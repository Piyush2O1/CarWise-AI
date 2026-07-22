import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Car,
  DollarSign,
  ShieldAlert,
  Lightbulb,
  BarChart3,
  BookOpen,
} from "lucide-react";
import { calculateWeightedRiskScore } from "../utils/riskScoring";
import { getSafetyProfileLabel, normalizeRiskLevel } from "../utils/riskLevel";
import { resolveContractRiskSummary } from "../utils/contractRisk";
import {
  classifyClauseStatus,
  detectHiddenCharges,
  normalizeText,
} from "../utils/clauseAnalysis";

function ContractDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchContract = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          navigate("/login");
          return;
        }

        const response = await axios.get(
          `http://localhost:5000/api/contracts/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setContract(response.data.contract);
      } catch (error) {
        console.error(error);

        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }

        setError(
          error.response?.data?.message ||
            "Failed to load contract details"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchContract();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="details-page">
        <div className="details-state">
          <h2>Loading contract details...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="details-page">
        <div className="details-state">
          <h2>{error}</h2>

          <button
            className="dashboard-primary-button"
            onClick={() => navigate("/history")}
          >
            Back to History
          </button>
        </div>
      </div>
    );
  }

  const analysis = contract?.analysis || {};

  const supportedContractTypes = [
    "Master Vehicle Loan Agreement",
    "Vehicle Loan Agreement",
    "Vehicle Purchase Agreement",
    "Vehicle Lease Agreement",
    "Vehicle Finance Agreement",
  ];

  const normalizeContractType = (value) => {
    if (!value) return null;
    const text = String(value).trim();
    const normalized = text.toLowerCase();
    for (const type of supportedContractTypes) {
      if (normalized.includes(type.toLowerCase())) {
        return type;
      }
    }
    return null;
  };

  const extractFirstPageTitle = (text) => {
    if (!text) return null;
    const lines = text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .slice(0, 20);

    for (const line of lines) {
      const title = normalizeContractType(line);
      if (title) {
        return title;
      }
    }

    return null;
  };

  const detectContractType = () => {
    const fromAnalysis = normalizeContractType(analysis.contractType);
    if (fromAnalysis) return fromAnalysis;

    const fromContract = normalizeContractType(contract.contractType || contract.originalName);
    if (fromContract) return fromContract;

    const fromText = extractFirstPageTitle(contract.extractedText);
    if (fromText) return fromText;

    return "Vehicle Purchase Agreement";
  };

  const formatIndianNumber = (value) => {
    const str = String(value || "").trim();
    if (!str) return "";
    const [intPart] = str.split(".");
    const digits = intPart.replace(/[^0-9]/g, "");
    if (!digits) return "";
    const lastThree = digits.slice(-3);
    const rest = digits.slice(0, -3);
    const formattedRest = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",");
    return rest ? `${formattedRest},${lastThree}` : lastThree;
  };

  const formatCurrency = (value) => {
    if (value == null) return "Information Not Found";
    const raw = String(value).trim();
    if (!raw) return "Information Not Found";
    if (/information not found/i.test(raw)) {
      return "Information Not Found";
    }

    const sanitized = raw
      .replace(/₹/g, "")
      .replace(/\bRs\.?\b/gi, "")
      .replace(/\bINR\b/gi, "")
      .replace(/\/-/g, "")
      .replace(/[\s,]+/g, "");

    const numberMatch = sanitized.match(/[0-9]+(?:\.[0-9]+)?/);
    if (!numberMatch) {
      return raw;
    }

    const [integer, decimal] = numberMatch[0].split(".");
    const formattedInteger = formatIndianNumber(integer);
    return `₹${formattedInteger}${decimal ? `.${decimal}` : ""}`;
  };

  const getRiskStatus = (score, text, presentFlag) => {
    if (score == null || score === "") return "UNKNOWN";

    if (typeof score === "number") {
      return "UNKNOWN";
    }

    if (typeof score === "string") {
      if (/^-?\d+(\.\d+)?$/.test(score.trim())) {
        return "UNKNOWN";
      }

      const clauseStatus = classifyClauseStatus(score, text, presentFlag);
      if (clauseStatus === "SAFE") return "SAFE";
      if (clauseStatus === "LOW RISK") return "LOW RISK";
      if (clauseStatus === "DETECTED" || clauseStatus === "NOT DETECTED" || clauseStatus === "Information Not Found") {
        return clauseStatus;
      }
      return normalizeRiskLevel(clauseStatus);
    }

    return "UNKNOWN";
  };

  const computeRiskScores = (an) => {
    const rc = an.riskClauses || {};
    const text = normalizeText(contract.extractedText || an.summary || "");
    const clauseText = (value, fallback) => normalizeText(value || fallback || "");

    const hiddenArray = detectHiddenCharges(an);
    const hiddenStatus = classifyClauseStatus(
      "hiddenCharges",
      clauseText(rc.hiddenCharges?.text, an.hiddenCharges?.list || an.hiddenCharges || an.hiddenRisks?.hiddenCharges),
      rc.hiddenCharges?.present
    );
    const hasHidden = hiddenArray.length > 0 || hiddenStatus === "DETECTED";
    const hasNonRefundable = hiddenArray.some((h) => h.nonRefundable) || classifyClauseStatus(
      "nonRefundableCharges",
      clauseText(rc.nonRefundableCharges?.text, an.hiddenCharges?.nonRefundable || an.nonRefundableCharges),
      rc.nonRefundableCharges?.present
    ) === "DETECTED";
    const hasAnnualMaintenance = /annual maintenance|maintenance charge|maintenance charges/.test(text) || hiddenArray.some((h) => /maintenance/.test(normalizeText(h.name)));
    const hasLoanClosure = /loan closure|loan closing/.test(text) || hiddenArray.some((h) => /loan closure/.test(normalizeText(h.name)));
    const hasCancellationCharges = /cancellation charge|cancellation fee|cancelation charge|cancelation fee/.test(text);
    const hasEmiIncrease = /emi increase|increase in emi|emi may increase|emi can increase|emi will increase/.test(text);
    const hasTrackingPrivacy = /tracking|gps|location tracking|telematics|privacy policy|data privacy/.test(text);
    const hasProcessingFees = /processing fee|processing charge|processing charges/.test(text) || hiddenArray.some((h) => /processing/.test(normalizeText(h.name)));
    const hasDocumentationCharges = /documentation charge|documentation fee|documentation charges/.test(text) || hiddenArray.some((h) => /documentation/.test(normalizeText(h.name)));
    const hasMaintenanceCharges = hasAnnualMaintenance;

    const lateStatus = classifyClauseStatus(
      "latePaymentPenalty",
      clauseText(rc.latePaymentPenalty?.text, an.hiddenRisks?.latePaymentPenalties || an.latePaymentPenalties),
      rc.latePaymentPenalty?.present
    );
    const foreclosureStatus = classifyClauseStatus(
      "foreclosureCharges",
      clauseText(rc.foreclosureCharges?.text, an.hiddenRisks?.foreclosureCharges || an.foreclosureCharges),
      rc.foreclosureCharges?.present
    );
    const insuranceRawText = clauseText(
      rc.mandatoryInsuranceClause?.text,
      an.contractTerms?.insurance || an.contractTerms?.insuranceRequirement
    );
    const insuranceStatus = classifyClauseStatus(
      "mandatoryInsuranceClause",
      insuranceRawText,
      rc.mandatoryInsuranceClause?.present
    );
    const packageStatus = classifyClauseStatus(
      "mandatoryPackages",
      clauseText(rc.mandatoryPackages?.text, an.contractTerms?.mandatoryPackages),
      rc.mandatoryPackages?.present
    );
    const repossessionStatus = classifyClauseStatus(
      "vehicleRepossessionClause",
      clauseText(rc.vehicleRepossessionClause?.text, an.contractTerms?.repossession),
      rc.vehicleRepossessionClause?.present
    );
    const prepaymentStatus = classifyClauseStatus(
      "partPrepaymentRestrictions",
      clauseText(rc.partPrepaymentRestrictions?.text, an.contractTerms?.prepaymentRestrictions),
      rc.partPrepaymentRestrictions?.present
    );
    const arbitrationStatus = classifyClauseStatus(
      "arbitrationClause",
      clauseText(rc.arbitrationClause?.text, an.contractTerms?.arbitration),
      rc.arbitrationClause?.present
    );
    const jurisdictionStatus = classifyClauseStatus(
      "jurisdictionClause",
      clauseText(rc.jurisdictionClause?.text, an.contractTerms?.jurisdiction),
      rc.jurisdictionClause?.present
    );

    const insuranceFromLender = /only from lender|from lender|through lender|insurer appointed by lender|lender appointed insurer/.test(insuranceRawText);
    const immediateRepossession = repossessionStatus === "DETECTED" && /immediate repossession|without notice|without prior notice|instant repossession/.test(text);
    const mutualArbitration = arbitrationStatus === "SAFE" || /mutually agreed|mutually appointed|mutual arbitration/.test(text);
    const legalNoticeRepossession = repossessionStatus === "LOW RISK" || /prior notice|written notice|legal notice/.test(text);
    const insuranceFreedom = insuranceStatus === "SAFE" || /any provider|any insurer|choose any insurer|insurance freedom/.test(text);
    const transparentCharges = !hasHidden || /transparent|all charges disclosed|charges are disclosed|no hidden charges|clear fees|fully disclosed/.test(text);
    const noForeclosureCharges = foreclosureStatus === "SAFE" || foreclosureStatus === "NOT DETECTED";
    const partPrepaymentAllowed =
      prepaymentStatus === "SAFE" ||
      /prepayment allowed|part prepayment allowed|allowed anytime|prepayment may be made|partial prepayment/.test(text);
    const optionalAddOnPackage =
      packageStatus === "SAFE" ||
      /optional package|optional add-on|optional service|service is optional/.test(text);
    const prepaymentCharges =
      prepaymentStatus === "DETECTED" ||
      /prepayment charge|prepayment fee|early payment charge|prepayment penalty/.test(text);
    const recoveryExpensesClause = /recovery expense|recovery cost|repossession expense|recovery charges/.test(text);
    const vehicleInspectionCharges = /vehicle inspection charge|inspection fee|inspection cost/.test(text);
    const noHiddenCharges = /no hidden charges|no hidden fees|fully disclosed|fully transparent/.test(text);

    const flags = {
      hiddenCharges: hasHidden,
      nonRefundableCharges: hasNonRefundable,
      maintenanceCharges: hasMaintenanceCharges,
      documentationCharges: hasDocumentationCharges,
      processingFees: hasProcessingFees,
      loanClosureCharges: hasLoanClosure,
      mandatoryInsurance: insuranceStatus === "DETECTED",
      mandatoryInsuranceFromLender: insuranceFromLender,
      mandatoryPackages: packageStatus === "DETECTED",
      foreclosureCharges: foreclosureStatus === "DETECTED",
      immediateRepossession,
      emiIncreaseClause: hasEmiIncrease,
      arbitrationRisk: arbitrationStatus === "DETECTED",
      jurisdictionRestrictions: jurisdictionStatus === "DETECTED",
      latePaymentPenalty: lateStatus === "DETECTED",
      vehicleTrackingPrivacyIssues: hasTrackingPrivacy,
      noForeclosureCharges,
      insuranceAnyProvider: insuranceFreedom,
      partPrepaymentAllowed,
      legalNoticeBeforeRepossession: legalNoticeRepossession,
      mutualArbitration,
      transparentChargesMentioned: transparentCharges,
      optionalAddOnPackage,
      prepaymentCharges,
      recoveryExpensesClause,
      vehicleInspectionCharges,
      noHiddenCharges,
    };

    const scoreResult = calculateWeightedRiskScore(flags);

    return {
      ...scoreResult,
      riskLevel: scoreResult.status,
    };
  };

  const computedRiskSummary = computeRiskScores(analysis);
  const riskSummary = resolveContractRiskSummary(contract);

  const contractSummary = analysis.summary || "No summary available.";

  const dedupeVehicleName = (name) => {
    if (!name) return name;
    const trimmed = name.trim();
    const m = trimmed.match(/^(.*)\s+\1$/i);
    return m ? m[1] : trimmed;
  };

  const rawVehicleName = [
    analysis.vehicle?.vehicleName || analysis.vehicle?.make,
    analysis.vehicle?.vehicleModel || analysis.vehicle?.model,
  ]
    .filter(Boolean)
    .join(" ");

  const vehicleName = dedupeVehicleName(rawVehicleName) || "Vehicle Contract";
  const contractType = detectContractType();
  const purchasePrice = formatCurrency(analysis.financials?.vehiclePrice || analysis.financials?.purchasePrice || analysis.financials?.amount || "Information Not Found");
  const interestRate = analysis.financials?.interestRate || analysis.financials?.apr || "Information Not Found";
  const loanDuration = analysis.financials?.loanDuration || analysis.financials?.term || "Information Not Found";
  const monthlyEmi = formatCurrency(analysis.financials?.emiAmount || analysis.financials?.monthlyEMI || analysis.financials?.monthlyPayment || "Information Not Found");
  const processingFees = formatCurrency(analysis.financials?.processingFee || analysis.financials?.processingFees || analysis.financials?.fees || "Information Not Found");
  const insuranceCharges = formatCurrency(analysis.additionalCharges?.insuranceCharges || analysis.financials?.insuranceCharges || "Information Not Found");
  const dealerHandlingCharges = formatCurrency(analysis.additionalCharges?.dealerHandlingCharges || "Information Not Found");
  const registrationCharges = formatCurrency(analysis.additionalCharges?.registrationCharges || "Information Not Found");
  const roadTaxDetails = formatCurrency(analysis.additionalCharges?.roadTax || "Information Not Found");
  const documentationCharges = formatCurrency(analysis.financials?.documentationCharges || analysis.additionalCharges?.documentationCharges || "Information Not Found");

  const hiddenRiskCategories = [
    {
      label: "Hidden Charges",
      detail:
        (analysis.riskClauses?.hiddenCharges?.text || analysis.hiddenCharges?.list || analysis.hiddenCharges || "Information Not Found"),
      status: (() => {
        const detected = detectHiddenCharges(analysis || {});
        if (detected.length > 0) return "DETECTED";
        // fallback to clause-based status
        return getRiskStatus(
          "hiddenCharges",
          analysis.riskClauses?.hiddenCharges?.text || analysis.hiddenCharges?.list || analysis.hiddenCharges || analysis.hiddenRisks?.hiddenCharges,
          analysis.riskClauses?.hiddenCharges?.present
        );
      })(),
    },
    {
      label: "Late Payment Penalties",
      detail: analysis.riskClauses?.latePaymentPenalty?.text || analysis.hiddenRisks?.latePaymentPenalties || analysis.latePaymentPenalties || "Information Not Found",
      status: getRiskStatus(
        "latePaymentPenalty",
        analysis.riskClauses?.latePaymentPenalty?.text || analysis.hiddenRisks?.latePaymentPenalties || analysis.latePaymentPenalties,
        analysis.riskClauses?.latePaymentPenalty?.present
      ),
    },
    {
      label: "Foreclosure Charges",
      detail: analysis.riskClauses?.foreclosureCharges?.text || analysis.hiddenRisks?.foreclosureCharges || analysis.foreclosureCharges || "Information Not Found",
      status: getRiskStatus(
        "foreclosureCharges",
        analysis.riskClauses?.foreclosureCharges?.text || analysis.hiddenRisks?.foreclosureCharges || analysis.foreclosureCharges,
        analysis.riskClauses?.foreclosureCharges?.present
      ),
    },
    {
      label: "Mandatory Insurance",
      detail: analysis.riskClauses?.mandatoryInsuranceClause?.text || analysis.contractTerms?.insurance || analysis.contractTerms?.insuranceRequirement || "Information Not Found",
      status: getRiskStatus(
        "mandatoryInsuranceClause",
        analysis.riskClauses?.mandatoryInsuranceClause?.text || analysis.contractTerms?.insurance || analysis.contractTerms?.insuranceRequirement,
        analysis.riskClauses?.mandatoryInsuranceClause?.present
      ),
    },
    {
      label: "Mandatory Packages",
      detail: analysis.riskClauses?.mandatoryPackages?.text || analysis.contractTerms?.mandatoryPackages || "Information Not Found",
      status: getRiskStatus(
        "mandatoryPackages",
        analysis.riskClauses?.mandatoryPackages?.text || analysis.contractTerms?.mandatoryPackages,
        analysis.riskClauses?.mandatoryPackages?.present
      ),
    },
    {
      label: "Vehicle Repossession Risk",
      detail: analysis.riskClauses?.vehicleRepossessionClause?.text || analysis.contractTerms?.repossession || "Information Not Found",
      status: getRiskStatus(
        "vehicleRepossessionClause",
        analysis.riskClauses?.vehicleRepossessionClause?.text || analysis.contractTerms?.repossession,
        analysis.riskClauses?.vehicleRepossessionClause?.present
      ),
    },
    {
      label: "Arbitration Risk",
      detail: analysis.riskClauses?.arbitrationClause?.text || analysis.contractTerms?.arbitration || "Information Not Found",
      status: getRiskStatus(
        "arbitrationClause",
        analysis.riskClauses?.arbitrationClause?.text || analysis.contractTerms?.arbitration,
        analysis.riskClauses?.arbitrationClause?.present
      ),
    },
    {
      label: "Non-refundable Charges",
      detail: analysis.riskClauses?.nonRefundableCharges?.text || analysis.hiddenCharges?.nonRefundable || analysis.nonRefundableCharges || "Information Not Found",
      status: getRiskStatus(
        "nonRefundableCharges",
        analysis.riskClauses?.nonRefundableCharges?.text || analysis.hiddenCharges?.nonRefundable || analysis.nonRefundableCharges,
        analysis.riskClauses?.nonRefundableCharges?.present
      ),
    },
    {
      label: "Jurisdiction Restrictions",
      detail: analysis.riskClauses?.jurisdictionClause?.text || analysis.contractTerms?.jurisdiction || "Information Not Found",
      status: getRiskStatus(
        "jurisdictionClause",
        analysis.riskClauses?.jurisdictionClause?.text || analysis.contractTerms?.jurisdiction,
        analysis.riskClauses?.jurisdictionClause?.present
      ),
    },
  ];

  const importantClauses = Array.isArray(analysis.importantClauses) && analysis.importantClauses.length > 0
    ? analysis.importantClauses
    : Array.isArray(analysis.contractTerms?.importantClauses) && analysis.contractTerms.importantClauses.length > 0
      ? analysis.contractTerms.importantClauses
      : [
          "Review liability, warranty and payment terms before signing.",
          "Confirm penalty conditions for late payment.",
          "Validate interest rate and total loan duration.",
        ];

  const recommendations = Array.isArray(analysis.recommendations) && analysis.recommendations.length > 0
    ? analysis.recommendations
    : [
        "Negotiate fees to reduce final cost.",
        "Review warranty terms carefully.",
        "Check loan conditions before approval.",
      ];

  const financeDetails = [
    { label: "Interest Rate", value: interestRate },
    { label: "Loan Duration", value: loanDuration },
    { label: "Monthly EMI", value: monthlyEmi },
    { label: "Processing Fees", value: processingFees },
  ];

  const resolvedRiskLevel = riskSummary.riskLevel || "NOT ANALYZED";
  const resolvedSafetyScore = riskSummary.safetyScore ?? analysis.safetyScore ?? null;
  const resolvedRiskScore = riskSummary.riskScore ?? analysis.riskScore ?? null;
  const resolvedScoreLabel = resolvedSafetyScore == null ? "NOT ANALYZED" : getSafetyProfileLabel(resolvedSafetyScore);
  const resolvedContractSummary = contractSummary || "No summary available.";

  return (
    <div className="details-page">
      <div className="details-header">
        <button
          className="back-button"
          onClick={() => navigate("/history")}
        >
          <ArrowLeft size={18} />
          Back to History
        </button>

        <p className="dashboard-eyebrow">CONTRACT ANALYSIS</p>

        <h1>{contract.originalName}</h1>

        <p className="dashboard-subtitle">
          AI-powered insights from your vehicle contract.
        </p>
      </div>

      <section className="contract-hero-grid">
        <div className="contract-summary-card premium-card">
          <p className="dashboard-eyebrow">Contract Summary</p>
          <h2>{contract.originalName}</h2>

          <div className="summary-pill-row">
            <span>{contractType}</span>
            <span>{resolvedRiskLevel || "Analyzed"}</span>
          </div>

          <div className="summary-meta-grid">
            <div className="summary-meta-card">
              <span>Vehicle Name</span>
              <strong>{vehicleName}</strong>
            </div>
            <div className="summary-meta-card">
              <span>Contract Type</span>
              <strong>{contractType}</strong>
            </div>
            <div className="summary-meta-card">
              <span>Purchase Price</span>
              <strong>{purchasePrice}</strong>
            </div>
            <div className="summary-meta-card">
              <span>Uploaded</span>
              <strong>{contract.createdAt?.slice(0, 10) || "N/A"}</strong>
            </div>
          </div>
        </div>

        <div className="contract-score-card premium-card">
          <div className="score-chip">AI Safety Score</div>
          <div className="score-badge">{resolvedSafetyScore == null ? "N/A" : `${resolvedSafetyScore}/100`}</div>
          <div className="score-label">{resolvedScoreLabel}</div>

          <div className="risk-meter">
            <div
              className="risk-meter-fill"
              style={{ width: `${resolvedSafetyScore == null ? 0 : resolvedSafetyScore}%` }}
            />
          </div>

          <div className="score-meta">
            <span>Risk: {resolvedRiskLevel}</span>
            <span>Trend: {analysis.trend || "Stable"}</span>
          </div>
          <div className="score-meta">
            <span>{resolvedContractSummary}</span>
          </div>
        </div>
      </section>

      <section className="details-section">
        <div className="details-section-title">
          <Car size={22} />
          <h2>Vehicle Information</h2>
        </div>

        <div className="details-grid">
          <div className="details-card">
            <span>Vehicle Name</span>
            <strong>{vehicleName}</strong>
          </div>
          <div className="details-card">
            <span>Contract Type</span>
            <strong>{contractType}</strong>
          </div>
          <div className="details-card">
            <span>Purchase Price</span>
            <strong>{purchasePrice}</strong>
          </div>
        </div>
      </section>

      <section className="details-section">
        <div className="details-section-title">
          <DollarSign size={22} />
          <h2>Financial Details</h2>
        </div>

        <div className="details-grid">
          {financeDetails.map((detail) => (
            <div className="details-card" key={detail.label}>
              <span>{detail.label}</span>
              <strong>{detail.value}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="details-section details-grid-2">
        <div className="important-panel">
          <div className="details-section-title">
            <ShieldAlert size={22} />
            <h2>Hidden Risks</h2>
          </div>

          <div className="hidden-risks-grid">
            {hiddenRiskCategories.map((risk, index) => (
              <div className="hidden-risk-card" key={index}>
                <span>{risk.label}</span>
                <p>
                  <strong>Status:</strong> {risk.status}
                </p>
                <p>{risk.detail}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="important-panel">
          <div className="details-section-title">
            <BookOpen size={22} />
            <h2>Important Clauses</h2>
          </div>

          <ul className="important-clauses-list">
            {importantClauses.map((clause, index) => (
              <li key={index}>{clause}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="details-section details-grid-2">
        <div className="recommendations-card premium-card">
          <div className="details-section-title">
            <Lightbulb size={22} />
            <h2>AI Recommendations</h2>
          </div>

          <div className="logical-panel">
            {recommendations.map((recommendation, index) => (
              <div className="recommendation-pill" key={index}>
                <span>{recommendation}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="risk-score-card premium-card">
          <div className="details-section-title">
            <BarChart3 size={22} />
            <h2>Risk Score</h2>
          </div>

          <div className="risk-score-stat">
            <strong>Current Risk Score</strong>
            <span>{resolvedRiskScore == null ? "N/A" : `${resolvedRiskScore}%`}</span>
          </div>
          <div className="risk-score-stat">
            <strong>Overall Safety</strong>
            <span>{resolvedSafetyScore == null ? "N/A" : `${resolvedSafetyScore}/100`}</span>
          </div>
          <div className="risk-score-stat">
            <strong>Contract Status</strong>
            <span>{resolvedRiskLevel}</span>
          </div>
          <div className="risk-score-stat">
            <strong>Safety Profile</strong>
            <span>{resolvedScoreLabel}</span>
          </div>
        </div>
      </section>
    </div>
  );
}

export default ContractDetails;
