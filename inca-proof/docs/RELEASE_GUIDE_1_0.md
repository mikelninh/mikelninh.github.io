# INCA Release 1.0 — reviewer guide

**One link to share:** https://mikelninh.github.io/inca/release.html

This is a **standalone, independent AI Operations Associate work sample**. Not RETURN LOOP (the separate SNOCKS project). Nothing in the demo uses an insurer connection, proprietary INCA code, customer data, payment authorization or live production traffic.

## What to do in 60–90 seconds

1. Open the release link and click one of six fictional cases, across **five claim types**: travel cancellation (including prompt injection), water damage, bicycle theft, liability dispute and electronics repair.
2. Compare two editable source snippets and click **Check the evidence**.
3. Read the bounded route (human review / request information / continue remaining checks), reason code, parsed evidence and next step.
4. Download an **unsent local handoff**. Optionally propose a correction and download a regression-case candidate; candidates are NOT automatically integrated into CI.

**What is live:** a browser-local transparent evidence checker. It is not a real-time LLM, a PDF parser, or comprehensive claim adjudication. Manipulative document instructions trigger an extra fail-closed review route.

## The engineering story

A developer-authored synthetic holdout example **H-A-011** exposed a known cross-document contradiction missed by a previous structured-data routing rule. The later ST-104 text workshop *reconstructs* that mechanism; these are not identical original case records.

In a separate real API experiment using fictional **travel-cancellation** pairs, Jev and GPT-4o mini were compared on the *same narrow binary attention question*. Recorded developer-set run: https://github.com/mikelninh/mikelninh.github.io/actions/runs/39633113245

| Measured/retrospective metric (20 dev cases) | Jev | GPT-4o mini |
|---|---:|---:|
| **Raw live model decisions** | 17/20 | 16/20 |
| Raw missed attention cases | 0 | 2 |
| Raw unnecessary reviews | 3 | 2 |
| **With new deterministic injection guard (offline replay)** | **17/20** | **18/20** |
| Guarded missed attention cases | 0 | 0 |
| Guarded unnecessary reviews | 3 | 2 |

The GPT missed cases PB-021 and PB-023 explicitly tried to steer an AI via untrusted document text. The new independent safety guard flags those developer cases even when the GPT response misses them. Developer-labelled benign instructions remain non-flags. This is retrospective on *inspected development cases*, not a valid independent improvement estimate.

See `inca/guard-evidence.json` for provenance and machine-readable aggregate. The reported model-only results must remain visible and unaltered; guard-assisted decisions are displayed separately.

## What was tested for this release

- `node --test inca/release-engine.test.cjs` — six claim cases, document editing, safe routes, attack attempts, normal customer wording, no external actions, and the release page's visible boundaries.
- `python -m unittest discover inca-proof/model-eval -p 'test_*.py' -v` — model evaluation, original bounded Jev integration, guarded binary routing, two previously missed cases, negative controls, safe offline replay.
- `python inca-proof/model-eval/paired_benchmark.py --mode dry-run --split dev --limit 5` — zero external calls, zero model quality results.
- The GitHub **INCA proof checks** workflow runs the Node + Python regressions on PR/push. CI passing proves test logic ran; it does not prove deployment-level insurance performance.

The **untouched 20-case `holdout` split** from the paired dataset remains available for a later explicit model run, but its labels share developer-authored templates with dev and were not independent. Never tune guard patterns based on its outcomes and then advertise the same set as blind.

## What remains before a real insurer pilot

- An actual insurer-specific SOP and legal/policy review, authentic evidence handling and routing ownership.
- Independently expert-labelled multi-claim documents, realistic PDFs, OCR, multilingual edge cases, protected personal data and an independently sampled blind holdout.
- Human-approved case management integration and audit, latency plus review time, cost invoicing, regression release gates, reliable escalation and monitoring.
- A measured error-rate ceiling and review queue capacity before any assisted automation is deployed.
- The model is **replaceable**: choose the provider by task quality, evidence grounding, failure behavior, price, latency and governance, not loyalty to a specific brand.

## Where to inspect deeper

- [Compact release](https://mikelninh.github.io/inca/release.html)
- [Full interactive Operator Shift](https://mikelninh.github.io/inca/operator-shift.html)
- [Recorded Model Lab](https://mikelninh.github.io/inca/model-lab.html)
- [Code and tests](https://github.com/mikelninh/mikelninh.github.io/tree/main/inca-proof)
- [Recorded benchmark run](https://github.com/mikelninh/mikelninh.github.io/actions/runs/39633113245)
