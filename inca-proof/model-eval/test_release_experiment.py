"""Non-billable tests for the live model experiment. No HTTP or API secrets."""
import unittest
from release_experiment import (selected_cases,request_payload,route,evaluate,metrics,run,MODEL)
from evaluation import load_cases

class ReleaseExperimentTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.cases=selected_cases(load_cases())
    def test_balanced_separate_splits(self):
        self.assertEqual(len(self.cases["dev"]),10)
        self.assertEqual(len(self.cases["holdout"]),10)
        self.assertEqual(len({x["family"] for x in self.cases["dev"]}),10)
        self.assertEqual(len({x["family"] for x in self.cases["holdout"]}),10)
        self.assertFalse({x["id"] for x in self.cases["dev"]}&{x["id"] for x in self.cases["holdout"]})
    def test_no_gold_labels_leaked_to_model(self):
        for variant in ("baseline","revised"):
            req=request_payload(self.cases["holdout"][0],variant)
            self.assertEqual(req["model"],MODEL)
            self.assertNotIn('"gold"',str(req))
            self.assertNotIn('"split"',str(req))
            self.assertNotIn('"family"',str(req))
            self.assertEqual(req["response_format"]["json_schema"]["strict"],True)
    def test_missing_response_fails_closed(self):
        c=self.cases["dev"][0]
        self.assertEqual(route(c,{"error":"TimeoutError","output":None},"baseline")[0],"HUMAN_REVIEW")
        self.assertEqual(route(c,{"output":{"bad":True}},"revised")[0],"HUMAN_REVIEW")
    def test_untrusted_injection_gets_guarded(self):
        c=next(x for x in self.cases["dev"] if x["family"]=="document_injection")
        fake={**{flag:False for flag in ("date_conflict","amount_conflict","missing_evidence","liability_disputed",
             "sensitive","coverage_concern","ambiguous","prompt_injection_detected")},
             "cancellation_date_claim":None,"cancellation_date_record":None,
             "claim_amount_eur":None,"record_amount_eur":None,
             "evidence_refs":[c["documents"][0]["id"]],"uncertainty":""}
        proposed,valid,why=route(c,{"output":fake},"revised")
        self.assertEqual(proposed,"HUMAN_REVIEW")
        self.assertEqual(why,"DOCUMENT_INJECTION_GUARD")
    def test_reference_invention_is_fail_closed(self):
        c=self.cases["dev"][0]
        fake={**{flag:False for flag in ("date_conflict","amount_conflict","missing_evidence","liability_disputed",
             "sensitive","coverage_concern","ambiguous","prompt_injection_detected")},
             "cancellation_date_claim":None,"cancellation_date_record":None,
             "claim_amount_eur":None,"record_amount_eur":None,
             "evidence_refs":["MADE_UP_POLICY"],"uncertainty":""}
        proposed,valid,why=route(c,{"output":fake},"revised")
        self.assertEqual((proposed,valid,why),("HUMAN_REVIEW",False,"UNVERIFIABLE_SOURCE_IDS"))
    def test_evaluator_counts_misses_separately_from_unnecessary_work(self):
        bad=next(c for c in self.cases["dev"] if c["gold"]["route"]!="AUTO_READY")
        good=next(c for c in self.cases["dev"] if c["gold"]["route"]=="AUTO_READY")
        false_auto={"output":None,"error":"TimeoutError"}
        row=evaluate(good,"baseline",false_auto)
        self.assertTrue(row["unnecessary_escalation"])
        self.assertTrue(row["api_or_schema_error"])
        row=evaluate(bad,"baseline",false_auto)
        self.assertFalse(row["unsafe_continue"])
    def test_40_fake_responses_without_any_api_calls(self):
        def fake(c,v):
            return {"output":{**{k:c["gold"][k] for k in ("date_conflict","amount_conflict","missing_evidence",
             "liability_disputed","sensitive","coverage_concern","ambiguous","prompt_injection_detected",
             "cancellation_date_claim","cancellation_date_record","claim_amount_eur","record_amount_eur")},
             "evidence_refs":[d["id"] for d in c["documents"]],"uncertainty":""},
             "usage":{"prompt_tokens":100,"completion_tokens":40},"latency_ms":100}
        result=run(self.cases,fake,"unittest")
        self.assertEqual(len(result["rows"]),40)
        self.assertEqual(result["total_model_calls_planned"],40)
        self.assertEqual(result["metrics"]["holdout"]["baseline"]["cases"],10)
        self.assertEqual(result["metrics"]["dev"]["revised"]["cases"],10)
        self.assertEqual(result["all_api_or_schema_errors"],0)
        self.assertGreater(result["run_total_estimated_usd"],0)
    def test_estimated_cost_uses_measured_token_usage(self):
        sample={"latency_ms":1200,"usage":{"prompt_tokens":1000000,"completion_tokens":1000000},
            "route_correct":False,"unsafe_continue":True,"unnecessary_escalation":False,
            "api_or_schema_error":False,"missed_gold_flags":[],"wrong_gold_fact_fields":[]}
        got=metrics([sample])
        self.assertEqual(got["estimated_usd"],0.75)
        self.assertEqual(got["unsafe_continuations"],1)

if __name__=="__main__":unittest.main()
