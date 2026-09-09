# ARCHITECTURE

Static public application page (`/inca/`) + inspectable engineering proof (`/inca-proof/`).

Data:
- `data/claims.json`: 72 synthetic cases with explicit split labels.
- `data/synthetic_policy_pack.json`: synthetic evidence refs.

Evaluation:
- `route_v1`: deliberately incomplete baseline.
- `route_v2`: guarded workflow; evaluated once on frozen holdout A.
- `route_v3`: post-inspection fix for cross-document contradictions.
- `regression_b`: fresh post-fix regression set.

Model layer:
- versioned prompts
- Anthropic Messages API harness
- results only published after real execution

Authority:
- model/router proposes next route
- public proof performs no customer communication, payment or external write
