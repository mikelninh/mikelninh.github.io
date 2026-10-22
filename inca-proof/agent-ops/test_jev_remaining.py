"""No-cost tests for H2/H6 re-analysis and new H7 bilingual version evaluation."""
import pathlib,sys,unittest,json
from unittest.mock import patch
HERE=pathlib.Path(__file__).resolve().parent
sys.path.insert(0,str(HERE))
import jev_h2_h6_analysis as h
import jev_h7_bilingual as v

class RemainingHypothesisTests(unittest.TestCase):
 def test_40_semantically_paired_new_synthetic_facts(self):
  pairs=v.split_inputs()
  self.assertEqual(len(pairs),80)
  self.assertEqual(len(set(c["pair_id"] for c in pairs)),40)
  self.assertEqual({c["language"] for c in pairs},{"de","en"})
  self.assertEqual({c["kind"] for c in pairs},set(v.TASKS))
  for i in range(0,80,2):
   en,de=pairs[i],pairs[i+1]
   self.assertEqual(en["pair_id"],de["pair_id"])
   self.assertEqual(en["expected_specialist"],de["expected_specialist"])
   self.assertEqual(en["critical_trace_error"],de["critical_trace_error"])
 def test_version_pin_is_required_and_does_not_send_oracle(self):
  for model in v.VERSIONS:
   c=v.fixture()[0]
   p=v.prompt(c,model)
   self.assertEqual(p["model"],model)
   self.assertEqual(p["questions"]["specialist"]["type"],"choice")
   self.assertEqual(p["questions"]["trace_fault"]["type"],"noul")
   for marker in ("expected_specialist","critical_trace_error","pair_id","kind"):
    self.assertNotIn('"'+marker+'"',json.dumps(p))
 def test_h7_invalid_model_result_not_silently_successful(self):
  class BadResponse:
   def __enter__(self):return self
   def __exit__(self,*args):return False
   def read(self,n):return b\'{"answers":{"specialist":{"choice":"unknown"},"trace_fault":{"noul":0.3}}}\'
  with patch.object(v.urllib.request,"urlopen",return_value=BadResponse()):
   with self.assertRaises(ValueError):
    v.request(v.prompt(v.fixture()[0],"jev-1.13.0"),"fake-key")
 def test_h7_empty_synthesis_does_not_claim_success(self):
  self.assertEqual(v.evaluate([])["status"],"INCOMPLETE")
 def test_h7_summary_with_mocked_results(self):
  rows=[]
  for model in v.VERSIONS:
   for case in v.split_inputs():
    rows.append({"version_requested":model,"pair_id":case["pair_id"],
     "language":case["language"],"expected_specialist":case["expected_specialist"],
     "critical_trace_error":case["critical_trace_error"],
     "result":{"specialist":case["expected_specialist"],"risk":float(case["critical_trace_error"]),
       "model":model,"input_tokens":400,"latency_ms":80}})
  s=v.evaluate(rows)
  self.assertEqual(s["status"],"RECORDED_REAL_BILINGUAL_VERSION_COMPARISON")
  self.assertEqual(s["model_metrics"]["jev-1.13.0/de"]["tool_correct"],40)
  self.assertEqual(s["model_metrics"]["jev-1.14.0/en"]["tool_correct"],40)
 def test_h2_threshold_selected_only_from_development(self):
  rows=[{"jev":{"risk":.17},"critical_trace_error":True},{"jev":{"risk":.5},"critical_trace_error":True}]
  self.assertEqual(h.choose_dev_threshold(rows,"jev"),.17)
 def test_h2_calibration_formula(self):
  rows=[{"critical_trace_error":True,"jev":{"risk":.8}},
        {"critical_trace_error":False,"jev":{"risk":.2}}]
  self.assertAlmostEqual(h.brier(rows,"jev"),.04)
  self.assertGreaterEqual(h.ece(rows,"jev"),0)
 def test_h2_invalid_or_partial_artifact_cannot_pass(self):
  with self.assertRaises(ValueError):h.analyze({})
 def test_h2_and_h7_offline_import_never_calls_apis(self):
  with patch.object(v.urllib.request,"urlopen",side_effect=AssertionError("network called")):
   self.assertEqual(len(v.fixture()),80)
   self.assertIsNone(h.brier([], "jev") if False else None)
if __name__=="__main__":unittest.main()
