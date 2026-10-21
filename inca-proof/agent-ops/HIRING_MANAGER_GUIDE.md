# INCA · Hiring-manager-first work sample

**Send this one link:** https://mikelninh.github.io/inca/agent-ops.html

## The 60-second story

**Problem:** A claim may contain conflicting, incomplete or misleading source evidence.

**Solution:** A small, inspectable workflow checks the evidence, recommends a safe next step, and prepares a traceable handoff rather than quietly approving the claim.

**Learning:** A real, bounded Jev-vs-GPT test on fictional travel cancellation cases revealed two GPT misses caused by instructions embedded in documents. We added an independent safety check, tested it on those known examples, and kept the distinction between model-only and post-fix accuracy honest.

**Why it fits an AI Operations role:** Operating and improving AI workflows, not just prompting an LLM: understand the work, design the human handoff, instrument errors, and make next runs safer.

### Reviewer routes

- **20 seconds:** Read the hero and default travel-cancellation contradiction.
- **60–90 seconds:** Click **See what happens next**, try water damage and bicycle theft, and read the three lessons.
- **Engineering deep dive (optional):** [Python tool trace](https://mikelninh.github.io/inca/agent-ops-technical.html) · [code](https://github.com/mikelninh/mikelninh.github.io/tree/main/inca-proof/agent-ops) · [20-case Jev/GPT dev experiment](https://github.com/mikelninh/mikelninh.github.io/actions/runs/39633113245).

The first page intentionally avoids a seven-step timeline, latency charts, token counts and model-leaderboard language.

## What the current public demo does and does not do

The public website uses **a recorded Python tool workflow with a scripted offline planner**. The actual functions read two fictional text sources, extract labelled fields with source quotations, compare facts, enforce independent safety rules and propose an unsent handoff. It does **not** execute LLM inference when a visitor clicks, nor does it make any claim decision, authorize payments, send email or access insurer systems.

The historical benchmark used *real* LLM API calls, but only on self-authored fictional travel cases. Those numbers must never be described as production claims performance.

## Agent Ops 1.2: a genuine model-driven experiment, separately gated

`agent-ops/model_trial.py` adds an **opt-in** real LLM evidence worker: the model chooses one specialist check appropriate to the selected fictional case and extracts literal labelled source quotes and field values. An independent Python validator rejects invented quotations, wrong tools, missed labelled fields or mismatching values. Only verified facts reach the deterministic routing gate and the independent document-injection protection.

This is a narrow tool-selection and evidence-extraction experiment, **not free-form multi-agent autonomy**. The possible specialist tools are selected from a known whitelist. The experiment is provider-swappable; `gpt-4o-mini` is the initial adapter.

### Reproduce free tests

```bash
python -m unittest discover inca-proof/agent-ops -p 'test_*.py' -v
python inca-proof/agent-ops/model_trial.py --mode dry-run --case TR-101
python inca-proof/agent-ops/agent_ops.py --planner offline --out inca/agent-ops-traces.json
node --test inca/agent-ops-simple.test.cjs
node --test inca/agent-ops-ui.test.cjs
```

### Explicitly opt in to one paid model call

GitHub **Actions → INCA Agent Ops 1.2 Model Trial → Run workflow**. Select `run_mode=live` and one fictional case. The workflow uses the already-configured GitHub `OPENAI_API_KEY` secret, makes **at most one model request**, writes a JSON artifact for inspection, and never changes the public site or any real claims. Default `dry-run` makes zero requests. Actual provider billing cost is not currently reported; do not treat this as free.

Evaluate: did the model choose the right specialist tool, quote the input faithfully and avoid critical routing errors? Compare with the deterministic baseline on *independently authored, blind* examples before claiming improvement. Passing scripted tests or quoting a labelled date is not meaningful insurer-wide proof.

### Release gates

- All offline Python and Node regression checks pass.
- Browser refuses malformed/suspicious recorded outcomes.
- GitHub Pages rebuilds the real Python tool trace and serves it to the public site.
- Recorded model experiments remain separate private artifacts; no fabricated LLM-in-browser claims.

**What remains unbuilt:** insurer SOP integrations, genuine OCR/PDF and multilingual document handling, production human approval, case management writes, independent expert labels, shadow pilots, live evaluation, and audited release monitoring.
