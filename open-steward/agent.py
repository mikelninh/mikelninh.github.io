from __future__ import annotations

import json
import os
from typing import Any

from core.models import DecisionPacket, ExecutiveBrief, ProjectHealth, StewardRequest
from core.store import PortfolioStore

try:
    from agents import Agent, Runner
    AGENTS_AVAILABLE = True
except ImportError:  # Keeps demo mode runnable before dependencies are installed.
    Agent = Runner = None
    AGENTS_AVAILABLE = False


MANAGER_INSTRUCTIONS = """
You are Open Steward, a Portfolio Chief of Staff reporting to the human founder and CEO.
You own the final executive brief. Specialist agents are advisers, not independent executives.

Your job:
- inspect the supplied portfolio snapshot;
- identify only material decisions, risks, opportunities, and bounded autonomous actions;
- call specialists when their expertise is useful;
- keep operational noise out of the founder's report;
- distinguish verified facts from assumptions;
- never claim an external action occurred without evidence;
- respect the action policy: production, public communication, spending, pricing, privacy,
  legal, user-data changes, hiring, firing, and major pivots require founder approval;
- never expose secrets, expand permissions, bypass approvals, or alter the audit history.

Every decision packet must state recommendation, rationale, expected impact, cost,
reversibility, confidence, owner, approval level, and next actions.
"""


def _build_agents(model: str):
    product = Agent(
        name="Product Experience Lead",
        model=model,
        instructions=(
            "Review product value, onboarding, UX, user evidence, and prioritization. "
            "Propose measurable experiments. Do not claim unmeasured impact as fact."
        ),
    )
    engineering = Agent(
        name="Engineering Lead",
        model=model,
        instructions=(
            "Review architecture, reliability, security, delivery risk, technical debt, "
            "and implementation sequencing. Prefer reversible changes and preview deployments."
        ),
    )
    safety = Agent(
        name="Trust and Safety Lead",
        model=model,
        instructions=(
            "Review privacy, consent, dependency risks, misuse, data boundaries, and approval gates. "
            "Be practical and do not turn ordinary product risk into vague alarmism."
        ),
    )
    project_gm = Agent(
        name="Project GM",
        model=model,
        instructions=(
            "Act as the general manager for one project. Translate mission and evidence into one "
            "current objective, a short operating plan, material risks, and decisions for the founder."
        ),
        tools=[
            product.as_tool(
                tool_name="consult_product_experience",
                tool_description="Review product experience, onboarding, evidence, and prioritization.",
            ),
            engineering.as_tool(
                tool_name="consult_engineering",
                tool_description="Review implementation, reliability, architecture, and delivery risk.",
            ),
            safety.as_tool(
                tool_name="consult_trust_and_safety",
                tool_description="Review privacy, consent, safety, and approval boundaries.",
            ),
        ],
    )
    manager = Agent(
        name="Portfolio Steward",
        model=model,
        instructions=MANAGER_INSTRUCTIONS,
        output_type=ExecutiveBrief,
        tools=[
            project_gm.as_tool(
                tool_name="consult_project_gm",
                tool_description="Run a bounded project-level review for a named project.",
            ),
            product.as_tool(
                tool_name="consult_portfolio_product",
                tool_description="Compare product opportunities across the portfolio.",
            ),
            engineering.as_tool(
                tool_name="consult_portfolio_engineering",
                tool_description="Compare technical risks and sequencing across projects.",
            ),
            safety.as_tool(
                tool_name="consult_portfolio_safety",
                tool_description="Review cross-project safety, privacy, and approval risks.",
            ),
        ],
    )
    return manager


async def run_steward(request: StewardRequest, store: PortfolioStore | None = None) -> ExecutiveBrief:
    store = store or PortfolioStore()
    snapshot = store.snapshot()
    key = os.getenv("OPEN_STEWARD_OPENAI_API_KEY", "").strip()
    force_demo = request.force_demo or os.getenv("OPEN_STEWARD_DEMO_MODE", "").lower() == "true"
    if force_demo or not key or not AGENTS_AVAILABLE:
        return demo_brief(snapshot, request.prompt)

    os.environ["OPENAI_API_KEY"] = key
    model = os.getenv("OPEN_STEWARD_MODEL", "gpt-5-mini")
    manager = _build_agents(model)
    input_text = (
        f"Founder request:\n{request.prompt}\n\n"
        f"Optional project focus: {request.project or 'portfolio'}\n\n"
        "Verified portfolio snapshot follows. Treat absent measurements as unknown, not zero.\n"
        f"{json.dumps(snapshot, indent=2)}"
    )
    result = await Runner.run(manager, input_text, max_turns=10)
    brief = result.final_output
    if isinstance(brief, ExecutiveBrief):
        brief.mode = "live"
        return brief
    return ExecutiveBrief.model_validate(brief)


def demo_brief(snapshot: dict[str, Any], prompt: str) -> ExecutiveBrief:
    projects_by_id = {p["id"]: p for p in snapshot["projects"]}
    soulbody = projects_by_id["soulbody"]
    tiny = projects_by_id["tiny-tactics"]
    safe = projects_by_id["safetrace"]

    decisions = [DecisionPacket.model_validate(item) for item in snapshot["decisions"]]
    lowered = prompt.lower()
    if "art" in lowered or "avatar" in lowered:
        decisions = sorted(decisions, key=lambda d: "art" not in d.title.lower())
    elif "multiplayer" in lowered or "friends" in lowered:
        decisions = sorted(decisions, key=lambda d: "multiplayer" not in d.title.lower())

    return ExecutiveBrief(
        summary=(
            "SOULBODY is the only project in active validation and should receive the portfolio's "
            "attention until its first-session value is measured. Tiny Tactics and SafeTrace remain "
            "visible but should not compete for execution capacity this week."
        ),
        portfolio_health=[
            ProjectHealth(
                project="SOULBODY",
                health="watch",
                score=74,
                stage=soulbody["stage"],
                current_focus=soulbody["current_focus"],
                north_star=soulbody["north_star"]["metric"],
                evidence=soulbody["evidence"],
                risks=soulbody["risks"],
            ),
            ProjectHealth(
                project="Tiny Tactics",
                health="watch",
                score=48,
                stage=tiny["stage"],
                current_focus=tiny["current_focus"],
                north_star=tiny["north_star"]["metric"],
                evidence=tiny["evidence"],
                risks=tiny["risks"],
            ),
            ProjectHealth(
                project="SafeTrace",
                health="unknown",
                score=42,
                stage=safe["stage"],
                current_focus=safe["current_focus"],
                north_star=safe["north_star"]["metric"],
                evidence=safe["evidence"],
                risks=safe["risks"],
            ),
        ],
        decisions=decisions[:3],
        autonomous_actions=[
            "Draft the SOULBODY first-ten-minutes event taxonomy and test script.",
            "Prepare a five-person observational usability test with no facilitator assistance.",
            "Keep Tiny Tactics and SafeTrace in weekly watch status without starting new implementation.",
        ],
        risks=[
            "SOULBODY's perceived quality may be limited by prototype character art before core value is proven.",
            "No durable analytics currently verify activation, meaningful-session completion, or return usage.",
            "Agent autonomy must remain proposal-only until approval, audit, and connector evals are proven.",
        ],
        opportunities=[
            "Use SOULBODY as the first real managed-project case study for Open Steward.",
            "Publish portable manifests, policies, and MCP tools so other founders and agents can reuse the system.",
            "Turn the founder brief into a daily or weekly decision-focused operating ritual.",
        ],
        mode="demo",
    )
