import unittest
from run_openai import ROOT, load_cases, request_body

class ModernModelPayloadTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.case = load_cases(ROOT / 'data' / 'document_cases.jsonl')[0]

    def test_gpt6_luna_low_effort(self):
        p=request_body(self.case,'gpt-6-luna')
        self.assertEqual(p['reasoning_effort'],'low')
        self.assertNotIn('temperature',p)

    def test_gpt6_1_sol_low_effort(self):
        p=request_body(self.case,'gpt-6.1-sol')
        self.assertEqual(p['reasoning_effort'],'low')
        self.assertNotIn('temperature',p)

    def test_legacy_still_deterministic_request(self):
        p=request_body(self.case,'gpt-4o-mini')
        self.assertEqual(p['temperature'],0)
        self.assertNotIn('reasoning_effort',p)

    def test_all_models_structured_output(self):
        for m in ('gpt-4o-mini','gpt-6-luna','gpt-6.1-sol'):
            p=request_body(self.case,m)
            self.assertEqual(p['response_format']['type'],'json_schema')
            self.assertTrue(p['response_format']['json_schema']['strict'])
