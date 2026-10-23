# One-time real OpenAI A/B benchmark · 2026-10-23

This change explicitly requests a bounded **live** run of the INCA Model Improvement Loop.

- Forty billed Chat Completions requests, model: gpt-4o-mini
- Twenty developer-authored fictional cases (ten development + ten held-out), baseline and revised workflow
- Save actual structured extraction output, discrepancy analysis, routing, latency, usage and estimated USD cost
- Do not use real claim data, perform payments or send customer messages
- Publish only if all forty structured API responses complete
- Do not automatically retry, tune prompts on holdout, or call another model after a failed run

Requested by the user: ship the real end-to-end experiment.
