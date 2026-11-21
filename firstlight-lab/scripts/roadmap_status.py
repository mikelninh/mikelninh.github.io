#!/usr/bin/env python3
"""Create a factual weekly LifeBench roadmap report from GitHub issue metadata.

This is a progress *check*, not an autonomous implementer, legislative
submission, or reviewer of law. Never infer completion from an issue being closed.
Only standard-library dependencies.
"""
from __future__ import annotations

import argparse
from datetime import datetime, timezone
import json
import os
from pathlib import Path
import re
import sys
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
ISSUE_NUMBERS = (152, 153, 154, 155, 156, 157)
API = "https://api.github.com/repos/mikelninh/mikelninh.github.io"
LABELS = {
    152: "Evidence-first legal drafting & review",
    153: "Formal consultation and real institutional response",
    154: "Legislative event graph & source-level review",
    155: "Independent animal-welfare evaluation",
    156: "Open governance, privacy and partners",
    157: "Reusable public-interest policy toolkit",
}

def get_json(url: str):
    token = os.getenv("GITHUB_TOKEN", "").strip()
    headers = {"Accept": "application/vnd.github+json",
               "User-Agent": "lifebench-roadmap-status/1.0",
               "X-GitHub-Api-Version": "2022-11-28"}
    if token:
        headers["Authorization"] = "Bearer " + token
    try:
        with urlopen(Request(url, headers=headers), timeout=16) as response:
            return json.load(response)
    except (HTTPError, URLError, TimeoutError, ValueError) as exc:
        print(f"WARN roadmap issue metadata unavailable for {url}: {type(exc).__name__}", file=sys.stderr)
        return None

def normalise_issue(number: int, raw: dict | None) -> dict:
    if not raw or raw.get("number") != number or raw.get("pull_request"):
        return {"number": number, "title": LABELS[number], "state": "unknown",
                "updated_at": None, "checks_done": None, "checks_total": None,
                "url": f"https://github.com/mikelninh/mikelninh.github.io/issues/{number}",
                "availability": "unavailable"}
    body = raw.get("body") or ""
    checked = len(re.findall(r"(?m)^\s*-\s*\[[xX]\]\s", body))
    unchecked = len(re.findall(r"(?m)^\s*-\s*\[\s\]\s", body))
    return {"number":number,"title":str(raw.get("title") or LABELS[number])[:180],
            "state":raw["state"] if raw.get("state") in ("open","closed") else "unknown",
            "updated_at":raw.get("updated_at"),"checks_done":checked,
            "checks_total":checked+unchecked, "url":raw.get("html_url") or
            f"https://github.com/mikelninh/mikelninh.github.io/issues/{number}",
            "availability":"ok"}

def summarise(issues: list[dict], snapshot: dict, as_of: str) -> dict:
    law = next((x for x in snapshot.get("cases",[]) if x.get("id")=="334563"),{})
    valid = [i for i in issues if i["state"] in ("open","closed")]
    open_issues = [i for i in valid if i["state"]=="open"]
    return {
        "schema":"lifebench-roadmap-status-v1","generated_at":as_of,
        "report_kind":"factual_task_status_not_impact",
        "issue_count_known":len(valid),"issue_count_unknown":len(issues)-len(valid),
        "open_issues":len(open_issues),"closed_issues":len(valid)-len(open_issues),
        "next_open_issue":open_issues[0]["number"] if open_issues else None,
        "legislative_monitor":{"generated_at":snapshot.get("generated_at"),
            "sources":{key:entry.get("status") for key,entry in snapshot.get("sources",{}).items()},
            "animal_case_id":"334563","raw_status":law.get("status_raw") or "unknown",
            "promulgated_verified":bool(law.get("promulgation",{}).get("verified")),
            "entry_into_force_verified":bool(law.get("entry_into_force",{}).get("verified")),
            "impact_verified":bool(law.get("impact",{}).get("verified"))},
        "issues":issues,
        "guardrail":"An issue marked closed or a checkbox checked does not independently verify a legal, democratic or real-world outcome."
    }

