#!/usr/bin/env python3
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SOURCE = ROOT / "use_cases.json"
REPORT = ROOT / "report.json"


def priority_score(item: dict, weights: dict) -> float:
    # Scores are 1-5. Risk is inverted: lower risk gets a higher contribution.
    risk_inverse = 6 - item["risk"]
    weighted = (
        item["volume"] * weights["volume"]
        + item["data_readiness"] * weights["data_readiness"]
        + item["business_value"] * weights["business_value"]
        + item["ai_fit"] * weights["ai_fit"]
        + risk_inverse * weights["risk_inverse"]
    )
    return round((weighted / 5) * 100, 1)


def build_report() -> dict:
    payload = json.loads(SOURCE.read_text(encoding="utf-8"))
    ranked = []
    for item in payload["use_cases"]:
        ranked.append({
            "id": item["id"],
            "team": item["team"],
            "title": item["title"],
            "priority_score": priority_score(item, payload["weights"]),
            "system_shape": item["system_shape"],
            "human_boundary": item["human_boundary"],
        })
    ranked.sort(key=lambda x: x["priority_score"], reverse=True)
    return {
        "proof_scope": payload["meta"]["scope"],
        "recommended_first_mvp": ranked[0]["id"],
        "ranking": ranked,
    }


if __name__ == "__main__":
    report = build_report()
    REPORT.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(report, indent=2))
