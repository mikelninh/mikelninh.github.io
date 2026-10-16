import importlib.util
import os
from pathlib import Path
import sys
import unittest
HERE=Path(__file__).resolve().parent
sys.path.insert(0,str(HERE))
spec=importlib.util.spec_from_file_location("reasoning_matrix",HERE/"matrix.py")
matrix=importlib.util.module_from_spec(spec)
sys.modules[spec.name]=matrix
spec.loader.exec_module(matrix)

class BudgetMatrixTests(unittest.TestCase):
 def setUp(self):
  self.cases,self.gold=matrix.fixtures()
  self.first=self.cases[0]
 def test_all_model_effort_profiles(self):
  self.assertEqual(len(matrix.PROFILES),9)
  self.assertEqual(len({p["id"] for p in matrix.PROFILES}),9)
  self.assertEqual([p["effort"] for p in matrix.PROFILES if p["family"]=="luna"],["none","low","medium","high"])
  self.assertEqual([p["effort"] for p in matrix.PROFILES if p["family"]=="astra"],["low","high"])
 def test_rates_reflect_standard_pricing(self):
  self.assertEqual(matrix.PRICES["gpt-6-astra"],(10.,50.))
  self.assertEqual(matrix.PRICES["gpt-6-luna"],(.1,.5))
 def test_no_calls_in_default_dry_run(self):
  calls=[]
  def unexpected(*args):calls.append(1);raise RuntimeError("should not run")
  result=matrix.evaluate(live=False,transport=unexpected)
  self.assertEqual(result["mode"],"dry_run_no_api")
  self.assertEqual(result["budget"]["accounted_usd"],0)
  self.assertFalse(calls)
  self.assertEqual(len(result["profiles"]),9)
 def test_budget_rejects_more_than_user_has(self):
  with self.assertRaises(ValueError):matrix.Budget(2.59)
  with self.assertRaises(ValueError):matrix.Budget(0)
 def test_no_requests_if_estimate_exceeds_budget(self):
  invoked=[]
  def unexpected(*args):invoked.append(1);raise RuntimeError("called")
  budget=matrix.Budget(.00001)
  out=matrix.run_case(matrix.PROFILES[-1],self.first,self.gold,budget,1400,unexpected)
  self.assertEqual(out["status"],"budget_skipped")
  self.assertEqual(invoked,[])
 def test_quote_validation_in_real_benchmark_path(self):
  def mock(*args):
   return ({"claims":[{"field":"arr","kind":"actual","value":"EUR:240000",
      "source":self.first["docs"][0]["name"],"page":2,"quote":"ARR: €240k"}]},
      {"input":250,"output":50},70)
  budget=matrix.Budget(1.5)
  result=matrix.run_case(matrix.PROFILES[0],self.first,self.gold,budget,1400,mock)
  self.assertEqual(result["status"],"measured")
  self.assertEqual(result["verified_quotes"],1)
  self.assertGreater(budget.accounted,0)
 def test_error_reserves_cost_not_free(self):
  def fail(*args):raise RuntimeError("network error")
  budget=matrix.Budget(1.5)
  result=matrix.run_case(matrix.PROFILES[0],self.first,self.gold,budget,1400,fail)
  self.assertEqual(result["status"],"error")
  self.assertGreater(budget.accounted,0)
 def test_finalist_needs_same_three_complete_cases(self):
  report={p["id"]:[] for p in matrix.PROFILES}
  self.assertEqual(matrix.choose_finalists(report),[])
 def test_budget_capped_matrix_run_with_mock_transport(self):
  def fake(model,effort,content,cap):
   return ({"claims":[]},{"input":150,"output":120},7)
  report=matrix.evaluate(maximum=1.50,live=True,transport=fake)
  self.assertLessEqual(report["budget"]["accounted_usd"],1.50)
  self.assertEqual(report["schema"],"first-mile-reasoning-matrix/v1")
  self.assertEqual(report["mode"],"live_paid_api")
  self.assertTrue(report["selected_finalists"])
  self.assertEqual(len([p for p in report["profiles"] if p["complete_six"]]),3)
 def test_no_fake_winner_without_real_results(self):
  dry=matrix.evaluate()
  self.assertEqual(dry["recommendation"]["status"],"not_run")
 def test_cap_range_enforced(self):
  with self.assertRaises(ValueError):matrix.evaluate(cap=100)

if __name__=="__main__":unittest.main()
