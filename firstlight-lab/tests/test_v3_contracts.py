"""LifeBench 3.0 public release contracts, independent of live network responses."""
from html.parser import HTMLParser
from pathlib import Path
import json
import re
import unittest

ROOT = Path(__file__).resolve().parents[1]

class DOM(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids = []
        self.scripts = []
        self.links = []
    def handle_starttag(self, tag, attrs):
        d = dict(attrs)
        if "id" in d: self.ids.append(d["id"])
        if tag == "script" and d.get("src"): self.scripts.append(d["src"])
        if tag == "a" and d.get("href"): self.links.append(d["href"])

class LifeBenchV3Contracts(unittest.TestCase):
    def test_source_assets_and_unique_controls(self):
        doc = DOM()
        doc.feed((ROOT/"lifebench.html").read_text(encoding="utf-8"))
        self.assertEqual(len(doc.ids), len(set(doc.ids)), "Duplicate element IDs in LifeBench.")
        required = [
            "ai-kind", "ai-output", "ai-skeleton", "ai-generate",
            "ai-copy", "ai-export", "review-sources", "review-jurisdiction",
            "review-opposition", "review-consent", "handoff-download",
            "submission-channel", "official-channel-link", "submission-date",
            "submission-ref", "submission-response", "submission-note",
            "submission-add", "submission-list", "impact-question",
            "impact-metric", "impact-method", "impact-save", "impact-export",
            "source-health", "source-time", "change-list"
        ]
        for item in required:
            self.assertIn(item, doc.ids, f"UI control {item} missing")
        self.assertIn("./law-os.js", doc.scripts)
        self.assertIn("./law-os-v3.js", doc.scripts)
        for script in doc.scripts:
            if script.startswith("./"):
                self.assertTrue((ROOT/script[2:]).exists(), f"Missing: {script}")
        self.assertIn("./masterplan.html", doc.links)

    def test_draft_is_consent_gated_and_local_model_is_optional(self):
        js = (ROOT/"law-os-v3.js").read_text(encoding="utf-8")
        self.assertIn("window.LanguageModel", js)
        self.assertIn("api.availability(options)", js)
        self.assertIn("structured_template", js)
        self.assertIn("unsubmitted_citizen_work_product", js)
        self.assertIn("review-sources", js)
        self.assertIn("review-consent", js)
        self.assertIn("causalClaimPermitted:false", js)
        self.assertNotIn("sk-proj-", js)
        self.assertNotIn("api.openai.com", js)
        self.assertNotIn("epetitionen.bundestag.de", js)

    def test_roadmap_has_six_concrete_milestones(self):
        html=(ROOT/"masterplan.html").read_text(encoding="utf-8")
        doc=DOM();doc.feed(html)
        self.assertIn("./MASTERPLAN.md", doc.links)
        for num in range(152,158):
            self.assertTrue(any(f"/issues/{num}" in u for u in doc.links), f"Missing milestone #{num}")
        plan=(ROOT/"MASTERPLAN.md").read_text(encoding="utf-8")
        self.assertIn("independent", plan.lower())
        self.assertIn("human", plan.lower())

    def test_impact_data_cannot_invent_causation(self):
        d=json.loads((ROOT/"data/impact-registry.json").read_text(encoding="utf-8"))
        animal=next(x for x in d["missions"] if x["id"]=="animal")
        self.assertGreaterEqual(len(animal.get("observed_indicators", [])),1)
        for indicator in animal["observed_indicators"]:
            self.assertIn("interpretation",indicator)
            self.assertTrue(all(v.get("source","").startswith("https://") for v in indicator["values"]))
        feed=json.loads((ROOT/"data/law-feed.json").read_text(encoding="utf-8"))
        self.assertEqual(feed["schema"],"lifebench-official-monitor-v1")
        for case in feed["cases"]:
            if case.get("entry_into_force",{}).get("verified"):
                self.assertTrue(case["entry_into_force"].get("source_url"))
            if case.get("impact",{}).get("verified"):
                self.assertTrue(case["impact"].get("source_url"))

if __name__ == "__main__":
    unittest.main()
