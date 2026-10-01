from __future__ import annotations

from mcp.server.fastmcp import FastMCP

from core.policy import classify_action
from core.store import PortfolioStore


store = PortfolioStore()
mcp = FastMCP("Open Steward")


@mcp.tool()
def list_projects() -> list[dict]:
    """List registered projects and their public operating manifests."""
    return store.list_projects()


@mcp.tool()
def get_project_health(project_id: str) -> dict:
    """Return the registered manifest and current health inputs for one project."""
    project = store.get_project(project_id)
    return project or {"error": "project_not_found", "project_id": project_id}


@mcp.tool()
def list_open_decisions() -> list[dict]:
    """List decision packets currently waiting for founder review."""
    return store.list_decisions()


@mcp.tool()
def check_action_policy(action: str) -> dict:
    """Classify an intended action as automatic, approval-required, or forbidden."""
    decision = classify_action(action)
    return {"action": decision.action, "level": decision.level, "reason": decision.reason}


@mcp.tool()
def propose_decision(
    project: str,
    title: str,
    recommendation: str,
    expected_impact: str,
    approval_level: str = "approval_required",
) -> dict:
    """Create a local proposed decision packet. This does not execute the proposed action."""
    packet = {
        "project": project,
        "title": title,
        "recommendation": recommendation,
        "expected_impact": expected_impact,
        "approval_level": approval_level,
    }
    return store.propose_decision(packet)


@mcp.tool()
def record_outcome(project: str, outcome: str, evidence: str) -> dict:
    """Append a verified project outcome to the local audit log."""
    payload = {"project": project, "outcome": outcome, "evidence": evidence}
    store.record_audit_event("outcome_recorded", payload)
    return {"recorded": True, **payload}


if __name__ == "__main__":
    mcp.run()
