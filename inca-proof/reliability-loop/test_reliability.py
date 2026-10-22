"""Offline tests of all 12 fictional ClaimsOps traces and reproducible CI report."""
import copy,json,pathlib,sys,unittest
HERE=pathlib.Path(__file__).resolve().parent
sys.path.insert(0,str(HERE))
import reliability as m
class ReliabilityTests(unittest.TestCase):
 @classmethod
 def setUpClass(cls):cls.data=m.fixtures()
 def test_12_known_cases_5_failure_classes(self):
  self.assertEqual(len(clsdata:=self.data),12)
  self.assertEqual(len({x['id'] for x in clsdata}),12)
  self.assertEqual({x['fault_type'] for x in clsdata if x['fault_type']!='none'},set(m.FAULTS))
 def test_true_quote_in_outdated_policy_is_still_unsafe(self):
  c=self.data[0];t=c['before']['trace'];src=next(d for d in c['before']['documents'] if d['id']==t['source_id'])
  self.assertIn(t['quote'],src['text'])
  self.assertEqual(m.evaluate(c,'before')['failures'],['policy_revision'])
  self.assertEqual(m.evaluate(c,'before')['next_step'],'HUMAN_REVIEW_REQUIRED')
 def test_planted_defects_block_and_scripted_fixes_clear(self):
  for c in self.data:
   with self.subTest(case=c['id']):
    self.assertEqual(m.evaluate(c,'before')['pass'],c['fault_type']=='none')
    self.assertTrue(m.evaluate(c,'after')['pass'])
 def test_unverifiable_quote_and_missing_source_fail(self):
  self.assertIn('source_quote',m.evaluate(self.data[1],'before')['failures'])
  self.assertIn('source_reference',m.evaluate(self.data[3],'before')['failures'])
 def test_unauthorized_payment_instruction_fails(self):
  self.assertEqual(m.evaluate(self.data[2],'before')['failures'],['no_external_action'])
 def test_skip_or_reverse_source_verification_fails(self):
  self.assertIn('verification_step',m.evaluate(self.data[4],'before')['failures'])
  c=self.data[4];t=copy.deepcopy(c['after']);t['trace']['steps']=['suggest_handoff','verify_source']
  self.assertIn('verification_step',[x['id'] for x in m.checks(c,t) if not x['pass']])
 def test_forbidden_approval_or_wrong_policy_rev_always_blocked(self):
  c=self.data[0];a=copy.deepcopy(c['after']);a['trace']['next_gate']='PAY_NOW'
  self.assertIn('bounded_gate',[x['id'] for x in m.checks(c,a) if not x['pass']])
  a=copy.deepcopy(c['after']);a['trace']['selected_policy_revision']='2024'
  self.assertIn('policy_revision',[x['id'] for x in m.checks(c,a) if not x['pass']])
 def test_generated_report_is_stable_and_zero_api(self):
  a=m.report();self.assertEqual(a,m.report())
  self.assertEqual(a['metrics']['release_a_blocked'],5)
  self.assertEqual(a['metrics']['release_b_passed'],12)
  self.assertEqual(a['metrics']['seeded_fault_escapes_with_guard'],0)
  self.assertEqual(a['metrics']['api_requests'],0)
  self.assertTrue(any('not measured' in v.lower() for v in a['assumptions']))
 def test_static_json_matches_actual_python_evaluation(self):
  p=HERE.parents[1]/'inca'/'reliability-loop-data.json'
  self.assertEqual(json.loads(p.read_text(encoding='utf8')),m.report())
if __name__=='__main__':unittest.main()
