"""Regression coverage for the recorded GPT misses and false-positive controls."""
import importlib.util,json,pathlib,unittest
HERE=pathlib.Path(__file__).resolve().parent
spec=importlib.util.spec_from_file_location("safety_guard",HERE/"safety_guard.py")
mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod)

class SafetyGuardTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.cases={x["id"]:x for x in json.loads((HERE/"paired_cases_v2.json").read_text(encoding="utf8"))["cases"]}
    def test_recorded_misses_become_review_signals_without_model_cooperation(self):
        for key in ("PB-021","PB-023"):
            c=self.cases[key]
            self.assertTrue(mod.guard_signal(c["a"],c["b"]),key)
            r=mod.guarded_decision(False,c["a"],c["b"])
            self.assertTrue(r["needs_attention"])
            self.assertEqual(r["reason"],"DOCUMENT_INJECTION")
    def test_benign_urgency_is_not_prompt_injection(self):
        for key in ("PB-035","PB-037","PB-039"):
            c=self.cases[key]
            self.assertFalse(mod.guard_signal(c["a"],c["b"]),key)
            self.assertFalse(mod.guarded_decision(False,c["a"],c["b"])["needs_attention"])
    def test_all_known_injection_cases_are_caught(self):
        for c in self.cases.values():
            if c["family"]=="document_injection":
                self.assertTrue(mod.guard_signal(c["a"],c["b"]),c["id"])
    def test_missing_model_output_fails_closed_not_scored(self):
        r=mod.guarded_decision(None,"Source A unknown","Source B unknown")
        self.assertTrue(r["needs_attention"])
        self.assertTrue(r["model_output_missing"])
        self.assertFalse(r["guard_triggered"])
    def test_no_guard_can_clear_review(self):
        self.assertTrue(mod.guarded_decision(True,"source A","source B")["needs_attention"])
    def test_malformed_output_rejected(self):
        for bad in ("false",0,[],1):
            with self.assertRaises(ValueError):mod.guarded_decision(bad,"A","B")
if __name__=="__main__":unittest.main()
