"""Regression tests: paired benchmark never leaks labels or bills by default."""
import importlib.util, pathlib, unittest
HERE=pathlib.Path(__file__).resolve().parent
spec=importlib.util.spec_from_file_location("paired_benchmark",HERE/"paired_benchmark.py")
m=importlib.util.module_from_spec(spec)
spec.loader.exec_module(m)

class PairedBenchmarkTests(unittest.TestCase):
    def test_dataset_counts_labels_and_splits(self):
        rows=m.load_cases()
        self.assertEqual(len(rows),40)
        self.assertEqual(sum(x["needs_attention"] for x in rows),20)
        self.assertEqual(sum(x["split"]=="holdout" for x in rows),20)
        self.assertEqual(len({x["family"] for x in rows}),10)
    def test_payload_excludes_gold_label_and_split(self):
        row=m.load_cases()[0]
        a=m.gpt_payload(row,"gpt-4o-mini")
        self.assertNotIn("needs_attention",a["messages"][1]["content"])
        self.assertNotIn("split",a["messages"][1]["content"])
        self.assertNotIn("family",a["messages"][1]["content"])
        b=m.jev.build_payload(row)
        self.assertNotIn("expected",str(b))
        self.assertNotIn("needs_attention",str(b["state"]))
    def test_free_offline_run_has_no_scores(self):
        r=m.evaluate(m.load_cases()[:5])
        self.assertEqual(r["status"],"OFFLINE_NO_API_CALLS")
        self.assertEqual(r["summary"]["jev"]["unscored"],5)
        self.assertEqual(r["summary"]["gpt"]["unscored"],5)
    def test_critical_misses_are_explicit_and_errors_excluded(self):
        data=m.load_cases()[:4]
        result=m.evaluate(data,
            jev_fn=lambda c:{"decision":False,"latency_ms":10},
            gpt_fn=lambda c:{"decision":c["needs_attention"],"latency_ms":20})
        self.assertGreater(len(result["summary"]["jev"]["critical_misses"]),0)
        self.assertEqual(result["summary"]["gpt"]["fn"],0)
        self.assertIsNone(result["summary"]["jev"]["provider_cost_usd_total"])
    def test_api_error_is_not_a_correct_answer(self):
        def broken(_):raise TimeoutError("simulated")
        r=m.evaluate(m.load_cases()[:3],jev_fn=broken)
        self.assertEqual(r["summary"]["jev"]["scored"],0)
        self.assertEqual(r["summary"]["jev"]["unscored"],3)
        self.assertTrue(all(x["jev_error"]=="TimeoutError" for x in r["rows"]))
    def test_models_asked_same_binary_task(self):
        self.assertIn("NEED ATTENTION",m.GPT_SYSTEM)
        self.assertIn("attention",m.jev.QUESTION)
        self.assertEqual(m.GPT_SCHEMA["schema"]["properties"],{"needs_attention":{"type":"boolean"}})
if __name__=="__main__":unittest.main()
