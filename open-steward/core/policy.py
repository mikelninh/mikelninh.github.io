from __future__ import annotations

from dataclasses import dataclass
from typing import Literal

ApprovalLevel = Literal["automatic", "approval_required", "forbidden"]


AUTOMATIC = {
    "read_status",
    "summarize",
    "draft_spec",
    "create_issue",
    "create_branch",
    "create_pull_request",
    "run_tests",
    "run_evals",
    "deploy_preview",
    "update_documentation",
    "analyze_feedback",
}

APPROVAL_REQUIRED = {
    "deploy_production",
    "public_communication",
    "increase_budget",
    "purchase",
    "change_pricing",
    "change_privacy_policy",
    "change_safety_policy",
    "delete_user_data",
    "legal_agreement",
    "hire_person",
    "terminate_person",
    "major_pivot",
}

FORBIDDEN = {
    "expand_own_permissions",
    "read_secret_value",
    "print_secret_value",
    "commit_secret",
    "delete_audit_log",
    "rewrite_audit_history",
    "bypass_approval",
    "hide_failed_tests",
    "claim_unverified_action",
}


@dataclass(frozen=True)
class PolicyDecision:
    action: str
    level: ApprovalLevel
    reason: str


def classify_action(action: str) -> PolicyDecision:
    normalized = action.strip().lower().replace(" ", "_").replace("-", "_")
    if normalized in FORBIDDEN:
        return PolicyDecision(normalized, "forbidden", "This action violates the operating constitution.")
    if normalized in APPROVAL_REQUIRED:
        return PolicyDecision(normalized, "approval_required", "Founder approval is required before execution.")
    if normalized in AUTOMATIC:
        return PolicyDecision(normalized, "automatic", "This action is bounded, reversible, and auditable.")
    return PolicyDecision(normalized, "approval_required", "Unknown actions default to founder approval.")


def may_execute(action: str, approved: bool = False) -> bool:
    decision = classify_action(action)
    if decision.level == "automatic":
        return True
    if decision.level == "approval_required":
        return approved
    return False
