"""Offline regression tests for the bounded INCA decision-model experiment."""
import importlib.util
import json
import math
import pathlib
import unittest
from unittest.mock import Mock

HERE = pathlib.Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location("cost_quality", HERE / "cost_quality.py")
lab = importlib.util.module_from_spec(spec)
spec.loader.exec_module(lab)

class DecisionLabTests(unittest.TestCase):
    def test_dataset_is_fictional_and_eight_cases(self):
        cases = lab.load_cases()
        self.assertEqual(len(cases), 8)
        self.assertEqual(len({c["id"] for c in cases}), 8)

    def test_payload_is_noul_and_source_text_only(self):
        p = lab.build_payload(lab.load_cases()[0])
        self.assertEqual(p["model"], "jev-latest")
        self.assertEqual(p["questions"]["needs_attention"]["type"], "noul")
        self.assertNotIn("expected", json.dumps(p))

    def test_official_typesafe_endpoint_only(self):
        self.assertEqual(lab.JEV_URL, "https://api.typesafe.ai/v1/systemone")
        self.assertNotIn("jevtypesafeai.com", lab.JEV_URL)

    def test_probability_validation(self):
        for bad in [True, "0.7", -0.1, 1.1, float("nan"), float("inf"), None]:
            with self.subTest(bad=bad), self.assertRaises(ValueError):
                lab.validated_score({"answers":{"needs_attention":{"noul":bad}}})
        self.assertEqual(lab.validated_score({"answers":{"needs_attention":{"noul":0.75}}}), .75)

    def test_never_override_existing_hold(self):
        for route in ("HUMAN_REVIEW", "NEED_INFO"):
            for score in (0, .5, 1, None):
                self.assertEqual(lab.shadow_route(route, score, .5), route)

    def test_missing_score_fails_closed(self):
        self.assertEqual(lab.shadow_route("CONTINUE_CHECKS", None, .5), "HUMAN_REVIEW")
        self.assertEqual(lab.shadow_route("UNKNOWN", .01, .5), "HUMAN_REVIEW")

    def test_threshold_matters(self):
        self.assertEqual(lab.shadow_route("CONTINUE_CHECKS", .6, .5), "HUMAN_REVIEW")
        self.assertEqual(lab.shadow_route("CONTINUE_CHECKS", .6, .7), "CONTINUE_CHECKS")

    def test_confusion_matrix_and_brier(self):
        rows = [{"expected":e,"score":p} for e,p in [
            ("HUMAN_REVIEW", .9), ("NEED_INFO", .4),
            ("CONTINUE_CHECKS", .6), ("CONTINUE_CHECKS", .1)]]
        m = lab.compute_metrics(rows, .5)
        self.assertEqual((m["tp"],m["fn"],m["fp"],m["tn"]), (1,1,1,1))
        self.assertEqual(m["scored"],4)
        self.assertAlmostEqual(m["brier"], .185, places=6)

    def test_invalid_scores_are_not_accuracy_success(self):
        m = lab.compute_metrics([{"expected":"HUMAN_REVIEW", "score":None}],.5)
        self.assertEqual(m["unscored"],1)
        self.assertIsNone(m["recall"])

    def test_dry_run_has_no_score_and_makes_no_request(self):
        original = json.loads(lab.BASELINE.read_text(encoding="utf-8"))
        report = lab.make_report(lab.load_cases(), original)
        self.assertEqual(report["status"], "DRY_RUN_NO_MODEL_CALLS")
        self.assertEqual(report["scoring"]["unscored"],8)
        self.assertTrue(all(r["score"] is None for r in report["rows"]))
        self.assertTrue(all(r["shadow_route"] is None for r in report["rows"]))

    def test_live_failure_fails_closed_without_inventing_probability(self):
        original = json.loads(lab.BASELINE.read_text(encoding="utf-8"))
        def broken(_):
            raise TimeoutError("network")
        report = lab.make_report(lab.load_cases()[:1],original,api_fn=broken)
        self.assertIsNone(report["rows"][0]["score"])
        self.assertEqual(report["rows"][0]["shadow_route"],"HUMAN_REVIEW")
        self.assertEqual(report["scoring"]["unscored"],1)
        self.assertEqual(report["provider_cost_known_cases"],0)

    def test_shadow_call_cannot_skip_source_validation(self):
        original = json.loads(lab.BASELINE.read_text(encoding="utf-8"))
        report = lab.make_report(lab.load_cases()[:1],original,
            api_fn=lambda _: {"score":0.0,"latency_ms":1,"input_tokens":1,
                              "provider_cost_usd":0.0,"model":"jev"})
        self.assertEqual(report["rows"][0]["shadow_route"],"HUMAN_REVIEW")
        self.assertEqual(report["scoring"]["fn"],1)  # Standalone judge missed; baseline still safe

if __name__ == "__main__":
    unittest.main()
