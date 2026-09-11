#!/usr/bin/env python3
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SCENARIOS = ROOT / "scenarios.json"
REPORT = ROOT / "report.json"


def release_decision(gates: dict[str, bool]) -> str:
    required = ("spec_contract", "tool_policy", "tests", "security", "observability", "ci")
    return "READY_FOR_HUMAN_RELEASE" if all(bool(gates.get(name)) for name in required) else "BLOCKED"


def build_report() -> dict:
    payload = json.loads(SCENARIOS.read_text(encoding="utf-8"))
    results = []
    for scenario in payload["scenarios"]:
        actual = release_decision(scenario["gates"])
        expected = scenario["expected_release"]
        results.append({
            "id": scenario["id"],
            "name": scenario["name"],
            "expected_release": expected,
            "actual_release": actual,
            "match": actual == expected,
            "failed_gates": [name for name, passed in scenario["gates"].items() if not passed],
        })
    return {
        "proof_scope": payload["meta"]["scope"],
        "scenario_count": len(results),
        "all_expected_outcomes_match": all(item["match"] for item in results),
        "results": results,
    }


if __name__ == "__main__":
    report = build_report()
    REPORT.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(report, indent=2))
    raise SystemExit(0 if report["all_expected_outcomes_match"] else 1)
