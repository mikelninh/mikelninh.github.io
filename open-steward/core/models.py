from __future__ import annotations

from typing import Literal
from pydantic import BaseModel, Field


ApprovalLevel = Literal["automatic", "approval_required", "forbidden"]
HealthLevel = Literal["healthy", "watch", "at_risk", "unknown"]


class DecisionPacket(BaseModel):
    id: str
    project: str
    title: str
    recommendation: str
    rationale: str
    expected_impact: str
    cost: str
    reversibility: Literal["high", "medium", "low"]
    confidence: int = Field(ge=0, le=100)
    approval_level: ApprovalLevel
    owner: str
    deadline: str | None = None
    next_actions: list[str] = Field(default_factory=list)


class ProjectHealth(BaseModel):
    project: str
    health: HealthLevel
    score: int = Field(ge=0, le=100)
    stage: str
    current_focus: str
    north_star: str
    evidence: list[str] = Field(default_factory=list)
    risks: list[str] = Field(default_factory=list)


class ExecutiveBrief(BaseModel):
    summary: str
    portfolio_health: list[ProjectHealth]
    decisions: list[DecisionPacket]
    autonomous_actions: list[str]
    risks: list[str]
    opportunities: list[str]
    mode: Literal["live", "demo"] = "live"


class StewardRequest(BaseModel):
    prompt: str = "Run the portfolio review and surface only material decisions."
    project: str | None = None
    force_demo: bool = False
