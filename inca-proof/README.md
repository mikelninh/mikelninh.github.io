# INCA AI Operations Proof

A role-specific, synthetic work sample for INCA's **AI Operations Associate** role.

The point is not to recreate MARS. The point is to demonstrate the operating discipline needed around an AI-first claims system:

**specialised checks → clear case decision → human escalation → feedback → regression → release gate → scalable handoff**

## Why this architecture

INCA publicly describes MARS as an AI-first claims platform with 250+ specialised agents, supported by claims experts. The AI Operations role asks for hands-on pilot operation, Claude expertise, review queues, measurable quality, SOPs and systems that eventually run without the operator.

This proof mirrors those *operating concerns* without claiming access to INCA internals.

## What is measured

```text
Synthetic claims                     72
Development cases                    40
Frozen holdout A                     20
Fresh post-fix regression B          12

Workflow baseline v1 on holdout A    13/20
Guarded workflow v2 on holdout A     19/20
Known v2 failure                     H-A-011
Guarded workflow v3 on regression B  12/12
Unsafe external actions              0
Policy refs grounded                 100%
```

These are **developer-authored synthetic engineering evaluations**, not insurer data, independent validation or production performance.

## The useful failure

`H-A-011` contains a cross-document date contradiction.

- v1 misses it.
- v2 still misses it.
- The holdout failure is inspected and recorded.
- v3 adds a contradiction gate.
- Because v3 was written after seeing Holdout A, we do **not** present its score on Holdout A as fresh evidence.
- A new 12-case regression set is created to test the fix plus broad regressions.

That is the behaviour this proof is trying to demonstrate: **find failure → make it explicit → turn it into a test → never quietly rewrite history.**

## Claude benchmark

`src/run_claude_benchmark.py` runs two versioned prompts through Anthropic's Messages API and measures:

- route match
- JSON/schema validity
- grounding to supplied policy excerpts
- runtime/API errors
- latency and token usage

Run:

```bash
export ANTHROPIC_API_KEY=...
export ANTHROPIC_MODEL=...
python inca-proof/src/run_claude_benchmark.py
```

No Claude score is published in the repository until a real run succeeds.

## Run locally

```bash
python inca-proof/src/claims_eval.py
python -m unittest discover inca-proof/tests -v
```

## Reviewer paths

See [`docs/REVIEW_GUIDE.md`](docs/REVIEW_GUIDE.md).

## Public proof

https://mikelninh.github.io/inca/

## Boundary

This is an independent application work sample. It does not use INCA customer data, confidential workflows, proprietary prompts or MARS internals.
