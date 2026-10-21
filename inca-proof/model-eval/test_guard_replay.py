"""Recorded dev replay must remain honest about the labels and split."""
import importlib.util,json,pathlib,unittest
HERE=pathlib.Path(__file__).resolve().parent
spec=importlib.util.spec_from_file_location("guard_replay",HERE/"guard_replay.py")
m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
data=json.loads((HERE/"paired_cases_v2.json").read_text(encoding="utf8"))
fixtures={x["id"]:x for x in data["cases"]}

class ReplayTests(unittest.TestCase):
    def sample(self):
        rows=[]
        for name in ("PB-021","PB-023","PB-035"):
            c=fixtures[name]
            rows.append({"id":name,"needs_attention":c["needs_attention"],
                "jev":{"decision":bool(c["needs_attention"])},"gpt":{"decision":False}})
        return {"status":"LIVE_API_RUN","rows":rows}
    def test_retrospective_guard_fixes_two_recorded_failure_patterns(self):
        r=m.replay(self.sample(),data)
        self.assertEqual(r["gpt"]["fn"],0)
        self.assertEqual(r["gpt"]["route_matches"],3)
        self.assertEqual(r["gpt"]["guard_changed_ids"],["PB-021","PB-023"])
        self.assertEqual(r["jev"]["guard_changed_ids"],[])
    def test_holdout_cannot_be_presented_as_dev_replay(self):
        r=self.sample()
        r["rows"][0]["id"]="PB-022"
        with self.assertRaises(ValueError):m.replay(r,data)
    def test_mismatched_gold_label_rejected(self):
        r=self.sample();r["rows"][0]["needs_attention"]=False
        with self.assertRaises(ValueError):m.replay(r,data)
    def test_duplicate_rows_rejected(self):
        r=self.sample();r["rows"][1]=r["rows"][0]
        with self.assertRaises(ValueError):m.replay(r,data)
    def test_no_model_output_is_not_a_success(self):
        r=self.sample();r["rows"][0]["gpt"]=None
        with self.assertRaises(ValueError):m.replay(r,data)
    def test_dry_run_not_accepted_as_measurement(self):
        r=self.sample();r["status"]="OFFLINE_NO_API_CALLS"
        with self.assertRaises(ValueError):m.replay(r,data)
if __name__=="__main__":unittest.main()