def render_md(result: dict) -> str:
    rows=[]
    for issue in result["issues"]:
        done = (str(issue["checks_done"])+"/"+str(issue["checks_total"])
                if issue["checks_total"] is not None else "unavailable")
        state = {"open":"Open","closed":"Closed (review evidence)","unknown":"Not checked"}[issue["state"]]
        title = issue["title"].replace("|","/").replace("\n"," ")
        rows.append(f'| [#{issue["number"]}]({issue["url"]}) | {title} | {state} | {done} |')
    o=result["legislative_monitor"]; sources=o["sources"]
    return "\n".join([
        "# LifeBench · Weekly roadmap status",
        f'**Checked at:** {result["generated_at"]}',
        "**Type:** automated facts-only report, not autonomous engineering progress or a legislative-effect claim.",
        "",
        f'**Milestones:** {result["open_issues"]} open, {result["closed_issues"]} closed, {result["issue_count_unknown"]} unavailable. '
        "Closed issues are **not automatically verified as completed**.",
        "",
        "| Issue | Goal | Issue status | Self-reported checklist |",
        "|---|---|---|---|",
        *rows,
        "",
        "## Official animal-welfare legislative case",
        f'- **DIP:** [334563](https://dip.bundestag.de/vorgang/334563)',
        f'- **Reported parliamentary status:** {o["raw_status"]}',
        f'- **Monitor snapshot:** {o["generated_at"] or "unavailable"}',
        f'- **Source health:** '+", ".join(f"{key}={v}" for key,v in sources.items()),
        f'- **Promulgation verified:** {o["promulgated_verified"]}',
        f'- **Entry into force verified:** {o["entry_into_force_verified"]}',
        f'- **Independent impact verified:** {o["impact_verified"]}',
        "",
        "## What should happen next?",
        ("Review [the highest-priority open milestone](https://github.com/mikelninh/mikelninh.github.io/issues/"
         +str(result["next_open_issue"])+") with its acceptance criteria." if result["next_open_issue"] else
         "All known milestones are closed or unavailable: check evidence and create a new, reviewed milestone."),
        "",
        "**Limitations:** Issue statuses and checklist ticks are maintained by humans and are not independent evidence of fulfilment. "
        "Official legislative facts are taken only from the dated source snapshot. A law's vote, promulgation, entry into force, implementation and impact are distinct.",
        "",
        "[Long-term masterplan](./MASTERPLAN.md) · "
        "[Live LifeBench](https://mikelninh.github.io/firstlight-lab/lifebench.html)",
        ""
    ])

def main():
    p=argparse.ArgumentParser()
    p.add_argument("--out",default=str(ROOT/"ROADMAP_STATUS.md"))
    p.add_argument("--json-out",default=str(ROOT/"data"/"roadmap-status.json"))
    p.add_argument("--fixture",help="Optional local JSON list for testing instead of calling the GitHub API")
    args=p.parse_args()
    if args.fixture:
        raws=json.loads(Path(args.fixture).read_text(encoding="utf-8"))
        by_number={x.get("number"):x for x in raws}
        issues=[normalise_issue(n,by_number.get(n)) for n in ISSUE_NUMBERS]
    else:
        issues=[normalise_issue(n,get_json(f"{API}/issues/{n}")) for n in ISSUE_NUMBERS]
    snapshot=json.loads((ROOT/"data"/"law-feed.json").read_text(encoding="utf-8"))
    if snapshot.get("schema")!="lifebench-official-monitor-v1":
        raise ValueError("Official source snapshot has an unexpected schema")
    result=summarise(issues,snapshot,datetime.now(timezone.utc).isoformat(timespec="seconds"))
    Path(args.out).parent.mkdir(parents=True,exist_ok=True)
    Path(args.json_out).parent.mkdir(parents=True,exist_ok=True)
    Path(args.out).write_text(render_md(result),encoding="utf-8")
    Path(args.json_out).write_text(json.dumps(result,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print("Roadmap status:",result["open_issues"],"open,",result["issue_count_unknown"],"unavailable")

if __name__=="__main__":
    main()
