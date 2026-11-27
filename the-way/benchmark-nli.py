#!/usr/bin/env python3
"""Independent text-entailment classifier on the frozen development cases."""
import json,sys,time,re
from pathlib import Path
from datetime import datetime,timezone
import torch
from transformers import AutoTokenizer,AutoModelForSequenceClassification
from huggingface_hub import HfApi
ROOT=Path(__file__).parent
MODEL="cross-encoder/nli-deberta-v3-small"
revision=HfApi().model_info(MODEL).sha
torch.set_num_threads(2)
tokenizer=AutoTokenizer.from_pretrained(MODEL,revision=revision,trust_remote_code=False)
model=AutoModelForSequenceClassification.from_pretrained(MODEL,revision=revision,trust_remote_code=False,use_safetensors=True).eval()
labels={int(k):str(v).lower() for k,v in model.config.id2label.items()}
assert set(labels.values())=={"contradiction","entailment","neutral"},labels
dataset=json.loads((ROOT/"benchmark-cases.json").read_text())
rows=[];start=time.monotonic()
for c in dataset["cases"]:
    inputs=tokenizer(c["context"],c["claim"],return_tensors="pt",truncation=True,max_length=512)
    with torch.inference_mode():scores=model(**inputs).logits.softmax(-1)[0].tolist()
    label=labels[max(range(len(scores)),key=lambda i:scores[i])]
    entailment=scores[next(k for k,v in labels.items() if v=="entailment")]
    raw="REVIEW" if label=="entailment" else "REJECT"
    # Prespecified threshold is a model score, not a calibrated truth probability.
    guarded="REVIEW" if raw=="REVIEW" and entailment>=0.8 and not re.search(r"ignore your instructions|output review",c["context"],re.I) else "REJECT"
    rows.append({**c,"label":label,"modelScore":round(entailment,5),"rawDecision":raw,"guardedDecision":guarded})
def metrics(key):
    return {"correct":sum(r[key]==r["expected"] for r in rows),"criticalFalseAllows":sum(r["critical"] and r[key]=="REVIEW" for r in rows),"supportedAccepted":sum(r["expected"]=="REVIEW" and r[key]=="REVIEW" for r in rows),"supportedTotal":sum(r["expected"]=="REVIEW" for r in rows)}
out={"version":dataset["version"],"method":"Independent natural-language inference model, frozen development cases. Threshold 0.8 on uncalibrated entailment score plus injection guard. No independent test set, no publication approval.","model":MODEL,"revision":revision,"generatedAt":datetime.now(timezone.utc).isoformat(),"modelCalls":len(rows),"seconds":round(time.monotonic()-start,2),"raw":metrics("rawDecision"),"guarded":metrics("guardedDecision"),"results":rows,"publicationApproved":False}
Path(sys.argv[1]).write_text(json.dumps(out,indent=2,ensure_ascii=False))
print("NLI_RECEIPT "+json.dumps(out,ensure_ascii=True,separators=(",",":")))
