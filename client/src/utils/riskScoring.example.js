import { calculateWeightedRiskScore } from "./riskScoring";

const flags = {
  hiddenCharges: true,
  annualMaintenanceCharges: true,
  mandatoryInsurance: true,
  noForeclosureCharges: true,
  insuranceAnyProvider: true,
  legalNoticeBeforeRepossession: true,
  mutualArbitration: true,
  transparentChargesMentioned: true,
};

const result = calculateWeightedRiskScore(flags);
console.log(result);
