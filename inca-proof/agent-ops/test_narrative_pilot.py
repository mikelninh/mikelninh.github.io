import importlib.util
import json
import pathlib
import sys
import unittest
from unittest.mock import patch
HERE=pathlib.Path(__file__).resolve().parent
sys.path.insert(0,str(HERE))
spec=importlib.util.spec_from_file_location("narrative_pilot",HERE/"narrative_pilot.py")
m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)

PRESETS=[
 ("check_cancellation_dates","I cancelled my flight on 11 July 2026","11 July 2026",
  "We processed the cancellation on 12 July 2026","12 July 2026"),
 ("check_damage_photos","I haven't taken any photos yet","haven't taken any photos yet",
  "Images not uploaded","Images not uploaded"),
 ("check_frame_numbers","frame number BIKE-4832","BIKE-4832",
  "serial identifier BIKE-4832","BIKE-4832"),
 ("check_liability_dispute","I accept responsibility for the scratch","accept responsibility",
  "I dispute the insured person's description of the damage","I dispute"),
 ("check_invoice_amounts","screen replacement would cost €480","€480",
  "Final repair invoice: €630","€630"),
 ("check_cancellation_dates","I cancelled the hotel on 4 June 2026","4 June 2026",
  "Cancellation processed on 4 June 2026","4 June 2026")
]
def crafted(index):
    tool,qa,va,qb,vb=PRESETS[index]
    return {"specialist_tool":tool,
      "source_a":{"quote":qa,"value":va},"source_b":{"quote":qb,"value":vb}}

class NarrativePilotTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.c=m.cases()
    def test_six_representative_document_types_and_routes(self):
        self.assertEqual(len(self.c),6)
        self.assertEqual(len(set(c["kind"] for c in self.c)),5)
        for i,c in enumerate(self.c):
            rec=m.judge(c,crafted(i))
            self.assertTrue(rec["verified"],(c["id"],rec.get("validation_error_type")))
            self.assertTrue(rec["matched_expected_route"],(c["id"],rec["reason"]))
            self.assertEqual(rec["external_actions"],0)
    def test_model_has_no_gold_labels_or_category_in_prompt(self):
        for c in self.c:
            p=m.model_payload(c)
            content=p["messages"][1]["content"]
            self.assertNotIn("expected_route",content)
            self.assertNotIn("kind",content)
            self.assertNotIn("scenario",content)
            self.assertNotIn("selected_tool",content)
    def test_pre_existing_rule_cannot_extract_these_narratives(self):
        self.assertFalse(any(m.baseline(c)["labelled_field_found_in_both"] for c in self.c))
    def test_invalid_tool_or_fabricated_quote_is_not_considered_verified(self):
        c=self.c[0]
        p=crafted(0);p["specialist_tool"]="check_invoice_amounts"
        self.assertFalse(m.judge(c,p)["verified"])
        p=crafted(0);p["source_a"]["quote"]="I cancelled on 11 January 2099"
        self.assertFalse(m.judge(c,p)["verified"])
    def test_model_does_not_get_to_override_validation_or_approval(self):
        c=self.c[2];p=crafted(2);p["route"]="AUTO_APPROVE"
        r=m.judge(c,p)
        self.assertFalse(r["verified"])
        self.assertEqual(r["route"],"HUMAN_REVIEW")
        self.assertFalse(r["coverage_approved"])
        self.assertFalse(r["payment"])
    def test_empty_response_fails_closed(self):
        r=m.judge(self.c[0],None)
        self.assertEqual(r["route"],"HUMAN_REVIEW")
        self.assertFalse(r["verified"])
        self.assertFalse(r["matched_expected_route"])
    def test_injection_in_document_overrides_matching_dates(self):
        r=m.judge(self.c[5],crafted(5))
        self.assertEqual(r["reason"],"UNTRUSTED_DOCUMENT_INSTRUCTION")
        self.assertEqual(r["route"],"HUMAN_REVIEW")
    def test_no_model_calls_in_offline_fixture_checks(self):
        with patch.object(m.urllib.request,"urlopen",side_effect=AssertionError("Unexpected paid request")):
            for i,c in enumerate(self.c):
                self.assertTrue(m.judge(c,crafted(i))["verified"])
    def test_ambiguous_quotes_and_values_are_rejected(self):
        c=self.c[4];p=crafted(4)
        p["source_b"]["value"]="€999"
        self.assertFalse(m.judge(c,p)["verified"])
    def test_german_and_english_date_normalization(self):
        self.assertEqual(m.parse_date("I cancelled on 11 July 2026"),["2026-07-11"])
        self.assertEqual(m.parse_date("Storniert am 11. Juli 2026"),["2026-07-11"])
        self.assertEqual(m.parse_date("Stornierung: 11.07.2026"),["2026-07-11"])
if __name__=="__main__":unittest.main()
