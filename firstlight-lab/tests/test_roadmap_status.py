import importlib.util
import json
import pathlib
import unittest

ROOT=pathlib.Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location("roadmap_status",ROOT/"scripts"/"roadmap_status.py")
roadmap=importlib.util.module_from_spec(spec)
spec.loader.exec_module(roadmap)

class RoadmapStatusTests(unittest.TestCase):
    def test_missing_issue_is_unknown_not_complete(self):
        x=roadmap.normalise_issue(152,None)
        self.assertEqual(x["state"],"unknown")
        self.assertEqual(x["availability"],"unavailable")
        self.assertIsNone(x["checks_total"])

    def test_checklist_is_self_reported(self):
        r={"number":152,"title":"Law review","state":"closed",
           "body":"- [x] A\n- [ ] B\n- [x] C",
           "html_url":"https://github.com/mikelninh/mikelninh.github.io/issues/152"}
        x=roadmap.normalise_issue(152,r)
        self.assertEqual((x["checks_done"],x["checks_total"]),(2,3))
        s=roadmap.summarise([x],{"cases":[],"sources":{}},"2026-11-21T00:00:00Z")
        self.assertFalse(s["legislative_monitor"]["impact_verified"])
        self.assertIn("not independently verify",s["guardrail"])

    def test_law_status_never_infers_impact(self):
        s=roadmap.summarise(
          [roadmap.normalise_issue(152,{"number":152,"title":"A","state":"open","body":""})],
          {"generated_at":"2026-11-21","sources":{"dip":{"status":"ok"}},
           "cases":[{"id":"334563","status_raw":"Verabschiedet",
                     "promulgation":{"verified":False},"entry_into_force":{"verified":False},
                     "impact":{"verified":False}}]},
          "2026-11-21T00:00:00Z"
        )
        self.assertEqual(s["legislative_monitor"]["raw_status"],"Verabschiedet")
        self.assertFalse(s["legislative_monitor"]["promulgated_verified"])
        self.assertFalse(s["legislative_monitor"]["entry_into_force_verified"])
        self.assertFalse(s["legislative_monitor"]["impact_verified"])
        md=roadmap.render_md(s)
        self.assertIn("not independent evidence",md)
        self.assertIn("Promulgation verified: False",md)

if __name__=="__main__":unittest.main()
