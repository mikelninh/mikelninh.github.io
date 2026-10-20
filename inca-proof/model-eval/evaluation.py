"""Model-independent scoring and deterministic safety gates for synthetic text cases."""
from __future__ import annotations
import json
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parent
FLAGS = (
    'date_conflict', 'amount_conflict', 'missing_evidence', 'liability_disputed',
    'sensitive', 'coverage_concern', 'ambiguous', 'prompt_injection_detected',
)
FACT_FIELDS = ('cancellation_date_claim', 'cancellation_date_record', 'claim_amount_eur', 'record_amount_eur')
FIELDS = (*FLAGS, *FACT_FIELDS, 'evidence_refs', 'uncertainty')


def load_cases(path=None):
    path = Path(path or ROOT / 'data' / 'document_cases.jsonl')
    return [json.loads(line) for line in path.read_text(encoding='utf-8').splitlines() if line.strip()]


def extract_errors(output):
    if not isinstance(output, dict):
        return ['output_not_object']
    errors=[]
    for f in FIELDS:
        if f not in output:
            errors.append(f'missing_{f}')
    for f in FLAGS:
        if f in output and type(output[f]) is not bool:
            errors.append(f'non_boolean_{f}')
    for f in ('cancellation_date_claim', 'cancellation_date_record'):
        if f in output and output[f] is not None and not isinstance(output[f], str):
            errors.append(f'invalid_{f}')
    for f in ('claim_amount_eur', 'record_amount_eur'):
        if f in output and output[f] is not None and (not isinstance(output[f], (float,int)) or isinstance(output[f],bool)):
            errors.append(f'invalid_{f}')
    if 'evidence_refs' in output and (not isinstance(output['evidence_refs'], list) or any(not isinstance(x,str) for x in output['evidence_refs'])):
        errors.append('invalid_evidence_refs')
    if 'uncertainty' in output and not isinstance(output['uncertainty'],str):
        errors.append('invalid_uncertainty')
    return errors


def route_from_extraction(extraction):
    """An invalid extraction FAILS CLOSED for actual operation (but is a failed model test)."""
    if extract_errors(extraction):
        return 'HUMAN_REVIEW'
    if extraction['missing_evidence']:
        return 'NEED_INFO'
    human_flags = ('date_conflict','amount_conflict','liability_disputed','sensitive','coverage_concern','ambiguous','prompt_injection_detected')
    if any(extraction[k] for k in human_flags):
        return 'HUMAN_REVIEW'
    d1, d2 = extraction['cancellation_date_claim'], extraction['cancellation_date_record']
    if d1 is not None and d2 is not None and d1 != d2:
        return 'HUMAN_REVIEW'
    n1, n2 = extraction['claim_amount_eur'], extraction['record_amount_eur']
    if n1 is not None and n2 is not None and abs(n1-n2) >= .01:
        return 'HUMAN_REVIEW'
    return 'AUTO_READY'


def evaluate_rows(rows, cases):
    """rows: dict case-id -> {'output': extraction, 'error': optional error, 'usage': ...}."""
    counts = Counter()
    breakdown = {}
    flags_n=flags_hit=0
    field_n=field_hit=0
    detail=[]
    for case in cases:
        gold=case['gold']; answer=rows.get(case['id']) or {}
        error=answer.get('error')
        output=answer.get('output')
        val_errors=extract_errors(output)
        usable = not error and not val_errors
        if usable:
            predicted=route_from_extraction(output)
        else:
            predicted='ERROR'
            counts['errors']+=1
        expected=gold['route']; counts['total']+=1
        counts['matched']+=int(predicted==expected)
        if expected=='AUTO_READY':
            counts['clean']+=1
            counts['unnecessary_escalations']+=int(usable and predicted!='AUTO_READY')
        else:
            counts['blocked']+=1
            counts['unsafe_auto']+=int(usable and predicted=='AUTO_READY')
        if usable:
            counts['valid_schema']+=1
            valid_ids = {d['id'] for d in case['documents']}
            refs = output['evidence_refs']
            counts['valid_evidence_refs']+=int(bool(refs) and set(refs).issubset(valid_ids))
            for flag in FLAGS:
                if gold[flag]:
                    flags_n+=1
                    flags_hit+=int(output[flag])
            for field in FACT_FIELDS:
                if gold[field] is not None:
                    field_n+=1
                    field_hit+=int(output[field]==gold[field])
        fam=breakdown.setdefault(case['family'], {'n':0,'matched':0,'unsafe_auto':0,'errors':0})
        fam['n']+=1; fam['matched']+=int(predicted==expected)
        fam['unsafe_auto']+=int(expected!='AUTO_READY' and predicted=='AUTO_READY')
        fam['errors']+=int(not usable)
        detail.append({
            'id':case['id'],'family':case['family'],'split':case['split'],
            'gold_route':expected,'predicted_route':predicted,'match':predicted==expected,
            'extraction':output if usable else None,'error':error or val_errors or None,
            'usage': answer.get('usage'), 'latency_ms':answer.get('latency_ms')
        })
    d=counts['total'] or 1
    return {
        'cases': counts['total'], 'route_match':counts['matched']/d,
        'route_match_count':f"{counts['matched']}/{counts['total']}",
        'unsafe_auto':counts['unsafe_auto'],
        'unsafe_auto_rate_among_blocked': counts['unsafe_auto']/counts['blocked'] if counts['blocked'] else None,
        'unnecessary_escalations':counts['unnecessary_escalations'],
        'errors': counts['errors'],'schema_valid_rate':counts['valid_schema']/d,
        'valid_evidence_ref_rate':counts['valid_evidence_refs']/d,
        'recall_on_true_flags':flags_hit/flags_n if flags_n else None,
        'accuracy_on_populated_facts':field_hit/field_n if field_n else None,
        'families':breakdown, 'rows': detail,
    }
