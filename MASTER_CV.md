# Michael Ninh — Master CV source

This is the canonical claim-safe source for Michael's general CV and future targeted variants. Read `POSITIONING.md` first.

## Target positioning

**AI Engineer · Agentic Systems · AI Operations**

> I build reliable AI systems that turn messy real-world workflows into tested, observable software.

Transparent implementation note:

> Coding agents do much of the implementation. I design the system, architecture, autonomy boundaries, evals and evidence that make the result trustworthy.

Professional thesis:

> I design agentic software-development systems with explicit specifications, autonomy boundaries, evals, verification gates and production monitoring.

Do not inflate this into seniority, production scale or domain authority that the evidence does not support.

## Profile

Berlin-based AI engineer with founder, product and operations experience. Builds bounded AI workflows and evidence-first systems where inputs, permissions, tests, uncertainty, human authority and failure modes remain inspectable. Strongest fit: early-career AI engineering, agentic systems, AI operations, automation, applied AI and intelligence/data workflows.

## Core capabilities

### Agentic systems
- problem framing and architecture
- explicit specs and acceptance criteria
- agent/tool autonomy boundaries
- deterministic policy gates outside the model
- human-in-the-loop / human release gates
- evals, regression cases and CI verification
- evidence receipts, traces and monitoring contracts

### Applied AI
- LLM applications
- agents and tool use
- RAG / hybrid retrieval
- MCP
- structured outputs
- evaluation and failure testing
- human review workflows

### Engineering
- Python
- FastAPI
- REST APIs
- SQL / PostgreSQL
- TypeScript / React
- JavaScript / Node.js
- Git / GitHub Actions / CI

### Product & operations
- problem framing
- workflow design
- rapid prototyping
- user research
- process improvement
- founder-led operations

### Languages
- German C2
- English C1
- Vietnamese B1

## Selected proof bank

### TrustReady — evidence-first trust layer for AI systems
**Use for:** agentic systems, AI operations, sensitive workflows, governance-by-design, human authority.

- Connects claims/requests to identity, policy and evidence.
- Enforces deterministic boundaries outside the LLM and returns `allow / deny / unknown`-style evidence-backed states.
- Keeps irreversible legal-demo actions disabled; public demos are synthetic only.
- Uses an explicit promotion path: synthetic demo → production-shaped pilot → qualified reviews → shadow pilot → measured success → narrowly typed human-approved release.
- Production-shaped legal portal contract covers identity/session boundaries, upload capabilities, quarantine, content hashes and database RLS, while clearly separating architecture from observed production claims.
- Pilot success is defined before the pilot: 5 real workdays, at least 20 real work items, target ≥30 minutes net time saved/day, fewer calls/emails, zero unauthorised external actions, team chooses to continue.

**Boundary:** engineering assurance layer, not certification, legal advice or proof of production readiness.

Links:
- Demo: https://mikelninh.github.io/trustready/legal/
- Code: https://github.com/mikelninh/trustready

### SafeTrace Entity Resolution — calibrated evidence-first identity resolution
**Use for:** intelligence, investigations, entity resolution, evaluation discipline, uncertainty handling.

- Tri-state decision contract: `merge / separate / review` rather than forced yes/no matching.
- Fresh frozen developer-authored holdout-v2: 40 deliberately messy entity pairs.
- Automatic decisions: 34/40; routed to human review: 6/40.
- False automatic merges: 0; false automatic separations: 0 on that frozen set.
- Auto-merge precision: 1.0000; merge recall counting review as not auto-merged: 0.8947; F1: 0.9444; automatic-decision coverage: 0.8500.
- Explicit evaluation guardrail: after inspecting holdout-v2, further tuning requires a new frozen holdout-v3 before claiming a new unseen score.

**Boundary:** developer-authored benchmark, not independent external validation or production analyst performance.

Links:
- Interactive investigation proof: https://mikelninh.github.io/digital-democracy-studio/safetrace/venatic_application/
- Entity-resolution proof: https://github.com/mikelninh/digital-democracy-studio/tree/main/zero-suffering-intelligence/entity-resolution

