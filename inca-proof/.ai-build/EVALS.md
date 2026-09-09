# EVALS

Primary route metric: exact match to developer-authored gold route.

Secondary invariants:
- supplied policy refs resolve
- no external action
- JSON/schema validity for model benchmark
- model evidence refs limited to supplied policy excerpts

Evidence sets:
- `dev`: iteration only
- `holdout_a`: frozen before v2 evaluation
- `regression_b`: fresh post-fix regression set after H-A-011 was inspected
