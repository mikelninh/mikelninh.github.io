import importlib.util
import pathlib
import unittest

ROOT = pathlib.Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('monitor', ROOT/'scripts'/'monitor.py')
monitor = importlib.util.module_from_spec(spec)
spec.loader.exec_module(monitor)

class MonitorTests(unittest.TestCase):
    def test_stage_not_in_force_by_vote(self):
        case=monitor.case_view({'id':'334563','titel':'Law','beratungsstand':'Verabschiedet','gesta':'F013','aktualisiert':'2026-11-20'},[],[])
        self.assertEqual(case['stage'],'parliamentary_decision')
        self.assertFalse(case['promulgation']['verified'])
        self.assertFalse(case['entry_into_force']['verified'])
        self.assertFalse(case['impact']['verified'])

    def test_exact_match_is_required_for_gazette(self):
        item={'title':'A similar animal law','gesta':'F014','kind':'Gesetz','url':'https://www.recht.bund.de/eli/bund/bgbl-1/2026/10','citation':'BGBl. I','date':'2026-11-20'}
        doc={'id':'334563','titel':'Animal Law','beratungsstand':'Verabschiedet','gesta':'F013'}
        case=monitor.case_view(doc,[item],[])
        self.assertFalse(case['promulgation']['verified'])
        item['gesta']='F013'
        case=monitor.case_view(doc,[item],[])
        self.assertTrue(case['promulgation']['verified'])
        self.assertFalse(case['entry_into_force']['verified'])

    def test_no_false_citizen_consensus(self):
        x=monitor.parse_consultations([{'title':'[LifeBench] Reform','html_url':'https://github.com/mikelninh/mikelninh.github.io/issues/12','state':'open','comments':5,'number':12},{'title':'Other','html_url':'https://github.com/mikelninh/mikelninh.github.io/issues/13','state':'open','comments':5},{'title':'[LifeBench] Pull','html_url':'https://github.com/mikelninh/mikelninh.github.io/issues/14','pull_request':{},'state':'open'}])
        self.assertEqual(x['count'],1)
        self.assertIn('do not measure public support',x['note'])

    def test_status_changes_only_real_changes(self):
        x={'cases':[{'id':'334563','status_raw':'Verabschiedet','promulgation':{'verified':False},'source_url':'https://dip.bundestag.de/vorgang/334563'}],'generated_at':'2026-11-21','changes':[]}
        old={'cases':[{'id':'334563','status_raw':'Verabschiedet','promulgation':{'verified':False}}]}
        self.assertEqual(monitor.changes_between(old,x),[])
        x['cases'][0]['status_raw']='Verkündet'
        self.assertEqual(monitor.changes_between(old,x)[0]['type'],'official_status_change')

    def test_output_clean_text(self):
        self.assertEqual(monitor.clean_text('A<br/>  B  <strong>C</strong>'),'A B C')

if __name__=='__main__':unittest.main()
