import unittest
from release_stress import stress_cases,priority_route,second_score,stress_run
from evaluation import FLAGS,FACT_FIELDS

class StressRoutingTests(unittest.TestCase):
    def setUp(self):
        self.cases=stress_cases()
    def test_stress_split_unused_by_dev_holdout(self):
        self.assertEqual(len(self.cases),20)
        self.assertTrue(all(c["split"]=="stress" for c in self.cases))
        self.assertEqual(len({c["family"] for c in self.cases}),10)
    def test_dev_discovered_critical_case_override(self):
        c=next(x for x in self.cases if x["family"]=="coverage_concern")
        model_out={**{k:c["gold"][k] for k in (*FLAGS,*FACT_FIELDS)},
             "evidence_refs":[d["id"] for d in c["documents"]],
             "uncertainty":""}
        model_out["missing_evidence"]=True
        route,valid,reason=priority_route(c,{"output":model_out})
        self.assertEqual((route,valid,reason),("HUMAN_REVIEW",True,"CRITICAL_COVERAGE_REVIEW_PRIORITY"))
    def test_other_missing_evidence_stays_need_info(self):
        c=next(x for x in self.cases if x["family"]=="missing_evidence")
        model_out={**{k:c["gold"][k] for k in (*FLAGS,*FACT_FIELDS)},
             "evidence_refs":[d["id"] for d in c["documents"]],
             "uncertainty":""}
        route,valid,reason=priority_route(c,{"output":model_out})
        self.assertEqual(route,"NEED_INFO")
    def test_missing_api_output_never_auto_ready(self):
        c=next(x for x in self.cases if x["family"]=="coverage_concern")
        r=priority_route(c,{"output":None,"error":"TimeoutError"})
        self.assertEqual(r[0],"HUMAN_REVIEW")
    def test_one_real_extraction_can_be_scored_both_ways(self):
        calls=[]
        def fake(c):
            calls.append(c["id"])
            output={**{k:c["gold"][k] for k in (*FLAGS,*FACT_FIELDS)},
             "evidence_refs":[d["id"] for d in c["documents"]],
             "uncertainty":""}
            if c["family"]=="coverage_concern":output["missing_evidence"]=True
            return {"output":output,"usage":{"prompt_tokens":100,"completion_tokens":40},"latency_ms":1200}
        report=stress_run(self.cases,fake,"test-run")
        self.assertEqual(len(calls),20)
        self.assertEqual(report["actual_model_requests"],20)
        self.assertEqual(len(report["rows"]),20)
        self.assertEqual(report["api_or_schema_errors"],0)
        self.assertEqual(report["metrics"]["critical_review_first"]["correct_routes"],20)
        self.assertGreater(report["metrics"]["critical_review_first"]["correct_routes"],
                           report["metrics"]["previous_route"]["correct_routes"])
        self.assertGreater(report["estimated_api_cost_usd"],0)
        self.assertEqual(report["estimated_api_cost_usd"],report["metrics"]["previous_route"]["estimated_usd"])

if __name__=="__main__":unittest.main()
