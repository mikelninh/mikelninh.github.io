import importlib.util
import pathlib
import sys
import unittest
from unittest.mock import patch

HERE=pathlib.Path(__file__).resolve().parent
sys.path.insert(0,str(HERE))
spec=importlib.util.spec_from_file_location("model_trial",HERE/"model_trial.py")
m=importlib.util.module_from_spec(spec)
spec.loader.exec_module(m)

class ModelTrialTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.cases=m.base.load_cases()
    @staticmethod
    def fake(c):
        _,pattern=m.base.FIELD[c["line"]]
        return {"specialist_tool":m.ALLOWED[c["line"]],
          **{"source_"+src.lower():{
            "quote":(found.group(0).strip() if (found:=pattern.search(c["documents"][src])) else ""),
            "value":(found.group(1).strip() if found else "")}
            for src in ("A","B")}}
    def test_all_six_mocked_model_proposals_have_safe_routes(self):
        for c in self.cases:
            result=m.evaluate(c,self.fake(c))
            self.assertEqual(result["status"],"EVALUATED",c["id"])
            self.assertEqual(result["decision"]["route"],c["expected_demo_route"],c["id"])
            self.assertEqual(result["external_actions"],0)
            self.assertFalse(result["decision"]["payment"])
            self.assertFalse(result["decision"]["coverage_approved"])
            self.assertEqual(result["decision"]["handoff"],"UNSENT_DRAFT")
    def test_model_cannot_call_the_wrong_specialist(self):
        c=self.cases[0];fake=self.fake(c)
        fake["specialist_tool"]="check_invoice_amounts"
        result=m.evaluate(c,fake)
        self.assertEqual(result["status"],"BLOCKED_FAILURE")
        self.assertEqual(result["decision"]["route"],"HUMAN_REVIEW")
    def test_fabricated_quote_fails_closed(self):
        c=self.cases[0];fake=self.fake(c);fake["source_a"]["quote"]="Stornierungsdatum: 25.12.2040"
        self.assertEqual(m.evaluate(c,fake)["status"],"BLOCKED_FAILURE")
    def test_value_must_match_quote_and_ground_truth(self):
        c=self.cases[0];fake=self.fake(c);fake["source_b"]["value"]="11.07.2026"
        self.assertEqual(m.evaluate(c,fake)["status"],"BLOCKED_FAILURE")
    def test_model_cannot_ignore_present_evidence(self):
        c=self.cases[0];fake=self.fake(c);fake["source_b"]={"value":"","quote":""}
        self.assertEqual(m.evaluate(c,fake)["status"],"BLOCKED_FAILURE")
    def test_multiple_conflicting_values_always_human_review(self):
        c=dict(self.cases[0])
        c["documents"]=dict(c["documents"])
        c["documents"]["A"]+="\nStornierungsdatum: 16.07.2026"
        r=m.evaluate(c,self.fake(c))
        self.assertEqual(r["decision"]["route"],"HUMAN_REVIEW")
        self.assertEqual(r["decision"]["reason"],"INTERNAL_CONTRADICTION")
    def test_prompt_injection_cannot_override_comparison(self):
        c=self.cases[-1];r=m.evaluate(c,self.fake(c))
        self.assertEqual(r["decision"]["reason"],"UNTRUSTED_DOCUMENT_INSTRUCTION")
    def test_model_prompt_excludes_expected_demo_route(self):
        c=self.cases[0];payload=m.payload(c,"gpt-4o-mini")
        self.assertNotIn("expected_demo_route",str(payload))
        self.assertEqual(payload["response_format"]["type"],"json_schema")
    def test_one_call_dry_run_without_secrets(self):
        with patch.object(m.urllib.request,"urlopen",side_effect=AssertionError("Network called")):
            self.assertEqual(m.ALLOWED["home"],"check_damage_photos")
            self.assertEqual(m.ALLOWED["theft"],"check_frame_numbers")
            self.assertEqual(len(m.ALLOWED),5)
    def test_missing_model_keys_fail_closed(self):
        c=self.cases[0]
        r=m.evaluate(c,{"source_a":{"quote":"x","value":"y"}})
        self.assertEqual(r["status"],"BLOCKED_FAILURE")
    def test_malformed_json_blocks(self):
        c=self.cases[0]
        for proposal in (None,{},[],{"specialist_tool":"check_cancellation_dates","source_a":1,"source_b":1}):
            self.assertEqual(m.evaluate(c,proposal)["status"],"BLOCKED_FAILURE")
if __name__=="__main__":unittest.main()
