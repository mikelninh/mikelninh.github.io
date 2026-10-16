#!/usr/bin/env python3
"""FIRST MILE GPT-6 budgeted model/reasoning benchmark. Dry-run by default."""
import argparse
from datetime import datetime,timezone
import json
import os
from pathlib import Path
import sys
import time
from urllib.error import HTTPError,URLError
from urllib.request import Request,urlopen
HERE=Path(__file__).resolve().parent
sys.path.insert(0,str(HERE))
from benchmark import FIELDS,CLAIM_SCHEMA,EXTRACT_PROMPT,fixtures,verify,statuses
PRICES={"gpt-6-luna":(.10,.50),"gpt-6.1-sol":(2.,10.),"gpt-6-astra":(10.,50.)}
PROFILES=[{"id":family+"-"+effort,"model":model,"family":family,"effort":effort}
 for family,model,efforts in (
 ("luna","gpt-6-luna",("none","low","medium","high")),
 ("sol","gpt-6.1-sol",("low","medium","high")),
 ("astra","gpt-6-astra",("low","high")))
 for effort in efforts]
PILOT=("asterion","riverbend","forecast-split")
DEFAULT_LIMIT=1.50
DEFAULT_OUTPUT_CAP=1400

def text_for(case):
 return json.dumps({"untrusted_documents":case["docs"]},ensure_ascii=False,separators=(",",":"))

def reserve_cost(model,content,cap):
 # Overreserve UTF8 byte count + schema/system + framing; not an account spending cap.
 bytes_total=(len(content.encode("utf-8"))+len(EXTRACT_PROMPT.encode("utf-8"))
    +len(json.dumps(CLAIM_SCHEMA).encode("utf-8"))+1800)
 input_estimate=max(bytes_total,3000)
 input_rate,output_rate=PRICES[model]
 return round(1.20*(input_estimate*input_rate+cap*output_rate)/1e6,8)

def actual_cost(model,usage):
 input_rate,output_rate=PRICES[model]
 return round((usage["input"]*input_rate+usage["output"]*output_rate)/1e6,8)

class Budget:
 def __init__(self,maximum):
  if maximum<=0 or maximum>2.58:raise ValueError("Use a budget between $0 and $2.58")
  self.maximum=float(maximum);self.accounted=0.;self.events=[]
 def allowed(self,reservation):
  return self.accounted+reservation<=self.maximum+1e-9
 def record(self,reservation,actual=None):
  booked=reservation if actual is None else actual
  self.accounted=round(self.accounted+booked,8)
  self.events.append({"reserve_usd":reservation,"accounted_usd":booked,
        "basis":"unknown_spend_error_reservation" if actual is None else "provider_token_usage"})

def call_openai(model,effort,text,cap):
 key=os.environ.get("OPENAI_API_KEY")
 if not key:raise RuntimeError("OPENAI_API_KEY missing")
 payload={"model":model,"reasoning":{"effort":effort},"instructions":EXTRACT_PROMPT,
   "input":text,"max_output_tokens":cap,"store":False,
   "text":{"format":{"type":"json_schema","name":"first_mile_claims","strict":True,"schema":CLAIM_SCHEMA}}}
 request=Request("https://api.openai.com/v1/responses",
   json.dumps(payload,ensure_ascii=False).encode("utf-8"),
   headers={"Authorization":"Bearer "+key,"Content-Type":"application/json"},method="POST")
 started=time.perf_counter()
 try:
  with urlopen(request,timeout=90) as response:
   body=json.loads(response.read(2000000).decode("utf-8"))
 except HTTPError as e:raise RuntimeError("OpenAI HTTP "+str(e.code)) from None
 except URLError:raise RuntimeError("OpenAI transport failure") from None
 usage=body.get("usage") or {}
 tokens={"input":int(usage.get("input_tokens") or 0),"output":int(usage.get("output_tokens") or 0)}
 pieces=[part.get("text","") for row in body.get("output",[])
         for part in row.get("content",[]) if part.get("type")=="output_text"]
 if not pieces:raise RuntimeError("No structured output; reasoning may have consumed output cap")
 return json.loads("".join(pieces)),tokens,round((time.perf_counter()-started)*1000)

def run_case(profile,case,labels,budget,cap,transport):
 text=text_for(case);reserved=reserve_cost(profile["model"],text,cap)
 result={"case_id":case["id"],"status":"not_run","correct":None,"fields":8,
         "reserved_usd":reserved}
 if not budget.allowed(reserved):
  result.update(status="budget_skipped",reason="Not enough budget for conservative per-request estimate")
  return result
 try:
  payload,usage,latency=transport(profile["model"],profile["effort"],text,cap)
  cost=actual_cost(profile["model"],usage);budget.record(reserved,cost)
  accepted,rejected=verify(case,payload.get("claims",[]))
  predicted=statuses(accepted)
  correct=sum(predicted[k]==labels[case["id"]][k] for k in FIELDS)
  result.update(status="measured",correct=correct,predicted=predicted,expected=labels[case["id"]],
     mismatches=[k for k in FIELDS if predicted[k]!=labels[case["id"]][k]],
     verified_quotes=len(accepted),rejected_quotes=len(rejected),usage=usage,
     cost_usd=cost,latency_ms=latency)
 except Exception as error:
  budget.record(reserved,None)
  result.update(status="error",reason=type(error).__name__)
 return result

