import importlib.util
from pathlib import Path
import os
import sys
import unittest

HERE=Path(__file__).resolve().parent
spec=importlib.util.spec_from_file_location("firstmile_runner",HERE/"benchmark.py")
lab=importlib.util.module_from_spec(spec)
sys.modules[spec.name]=lab
spec.loader.exec_module(lab)

class RunnerContractTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.cases,cls.labels=lab.fixtures()
        cls.example=cls.cases[0]

    def test_six_cases_have_exactly_eight_ground_truth_labels(self):
        self.assertEqual(len(self.cases),6)
        for c in self.cases:self.assertEqual(set(self.labels[c["id"]]),set(lab.FIELDS))

    def test_cited_numeric_observation_is_verified(self):
        c={"field":"arr","kind":"actual","value":"EUR:240000",
           "source":self.example["docs"][0]["name"],"page":2,"quote":"ARR: €240k"}
        good,bad=lab.verify(self.example,[c])
        self.assertEqual(len(good),1)
        self.assertEqual(bad,[])

    def test_quote_without_a_source_is_rejected(self):
        c={"field":"arr","kind":"actual","value":"EUR:50000000",
           "source":self.example["docs"][0]["name"],"page":2,"quote":"ARR: €50m"}
        good,bad=lab.verify(self.example,[c])
        self.assertFalse(good)
        self.assertEqual(bad[0]["reason"],"unverified_quote")

    def test_incorrect_numeric_value_is_rejected(self):
        c={"field":"arr","kind":"actual","value":"EUR:1",
           "source":self.example["docs"][0]["name"],"page":2,"quote":"ARR: €240k"}
        _,bad=lab.verify(self.example,[c])
        self.assertEqual(bad[0]["reason"],"numeric_mismatch")

    def test_forecast_is_not_current_performance(self):
        c=[{"field":"arr","kind":"forecast","value":"EUR:1500000"}]
        self.assertEqual(lab.statuses(c)["arr"],"forecast")
        self.assertEqual(lab.statuses([])["arr"],"missing")

    def test_two_stage_verified_workflow(self):
        events=[]
        def stub(provider,model,schema,system,user):
            events.append(schema)
            if schema is lab.CLAIM_SCHEMA:
                return ({"claims":[{"field":"arr","kind":"actual","value":"EUR:240000",
                "source":self.example["docs"][0]["name"],"page":2,"quote":"ARR: €240k"}]},
                {"input":40,"output":20},4)
            return ({"questions":["What explains the ARR difference?"]},{"input":12,"output":8},4)
        r=lab.case_run(self.example,"openai","test",agent=True,transport=stub)
        self.assertEqual(r["status"],"measured")
        self.assertEqual(r["predicted"]["arr"],"found")
        self.assertEqual([x["stage"] for x in r["trace"]],["extract","verify_exact_source","draft_founder_questions"])
        self.assertEqual(r["tokens"]["input"],52)
        self.assertEqual(len(r["questions"]),1)
        self.assertEqual(len(events),2)

    def test_agent_never_contacts_external_action_system(self):
        self.assertNotIn("execute",lab.QUESTION_PROMPT.lower())
        self.assertIn("No investment judgement",lab.EXTRACT_PROMPT)

    def test_missing_api_explicitly_not_run(self):
        previous=os.environ.pop("OPENAI_MODEL",None)
        try:
            e=lab.model_run("gpt",self.cases,self.labels)
            self.assertEqual(e["status"],"not_run")
        finally:
            if previous is not None:os.environ["OPENAI_MODEL"]=previous

    def test_no_explicit_cost_permission_means_no_provider_call(self):
        r=lab.benchmark(["gpt"],allow_billable=False)
        self.assertEqual(r["engines"][0]["status"],"not_run")
        self.assertEqual(r["engines"][0]["reason"],"billable_calls_not_authorised")

if __name__=="__main__":
    unittest.main()
