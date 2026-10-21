import importlib.util
import json
import sys
import unittest
from pathlib import Path

HERE=Path(__file__).resolve().parent
spec=importlib.util.spec_from_file_location("run_shift_snapshot",HERE/"run_shift_snapshot.py")
shift=importlib.util.module_from_spec(spec)
sys.modules[spec.name]=shift
spec.loader.exec_module(shift)

class ShiftExtractionTests(unittest.TestCase):
    def setUp(self):
        self.cases=json.loads((HERE/"shift_cases.json").read_text(encoding="utf-8"))["cases"]
        self.assertEqual(len(self.cases),8)
        self.by_id={c["id"]:c for c in self.cases}

    def output(self,a_date,b_date,a_quote,b_quote,injection=False):
        return {"source_a":{"date":a_date,"quote":a_quote},
                "source_b":{"date":b_date,"quote":b_quote},
                "prompt_injection_detected":injection,"uncertainty":""}

    def test_known_contradiction(self):
        o=self.output("2026-07-11","2026-07-12",
            "Stornierungsdatum: 11.07.2026","Stornierungsdatum: 12.07.2026")
        x=shift.evaluate_extraction(self.by_id["ST-104"],o)
        self.assertEqual(x["route"],"HUMAN_REVIEW")
        self.assertTrue(x["valid_evidence"])

    def test_matching_dated_documents(self):
        o=self.output("2026-09-06","2026-09-06",
            "Stornierungsdatum: 06.09.2026","Stornierungsdatum: 06.09.2026")
        x=shift.evaluate_extraction(self.by_id["ST-318"],o)
        self.assertEqual(x["route"],"CONTINUE_CHECKS")
        self.assertTrue(x["valid_evidence"])

    def test_missing_evidence(self):
        o=self.output("2026-08-18",None,"18.08.2026",None)
        self.assertEqual(shift.evaluate_extraction(self.by_id["ST-207"],o)["route"],"NEED_INFO")

    def test_natural_language_quotes(self):
        o=self.output("2026-06-04","2026-06-04","am 4. Juni 2026","2026-06-04")
        self.assertEqual(shift.evaluate_extraction(self.by_id["ST-421"],o)["route"],"CONTINUE_CHECKS")

    def test_prompt_injection_remains_blocked_even_if_model_misses_it(self):
        o=self.output("2026-07-11","2026-07-11",
             "Stornierungsdatum: 11.07.2026","Stornierungsdatum: 11.07.2026",False)
        self.assertEqual(shift.evaluate_extraction(self.by_id["ST-533"],o)["route"],"HUMAN_REVIEW")

    def test_ungrounded_quote_fails_closed(self):
        o=self.output("2026-07-11","2026-07-11",
             "Stornierungsdatum: 11.07.2026","Stornierungsdatum: 11.07.2026")
        out=shift.evaluate_extraction(self.by_id["ST-104"],o)
        self.assertEqual(out["route"],"HUMAN_REVIEW")
        self.assertFalse(out["valid_evidence"])

    def test_date_must_match_exact_quote(self):
        o=self.output("2026-09-06","2026-10-06",
             "Stornierungsdatum: 06.09.2026","Stornierungsdatum: 06.09.2026")
        out=shift.evaluate_extraction(self.by_id["ST-318"],o)
        self.assertFalse(out["valid_evidence"])
        self.assertEqual(out["route"],"HUMAN_REVIEW")

    def test_invalid_model_response_is_never_a_clearance(self):
        out=shift.evaluate_extraction(self.by_id["ST-318"],{"source_a":{"date":"2026-09-06"}})
        self.assertEqual(out["route"],"HUMAN_REVIEW")

    def test_token_cost_is_bounded_and_no_calls_in_test(self):
        self.assertLessEqual(len(self.cases),8)
        body=shift.request_payload(self.cases[0],"gpt-6-luna")
        self.assertEqual(body["response_format"]["type"],"json_schema")
        self.assertIn("reasoning_effort",body)
        self.assertNotIn("Authorization",json.dumps(body))

    def test_report_discloses_expert_review_not_performed(self):
        def fake(case,model):
            return {"source_a":{"date":None,"quote":None},
                    "source_b":{"date":None,"quote":None},
                    "prompt_injection_detected":False,"uncertainty":"No dates"}, {"prompt_tokens":1,"completion_tokens":1},3
        r=shift.build_report(self.cases,"FAKE_OFFLINE_TEST",fake)
        self.assertIsNone(r["scoring"]["real_expert_corrections"])
        self.assertIsNone(r["scoring"]["measured_time_saved_seconds"])
        self.assertEqual(r["scoring"]["cases"],8)

if __name__=="__main__":unittest.main()
