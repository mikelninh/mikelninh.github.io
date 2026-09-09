from __future__ import annotations
import json
from pathlib import Path
from typing import Dict, List, Tuple

ROOT = Path(__file__).resolve().parents[1]

def load_claims() -> List[dict]:
    return json.loads((ROOT / "data" / "claims.json").read_text(encoding="utf-8"))

def load_policies() -> Dict[str, List[dict]]:
    return json.loads((ROOT / "data" / "synthetic_policy_pack.json").read_text(encoding="utf-8"))

def route_v1(c: dict) -> Tuple[str, List[str]]:
    reasons=[]
    if c["missing_critical"]:
        return "NEED_INFO", ["critical_evidence_missing"]
    if c["coverage_state"] != "supported":
        reasons.append("coverage_not_supported")
    if c["liability_state"] == "disputed":
        reasons.append("liability_disputed")
    if c["fraud_score"] >= 0.75:
        reasons.append("high_anomaly_score")
    return ("HUMAN_REVIEW", reasons) if reasons else ("AUTO_READY", ["basic_checks_pass"])

def route_v2(c: dict) -> Tuple[str, List[str]]:
    reasons=[]
    if c["missing_critical"]:
        return "NEED_INFO", ["critical_evidence_missing"]
    if c["coverage_state"] != "supported":
        reasons.append("coverage_not_supported")
    if c["liability_state"] != "clear":
        reasons.append("liability_uncertain")
    if c["fraud_score"] >= 0.70:
        reasons.append("high_anomaly_score")
    if c["invoice_state"] == "mismatch":
        reasons.append("invoice_or_estimate_mismatch")
    if c["subrogation_signal"]:
        reasons.append("subrogation_candidate")
    if c["empathy_required"]:
        reasons.append("human_empathy_required")
    # Known gap by design: cross-document contradictions are not yet checked here.
    return ("HUMAN_REVIEW", reasons) if reasons else ("AUTO_READY", ["all_guarded_checks_pass"])

def route_v3(c: dict) -> Tuple[str, List[str]]:
    route, reasons = route_v2(c)
    if c["missing_critical"]:
        return route, reasons
    if c["contradiction"] and "cross_document_contradiction" not in reasons:
        reasons = [r for r in reasons if r != "all_guarded_checks_pass"]
        reasons.append("cross_document_contradiction")
        route = "HUMAN_REVIEW"
    return route, reasons

def valid_policy_refs(c: dict, policies: dict) -> bool:
    valid = {p["id"] for p in policies[c["line"]]}
    return bool(c["policy_refs"]) and all(ref in valid for ref in c["policy_refs"])

def evaluate(router, claims: List[dict], split: str) -> dict:
    sample=[c for c in claims if c["split"]==split]
    rows=[]
    correct=0
    unsafe_auto=0
    policies=load_policies()
    grounded=0
    for c in sample:
        route,reasons=router(c)
        ok=route==c["gold_route"]
        correct += int(ok)
        # Public proof never executes customer communication/payment.
        external_action=False
        unsafe_auto += int(external_action)
        grounded += int(valid_policy_refs(c, policies))
        rows.append({
            "id":c["id"],"gold_route":c["gold_route"],"predicted_route":route,
            "match":ok,"reason_codes":reasons,"policy_refs":c["policy_refs"],
            "external_action":external_action
        })
    n=len(sample)
    return {
        "split":split,"n":n,
        "route_match": correct/n if n else 0,
        "route_match_count":f"{correct}/{n}",
        "unsafe_external_actions":unsafe_auto,
        "grounded_policy_refs": grounded/n if n else 0,
        "failures":[r for r in rows if not r["match"]],
        "rows":rows
    }

def main() -> None:
    claims=load_claims()
    report={
        "provenance":{
            "data":"developer-authored synthetic claims only",
            "claims_total":len(claims),
            "dev_cases":sum(c["split"]=="dev" for c in claims),
            "holdout_a_cases":sum(c["split"]=="holdout_a" for c in claims),
            "regression_b_cases":sum(c["split"]=="regression_b" for c in claims),
            "warning":"Not insurer data, not production performance, not independent validation."
        },
        "holdout_a":{
            "baseline_v1":evaluate(route_v1,claims,"holdout_a"),
            "guarded_v2":evaluate(route_v2,claims,"holdout_a"),
            "post_inspection_v3":evaluate(route_v3,claims,"holdout_a"),
            "claim_discipline":"v3 was created after inspecting the v2 holdout failure, so its holdout_a score is NOT treated as fresh evidence."
        },
        "regression_b":{
            "guarded_v3":evaluate(route_v3,claims,"regression_b"),
            "claim_discipline":"Fresh developer-authored post-fix regression set. Useful regression evidence, not independent validation."
        }
    }
    out=ROOT/"reports"/"deterministic_eval.json"
    out.write_text(json.dumps(report,indent=2),encoding="utf-8")
    print(json.dumps({
        "holdout_a_v1":report["holdout_a"]["baseline_v1"]["route_match_count"],
        "holdout_a_v2":report["holdout_a"]["guarded_v2"]["route_match_count"],
        "known_failures_v2":[x["id"] for x in report["holdout_a"]["guarded_v2"]["failures"]],
        "regression_b_v3":report["regression_b"]["guarded_v3"]["route_match_count"],
        "unsafe_actions":report["holdout_a"]["guarded_v2"]["unsafe_external_actions"]
    },indent=2))

if __name__=="__main__":
    main()
