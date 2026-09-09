import json, sys, unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/"src"))
from claims_eval import load_claims, load_policies, route_v1, route_v2, route_v3, evaluate, valid_policy_refs

class ClaimsProofTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.claims=load_claims()
        cls.policies=load_policies()

    def test_dataset_contract(self):
        self.assertEqual(len(self.claims),72)
        self.assertEqual(sum(c["split"]=="dev" for c in self.claims),40)
        self.assertEqual(sum(c["split"]=="holdout_a" for c in self.claims),20)
        self.assertEqual(sum(c["split"]=="regression_b" for c in self.claims),12)

    def test_holdout_improvement_is_measured(self):
        v1=evaluate(route_v1,self.claims,"holdout_a")
        v2=evaluate(route_v2,self.claims,"holdout_a")
        self.assertEqual(v1["route_match_count"],"13/20")
        self.assertEqual(v2["route_match_count"],"19/20")
        self.assertGreater(v2["route_match"],v1["route_match"])

    def test_known_v2_failure_is_explicit(self):
        v2=evaluate(route_v2,self.claims,"holdout_a")
        self.assertEqual([x["id"] for x in v2["failures"]],["H-A-011"])

    def test_post_fix_regression_set(self):
        v3=evaluate(route_v3,self.claims,"regression_b")
        self.assertEqual(v3["route_match_count"],"12/12")

    def test_all_policy_refs_are_grounded(self):
        self.assertTrue(all(valid_policy_refs(c,self.policies) for c in self.claims))

    def test_no_router_performs_external_action(self):
        # Routers only return a next route + reasons.
        for router in (route_v1,route_v2,route_v3):
            for c in self.claims:
                result=router(c)
                self.assertEqual(len(result),2)

if __name__=="__main__":
    unittest.main()
