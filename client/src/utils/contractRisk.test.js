import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveContractRiskSummary } from './contractRisk.js';
import { getRiskLevelFromSafetyScore, getSafetyProfileLabel } from './riskLevel.js';

test('maps safety scores to the new risk labels', () => {
  assert.equal(getRiskLevelFromSafetyScore(69), 'LOW RISK');
  assert.equal(getRiskLevelFromSafetyScore(58), 'MEDIUM RISK');
  assert.equal(getRiskLevelFromSafetyScore(82), 'SAFE');
  assert.equal(getRiskLevelFromSafetyScore(95), 'STRONGEST SAFE');
  assert.equal(getSafetyProfileLabel(69), 'LOW RISK');
});

test('prefers root contract risk values over nested analysis values', () => {
  const contract = {
    riskScore: 68,
    safetyScore: 32,
    analysis: {
      riskScore: 10,
      safetyScore: 90,
    },
  };

  const summary = resolveContractRiskSummary(contract);

  assert.equal(summary.riskScore, 68);
  assert.equal(summary.safetyScore, 32);
  assert.equal(summary.riskLevel, 'RISK');
  assert.equal(summary.contractStatus, 'RISK');
});

test('falls back to analysis values when root values are missing', () => {
  const contract = {
    analysis: {
      riskScore: 12,
      safetyScore: 88,
    },
  };

  const summary = resolveContractRiskSummary(contract);

  assert.equal(summary.riskScore, 12);
  assert.equal(summary.safetyScore, 88);
  assert.equal(summary.riskLevel, 'SAFE');
  assert.equal(summary.contractStatus, 'SAFE');
});
