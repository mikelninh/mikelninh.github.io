"""Offline-only replay of a recorded *development* paired-model report.

This script NEVER calls an LLM. Do not use to claim unbiased generalisation:
guard rules were written after inspecting these development failures.
"""
import argparse,hashlib,json,pathlib
from safety_guard import guarded_decision

HERE=pathlib.Path(__file__).resolve().parent

def summarize(rows,model):
    tp=fp=tn=fn=0;changed=[]
    for row in rows:
        raw=row[model]
        if not isinstance(raw,dict) or type(raw.get("decision")) is not bool:
            raise ValueError("Recorded model output missing: "+row["id"])
        actual=guarded_decision(raw["decision"],row["a"],row["b"])
        pred=actual["needs_attention"];expected=row["expected"]
        if actual["guard_triggered"] and pred!=raw["decision"]:
            changed.append(row["id"])
        if pred and expected:tp+=1
        elif pred:fp+=1
        elif expected:fn+=1
        else:tn+=1
    return {"n":len(rows),"tp":tp,"fp":fp,"tn":tn,"fn":fn,"route_matches":tp+tn,"guard_changed_ids":changed}

def replay(report,dataset):
    if report.get("status")!="LIVE_API_RUN":
        raise ValueError("Require recorded live API results")
    digest=hashlib.sha256(json.dumps(dataset,indent=2,ensure_ascii=False).encode("utf-8")).hexdigest()
    # Validate identity by case IDs and authored binary labels; the raw source bytes hash
    # is compared by the CLI, not this pure function.
    fixtures={r["id"]:r for r in dataset["cases"]}
    given=report.get("rows")
    if not isinstance(given,list) or not given or len({r["id"] for r in given})!=len(given):
        raise ValueError("Missing or duplicated rows")
    rows=[]
    for r in given:
        c=fixtures.get(r["id"])
        if c is None or c["split"]!="dev" or r.get("needs_attention")!=c["needs_attention"]:
            raise ValueError("Not a matching, development-only set: "+r["id"])
        rows.append({"id":r["id"],"a":c["a"],"b":c["b"],"expected":c["needs_attention"],
                     "jev":r.get("jev"),"gpt":r.get("gpt")})
    return {"provenance":"Retrospective deterministic guard replay on previously observed, developer-authored DEV examples; not a new independent model run.",
            "cases":len(rows),"jev":summarize(rows,"jev"),"gpt":summarize(rows,"gpt")}

def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument("recorded_json",type=pathlib.Path)
    p.add_argument("--out",type=pathlib.Path)
    a=p.parse_args()
    dataset_path=HERE/"paired_cases_v2.json"
    dataset=json.loads(dataset_path.read_text(encoding="utf-8"))
    recorded=json.loads(a.recorded_json.read_text(encoding="utf-8"))
    if recorded.get("dataset_sha256")!=hashlib.sha256(dataset_path.read_bytes()).hexdigest():
        p.error("Dataset digest differs; cannot replay")
    summary=replay(recorded,dataset)
    rendered=json.dumps(summary,indent=2,ensure_ascii=False)+"\n"
    print(rendered,end="")
    if a.out:
        a.out.parent.mkdir(parents=True,exist_ok=True)
        a.out.write_text(rendered,encoding="utf-8")
if __name__=="__main__":main()
