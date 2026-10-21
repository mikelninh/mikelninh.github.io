"""No paid provider calls: A/B/C routing economics, no-unsafe-clearance tests."""
import importlib.util,json,pathlib,sys,unittest
from unittest.mock import patch
HERE=pathlib.Path(__file__).resolve().parent
sys.path.insert(0,str(HERE))
spec=importlib.util.spec_from_file_location("abc_comparison",HERE/"abc_comparison.py")
m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)

def gpt_fake(case,route=None,verified=True):
    return {"route":route or case["expected_route"],"verified":verified}

def jev_fake(score):
    return {"score":score,"input_tokens":650,"output_tokens":0,"latency_ms":140,"model":"jev-latest"}

class ABCTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):cls.cases=m.narrative.cases()
    def test_A_always_needs_verified_evidence(self):
        case=self.cases[2]
        a=m.choose(case,gpt_fake(case,route="CONTINUE_CHECKS",verified=False),jev_fake(.01))
        self.assertEqual(a["A"]["route"],"HUMAN_REVIEW")
        self.assertFalse(a["A"]["evidence_verified"])
        self.assertEqual(a["A"]["calls_gpt"],1)
    def test_B_does_not_override_required_checks(self):
        case=self.cases[0]
        x=m.choose(case,gpt_fake(case),jev_fake(.001))
        self.assertEqual(x["B"]["route"],"HUMAN_REVIEW")
        self.assertEqual(x["B"]["calls_gpt"],1)
        self.assertEqual(x["B"]["calls_jev"],1)
    def test_B_can_escalate_a_clean_case_but_not_downgrade(self):
        case=self.cases[2]
        x=m.choose(case,gpt_fake(case),jev_fake(.99))
        self.assertEqual(x["A"]["route"],"CONTINUE_CHECKS")
        self.assertEqual(x["B"]["route"],"HUMAN_REVIEW")
    def test_C_skips_llm_but_never_lets_jev_clear_without_evidence(self):
        case=self.cases[2]
        x=m.choose(case,gpt_fake(case),jev_fake(.1))
        self.assertEqual(x["C"]["calls_gpt"],0)
        self.assertEqual(x["C"]["route"],"MANUAL_EVIDENCE_CHECK")
        self.assertTrue(x["C"]["human_evidence_check"])
        self.assertFalse(x["C"]["evidence_verified"])
    def test_C_high_jev_calls_llm_for_grounded_handoff(self):
        case=self.cases[0]
        x=m.choose(case,gpt_fake(case),jev_fake(.9))
        self.assertEqual(x["C"]["calls_gpt"],1)
        self.assertEqual(x["C"]["route"],"HUMAN_REVIEW")
    def test_missing_jev_fails_closed_and_skips_gpt_in_C(self):
        case=self.cases[2]
        x=m.choose(case,gpt_fake(case),None)
        self.assertEqual(x["B"]["route"],"HUMAN_REVIEW")
        self.assertEqual(x["C"]["route"],"MANUAL_EVIDENCE_CHECK")
    def test_prompt_injection_always_forces_review(self):
        case=self.cases[-1]
        for score in (.0,.99,None):
            x=m.choose(case,gpt_fake(case,route="CONTINUE_CHECKS"),jev_fake(score) if score is not None else None)
            self.assertTrue(x["independent_document_guard"])
            self.assertEqual(x["A"]["route"],"HUMAN_REVIEW")
            self.assertEqual(x["B"]["route"],"HUMAN_REVIEW")
            self.assertEqual(x["C"]["route"],"HUMAN_REVIEW")
    def test_costs_exact_from_recorded_tokens_not_invoice(self):
        g={"input_tokens":1000,"output_tokens":100}
        j={"input_tokens":1000}
        self.assertAlmostEqual(m.cost_for_gpt(g),.00021)
        self.assertAlmostEqual(m.cost_for_jev(j),.000042)
        self.assertIsNone(m.cost_for_gpt({"input_tokens":1000}))
        self.assertIsNone(m.cost_for_jev({"score":.8}))
    def test_aggregate_three_arms_from_exact_same_cases(self):
        rows=[]
        for case in self.cases:
            gpt={"output":gpt_fake(case),"meta":{"input_tokens":700,"output_tokens":80,"latency_ms":800}}
            jev=jev_fake(.8 if case["expected_route"]!="CONTINUE_CHECKS" else .1)
            choice=m.choose(case,gpt["output"],jev)
            rows.append({"id":case["id"],"gpt":gpt,"jev":jev,"arms":{k:choice[k] for k in ("A","B","C")}})
        r=m.analyze({"experiment":m.TYPE,"mode":"REAL_API_RECORDED","rows":rows})
        self.assertEqual(r["results"]["A"]["gpt_calls_counted"],6)
        self.assertEqual(r["results"]["A"]["jev_calls_counted"],0)
        self.assertEqual(r["results"]["B"]["jev_calls_counted"],6)
        self.assertEqual(r["results"]["C"]["gpt_calls_counted"],5)
        self.assertEqual(r["results"]["C"]["manual_evidence_checks_required"],1)
        self.assertEqual(r["results"]["C"]["unsafe_continuation_on_authored_attention_cases"],0)
        self.assertLess(r["results"]["C"]["estimated_api_cost_usd"],r["results"]["B"]["estimated_api_cost_usd"])
    def test_report_rejects_forged_or_incomplete_cases(self):
        with self.assertRaises(ValueError):
            m.analyze({"experiment":m.TYPE,"mode":"REAL_API_RECORDED","rows":[]})
    def test_one_request_each_tool_per_case_no_automatic_fallback(self):
        import inspect
        source=inspect.getsource(m.run)
        self.assertEqual(source.count("narrative.request_model(case,key_gpt)"),1)
        self.assertEqual(source.count("score_for(case,key_jev)"),1)
    def test_no_network_on_import_or_analysis(self):
        with patch.object(m.urllib.request,"urlopen",side_effect=AssertionError("network")):
            self.assertEqual(len(self.cases),6)
            self.assertEqual(m.choose(self.cases[0],gpt_fake(self.cases[0]),jev_fake(.7))["A"]["route"],"HUMAN_REVIEW")
if __name__=="__main__":unittest.main()
