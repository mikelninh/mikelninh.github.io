# INCA Proof — reviewer guide

This work sample is intentionally layered.

## 20 seconds — HR / Recruiting
1. Open `/inca/`.
2. Pick a claim.
3. Read **Decision → Why → Next step**.
4. The intended signal: Michael can make a high-stakes AI workflow understandable without hiding uncertainty.

## 90 seconds — Founder / Operations
1. Read the measured-evidence section.
2. Inspect the known failure.
3. Follow the loop: edge case → reason code → regression → release gate → SOP/handoff.
4. The intended signal: the operator improves the system, not merely the individual claim.

## 5 minutes — Engineering
1. Inspect `data/claims.json` and `data/synthetic_policy_pack.json`.
2. Run `python inca-proof/src/claims_eval.py`.
3. Run `python -m unittest discover inca-proof/tests -v`.
4. Inspect `reports/deterministic_eval.json`.
5. Inspect `src/run_claude_benchmark.py` and the two versioned prompts.

## Evidence boundaries
- All claim and policy data is developer-authored and synthetic.
- The deterministic evaluation is measured locally on the checked-in fixtures.
- Holdout A: v1 = 13/20; v2 = 19/20.
- The single v2 failure is intentionally visible.
- v3 was written after inspecting that failure, so its Holdout-A score is not fresh evidence.
- A fresh post-fix regression set B has 12 cases; v3 = 12/12.
- The Claude harness is implemented, but no model score is published until a real Anthropic API run succeeds.
- No customer communication, payment or other external action is executed by this proof.
