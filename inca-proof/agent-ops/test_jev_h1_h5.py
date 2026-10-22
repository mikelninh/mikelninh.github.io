"""H1/H5 provider-free regression suite: provenance, fair task, and fail-closed."""
import pathlib,sys,json,unittest
from unittest.mock import patch
HERE=pathlib.Path(__file__).resolve().parent
sys.path.insert(0,str(HERE))
import jev_h1_h5 as m

class H1H5Tests(unittest.TestCase):
 @classmethod
 def setUpClass(cls):cls.cases=m.generate()
 def test_40_new_cases_10_dev_30_fixed_holdout(self):
  self.assertEqual(len(self.cases),40)
  self.assertEqual(len(set(c["id"] for c in self.cases)),40)
  self.assertEqual(sum(c["split"]=="dev" for c in self.cases),10)
  self.assertEqual(sum(c["split"]=="holdout" for c in self.cases),30)
  self.assertEqual(len(set(c["case_type"] for c in self.cases)),5)
  self.assertEqual(m.sha(self.cases),m.sha(m.generate()))
 def test_models_get_verified_facts_only_not_gold_labels(self):
  for c in self.cases:
   for payload in (m.jev_payload(c,list(m.OPTIONS)),m.gpt_payload(c,list(m.OPTIONS))):
    # Correct choices appear in response schema by design, oracle labels
    # do NOT appear as named fields in user source state.
    s=json.dumps(payload)
    self.assertNotIn('"expected"',s)
    self.assertNotIn('"scenario"',s)
    self.assertNotIn('"case_type"',s)
    self.assertNotIn('"split"',s)
 def test_exact_baseline_uses_no_gold_metadata(self):
  for c in self.cases:
   self.assertEqual(m.rules(c),c["expected"])
   changed=dict(c)
   changed["expected"]={x:"wrong" for x in c["expected"]}
   self.assertEqual(m.rules(changed),m.rules(c))
 def test_four_typed_choices_vs_identical_gpt_enums(self):
  c=self.cases[0];keys=list(m.OPTIONS)
  a=m.jev_payload(c,keys);b=m.gpt_payload(c,keys)
  self.assertEqual(len(a["questions"]),4)
  self.assertEqual(set(b["response_format"]["json_schema"]["schema"]["properties"]),set(keys))
  for k in keys:
   self.assertEqual(a["questions"][k]["type"],"choice")
   self.assertEqual(set(a["questions"][k]["criteria"]),set(b["response_format"]["json_schema"]["schema"]["properties"][k]["enum"]))
 def test_explicit_single_only_next_action(self):
  c=self.cases[5]
  self.assertEqual(list(m.jev_payload(c,["next_action"])["questions"]),["next_action"])
  self.assertEqual(list(m.gpt_payload(c,["next_action"])["response_format"]["json_schema"]["schema"]["required"]),["next_action"])
 def test_reject_unsupported_choices(self):
  with self.assertRaises(ValueError):
   m.parse_jev({"model":"jev-1.14.0","answers":{"next_action":{"choice":"PAY_NOW"}}},50,["next_action"])
  with self.assertRaises(ValueError):
   m.parse_gpt({"choices":[{"finish_reason":"stop","message":{"content":'{"next_action":"APPROVE"}'}}]},50,["next_action"])
 def test_provider_cost_computations_use_recorded_tokens_not_invoices(self):
  self.assertAlmostEqual(m.price("jev_multi",{"input_tokens":1000,"output_tokens":0}),.000042)
  self.assertAlmostEqual(m.price("gpt_multi",{"input_tokens":1000,"output_tokens":100}),.00021)
  self.assertIsNone(m.price("jev_single",{"input_tokens":None,"output_tokens":0}))
 def test_offline_run_is_safe_and_unscored_not_fabricated(self):
  with patch.object(m.urllib.request,"urlopen",side_effect=AssertionError("paid call")):
   r=m.run("dry-run")
  self.assertEqual(r["mode"],"OFFLINE_NO_REQUESTS")
  self.assertEqual(r["max_provider_calls"],0)
  self.assertEqual(r["metrics"]["gpt_multi"]["scored"],0)
  self.assertEqual(r["metrics"]["jev_single"]["scored"],0)
  self.assertEqual(r["metrics"]["deterministic_rules"]["exact_four_choices"],30)
  self.assertEqual(sum(x["sequential_sample"] for x in r["rows"]),12)
 def test_holdout_cases_with_missing_model_calls_are_not_counted_as_success(self):
  r=m.run("dry-run")
  self.assertEqual(r["metrics"]["jev_single"]["critical_under_escalations"],sum(x["expected"]["next_action"]=="HUMAN_REVIEW" for x in r["rows"] if x["split"]=="holdout"))
 def test_good_fake_provider_answers_score_correct(self):
  rows=[]
  for c in self.cases:
   base={"id":c["id"],"split":c["split"],"case_type":c["case_type"],"expected":c["expected"],"scenario":c["scenario"],"rules":m.rules(c),"sequential_sample":c["split"]=="holdout" and c["case_type"] in ("travel","home")}
   for name in ("jev_single","gpt_single","jev_multi","gpt_multi","jev_sequential"):
    base[name]={"answers":{k:v for k,v in c["expected"].items() if not name.endswith("single") or k=="next_action"},"model":"mock","ms":10,"input_tokens":50,"output_tokens":0}
   rows.append(base)
  summary=m.summarize(rows)
  self.assertEqual(summary["jev_multi"]["exact_cases"],30)
  self.assertEqual(summary["jev_single"]["exact_cases"],30)
  self.assertEqual(summary["jev_sequential"]["exact_cases"],12)
  self.assertEqual(summary["gpt_multi"]["question_total"],120)
if __name__=="__main__":unittest.main()
