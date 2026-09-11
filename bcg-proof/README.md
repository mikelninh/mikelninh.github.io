# BCG Platinion — Agentic Software Factory Work Sample

Independent application work sample by Michael Ninh for the **AI Associate (all genders)** role.

## What this demonstrates

The role asks for coding-agent governance across the SDLC: business intent → precise specs → bounded agent execution → evaluation → CI/CD → release governance.

This proof makes that loop concrete with one synthetic scenario:

```text
business intent
   ↓
spec contract + acceptance criteria
   ↓
bounded coding-agent loop
   ↓
scoped tools / MCP-style capability boundary
   ↓
tests + evals + trace
   ↓
CI release gate
   ↓
human release authority
```

Two deterministic cases are included:

1. `ASF-2026-014` — all required gates pass → `READY_FOR_HUMAN_RELEASE`
2. `ASF-2026-015` — the agent weakens a protected payment-approval boundary → security + CI fail → `BLOCKED`

The point is not the toy feature. The point is the **control plane around agentic delivery**.

## Run the proof

```bash
python bcg-proof/evaluate.py
```

The evaluator reads `scenarios.json`, applies a deterministic release rule and regenerates `report.json`.

## Claim discipline

- Synthetic scenario only.
- No BCG proprietary information or internal architecture is used.
- This is not enterprise-scale production validation.
- The evidence is scoped to the release-gate behaviour represented in this repository.

## Related implementation

The deeper implementation pattern is visible in **Agent Review Console**:

- explicit specs and acceptance criteria
- bounded agent autonomy
- evidence + trace
- degraded paths
- human review
- regression-oriented verification
- CI/release gates

Repo: https://github.com/mikelninh/agent-review-console

Public work sample: https://mikelninh.github.io/bcg/
