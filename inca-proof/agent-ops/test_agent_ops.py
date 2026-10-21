import importlib.util
import json
import pathlib
import unittest
from unittest.mock import patch

HERE=pathlib.Path(__file__).resolve().parent
spec=importlib.util.spec_from_file_location("inca_agent_ops",HERE/"agent_ops.py")
mod=importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)

class AgentOpsTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.cases=mod.load_cases()
        cls.by_id={r["id"]:r for r in cls.cases}
    def test_offline_runs_all_six_with_expected_routes(self):
        report=mod.produce()
        self.assertEqual(report["execution_mode"],"offline")
        self.assertEqual(report["case_count"],6)
        for row in report["runs"]:
            self.assertEqual(row["route"],self.by_id[row["case_id"]]["expected_demo_route"])
            self.assertEqual(len(row["events"]),7)
            self.assertEqual(row["external_actions"],0)
            self.assertEqual(row["handoff"]["status"],"UNSENT_DRAFT")
            self.assertEqual(row["handoff"]["external_actions"],0)
            self.assertFalse(row["events"][-1]["output"]["payment"])
    def test_tool_execution_makes_grounded_citations(self):
        r=mod.run_case(self.by_id["TR-101"])
        self.assertEqual([x["source_ref"] for x in r["evidence"]],["TR-101:A","TR-101:B"])
        self.assertEqual(r["evidence"][0]["quotes"],["Stornierungsdatum: 11.07.2026"])
        self.assertEqual(r["reason"],"CANCELLATION_DATE_CONFLICT")
        self.assertEqual(r["status"],"AWAITING_HUMAN_REVIEW")
    def test_model_instructions_in_document_do_not_override_guard(self):
        r=mod.run_case(self.by_id["TR-606"])
        self.assertEqual(r["route"],"HUMAN_REVIEW")
        self.assertEqual(r["reason"],"UNTRUSTED_DOCUMENT_INSTRUCTION")
        self.assertTrue(r["events"][-1]["output"]["guard_triggered"])
    def test_agent_cannot_call_external_tool_or_skip_required_step(self):
        c=self.by_id["TR-101"]
        for bad in [
            [{"tool":"send_email","source":"A"}],
            [{"tool":"pay_claim","amount":9999}]*6,
            mod.scripted_plan(c)[:-1],
            mod.scripted_plan(c)[:-1]+[{"tool":"draft_handoff","url":"https://unknown.example"}],
        ]:
            r=mod.run_case(c,bad)
            self.assertEqual(r["route"],"HUMAN_REVIEW")
            self.assertEqual(r["status"],"BLOCKED_FAILURE")
            self.assertEqual(r["reason"],"SAFE_EXECUTION_ABORT")
            self.assertEqual(r["external_actions"],0)
    def test_network_never_called_in_default_offline_runner(self):
        with patch.object(mod.urllib.request,"urlopen",side_effect=AssertionError("Network called")):
            r=mod.produce()
        self.assertEqual(len(r["runs"]),6)
    def test_mock_execution_is_replayable_and_stable(self):
        a=mod.run_case(self.by_id["HM-202"])
        b=mod.run_case(self.by_id["HM-202"])
        self.assertEqual(a,b)
        self.assertEqual(a["next_action"],"REQUEST_INFORMATION_DRAFT")
    def test_missing_facts_fail_closed(self):
        original=self.by_id["TH-303"]
        c=json.loads(json.dumps(original))
        c["documents"]["B"]="No frame number found"
        r=mod.run_case(c)
        self.assertEqual(r["route"],"NEED_INFO")
    def test_internal_dates_conflict_even_if_other_source_agrees(self):
        c=json.loads(json.dumps(self.by_id["TR-101"]))
        c["documents"]["A"]+="\nStornierungsdatum: 15.07.2026"
        r=mod.run_case(c)
        self.assertEqual(r["route"],"HUMAN_REVIEW")
        self.assertEqual(r["reason"],"INTERNAL_CONTRADICTION")
    def test_plan_validation_does_not_accept_unknown_arguments(self):
        p=mod.scripted_plan(self.by_id["TR-101"])
        p[0]["path"]="../../secrets"
        with self.assertRaises(ValueError):mod.validate_plan(p)
    def test_case_names_and_gold_label_absent_from_model_prompt(self):
        # Planner only sees claim type and source texts; never gold routes or private prompts.
        # The scripted default does not call a model.
        r=mod.produce(case_id="TR-101")
        self.assertEqual(r["case_count"],1)
        self.assertNotIn("expected_demo_route",json.dumps(r["runs"]))
    def test_real_model_mode_requires_opt_in_case_and_secret(self):
        with self.assertRaises(ValueError):mod.produce("openai")
        with patch.dict(mod.os.environ,{"OPENAI_API_KEY":""}):
            with self.assertRaises(ValueError):mod.produce("openai","TR-101")
    def test_broken_provider_result_fails_closed_without_claiming_success(self):
        c=self.by_id["TH-303"]
        r=mod.run_case(c,[],"provider-opt-in")
        self.assertEqual(r["route"],"HUMAN_REVIEW")
        self.assertIsNone(r["handoff"])
        self.assertEqual(r["external_actions"],0)
    def test_case_fields_have_caps(self):
        c=json.loads(json.dumps(self.by_id["TR-101"]))
        c["documents"]["A"]="X"*4001
        with self.assertRaises(ValueError):mod.run_case(c)
if __name__=="__main__":unittest.main()
