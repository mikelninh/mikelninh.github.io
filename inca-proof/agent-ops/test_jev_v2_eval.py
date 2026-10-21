"""Reproducible and free contract tests for the Jev Research V2 challenge."""
import importlib.util
import json
import pathlib
import sys
import unittest
from unittest.mock import patch
HERE=pathlib.Path(__file__).resolve().parent
sys.path.insert(0,str(HERE))
import jev_v2_dataset as d
import jev_v2_eval as e

class JevV2Tests(unittest.TestCase):
 @classmethod
 def setUpClass(cls):
  cls.rows=d.generate()
 def test_all_300_unique_balanced_and_split_frozen(self):
  self.assertEqual(len(self.rows),300)
  self.assertEqual(len({x["id"] for x in self.rows}),300)
  self.assertEqual(sum(x["split"]=="dev" for x in self.rows),60)
  self.assertEqual(sum(x["split"]=="holdout" for x in self.rows),240)
  self.assertEqual({x["kind"] for x in self.rows},set(d.LINES))
  self.assertEqual(d.dataset_sha(self.rows),d.dataset_sha(d.generate()))
 def test_template_disjoint_and_no_gold_leaks_to_model(self):
  for x in self.rows:
   msg=json.dumps(d.model_input(x),ensure_ascii=False)
   for secret in ("expected_specialist","expected_claim_gate",
                  "generator_scenario","generator_fault_type","critical_trace_error",
                  "noncritical_trace_issue","cohort","split"):
    self.assertNotIn('"'+secret+'"',msg)
  self.assertEqual(len(set(x["source_a"] for x in self.rows)),300)
 def test_fault_labels_are_not_trivial_all_positive(self):
  for split in ("dev","holdout"):
   r=[x for x in self.rows if x["split"]==split]
   n=sum(x["critical_trace_error"] for x in r)
   self.assertGreater(n,len(r)//10)
   self.assertLess(n,len(r)//3)
   self.assertTrue(any(x["noncritical_trace_issue"] for x in r))
 def test_no_network_during_corpus_or_dry_run(self):
  with patch.object(e.urllib.request,"urlopen",side_effect=AssertionError("unexpected paid call")):
   for shard in range(3):
    r=e.run("dry-run",shard)
    self.assertEqual(len(r["rows"]),100)
    self.assertEqual(r["model_calls_attempted"],{"jev":0,"gpt":0})
 def test_jev_payload_uses_choice_and_noul_same_request(self):
  c=self.rows[0];p=e.payload_jev(c)
  self.assertEqual(p["questions"]["specialist"]["type"],"choice")
  self.assertEqual(p["questions"]["needs_trace_audit"]["type"],"noul")
  self.assertEqual(set(p["questions"]["specialist"]["criteria"]),set(e.OPTIONS))
  self.assertNotIn("expected_specialist",json.dumps(p))
 def test_gpt_uses_comparable_fixed_labels_and_bounded_output(self):
  p=e.payload_gpt(self.rows[0])
  self.assertEqual(p["response_format"]["type"],"json_schema")
  self.assertEqual(set(p["response_format"]["json_schema"]["schema"]["properties"]["specialist"]["enum"]),set(e.OPTIONS))
  self.assertNotIn("\"critical_trace_error\"",p["messages"][1]["content"])
 def test_jev_and_gpt_result_parsing_reject_bad_outputs(self):
  with self.assertRaises(ValueError):
   e.parse_jev({"answers":{"specialist":{"choice":"random"},"needs_trace_audit":{"noul":.2}}},20)
  with self.assertRaises(ValueError):
   e.parse_jev({"answers":{"specialist":{"choice":"check_cancellation"},"needs_trace_audit":{"noul":float("nan")}}},20)
  with self.assertRaises(ValueError):
   e.parse_gpt({"choices":[{"finish_reason":"stop","message":{"content":'{"specialist":"other","critical_trace_error_probability":2}'}}]},50)
 def test_valid_parsers_and_revision_capture(self):
  j=e.parse_jev({"model":"jev-1.14.0","answers":{"specialist":{"choice":"check_cancellation"},"needs_trace_audit":{"noul":.4}},"usage":{"input_tokens":600}},120)
  self.assertEqual(j["model"],"jev-1.14.0")
  self.assertEqual(j["risk"],.4)
  g=e.parse_gpt({"model":"gpt-4o-mini","choices":[{"finish_reason":"stop","message":{"content":'{"specialist":"check_cancellation","critical_trace_error_probability":0.9}'}}],"usage":{"prompt_tokens":100,"completion_tokens":14}},600)
  self.assertEqual(g["input_tokens"],100)
 def test_rule_baselines_only_look_at_model_input(self):
  for c in self.rows:
   res=e.simple_rules(c)
   self.assertIn(res["specialist"],e.OPTIONS)
   self.assertIn(res["risk"],(0.0,1.0))
 def test_metric_summary_keeps_unscored_as_errors_not_hits(self):
  sample=[]
  for c in self.rows[:10]:
   sample.append({"id":c["id"],"split":"dev","cohort":c["cohort"],
                  "expected_specialist":c["expected_specialist"],
                  "critical_trace_error":c["critical_trace_error"],
                  "rule":e.simple_rules(c),"jev":None,"gpt":None})
  result=e.metrics(sample,"dev")
  self.assertEqual(result["jev"]["tool_choice"]["unscored"],10)
  self.assertEqual(result["jev"]["tool_choice"]["correct"],0)
 def test_counterfeit_or_partial_artifacts_cannot_be_combined(self):
  with self.assertRaises(ValueError):e.combine([])
  with self.assertRaises(ValueError):e.shard_rows(3)
 def test_complete_offline_shards_recombine_to_300_without_false_success(self):
  parts=[e.run("dry-run",i) for i in range(3)]
  r=e.combine(parts)
  self.assertEqual(r["status"],"OFFLINE_ONLY")
  self.assertEqual(r["metrics"]["dev"]["n"],60)
  self.assertEqual(r["metrics"]["holdout"]["n"],240)
  self.assertEqual(r["attempts"],{"jev":0,"gpt":0})
  self.assertEqual(r["metrics"]["holdout"]["gpt"]["scored"],0)
  self.assertEqual(r["metrics"]["holdout"]["jev"]["tool_choice"]["correct"],0)
if __name__=="__main__":unittest.main()
