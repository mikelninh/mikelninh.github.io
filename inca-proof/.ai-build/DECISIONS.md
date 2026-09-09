# DECISIONS

## D1 — Do not mimic MARS internals
Public INCA information informs the operating shape only. No proprietary architecture is inferred or represented as fact.

## D2 — Decision-first UI
Recruiters see Decision / Why / Next step before engineering details.

## D3 — Preserve the failure
The v2 holdout miss is kept visible. A post-fix score on the already-inspected holdout is not promoted as fresh evidence.

## D4 — No fake Claude benchmark
The harness writes `NOT_RUN` unless a real Anthropic call completes.

## D5 — Synthetic policy grounding
Policy excerpts are intentionally synthetic to prove the grounding mechanism without pretending domain/legal authority.
