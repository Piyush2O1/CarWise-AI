import test from 'node:test';
import assert from 'node:assert/strict';
import { detectHiddenCharges } from './clauseAnalysis.js';

test('detects hidden charges from processing and documentation fee wording', () => {
  const found = detectHiddenCharges({}, 'The borrower shall pay a processing fee and a documentation fee.');
  assert.ok(found.length > 0);
});

test('detects hidden charges from monthly subscription and administrative service charges', () => {
  const found = detectHiddenCharges({}, 'Monthly subscription charges and administrative fees are payable.');
  assert.ok(found.length > 0);
});
