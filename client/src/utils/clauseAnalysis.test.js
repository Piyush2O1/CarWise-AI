import test from 'node:test';
import assert from 'node:assert/strict';
import { classifyClauseStatus } from './clauseAnalysis.js';

test('detects compulsory insurance even when insurer choice is allowed', () => {
  const status = classifyClauseStatus('mandatoryInsuranceClause', 'The borrower must maintain comprehensive insurance during the loan tenure and the lender name must be endorsed in the policy.', true);
  assert.equal(status, 'DETECTED');
});

test('does not detect mandatory insurance when insurance is explicitly optional', () => {
  const status = classifyClauseStatus('mandatoryInsuranceClause', 'Insurance is optional and the borrower may choose the insurer.', false);
  assert.equal(status, 'NOT DETECTED');
});

test('detects non-refundable charges when the clause says the fee cannot be refunded', () => {
  const status = classifyClauseStatus('nonRefundableCharges', 'The processing fee is non-refundable and cannot be recovered on cancellation.', true);
  assert.equal(status, 'DETECTED');
});
