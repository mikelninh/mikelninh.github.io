from __future__ import annotations

from datetime import datetime, timezone
from pathlib import Path
from typing import Any
import json
import yaml


ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"
RUNTIME = ROOT / "runtime"


class PortfolioStore:
    def __init__(self, data_dir: Path = DATA, runtime_dir: Path = RUNTIME):
        self.data_dir = data_dir
        self.runtime_dir = runtime_dir

    def list_projects(self) -> list[dict[str, Any]]:
        projects = []
        for path in sorted((self.data_dir / "projects").glob("*.yaml")):
            with path.open("r", encoding="utf-8") as handle:
                project = yaml.safe_load(handle) or {}
                project["manifest_path"] = str(path.relative_to(ROOT))
                projects.append(project)
        return projects

    def get_project(self, project_id: str) -> dict[str, Any] | None:
        for project in self.list_projects():
            if project.get("id") == project_id:
                return project
        return None

    def list_decisions(self) -> list[dict[str, Any]]:
        path = self.data_dir / "decisions.json"
        with path.open("r", encoding="utf-8") as handle:
            return json.load(handle)

    def snapshot(self) -> dict[str, Any]:
        return {
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "projects": self.list_projects(),
            "decisions": self.list_decisions(),
            "agents": self._load_json("agents.json"),
            "autonomy": self._load_json("autonomy.json"),
        }

    def propose_decision(self, decision: dict[str, Any]) -> dict[str, Any]:
        self.runtime_dir.mkdir(parents=True, exist_ok=True)
        path = self.runtime_dir / "proposed_decisions.json"
        current = []
        if path.exists():
            current = json.loads(path.read_text(encoding="utf-8"))
        current.append(decision)
        path.write_text(json.dumps(current, indent=2), encoding="utf-8")
        self.record_audit_event("decision_proposed", decision)
        return decision

    def record_audit_event(self, event_type: str, payload: dict[str, Any]) -> None:
        self.runtime_dir.mkdir(parents=True, exist_ok=True)
        path = self.runtime_dir / "audit.jsonl"
        event = {
            "time": datetime.now(timezone.utc).isoformat(),
            "type": event_type,
            "payload": payload,
        }
        with path.open("a", encoding="utf-8") as handle:
            handle.write(json.dumps(event) + "\n")

    def _load_json(self, name: str) -> Any:
        path = self.data_dir / name
        with path.open("r", encoding="utf-8") as handle:
            return json.load(handle)
