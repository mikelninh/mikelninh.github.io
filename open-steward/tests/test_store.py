import unittest
from core.store import PortfolioStore


class StoreTests(unittest.TestCase):
    def setUp(self):
        self.store = PortfolioStore()

    def test_projects_load(self):
        ids = {project["id"] for project in self.store.list_projects()}
        self.assertTrue({"soulbody", "tiny-tactics", "safetrace"}.issubset(ids))

    def test_decisions_have_approval_level(self):
        for decision in self.store.list_decisions():
            self.assertIn(decision["approval_level"], {"automatic", "approval_required", "forbidden"})


if __name__ == "__main__":
    unittest.main()
