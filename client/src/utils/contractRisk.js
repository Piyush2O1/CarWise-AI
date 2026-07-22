import { getRiskLevelFromSafetyScore } from "./riskLevel.js";

export const resolveContractRiskSummary = (contract = {}) => {
  const rootRiskScore = contract.riskScore;
  const rootSafetyScore = contract.safetyScore;
  const rootRiskLevel = contract.riskLevel;
  const rootContractStatus = contract.contractStatus;

  const analysis = contract.analysis || {};

  const riskScore =
    rootRiskScore ?? analysis.riskScore ?? analysis.score?.riskScore ?? null;
  const safetyScore = rootSafetyScore ?? analysis.safetyScore ?? null;
  const riskLevel = safetyScore == null ? null : getRiskLevelFromSafetyScore(safetyScore);
  const contractStatus = riskLevel;

  return {
    riskScore,
    safetyScore,
    riskLevel,
    contractStatus,
  };
};