def quality(rows):
 measured=[r for r in rows if r["status"]=="measured"]
 return {"correct":sum(r["correct"] for r in measured),"fields":8*len(measured),
   "cost_usd":round(sum(r.get("cost_usd",0) for r in measured),8),
   "latency_ms":sum(r.get("latency_ms",0) for r in measured),
   "rejected_quotes":sum(r.get("rejected_quotes",0) for r in measured)}

def completed(rows,count):
 return len(rows)==count and all(r["status"]=="measured" for r in rows)

def choose_finalists(out):
 winners=[]
 for fam in ("luna","sol","astra"):
  members=[p for p in PROFILES if p["family"]==fam and completed(out[p["id"]],3)]
  members.sort(key=lambda p:(-quality(out[p["id"]])["correct"],
    quality(out[p["id"]])["rejected_quotes"],quality(out[p["id"]])["cost_usd"],
    quality(out[p["id"]])["latency_ms"]))
  if members:winners.append(members[0]["id"])
 return winners

def recommend(entries):
 contenders=[r for r in entries if r["complete_six"]]
 if len(contenders)<2:return {"status":"not_enough_comparable_finals"}
 best=max(c["quality"]["correct"] for c in contenders)
 near=[c for c in contenders if c["quality"]["correct"]>=best-1]
 near.sort(key=lambda c:(c["quality"]["cost_usd"],c["quality"]["latency_ms"]))
 return {"status":"provisional_synthetic_only","chosen_profile":near[0]["id"],
     "gold_matches":near[0]["quality"]["correct"],
     "of_fields":near[0]["quality"]["fields"],
     "criterion":"Lowest observed cost within one matched field of highest quality"}

def evaluate(maximum=DEFAULT_LIMIT,cap=DEFAULT_OUTPUT_CAP,live=False,transport=call_openai):
 if not 600<=cap<=3000:raise ValueError("Use 600-3000 output tokens")
 cases,labels=fixtures()
 by_id={x["id"]:x for x in cases}
 if live and transport is call_openai and not os.environ.get("OPENAI_API_KEY"):
  raise RuntimeError("Set OPENAI_API_KEY in your local environment first")
 budget=Budget(maximum)
 results={p["id"]:[] for p in PROFILES}
 plan=[{**p,"three_case_max_reserve_usd":round(sum(
    reserve_cost(p["model"],text_for(by_id[case_id]),cap) for case_id in PILOT),6)}
    for p in PROFILES]
 selected=[]
 if live:
  # Interleave to avoid one expensive profile consuming the full budget early.
  for case_id in PILOT:
   for p in PROFILES:
    results[p["id"]].append(run_case(p,by_id[case_id],labels,budget,cap,transport))
  selected=choose_finalists(results)
  for case in cases:
   if case["id"] in PILOT:continue
   for id in selected:
    p=next(p for p in PROFILES if p["id"]==id)
    results[id].append(run_case(p,case,labels,budget,cap,transport))
 entries=[{**p,"pilot_complete":completed([r for r in results[p["id"]] if r["case_id"] in PILOT],3),
   "complete_six":completed(results[p["id"]],6),
   "quality":quality(results[p["id"]]),"cases":results[p["id"]]} for p in PROFILES]
 return {"schema":"first-mile-reasoning-matrix/v1",
  "generated_at":datetime.now(timezone.utc).isoformat(),
  "mode":"live_paid_api" if live else "dry_run_no_api",
  "profiles":entries,"pilot_plan":plan,"selected_finalists":selected,
  "budget":{"limit_usd":maximum,"accounted_usd":round(budget.accounted,6),
             "remaining_estimated_usd":round(maximum-budget.accounted,6),"events":budget.events},
  "prices_per_million_input_output_usd":PRICES,
  "max_output_tokens":cap,
  "recommendation":recommend(entries) if live else {"status":"not_run"},
  "warnings":["Self-authored synthetic data; not independent real-deck accuracy",
   "Reasoning output tokens count toward cost; high effort can exhaust output cap",
   "Runner budget reservation is NOT a provider-enforced hard account limit",
   "Any API error counts as reserved spend, because actual provider charge may be unknown",
   "Partial and skipped profiles are not eligible for a winner claim"]}

def main():
 parser=argparse.ArgumentParser(description=__doc__)
 parser.add_argument("--allow-billable",action="store_true")
 parser.add_argument("--budget-usd",type=float,default=DEFAULT_LIMIT)
 parser.add_argument("--max-output-tokens",type=int,default=DEFAULT_OUTPUT_CAP)
 parser.add_argument("--output",type=Path)
 args=parser.parse_args()
 r=evaluate(args.budget_usd,args.max_output_tokens,args.allow_billable)
 raw=json.dumps(r,ensure_ascii=False,indent=2)+"\n"
 if args.output:
  path=args.output.resolve()
  if path.name.startswith(".env"):parser.error("Will not overwrite an environment file")
  path.parent.mkdir(parents=True,exist_ok=True);path.write_text(raw,encoding="utf-8")
  print("Wrote",r["mode"],"to",path)
 else:print(raw,end="")

if __name__=="__main__":main()
