import json
import unittest
from collections import Counter
from evaluation import load_cases, FLAGS, FACT_FIELDS, route_from_extraction, evaluate_rows, extract_errors
from run_openai import schema, request_body


class DocumentEvalTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.cases=load_cases()

    def test_100_unique_cases_with_explicit_splits(self):
        self.assertEqual(len(self.cases),100)
        self.assertEqual(len({c['id'] for c in self.cases}),100)
        self.assertEqual(Counter(c['split'] for c in self.cases),{'dev':60,'holdout':20,'stress':20})
        self.assertEqual(len({c['family'] for c in self.cases}),10)

    def test_every_case_has_source_documents_and_explicit_gold(self):
        for c in self.cases:
            self.assertTrue(c['documents'])
            self.assertEqual(len({d['id'] for d in c['documents']}),len(c['documents']))
            self.assertIn(c['gold']['route'], ('AUTO_READY','NEED_INFO','HUMAN_REVIEW'))
            for k in (*FLAGS,*FACT_FIELDS):
                self.assertIn(k,c['gold'])
            self.assertNotEqual(c['gold']['route'],'AUTO_READY') if any(c['gold'][f] for f in FLAGS) else None

    def test_input_leaves_out_gold_and_family(self):
        for c in self.cases:
            payload=json.dumps(request_body(c,'gpt-4o-mini'))
            self.assertNotIn('"gold"',payload)
            self.assertNotIn('"family"',payload)
            self.assertNotIn('"split"',payload)

    def test_schema_is_strict(self):
        s=schema()
        self.assertFalse(s['additionalProperties'])
        self.assertEqual(set(s['properties']),set(s['required']))

    def test_gold_extracts_reproduce_routes(self):
        rows={c['id']:{'output':{**{k:c['gold'][k] for k in (*FLAGS,*FACT_FIELDS)},
                                  'evidence_refs':[d['id'] for d in c['documents']],
                                  'uncertainty':''}} for c in self.cases}
        for c in self.cases:
            self.assertEqual(route_from_extraction(rows[c['id']]['output']),c['gold']['route'], c['id'])
        result=evaluate_rows(rows,self.cases)
        self.assertEqual(result['route_match_count'],'100/100')
        self.assertEqual(result['unsafe_auto'],0)

    def test_broken_model_output_does_not_auto_route(self):
        self.assertEqual(route_from_extraction({}),'HUMAN_REVIEW')
        self.assertTrue(extract_errors({}))

    def test_missing_evidence_cannot_auto_route(self):
        g=next(c for c in self.cases if c['family']=='missing_evidence')['gold']
        sample={**{k:g[k] for k in (*FLAGS,*FACT_FIELDS)},'evidence_refs':['DOC-1'],'uncertainty':''}
        self.assertEqual(route_from_extraction(sample),'NEED_INFO')

    def test_facts_alone_can_trigger_review_when_conflict_flag_is_wrong(self):
        g=next(c for c in self.cases if c['family']=='date_conflict')['gold']
        sample={**{k:g[k] for k in (*FLAGS,*FACT_FIELDS)},'evidence_refs':['DOC-1','DOC-2'],'uncertainty':''}
        sample['date_conflict']=False
        self.assertEqual(route_from_extraction(sample),'HUMAN_REVIEW')


if __name__=='__main__':
    unittest.main()
