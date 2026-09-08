import assert from 'node:assert/strict';
import { COHORT_SIZE, DEFAULT_COHORT, DEFAULT_ANALYSIS, analyzeCohort, filterRows } from './analysis.js';

assert.equal(DEFAULT_COHORT.length, COHORT_SIZE, 'cohort size must be stable');
assert.deepEqual(DEFAULT_ANALYSIS.funnel.map((s) => s.count), [10000, 9216, 7831, 7542, 7306], 'golden funnel changed');
assert.ok(DEFAULT_ANALYSIS.funnel.every((stage, i, list) => i === 0 || stage.count <= list[i - 1].count), 'funnel must be monotonic');
assert.equal(DEFAULT_ANALYSIS.diagnosis.largestStageDrop.key, 'identity', 'identity should remain the largest stage drop');
assert.equal(DEFAULT_ANALYSIS.diagnosis.largestRecoverableIssue.key, 'provider_timeout', 'provider timeout should remain top recoverable issue');
assert.equal(DEFAULT_ANALYSIS.diagnosis.highestTimeoutSegment.device, 'Mobile');
assert.equal(DEFAULT_ANALYSIS.diagnosis.highestTimeoutSegment.provider, 'VerifyNow');
assert.ok(DEFAULT_ANALYSIS.opportunity.modeledUpliftPp > 3 && DEFAULT_ANALYSIS.opportunity.modeledUpliftPp < 5.5, 'modeled opportunity must stay plausible and bounded');

const desktop = analyzeCohort(filterRows(DEFAULT_COHORT, { device: 'Desktop' }));
const mobile = analyzeCohort(filterRows(DEFAULT_COHORT, { device: 'Mobile' }));
assert.ok(mobile.diagnosis.largestRecoverableIssue.rate > desktop.diagnosis.largestRecoverableIssue.rate, 'mobile timeout signal should be stronger than desktop');

console.log('BROKER SIGNUP LAB TEST PASS', {
  started: DEFAULT_ANALYSIS.started,
  completion: Number(DEFAULT_ANALYSIS.completionRate.toFixed(1)),
  topIssue: DEFAULT_ANALYSIS.diagnosis.largestRecoverableIssue,
  hotspot: DEFAULT_ANALYSIS.diagnosis.highestTimeoutSegment,
  modeledUpliftPp: Number(DEFAULT_ANALYSIS.opportunity.modeledUpliftPp.toFixed(1)),
});
