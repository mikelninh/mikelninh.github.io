import test from "node:test";
import assert from "node:assert/strict";
import {
  RULESET_VERSION,
  buildEvidencePlan,
  completionScore,
  createApplicationId,
  evaluateEligibility,
  transitionCase
} from "../rules.js";

const base = {jurisdiction:"BE",childAge:13,grade:8,attendsSchool:true,benefit:"wohngeld"};

test("recognises a supported benefit for a school child", () => {
  const result = evaluateEligibility(base);
  assert.equal(result.status, "eligible");
  assert.equal(result.reasonCode, "benefit_verified");
  assert.equal(result.rulesetVersion, RULESET_VERSION);
  assert.equal(result.requiresHumanDecision, true);
});

test("Berlin primary grades follow the universal demo rule", () => {
  const result = evaluateEligibility({...base,grade:4,benefit:"none"});
  assert.equal(result.status, "eligible");
  assert.equal(result.reasonCode, "universal_primary");
});

test("low income without a listed benefit routes to review", () => {
  const result = evaluateEligibility({...base,benefit:"low_income"});
  assert.equal(result.status, "needs_review");
  assert.equal(result.reasonCode, "income_review");
});

test("does not silently approve a case without a direct match", () => {
  const result = evaluateEligibility({...base,benefit:"none"});
  assert.equal(result.status, "needs_review");
  assert.equal(result.requiresHumanDecision, true);
});

test("builds an explicit evidence plan with provenance", () => {
  const plan = buildEvidencePlan(base,{identityVerified:true,benefitVerified:true});
  assert.equal(plan.length,4);
  assert.equal(plan.find(item=>item.id==="identity").source,"eID-Demo");
  assert.equal(plan.find(item=>item.id==="benefit").source,"NOOTS-Demoabruf");
  assert.equal(completionScore(plan),50);
});

test("creates a stable-format synthetic application id", () => {
  const id = createApplicationId(new Date("2026-08-11T00:00:00Z"),()=>0);
  assert.equal(id,"OL-BE-2026-100000");
});

test("allows only explicit workflow transitions", () => {
  assert.equal(transitionCase("draft","submitted"),"submitted");
  assert.equal(transitionCase("submitted","in_review"),"in_review");
  assert.equal(transitionCase("in_review","approved"),"approved");
  assert.throws(()=>transitionCase("submitted","approved"),/Invalid case transition/);
  assert.throws(()=>transitionCase("approved","rejected"),/Invalid case transition/);
});
