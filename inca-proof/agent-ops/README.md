# INCA Agent Ops 1.1 — Exception Control Tower

**Live demo:** https://mikelninh.github.io/inca/agent-ops.html

This independent, fictional work sample is for INCA AI Operations. It is **not** the RETURN LOOP project for SNOCKS and does not recreate INCA's proprietary MARS system.

## What actually runs

The server-side Python script `agent_ops.py` executes **seven observable steps** for each of six fictional claims:

1. Intake agent calls `read_source(A)`
2. Intake agent calls `read_source(B)`
3. Evidence agent calls `extract_field(A)`, recording a source reference, source SHA-256 and exact excerpt
4. Evidence agent calls `extract_field(B)`
5. Verification agent calls `compare_facts()` with a mandatory independent injection guard
6. Handoff agent calls `draft_handoff()`, producing a strictly **unsent** recommendation
7. Safety supervisor records the bounded route, stops at the required gate, and confirms that no coverage, payout or communication occurred

These are **actual local Python function/tool executions**, not just decorative cards. In the default mode a *scripted planner* picks the sequence. No external LLM is called. Roles are logical responsibilities in one controlled process, not independent swarms or six running LLMs.

Unknown tools, unexpected arguments, wrong ordering, missing sources, invalid plans and failures must not produce a safe continuation. A production solution would also require independent document verification, access controls, signed audit logs, independent expert review and case system integration.

## How to run it yourself

From the repository root:

```bash
python -m unittest discover inca-proof/agent-ops -p 'test_*.py' -v
python inca-proof/agent-ops/agent_ops.py --planner offline --out inca/agent-ops-traces.json
node --test inca/agent-ops-ui.test.cjs
```

The GitHub Pages deployment regenerates `inca/agent-ops-traces.json` on **every release build** from this Python runner, then checks that the browser can replay the published trace. The website is a read-only player, not an agent execution backend.

### Optional, model-driven tool planning

The planner boundary is swappable. An **explicitly opt-in** OpenAI adapter is included, restricted to one fictional case and **one potentially billable API call**:

```bash
# Requires a pre-configured local OPENAI_API_KEY; never paste secrets in chat.
python inca-proof/agent-ops/agent_ops.py --planner openai --case TR-101 --out /tmp/inca-opt-in-run.json
```

**This paid command has not been executed as part of 1.1.** The optional adapter requests a strict six-call plan and the runtime independently rejects disallowed, missing or reordered tools. The planner has no authority to write to a claim system, send emails or approve payments. This proves a constrained *planner integration contract*, not autonomous insurance competence. Any other model provider can implement the same small planner interface.

## Case diversity

Six developer-authored examples across five claim lines:

- Travel cancellation: contradictory dates (`TR-101`)
- Water damage: missing photos (`HM-202`)
- Bicycle theft: matching frame identifiers (`TH-303`)
- Liability: contested responsibility (`LI-404`)
- Electronics: invoice total mismatch (`EL-505`)
- Travel cancellation: malicious embedded prompt-injection instruction (`TR-606`)

These are **scenario/engineering QA cases**, not independent model benchmark runs. The original Jev-vs-GPT-4o mini benchmark on 20 development-set fictional *travel cancellation* cases is a separate experiment. Guard-after-failure results are retrospective, not a clean holdout.

## Operational learning loop

A visitor can download a case's recorded trace and simulate a reviewer correction as a **regression candidate**. This is not a production review or automatic deployment. The complete real-world loop is: verified expert feedback → independent approved label → integration test → reviewed release gate → shadow pilot → ongoing drift and correction monitoring.

## Explicit release limits

- **0 provider calls and 0 model API fees** for offline production and Pages build.
- **0 external actions**: no insurer data, claim updates, payments or customer communications.
- **No true live multi-agent inference** in the published static page. The optional LLM planning path is untested live and intentionally out of the published scoring.
- Not a claim eligibility, policy coverage, OCR/PDF, fraud classification, legal or financial decision engine.
- The audit trace is developer-authored scenario data stored in a public site, not a tamper-evident customer audit ledger.

**Release gate:** Python regression tests, real offline Python trace generation, client snapshot contract tests and deployed Pages smoke checks must all pass.
