"""Second live experiment: dev-discovered routing precedence -> untouched stress cases.

No new prompts, provider changes or claim outcomes. One REAL gpt-4o-mini
extraction per previously unused synthetic stress case (20 total). Two
deterministic routing policies are compared against each *same* model output.
Fix is motivated by development DOC-EVAL-081, not adjusted on the stress split.
"""
from __future__ import annotations
import argparse
import datetime as dt
import hashlib
import json
import os
import pathlib

from evaluation import load_cases, extract_errors
from release_experiment import MODEL, REVISED, api_call, evaluate, metrics, route, prompt_hash

ROOT=pathlib.Path(__file__).resolve().parent
MAX_CALLS=20

def stress_cases():
    cases=sorted((c for c in load_cases() if c["split"]=="stress"),key=lambda c:c["id"])
    if len(cases)!=20 or len({c["id"] for c in cases})!=20 or len({c["family"] for c in cases})!=10:
        raise ValueError("Expected 20 unique previously unused stress cases across 10 families")
    return cases

def priority_route(case,response):
    before,grounded,reason=route(case,response,"revised")
    output=response.get("output")
    # Dev-derived defect: coverage concern is an expert-review risk even when
    # extraction ALSO incorrectly claims missing evidence. Do not make a
    # claims approval or authorize payment; a human makes the specialist decision.
    if (grounded and not response.get("error") and not extract_errors(output)
            and output.get("coverage_concern") is True
            and output.get("missing_evidence") is True
            and before=="NEED_INFO"):
        return "HUMAN_REVIEW",True,"CRITICAL_COVERAGE_REVIEW_PRIORITY"
    return before,grounded,reason

def second_score(case,original,response):
    predicted,grounded,reason=priority_route(case,response)
    row=dict(original)
    expected=case["gold"]["route"]
    row["variant"]="priority_fix"
    row["actual_route"]=predicted
    row["route_correct"]=predicted==expected
    row["unsafe_continue"]=expected!="AUTO_READY" and predicted=="AUTO_READY"
    row["unnecessary_escalation"]=expected=="AUTO_READY" and predicted!="AUTO_READY"
    row["valid_grounding_gate"]=grounded
    row["gate_reason"]=reason
    return row

def stress_run(cases,api_fn,run_id=None):
    baseline=[];fixed=[]
    for case in cases:
        try:
            response=api_fn(case)
        except Exception as exc:
            response={"output":None,"usage":{},"latency_ms":None,"error":type(exc).__name__}
        before=evaluate(case,"revised",response)
        after=second_score(case,before,response)
        baseline.append(before);fixed.append(after)
        print(f"STRESS {case['id']} baseline={before['actual_route']} priority={after['actual_route']} "
              f"expected={before['expected_route']} model_error={before['api_or_schema_error']}",
              flush=True)
    before=metrics(baseline);after=metrics(fixed)
    result={
        "schema":"INCA-LIVE-STRESS-ROUTE-1",
        "status":"REAL_MODEL_RESULTS",
        "generated_at_utc":dt.datetime.now(dt.timezone.utc).isoformat(),
        "github_run_id":str(run_id) if run_id else None,
        "model_requested":MODEL,
        "prompt_sha256":prompt_hash(REVISED),
        "dataset_sha256":hashlib.sha256((ROOT/"data"/"document_cases.jsonl").read_bytes()).hexdigest(),
        "causal_fix":"Development case DOC-EVAL-081 identified coverage_concern + missing_evidence -> NEED_INFO. Prioritise specialist review over requests for missing info when both flags are present.",
        "selection":[c["id"] for c in cases],
        "provenance":"20 developer-authored stress cases not used in the previous 40-request dev/holdout run. Common templates; no independent blind validation.",
        "limitations":"A deterministic routing-policy comparison on a shared set of real recorded model outputs. Does NOT compare separate model generations. No insurer data, automatic payout or real-world accuracy estimate.",
        "metrics":{"previous_route":before,"critical_review_first":after},
        "estimated_api_cost_usd":before["estimated_usd"], # charged once; two local routing decisions are free
        "actual_model_requests":len(cases),
        "api_or_schema_errors":before["api_or_schema_errors"],
        "rows":[{"id":a["id"],"family":a["family"],"expected_route":a["expected_route"],
                 "before_route":a["actual_route"],"after_route":b["actual_route"],
                 "changed":a["actual_route"]!=b["actual_route"],
                 "before_correct":a["route_correct"],"after_correct":b["route_correct"],
                 "before_reason":a["gate_reason"],"after_reason":b["gate_reason"],
                 "raw_model_extraction":a["raw_model_extraction"],"documents":a["documents"],
                 "latency_ms":a["latency_ms"],"usage":a["usage"]}
                 for a,b in zip(baseline,fixed)]
    }
    return result

def main(argv=None):
    p=argparse.ArgumentParser()
    p.add_argument("--mode",choices=("dry-run","live"),default="dry-run")
    p.add_argument("--out",type=pathlib.Path,default=ROOT.parent.parent/"inca"/"live-stress-eval.json")
    args=p.parse_args(argv)
    cases=stress_cases()
    assert len(cases)==MAX_CALLS
    if args.mode=="dry-run":
        print(json.dumps({"status":"NO_API_CALLS","planned_real_model_calls":MAX_CALLS,
                          "cases":[c["id"] for c in cases],
                          "dev_discovered_fix":"coverage_concern outranks missing_evidence"},indent=2))
        return 0
    key=os.getenv("OPENAI_API_KEY")
    if not key:
        raise SystemExit("No OPENAI_API_KEY repository secret; zero calls made")
    report=stress_run(cases,lambda c:api_call(c,"revised",key),os.getenv("GITHUB_RUN_ID"))
    args.out.parent.mkdir(parents=True,exist_ok=True)
    args.out.write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print("STRESS RESULT:",json.dumps(report["metrics"],ensure_ascii=False),flush=True)
    if report["api_or_schema_errors"]:
        raise SystemExit("Incomplete model data: publish artifact only, not public benchmark")
    return 0

if __name__=="__main__":raise SystemExit(main())
