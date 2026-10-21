# INCA AI Operations Proof

**Release 1.0 work sample:** https://mikelninh.github.io/inca/release.html

**Reviewer guide:** [Six fictional claims, transparent checks, recorded model failures and a replayed safety guard](docs/RELEASE_GUIDE_1_0.md).

This is independent of the SNOCKS RETURN LOOP project. Our INCA architecture and evaluation are **LLM-provider-agnostic**: choose and validate the model for each task rather than relying on one vendor.


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

## Try the interactive evidence-to-handoff case

[Open the 60-second case workshop](https://mikelninh.github.io/inca/60s.html#case-workshop).

This new synthetic scenario **ST-104** is a separate, editable exercise inspired by the cross-document contradiction failure, **not** one of the measured H-A-011 test records. The visitor can change two document texts, recompute the next step and download a real Markdown handoff containing source excerpts, the reason for review, operator notes and the recommended next action. The result also includes an **unsent customer-communication draft**. A reviewer can correct the suggested route and download a **machine-readable regression-fixture candidate** for human validation and later test integration. Inputs stay local in the browser.

The workshop uses simple deterministic date extraction and validation—**no live LLM, PDF reading, insurer integration, communication or payout**. It only clears the date-consistency gate when both sources agree; it does not clear the whole claim. Automated checks cover conflicting, matching, missing, invalid and injection-like inputs, as well as customer-draft and reviewer-feedback artifacts. Generating a fixture does not automatically update CI.

## Public proof

https://mikelninh.github.io/inca/

## Boundary

This is an independent application work sample. It does not use INCA customer data, confidential workflows, proprietary prompts or MARS internals.


## Interactive operator replay

[Try the operator lab](https://mikelninh.github.io/inca/#operator-lab): compare developer-authored synthetic holdout cases H-A-011 (known contradiction miss) and H-A-012 (control). The recorded guarded-v2 outcome and a proposed contradiction-gate route are displayed separately. The holdout has already been inspected, so the replay is **not fresh independent evidence**. No external effect is performed. A separate, two-case local test is available; it is not the original 12/12 fresh regression B.

Run: node --test inca/operator-lab.test.cjs

## Measured multi-model document-text evaluation

[`model-eval/`](model-eval/) includes **100 developer-authored synthetic document-text fixtures** across ten scenario families. Unlike the original deterministic routing test, this pipeline sends unstructured document text to real OpenAI models and then applies deterministic routing to their extracted findings.

The **first completed live pilot** used five selected synthetic cases per model: `gpt-4o-mini`, `gpt-6-luna`, and `gpt-6.1-sol` each produced **5/5 expected next-step routes** with no API or schema errors. Estimated total API token cost was **$0.0161**. Some models flagged additional ambiguity; current routing accuracy alone does not capture those false positives. Five developer-authored cases do **not** demonstrate production reliability or establish a model winner.

- [Measured run, costs, caveats and cases](model-eval/reports/RESULTS_2026-10-20.md)
- [Reproducible evaluation setup](model-eval/README.md)
- [GitHub Actions execution](https://github.com/mikelninh/mikelninh.github.io/actions/runs/39431536440)

