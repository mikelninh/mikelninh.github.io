"""Unit tests for recorded Jev/GPT economics; all tests offline with zero API use."""
import importlib.util
import json
import pathlib
import unittest

HERE=pathlib.Path(__file__).resolve().parent
spec=importlib.util.spec_from_file_location("decision_economics", HERE/"decision_economics.py")
econ=importlib.util.module_from_spec(spec)
spec.loader.exec_module(econ)

class DecisionEconomicsTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):cls.doc=econ.load()
    def test_raw_recorded_costs_using_actual_token_counts(self):
        costs=econ.model_api_costs(self.doc)
        self.assertAlmostEqual(costs["jev"],.000361746,places=10)
        self.assertAlmostEqual(costs["gpt"],.00064515,places=10)
        self.assertAlmostEqual(1-costs["jev"]/costs["gpt"],.439283887468,places=7)
    def test_guarded_replay_changes_attention_false_negatives_not_model_billing(self):
        a=econ.compute(self.doc,volume=20,attention_action_cost_usd=0,guarded=False)
        b=econ.compute(self.doc,volume=20,attention_action_cost_usd=0,guarded=True)
        self.assertEqual(a["models"]["gpt"]["missed_attention_equivalent"],2)
        self.assertEqual(b["models"]["gpt"]["missed_attention_equivalent"],0)
        self.assertEqual(a["models"]["gpt"]["api_cost_usd"],b["models"]["gpt"]["api_cost_usd"])
    def test_model_savings_reversed_if_more_reviews_have_cost(self):
        a=econ.compute(self.doc,volume=20,attention_action_cost_usd=5,missed_attention_cost_usd=0,guarded=False)
        self.assertEqual(a["models"]["jev"]["attention_actions_equivalent"],13)
        self.assertEqual(a["models"]["gpt"]["attention_actions_equivalent"],10)
        self.assertGreater(a["jev_minus_gpt_total_usd"],0)
        b=econ.compute(self.doc,volume=20,attention_action_cost_usd=5,missed_attention_cost_usd=20,guarded=False)
        self.assertLess(b["jev_minus_gpt_total_usd"],0)
    def test_guarded_gpt_has_fewer_rechecks_under_observed_dev_labels(self):
        a=econ.compute(self.doc,volume=20,attention_action_cost_usd=5,guarded=True)
        self.assertEqual(a["models"]["gpt"]["attention_actions_equivalent"],12)
        self.assertEqual(a["models"]["jev"]["attention_actions_equivalent"],13)
        self.assertEqual(a["models"]["gpt"]["extra_actions_equivalent"],2)
        self.assertEqual(a["models"]["jev"]["extra_actions_equivalent"],3)
        self.assertGreater(a["jev_minus_gpt_total_usd"],0)
    def test_invalid_scenarios(self):
        for kwargs in [
          {"volume":0},{"volume":10000001},{"volume":2.4},
          {"attention_action_cost_usd":-1},{"missed_attention_cost_usd":float("nan")},
        ]:
            with self.assertRaises(ValueError):econ.compute(self.doc,**kwargs)
    def test_a_tiny_sample_cannot_claim_provider_invoice(self):
        self.assertIsNone(self.doc["models"]["jev"].get("provider_cost_usd"))
        self.assertIn("not independent",self.doc["data_quality"].lower())
        self.assertIn("provider invoice",self.doc["caveats"][0].lower())
    def test_recorded_report_rejects_bad_rows_or_mismatch(self):
        fake={"status":"LIVE_API_RUN","rows":[{"id":"PB-"+str(i).zfill(3),
          "split":"dev","needs_attention":i%2==0,
          "jev":{"decision":True,"input_tokens":1},
          "gpt":{"decision":True,"input_tokens":1,"output_tokens":2}} for i in range(1,21)]}
        with self.assertRaises(ValueError):econ.check_recorded_pairs(fake,self.doc)
    def test_no_network_usage_anywhere_in_economic_model(self):
        source=(HERE/"decision_economics.py").read_text(encoding="utf-8")
        self.assertNotIn("urlopen",source)
        self.assertNotIn("requests.",source)

if __name__=="__main__":unittest.main()
