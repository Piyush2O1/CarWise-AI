import { calculateWeightedRiskScore } from "./riskScoring";

test("customer-friendly contract is safe", () => {
  const result = calculateWeightedRiskScore({
    noForeclosureCharges: true,
    insuranceAnyProvider: true,
    partPrepaymentAllowed: true,
    legalNoticeBeforeRepossession: true,
    mutualAgreedArbitrator: true,
    optionalAddOnPackage: true,
    transparentChargesMentioned: true,
    noHiddenCharges: true,
  });

  expect(result.status).toBe("SAFE");
  expect(result.riskScore).toBe(0);
});

test("hidden charges alone stays low risk", () => {
  const result = calculateWeightedRiskScore({ hiddenCharges: true });
  expect(result.status).toBe("LOW RISK");
  expect(result.riskScore).toBe(7);
});

test("multiple risky clauses become high risk", () => {
  const result = calculateWeightedRiskScore({
    mandatoryInsuranceFromLender: true,
    mandatoryPackages: true,
    immediateRepossession: true,
    foreclosureCharges: true,
  });

  expect(result.status).toBe("HIGH RISK");
  expect(result.riskScore).toBeGreaterThanOrEqual(60);
});
