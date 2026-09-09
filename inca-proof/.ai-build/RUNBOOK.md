# RUNBOOK

## Deterministic proof
`python inca-proof/src/claims_eval.py`

Expected summary:
- v1 13/20
- v2 19/20
- known v2 failure H-A-011
- v3 regression B 12/12

## Tests
`python -m unittest discover inca-proof/tests -v`

## Claude
Set `ANTHROPIC_API_KEY` and `ANTHROPIC_MODEL`, then:
`python inca-proof/src/run_claude_benchmark.py`

Do not copy a Claude result into public application material unless the report says `MEASURED`.
