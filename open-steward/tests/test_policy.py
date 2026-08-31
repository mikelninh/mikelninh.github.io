import unittest
from core.policy import classify_action, may_execute


class PolicyTests(unittest.TestCase):
    def test_preview_is_automatic(self):
        self.assertEqual(classify_action("deploy_preview").level, "automatic")
        self.assertTrue(may_execute("deploy_preview"))

    def test_production_requires_approval(self):
        self.assertEqual(classify_action("deploy_production").level, "approval_required")
        self.assertFalse(may_execute("deploy_production"))
        self.assertTrue(may_execute("deploy_production", approved=True))

    def test_permission_expansion_is_forbidden(self):
        self.assertEqual(classify_action("expand_own_permissions").level, "forbidden")
        self.assertFalse(may_execute("expand_own_permissions", approved=True))

    def test_unknown_defaults_to_approval(self):
        self.assertEqual(classify_action("invent_new_action").level, "approval_required")


if __name__ == "__main__":
    unittest.main()
