from __future__ import annotations
import argparse, json, os, sys, time, urllib.request, urllib.error
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
API_URL="https://api.anthropic.com/v1/messages"

def load_json(path): return json.loads(Path(path).read_text(encoding="utf-8"))

def policy_context(claim, policies):
    by_id={p["id"]:p for p in policies[claim["line"]]}
    selected=[by_id[r] for r in claim["policy_refs"] if r in by_id]
    return "\n".join(f'- {p["id"]}: {p["text"]}' for p in selected)

def public_claim(claim):
    blocked={"gold_route","split"}
    return {k:v for k,v in claim.items() if k not in blocked}

def call_claude(api_key, model, system_prompt, claim, policies):
    user = "CLAIM\n" + json.dumps(public_claim(claim), ensure_ascii=False, indent=2)
    user += "\n\nPOLICY EXCERPTS\n" + policy_context(claim, policies)
    payload={
        "model":model,
        "max_tokens":600,
        "temperature":0,
        "system":system_prompt,
        "messages":[{"role":"user","content":user}]
    }
    req=urllib.request.Request(
        API_URL,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "content-type":"application/json",
            "x-api-key":api_key,
            "anthropic-version":"2023-06-01"
        },
        method="POST"
    )
    with urllib.request.urlopen(req, timeout=90) as r:
        body=json.loads(r.read().decode("utf-8"))
    text="".join(x.get("text","") for x in body.get("content",[]) if x.get("type")=="text")
    return body, json.loads(text)

def validate(output, claim):
    allowed={"AUTO_READY","HUMAN_REVIEW","NEED_INFO"}
    route=output.get("route")
    refs=output.get("evidence_refs",[])
    schema_ok=route in allowed and isinstance(output.get("reason_codes"),list) and isinstance(refs,list)
    grounded=all(r in claim["policy_refs"] for r in refs)
    return schema_ok, grounded

def run_version(version, prompt_path, claims, policies, api_key, model, limit=None):
    prompt=Path(prompt_path).read_text(encoding="utf-8")
    rows=[]
    for claim in claims[:limit]:
        started=time.perf_counter()
        try:
            raw,out=call_claude(api_key,model,prompt,claim,policies)
            schema_ok,grounded=validate(out,claim)
            rows.append({
                "id":claim["id"],"gold_route":claim["gold_route"],
                "predicted_route":out.get("route"),"match":out.get("route")==claim["gold_route"],
                "schema_ok":schema_ok,"grounded":grounded,
                "latency_ms":round((time.perf_counter()-started)*1000),
                "reason_codes":out.get("reason_codes",[]),"evidence_refs":out.get("evidence_refs",[]),
                "uncertainty":out.get("uncertainty",""),
                "usage":raw.get("usage",{})
            })
        except Exception as e:
            rows.append({"id":claim["id"],"gold_route":claim["gold_route"],"error":str(e),"match":False,"schema_ok":False,"grounded":False})
    n=len(rows)
    return {
        "version":version,"model":model,"n":n,
        "route_match":sum(bool(r.get("match")) for r in rows)/n if n else 0,
        "schema_valid":sum(bool(r.get("schema_ok")) for r in rows)/n if n else 0,
        "grounded":sum(bool(r.get("grounded")) for r in rows)/n if n else 0,
        "errors":sum("error" in r for r in rows),
        "rows":rows
    }

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("--model",default=os.getenv("ANTHROPIC_MODEL"))
    ap.add_argument("--limit",type=int,default=None)
    args=ap.parse_args()
    api_key=os.getenv("ANTHROPIC_API_KEY")
    if not api_key or not args.model:
        status={
            "status":"NOT_RUN",
            "reason":"ANTHROPIC_API_KEY and ANTHROPIC_MODEL are required.",
            "claim":"No Claude benchmark result is published until a real API run succeeds."
        }
        (ROOT/"reports"/"claude_benchmark.json").write_text(json.dumps(status,indent=2),encoding="utf-8")
        print(json.dumps(status,indent=2))
        return 2
    claims=[c for c in load_json(ROOT/"data"/"claims.json") if c["split"]=="holdout_a"]
    policies=load_json(ROOT/"data"/"synthetic_policy_pack.json")
    result={
        "status":"MEASURED",
        "provenance":"Real Anthropic Messages API run on developer-authored synthetic holdout claims.",
        "warning":"Synthetic evaluation only; not insurer data or production performance.",
        "prompt_v1":run_version("prompt_v1",ROOT/"prompts"/"claim_router_v1.txt",claims,policies,api_key,args.model,args.limit),
        "prompt_v2":run_version("prompt_v2",ROOT/"prompts"/"claim_router_v2.txt",claims,policies,api_key,args.model,args.limit)
    }
    (ROOT/"reports"/"claude_benchmark.json").write_text(json.dumps(result,indent=2),encoding="utf-8")
    print(json.dumps({k:v for k,v in result.items() if k!="prompt_v1" and k!="prompt_v2"},indent=2))
    print("v1",result["prompt_v1"]["route_match"],"v2",result["prompt_v2"]["route_match"])
    return 0

if __name__=="__main__":
    raise SystemExit(main())
