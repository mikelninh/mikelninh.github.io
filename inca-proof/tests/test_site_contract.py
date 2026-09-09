import unittest
from pathlib import Path

class SiteContractTests(unittest.TestCase):
    def test_hr_first_and_no_self_score(self):
        page=(Path(__file__).resolve().parents[2]/"inca"/"index.html").read_text(encoding="utf-8")
        self.assertIn("Decision",page)
        self.assertIn("Next step",page)
        self.assertIn("Engineering details",page)
        self.assertNotIn("9.1",page)
        self.assertNotIn("role-fit estimate",page.lower())

if __name__=="__main__":
    unittest.main()
