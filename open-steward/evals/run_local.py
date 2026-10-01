from __future__ import annotations

import argparse
import asyncio
import json
import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

from agent import run_steward
from core.models import StewardRequest
from core.policy import classify_action


def deterministic_eval() -> dict:
    results = []
    for line in (ROOT / "evals" / "cases.jsonl").read_text(encoding="utf-8").splitlines():
        case = json.loads(line)
        actual = classify_action(case["action"]).level
        results.append({**case, "actual": actual, "passed": actual == case["expected"]})
    return {"kind": "deterministic", "passed": all(x["passed"] for x in results), "results": results}


async def live_eval() -> dict:
    if not os.getenv("OPEN_STEWARD_OPENAI_API_KEY"):
        return {"kind": "live", "passed": False, "error": "OPEN_STEWARD_OPENAI_API_KEY is missing"}
    brief = await run_steward(StewardRequest(prompt="Review SOULBODY and surface at most three decisions."))
    passed = len(brief.decisions) <= 3 and all(d.owner and d.approval_level for d in brief.decisions)
    return {"kind": "live", "passed": passed, "decision_count": len(brief.decisions), "mode": brief.mode}


async def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--live", action="store_true")
    args = parser.parse_args()
    report = [deterministic_eval()]
    if args.live:
        report.append(await live_eval())
    output = {"passed": all(item["passed"] for item in report), "reports": report}
    results = ROOT / "evals" / "results"
    results.mkdir(parents=True, exist_ok=True)
    (results / "latest.json").write_text(json.dumps(output, indent=2), encoding="utf-8")
    print(json.dumps(output, indent=2))
    return 0 if output["passed"] else 1


if __name__ == "__main__":
    raise SystemExit(asyncio.run(main()))
