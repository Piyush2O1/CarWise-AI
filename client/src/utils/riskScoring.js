import { getRiskLevel, getSafetyScore } from "./riskLevel";

const RISK_WEIGHTS = {
  hiddenCharges: 7,
  latePaymentPenalty: 5,
  foreclosureCharges: 8,
  mandatoryInsurance: 5,
  mandatoryInsuranceFromLender: 9,
  mandatoryPackages: 6,
  arbitrationClause: 5,
  arbitrationRisk: 6,
  jurisdictionRestrictions: 5,
  vehicleRepossessionClause: 10,
  immediateRepossession: 12,
  nonRefundableCharges: 5,
  recoveryExpensesClause: 7,
  prepaymentCharges: 5,
  vehicleInspectionCharges: 5,
  processingFees: 5,
  documentationCharges: 5,
  maintenanceCharges: 5,
  emiIncreaseClause: 6,
  cancellationCharges: 7,
  loanClosureCharges: 6,
  vehicleTrackingPrivacyIssues: 7,
};

const SAFE_WEIGHTS = {
  optionalAddOnPackage: -5,
  insuranceAnyProvider: -7,
  priorNoticeBeforeRepossession: -10,
  mutuallyAgreedArbitrator: -8,
  transparentChargesMentioned: -7,
  noForeclosureCharges: -8,
  partPrepaymentAllowed: -5,
  noHiddenCharges: -10,
};

const CLAUSE_LABELS = {
  hiddenCharges: "Hidden Charges",
  latePaymentPenalty: "Late Payment Penalties",
  foreclosureCharges: "Foreclosure Charges",
  mandatoryInsurance: "Mandatory Insurance",
  mandatoryInsuranceFromLender: "Lender-selected Insurance",
  mandatoryPackages: "Mandatory Packages",
  arbitrationClause: "Arbitration Clause",
  arbitrationRisk: "Arbitration Risk",
  jurisdictionRestrictions: "Jurisdiction Restrictions",
  vehicleRepossessionClause: "Vehicle Repossession Rules",
  immediateRepossession: "Immediate Repossession",
  nonRefundableCharges: "Non-refundable Charges",
  recoveryExpensesClause: "Recovery Expenses",
  prepaymentCharges: "Prepayment Charges",
  vehicleInspectionCharges: "Inspection Charges",
  emiIncreaseClause: "EMI Increase Clause",
  cancellationCharges: "Cancellation Charges",
  loanClosureCharges: "Loan Closure Charges",
  vehicleTrackingPrivacyIssues: "Vehicle Tracking / Privacy",
  optionalAddOnPackage: "Optional Add-ons",
  insuranceAnyProvider: "Insurance Freedom",
  priorNoticeBeforeRepossession: "Notice before Repossession",
  mutuallyAgreedArbitrator: "Mutually Agreed Arbitration",
  transparentChargesMentioned: "Transparent Charges",
  noForeclosureCharges: "No Foreclosure Charges",
  partPrepaymentAllowed: "Flexible Prepayment",
  noHiddenCharges: "No Hidden Charges",
};

const clamp = (score) => Math.max(0, Math.min(100, Math.round(score)));

export const getRiskStatus = (riskScore) => getRiskLevel(riskScore);

export const getSafetyProfile = (riskScore) => {
  const score = clamp(riskScore);
  if (score <= 20) return "Strong Safety";
  if (score <= 45) return "Proceed with Confidence";
  if (score <= 70) return "Proceed with Caution";
  return "High Attention Required";
};

export const getContractSummary = (riskScore, detectedClauses = []) => {
  const riskStatus = getRiskStatus(riskScore);
  const baseSummary = {
    SAFE:
      "This vehicle loan agreement presents a SAFE profile. The contract contains borrower-friendly terms and clearly disclosed charges. Review all payment and foreclosure clauses before proceeding.",
    "LOW RISK":
      "This vehicle loan agreement presents a LOW RISK profile. The contract contains moderate borrower obligations and disclosed charges. Please review all payment and foreclosure-related clauses before proceeding.",
    "MEDIUM RISK":
      "This vehicle loan agreement presents a MEDIUM RISK profile. The contract has several lender-favouring provisions. Carefully review penalties, fees, and insurance terms before signing.",
    "HIGH RISK":
      "This agreement contains multiple lender-favouring clauses and significant financial obligations. Carefully review all penalties, fees, and recovery-related provisions before signing.",
    "VERY HIGH RISK":
      "This agreement contains serious lender-favouring clauses and high risk exposures. Avoid signing without legal review and clarify all penalty, repossession, and extra fee provisions.",
  };

  const clauseText = detectedClauses.length
    ? ` Detected clauses include ${detectedClauses.slice(0, 5).join(", ")}.`
    : "";

  return `${baseSummary[riskStatus]}${clauseText}`.trim();
};

export const calculateWeightedRiskScore = (flags = {}) => {
  let riskScore = 0;
  const applied = { positives: [], risks: [] };

  Object.entries(SAFE_WEIGHTS).forEach(([key, weight]) => {
    if (flags[key]) {
      riskScore += weight;
      applied.positives.push({ key, weight });
    }
  });

  Object.entries(RISK_WEIGHTS).forEach(([key, weight]) => {
    if (flags[key]) {
      riskScore += weight;
      applied.risks.push({ key, weight });
    }
  });

  const score = clamp(riskScore);
  const safetyScore = getSafetyScore(score);
  const status = getRiskStatus(score);
  const safetyProfile = getSafetyProfile(score);
  const detectedClauses = Object.keys(flags)
    .filter((key) => flags[key] && RISK_WEIGHTS[key])
    .map((key) => CLAUSE_LABELS[key] || key);

  return {
    riskScore: score,
    safetyScore,
    status,
    safetyProfile,
    summary: getContractSummary(score, detectedClauses),
    breakdown: applied,
  };
};