### DRV SignalLab — trustworthy public-sector monitoring proof
**Use for:** data/AI, public sector, monitoring, responsible AI, statistical reasoning.

- Turns 50,000 deterministic synthetic administrative cases into an inspectable monitoring brief.
- Pipeline: data → quality → drift → signal → uncertainty → explanation → human review.
- Computes threshold evidence, approximate 95% confidence intervals, Cohen's d, PSI and missingness drift deterministically in Python.
- Golden cases are regression-tested; presentation values are checked against the analytics engine.
- Explicitly refuses causal, discrimination or individual benefit/enforcement conclusions from monitoring signals.

**Boundary:** synthetic independent work sample; no real DRV data, schema, thresholds or automated administrative decisions.

Links:
- Review guide: https://github.com/mikelninh/drv-signallab/blob/main/docs/REVIEW_GUIDE.md
- Code: https://github.com/mikelninh/drv-signallab

### Digital Worker Factory — bounded operational AI workflows
**Use for:** AI agents, automation, AI operations, platform/runtime roles.

- Shared `AgentGateway`, capability registry, evidence requirements, role/policy gates and human approval for consequential writes.
- Fail-closed public HausPilot flow: remove required evidence and the worker stops instead of guessing or claiming completion.
- Earned-autonomy ladder: SHADOW → COPILOT → HUMAN RELEASE → LIMITED AUTO → TRUSTED.
- Published 100-case synthetic release run completed without runtime errors, unsafe executions or false execution claims.
- Production-boundary tests cover tenant context, approval/trust-chain mismatches, secret redaction, duplicate execution and durable reference adapters.

**Boundary:** synthetic engineering evaluation; pilot-ready engineering candidate, not production-validated autonomous worker.

Links:
- Demo: https://mikelninh.github.io/agents/
- Code: https://github.com/mikelninh/digital-worker-factory

## Supporting proof bank

### PrüfPilot
Document workflow proof: PDF/document intake → structured evidence → rule checks → correction/approval/release path with explicit human authority. Use for document AI, public administration and review workflows.

### GitLaw
German-law retrieval proof with source traceability, hybrid retrieval, APIs/MCP and regression-oriented evaluation. Use for RAG, retrieval, MCP and legal-tech roles.

### MissionOps
Mission/NGO operations proof. Use for role-specific applications where operational prioritisation, mission delivery or human-centred AI is relevant.

### CasePilot
Observable agent-workflow proof. Use for agent reliability, traces, workflow state and context-graph roles.

## Experience

### RYUS UG — Founder & E-Commerce Manager
**2018–2025**
Built and ran an Amazon business end to end across sourcing, logistics, listings, fulfilment and customer operations.

### Transit Restaurants — Service & Operations Manager
**2021–2024**
Coordinated 8+ staff and high-volume daily service, resolving operational bottlenecks under real-time pressure.

### everphone GmbH — Product / Business Development
**2019–2020**
Worked across marketplaces, website, B2B partners and acquisition channels, using customer feedback to improve positioning and priorities.

## Education

### Masterschool — AI & Software Engineering
**Oct 2025 – Jun 2026 · 1,600h**

### TU Berlin — M.Sc. Biomedical Engineering

### TU Berlin — B.Sc. Mechanical Engineering

## General CV selection rule

The general CV should prove the professional thesis with **four projects maximum**:

1. TrustReady
2. SafeTrace Entity Resolution
3. DRV SignalLab
4. Digital Worker Factory

For targeted CVs, replace the fourth project first. Do not add more projects merely to show breadth.

## Claim discipline

- Say `synthetic` whenever the evidence is synthetic.
- Never call a developer-authored benchmark independent validation.
- Never convert a pilot target into a measured outcome.
- Never claim production deployment where only production-shaped architecture exists.
- Prefer `review`, `unknown`, `not released` and explicit human authority over fake certainty.
- Prefer concrete evidence over adjectives.
