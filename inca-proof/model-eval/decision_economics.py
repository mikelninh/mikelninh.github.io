"""Economics of a *binary* Jev versus GPT attention decision on recorded INCA dev cases.

OFFLINE ONLY. No model requests and no production impact. An illustrative
attention-action cost is not a measured human-review cost. No FX conversions.
"""
from __future__ import annotations
import argparse
import json
from pathlib import Path

DATA=Path(__file__).with_name("decision_economics_snapshot.json")
SAMPLE_SIZE=20

def load(path=DATA):
    doc=json.loads(Path(path).read_text(encoding="utf-8"))
    if doc["models"]["jev"]["scored"]!=SAMPLE_SIZE or doc["models"]["gpt"]["scored"]!=SAMPLE_SIZE:
        raise ValueError("Unexpected scored sample count")
    for model in ("jev","gpt"):
        r=doc["models"][model]
        if sum(r[k] for k in ("true_positive","false_positive","true_negative","false_negative"))!=SAMPLE_SIZE:
            raise ValueError("Confusion matrix incomplete")
        if any(type(r[k]) is not int or r[k]<0 for k in ("input_tokens","output_tokens")):
            raise ValueError("Invalid token usage")
    for model in ("guarded_jev","guarded_gpt"):
        r=doc["models"][model]
        if sum(r[k] for k in ("true_positive","false_positive","true_negative","false_negative"))!=SAMPLE_SIZE:
            raise ValueError("Bad guarded matrix")
    return doc

def model_api_costs(doc):
    t=doc["list_price_usd_per_million_tokens"]
    j=doc["models"]["jev"];g=doc["models"]["gpt"]
    return {
        "jev":(j["input_tokens"]*t["jev_input"]+j["output_tokens"]*t["jev_output"])/1_000_000,
        "gpt":(g["input_tokens"]*t["gpt_input"]+g["output_tokens"]*t["gpt_output"])/1_000_000,
    }

def compute(doc,volume=100000,attention_action_cost_usd=5,missed_attention_cost_usd=0,guarded=False):
    """Illustrative workflow cost; NOT an extrapolated accuracy prediction.

    All 'needs_attention' decisions are assumed to incur the same hypothetical
    action cost; a real insurer must separate NEED_INFO from HUMAN_REVIEW.
    """
    if type(volume) is not int or volume<1 or volume>10_000_000:
        raise ValueError("Volume must be 1..10M cases")
    if any(type(x) not in (int,float) or x<0 or x>1_000_000
           for x in (attention_action_cost_usd,missed_attention_cost_usd)):
        raise ValueError("Costs must be finite nonnegative USD values")
    import math
    if not all(math.isfinite(x) for x in (attention_action_cost_usd,missed_attention_cost_usd)):
        raise ValueError("Costs cannot be infinite")
    measured_api=model_api_costs(doc)
    scale=volume/SAMPLE_SIZE
    results={}
    for name in ("jev","gpt"):
        matrix=doc["models"][("guarded_"+name) if guarded else name]
        flagged=matrix["true_positive"]+matrix["false_positive"]
        # At scale, extrapolating 20 artificial cases is hypothetical, not
        # a projection of real insurer case mix or class prevalence.
        api=measured_api[name]*scale
        flagged_cost=flagged*scale*attention_action_cost_usd
        missed_cost=matrix["false_negative"]*scale*missed_attention_cost_usd
        results[name]={
            "api_cost_usd":round(api,6),
            "attention_actions_equivalent":round(flagged*scale,2),
            "extra_actions_equivalent":round(matrix["false_positive"]*scale,2),
            "missed_attention_equivalent":round(matrix["false_negative"]*scale,2),
            "hypothetical_attention_cost_usd":round(flagged_cost,2),
            "hypothetical_missed_attention_cost_usd":round(missed_cost,2),
            "hypothetical_total_usd":round(api+flagged_cost+missed_cost,6),
            "mean_model_latency_ms":doc["models"][name]["mean_latency_ms"],
        }
    return {
        "kind":"HYPOTHETICAL_FIXED_DEVELOPER_CASE_MIX",
        "sample_size":SAMPLE_SIZE,"volume":volume,
        "guarded_replay":guarded,
        "attention_action_cost_usd_assumed":attention_action_cost_usd,
        "missed_attention_cost_usd_assumed":missed_attention_cost_usd,
        "models":results,
        "jev_minus_gpt_total_usd":round(results["jev"]["hypothetical_total_usd"]-results["gpt"]["hypothetical_total_usd"],6),
        "assumptions":"Every flagged case uses identical hypothetical paid action. Real NEED_INFO and human review differ. Static 20-case dev labels not representative of insurer frequency. Guard performance on inspected development examples not blind. Model latency excludes extraction, network pipeline and real review time.",
    }

def check_recorded_pairs(report,doc):
    """Optional independent verification using the real Actions JSON artifact."""
    if report.get("status")!="LIVE_API_RUN" or len(report.get("rows",[]))!=SAMPLE_SIZE:
        raise ValueError("Original complete paired API report required")
    # Verify unique development IDs, both models, token totals and every confusion cell.
    ids=[r["id"] for r in report["rows"]]
    if len(set(ids))!=SAMPLE_SIZE or not all(r["split"]=="dev" for r in report["rows"]):
        raise ValueError("Need unique development cases")
    for model in ("jev","gpt"):
        rows=[r[model] for r in report["rows"]]
        if any(not isinstance(r,dict) or type(r.get("decision")) is not bool for r in rows):
            raise ValueError("Unscored model reply")
        if sum(r["input_tokens"] for r in rows)!=doc["models"][model]["input_tokens"]:
            raise ValueError("Input token total differs from recorded snapshot")
        if sum((r.get("output_tokens") or 0) for r in rows)!=doc["models"][model]["output_tokens"]:
            raise ValueError("Output tokens differ")
        tp=sum(x[model]["decision"] and x["needs_attention"] for x in report["rows"])
        fp=sum(x[model]["decision"] and not x["needs_attention"] for x in report["rows"])
        fn=sum(not x[model]["decision"] and x["needs_attention"] for x in report["rows"])
        tn=sum(not x[model]["decision"] and not x["needs_attention"] for x in report["rows"])
        d=doc["models"][model]
        if (tp,fp,tn,fn)!=(d["true_positive"],d["false_positive"],d["true_negative"],d["false_negative"]):
            raise ValueError("Confusion matrix mismatch")
    return True

def main():
    a=argparse.ArgumentParser(description=__doc__)
    a.add_argument("--volume",type=int,default=100000)
    a.add_argument("--action-cost",type=float,default=5)
    a.add_argument("--miss-cost",type=float,default=0)
    a.add_argument("--recorded-json",type=Path,help="Optional downloaded real Actions artifact to verify numbers")
    opts=a.parse_args()
    doc=load()
    if opts.recorded_json:
        check_recorded_pairs(json.loads(opts.recorded_json.read_text(encoding="utf-8")),doc)
        print("Original Actions results checked against aggregated data")
    print(json.dumps({
        "raw":compute(doc,opts.volume,opts.action_cost,opts.miss_cost,False),
        "guarded_retrospective":compute(doc,opts.volume,opts.action_cost,opts.miss_cost,True),
        "provenance":doc["source_run"],
        "price_sources":doc["source_for_prices"],
    },indent=2))
if __name__=="__main__":
    main()
