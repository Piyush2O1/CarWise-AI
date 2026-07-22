const clampRiskScore = (value) => {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return 0;
  return Math.max(0, Math.min(100, Math.round(numeric)));
};

const normalizeRiskLevel = (value) => {
  if (value == null || value === "") return "UNKNOWN";

  const normalized = String(value).trim().toUpperCase().replace(/\s+/g, " ");

  switch (normalized) {
    case "STRONGEST SAFE":
      return "STRONGEST SAFE";
    case "SAFE":
      return "SAFE";
    case "LOW RISK":
    case "LOW":
    case "LOWRISK":
      return "LOW RISK";
    case "MEDIUM RISK":
    case "MEDIUM":
    case "MODERATE RISK":
    case "MODERATE":
      return "MEDIUM RISK";
    case "RISK":
      return "RISK";
    case "HIGH RISK":
    case "HIGH":
    case "VERY HIGH RISK":
      return "HIGH RISK";
    default:
      return "UNKNOWN";
  }
};

const getRiskLevelFromSafetyScore = (score) => {
  const numeric = Number(score);
  if (!Number.isFinite(numeric)) return "NOT ANALYZED";

  const clamped = clampRiskScore(numeric);
  if (clamped >= 90) return "STRONGEST SAFE";
  if (clamped >= 75) return "SAFE";
  if (clamped >= 65) return "LOW RISK";
  if (clamped >= 40) return "MEDIUM RISK";
  if (clamped >= 20) return "RISK";
  return "HIGH RISK";
};

const getRiskLevel = (score) => getRiskLevelFromSafetyScore(score);

const getSafetyScore = (riskScore) => clampRiskScore(100 - clampRiskScore(riskScore));

module.exports = {
  clampRiskScore,
  normalizeRiskLevel,
  getRiskLevelFromSafetyScore,
  getRiskLevel,
  getSafetyScore,
};
