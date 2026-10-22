"""H2/H6: reproducible *posthoc* triage and score diagnostics on recorded real responses.

The 300-case H3/H4 archive was already inspected before this analysis.
Results MUST be labelled exploratory; not a new blind holdout evaluation.
No API calls or real insurer/customer actions.
"""
from __future__ import annotations
import argparse,json,math,statistics,hashlib
from pathlib import Path
STUDY="INCA-JEV-RESEARCH-V2-H3-H4"
PRICE={"jev_in":0.042,"gpt_in":0.15,"gpt_out":0.60} # USD / million, illustrative Oct 2026
def brier(rows,key):
 return sum((r[key]["risk"]-int(r["critical_trace_error"]))**2 for r in rows)/len(rows)
def ece(rows,key,bins=5):
 total=len(rows);out=0
 for j in range(bins):
  x=[r for r in rows if min(bins-1,int(r[key]["risk"]*bins))==j]
  if x:out+=len(x)/total*abs(statistics.mean(r[key]["risk"] for r in x)-statistics.mean(int(r["critical_trace_error"]) for r in x))
 return out
def choose_dev_threshold(rows,key):
 positives=[r[key]["risk"] for r in rows if r["critical_trace_error"]]
 if not positives:raise ValueError("No development positives")
 # Frozen on dev to recover all observed dev positives. Coarse, not calibrated.
 return min(positives)
def subset_cost(rows,key):
 if key=="jev":return sum(r[key]["input_tokens"] for r in rows)*PRICE["jev_in"]/1e6
 return sum(r[key]["input_tokens"]*PRICE["gpt_in"]+r[key]["output_tokens"]*PRICE["gpt_out"] for r in rows)/1e6
def analyze(records):
 if records.get("study")!=STUDY or records.get("status")!="RECORDED_REAL_MODEL_STUDY":
  raise ValueError("Actual archived run required")
 rows=records.get("rows",[])
 if len(rows)!=300 or len({r["id"] for r in rows})!=300:
  raise ValueError("Complete 300-case run required")
 if any(not isinstance(r.get(k),dict) or type(r[k].get("risk")) not in (int,float)
        or not 0<=r[k]["risk"]<=1 for r in rows for k in ("jev","gpt")):
  raise ValueError("Incomplete provider results")
 dev=[r for r in rows if r["split"]=="dev"]
 holdout=[r for r in rows if r["split"]=="holdout"]
 if len(dev)!=60 or len(holdout)!=240:raise ValueError("Wrong split")
 number_critical=sum(r["critical_trace_error"] for r in holdout)
 if number_critical!=49:raise ValueError("Unexpected oracle")
 threshold=choose_dev_threshold(dev,"jev")
 selected=[r for r in holdout if r["jev"]["risk"]>=threshold]
 detected=sum(r["critical_trace_error"] for r in selected)
 skipped=[r for r in holdout if r["jev"]["risk"]<threshold]
 # Compare real GPT inference costs on exactly the calls which this *replay*
 # would have invoked; no new LLM-as-judge call is actually executed conditionally.
 baseline=subset_cost(holdout,"gpt")
 jev_all=subset_cost(holdout,"jev")
 selected_gpt=subset_cost(selected,"gpt")
 outputs={
   "study":"INCA-JEV-H2-H6-EXPLORATORY",
   "source_run":"https://github.com/mikelninh/mikelninh.github.io/actions/runs/39691808881",
   "source_dataset_sha256":records["dataset_sha256"],
   "status":"OFFLINE_REPLAY_OF_PRIOR_REAL_API_RESPONSES",
   "analysis_is_posthoc_on_previously_inspected_holdout":True,
   "dev_n":len(dev),"holdout_n":len(holdout),"holdout_critical":number_critical,
   "h2":{
      "goal":"Dev-calibrated Jev triage before an optional GPT audit; baseline GPT audits every case",
      "dev_threshold_critical_recall_100pct":threshold,
      "holdout_gpt_calls_baseline":len(holdout),
      "holdout_gpt_calls_selected":len(selected),
      "holdout_gpt_calls_skipped":len(skipped),
      "saved_call_fraction":len(skipped)/len(holdout),
      "critical_detected":detected,"critical_missed":number_critical-detected,
      "critical_recall":detected/number_critical,
      "cost_usd_estimate":{"always_gpt":baseline,"jev_all":jev_all,
         "jev_plus_selected_gpt":jev_all+selected_gpt,
         "difference_jev_first_minus_gpt":jev_all+selected_gpt-baseline},
      "gate_met":(detected/number_critical>=.98 and len(skipped)/len(holdout)>=.30
                  and jev_all+selected_gpt<baseline),
      "safety":"This is optional trace QA sampling, NEVER a replacement for deterministic mandatory checks."},
   "h6":{"holdout":{
       "jev_brier":brier(holdout,"jev"),"gpt_brier":brier(holdout,"gpt"),
       "constant_prevalence_brier":(number_critical/len(holdout))*(1-number_critical/len(holdout)),
       "jev_ece_5bins":ece(holdout,"jev"),"gpt_ece_5bins":ece(holdout,"gpt"),
       "jev_passes_ece_target":ece(holdout,"jev")<=.10,
       "jev_brier_beats_prevalence_baseline":brier(holdout,"jev")<.9*(number_critical/len(holdout))*(1-number_critical/len(holdout))}},
   "limitations":["Developer-authored labels and repeated generator patterns.",
     "Already inspected holdout; posthoc analysis is not a fresh blind validation.",
     "Scores are probabilities for planted trace faults, not probability of insurance coverage.",
     "Cost is model API list-price estimate based on recorded tokens, not provider invoice.",
     "No new selective judge was executed; same cached real GPT answers simulate call skipping.",
     "Human work, queue effects, failures outside constructed trace patterns are unmeasured."]
 }
 return outputs
def main():
 p=argparse.ArgumentParser()
 p.add_argument("--input",required=True,type=Path)
 p.add_argument("--out",type=Path)
 a=p.parse_args()
 report=analyze(json.loads(a.input.read_text(encoding="utf8")))
 print(json.dumps(report,indent=2))
 if a.out:
  a.out.parent.mkdir(parents=True,exist_ok=True)
  a.out.write_text(json.dumps(report,indent=2)+"\n",encoding="utf8")
if __name__=="__main__":main()
