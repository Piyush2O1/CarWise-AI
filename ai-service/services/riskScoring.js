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

const { getRiskLevel, getSafetyScore } = require("../../shared/riskLevel");

const clamp = (score) => Math.max(0, Math.min(100, Math.round(score)));

const getSafetyStatus = (safetyScore) => getRiskLevel(100 - safetyScore);

const getSafetyProfile = (safetyScore) => {
  if (safetyScore >= 80) return "Strong Safety";
  if (safetyScore >= 60) return "Proceed with Confidence";
  if (safetyScore >= 40) return "Proceed with Caution";
  if (safetyScore >= 20) return "High Attention Required";
  return "Avoid Signing Without Legal Review";
};

const normalizeText = (value) => {
  if (!value) return "";
  return String(value).trim().toLowerCase();
};

const isDetected = (status) => status === "DETECTED";
const isSafe = (status) => status === "SAFE";

const hasTextMatch = (text, pattern) => {
  if (!text) return false;
  return new RegExp(pattern, "i").test(text);
};

const buildFlagsFromAnalysis = (analysis) => {
  const riskClauses = analysis.riskClauses || {};
  const text = normalizeText(analysis.extractedText || analysis.summary || "");

  const getClauseStatus = (key, defaultValue = false) => {
    const clause = riskClauses[key];
    if (!clause) return defaultValue;
    return isDetected(clause.status || clause.present ? "DETECTED" : "NOT DETECTED");
  };

  const hiddenDetected = Boolean(
    riskClauses.hiddenCharges?.present ||
      (Array.isArray(analysis.hiddenCharges?.list) && analysis.hiddenCharges.list.length > 0) ||
      /hidden charge|hidden fee|additional fee|extra fee/.test(text)
  );

  const noHiddenCharges = /no hidden charges|no hidden fees|fully disclosed|fully transparent/.test(text);
  const mandatoryInsuranceText = normalizeText(analysis.riskClauses?.mandatoryInsuranceClause?.text || analysis.contractTerms?.insurance || analysis.contractTerms?.insuranceRequirement || "");
  const hasCompulsoryInsuranceSignal = /(must|shall|required|compulsory|mandatory|maintain|keep.*insured|insured at all times|at all times|procure and maintain|obtain and maintain|lender.*endorse|endorse.*lender|policy in force|comprehensive insurance)/i.test(mandatoryInsuranceText);
  const hasOptionalInsuranceSignal = /(optional|not mandatory|no mandatory|may choose|may select|can choose|free to choose|voluntary|not compulsory)/i.test(mandatoryInsuranceText);
  const mandatoryInsuranceDetected = hasCompulsoryInsuranceSignal || Boolean(riskClauses.mandatoryInsuranceClause?.present) || (riskClauses.mandatoryInsuranceClause?.status === "DETECTED");
  const insuranceAnyProvider = !mandatoryInsuranceDetected && (isSafe(riskClauses.mandatoryInsuranceClause?.status) || /any provider|any insurer|choose any insurer/.test(text));
  const priorNoticeBeforeRepossession = isSafe(riskClauses.vehicleRepossessionClause?.status) || /prior notice|written notice|legal notice|notice before repossession/.test(text);
  const mutuallyAgreedArbitrator = isSafe(riskClauses.arbitrationClause?.status) || /mutual|mutually agreed|mutually appointed/.test(text);
  const transparentCharges = noHiddenCharges || /transparent|charges are disclosed|all charges disclosed|clear fees/.test(text);
  const noForeclosureCharges = isSafe(riskClauses.foreclosureCharges?.status) || /no foreclosure|no repossession|waives foreclosure penalties|foreclosure charges are waived/.test(text);
  const prepaymentAllowed = isSafe(riskClauses.partPrepaymentRestrictions?.status) || /prepayment allowed|partial prepayment allowed|prepayment may be made/.test(text);
  const optionalPackage = isSafe(riskClauses.mandatoryPackages?.status) || /optional package|optional add-on|optional service/.test(text);
  const recoveryExpensesClause = /recovery expense|recovery cost|repossession expense|recovery charges/.test(text);
  const vehicleInspectionCharges = /vehicle inspection charge|inspection fee|inspection cost/.test(text);
  const prepaymentCharges = /prepayment charge|prepayment fee|early payment charge|prepayment penalty/.test(text);

  return {
    hiddenCharges: hiddenDetected,
    latePaymentPenalty: isDetected(riskClauses.latePaymentPenalty?.status || riskClauses.latePaymentPenalty?.present ? "DETECTED" : "NOT DETECTED"),
    foreclosureCharges: isDetected(riskClauses.foreclosureCharges?.status || riskClauses.foreclosureCharges?.present ? "DETECTED" : "NOT DETECTED"),
    mandatoryInsurance: hasOptionalInsuranceSignal ? false : mandatoryInsuranceDetected,
    mandatoryInsuranceFromLender: /from lender|through lender|lender appointed insurer|insurer appointed by lender/.test(text),
    mandatoryPackages: isDetected(riskClauses.mandatoryPackages?.status || riskClauses.mandatoryPackages?.present ? "DETECTED" : "NOT DETECTED"),
    arbitrationClause: isDetected(riskClauses.arbitrationClause?.status || riskClauses.arbitrationClause?.present ? "DETECTED" : "NOT DETECTED"),
    arbitrationRisk: /lender appoints arbitrator|arbitrator appointed by lender/.test(text),
    jurisdictionRestrictions: isDetected(riskClauses.jurisdictionClause?.status || riskClauses.jurisdictionClause?.present ? "DETECTED" : "NOT DETECTED"),
    vehicleRepossessionClause: isDetected(riskClauses.vehicleRepossessionClause?.status || riskClauses.vehicleRepossessionClause?.present ? "DETECTED" : "NOT DETECTED"),
    immediateRepossession: /immediate repossession|without notice|instant repossession|without prior notice/.test(text),
    nonRefundableCharges: isDetected(riskClauses.nonRefundableCharges?.status || riskClauses.nonRefundableCharges?.present ? "DETECTED" : "NOT DETECTED"),
    recoveryExpensesClause,
    prepaymentCharges,
    vehicleInspectionCharges,
    emiIncreaseClause: /emi increase|emI may increase|emi can increase|emi will increase/.test(text),
    cancellationCharges: /cancellation charge|cancellation fee/.test(text),
    loanClosureCharges: /loan closure charge|loan closing charge/.test(text),
    vehicleTrackingPrivacyIssues: /tracking|gps|location tracking|telematics|data privacy/.test(text),
    optionalAddOnPackage: optionalPackage,
    insuranceAnyProvider,
    priorNoticeBeforeRepossession,
    mutuallyAgreedArbitrator,
    transparentChargesMentioned: transparentCharges,
    noForeclosureCharges,
    partPrepaymentAllowed: prepaymentAllowed,
    noHiddenCharges,
  };
};

const scoreAnalysis = (analysis) => {
  const flags = buildFlagsFromAnalysis(analysis);
  let riskScore = 0;
  const breakdown = { positives: [], risks: [] };

  Object.entries(SAFE_WEIGHTS).forEach(([key, weight]) => {
    if (flags[key]) {
      riskScore += weight;
      breakdown.positives.push({ key, weight });
    }
  });

  Object.entries(RISK_WEIGHTS).forEach(([key, weight]) => {
    if (flags[key]) {
      riskScore += weight;
      breakdown.risks.push({ key, weight });
    }
  });

  const clampedRiskScore = clamp(riskScore);
  const safetyScore = getSafetyScore(clampedRiskScore);

  return {
    riskScore: clampedRiskScore,
    safetyScore,
    riskLevel: getRiskLevel(clampedRiskScore),
    safetyStatus: getSafetyStatus(safetyScore),
    safetyProfile: getSafetyProfile(safetyScore),
    scoreBreakdown: breakdown,
    flags,
  };
};

module.exports = {
  scoreAnalysis,
};
