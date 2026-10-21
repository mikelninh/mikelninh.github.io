# INCA paired Jev × GPT Benchmark v2

**Goal:** compare Jev and GPT-4o mini on **the same binary question** using 40 fictional cancellation document pairs. The gold label means only *requires attention* (yes/no), NOT insurance eligibility, payout, or whether the correct downstream branch is `NEED_INFO` vs `HUMAN_REVIEW`.

## Dataset and limitations

- `paired_cases_v2.json`: 40 developer-authored fictional records, ten families × four variations, 20 tagged `dev` and 20 `holdout`; 20 positives and 20 negatives. Two cases per family per split.
- Families cover date disagreement, correct matching dates, missing confirmation, booking date decoys, ambiguous status, document prompt injections, historical date decoys, uncertain dates, benign customer requests, and unrelated dates.
- **Holdout is not independently constructed or blind:** all cases are developer-authored using common templates. It cannot substantiate deployment accuracy. Avoid adjusting the threshold based on holdout results.
- Jev outputs a continuous attention score at a **fixed, exploratory 0.5 threshold**. GPT returns a strictly structured boolean for the same attention task. Scores are not calibrated across models.
- Neither model proves quotation fidelity or exact date extraction in this experiment. Compare those separately, never present it as an extraction-equivalence test.

## Safe local commands (no API fees)

```bash
python -m unittest discover inca-proof/model-eval -p 'test_*.py' -v
python inca-proof/model-eval/paired_benchmark.py --mode dry-run --split dev --limit 5
```

**GitHub UI:** Actions → INCA Synthetic Model Eval → Run workflow → `run_mode=paired-dry-run`, `paired_split=dev`, `paired_cases=5`. This does **zero** API calls. No live workflow is scheduled by pushes.

## Paid, optional and bounded

Choose `run_mode=paired-live`, `paired_split=dev`, `paired_cases=5` after reviewing the dry-run. This makes up to **10 requests**, five to each API. The maximum is **40 requests in one run** for 20 cases, and only when intentionally selected. Keys are read exclusively from `TYPESAFE_API_KEY` and `OPENAI_API_KEY` repository secrets; don't paste them in chat.

Run a paired 20-case holdout once after choosing the question and fixed decision threshold; don't keep adjusting based on it. Reports are artifacts, **never automatically published to the portfolio**. Each case stores only identifier, family, authored binary label, numeric/binary results, model IDs, latency, token counts and *reported* cost (null if provider did not provide it). API errors are recorded as unscored, not treated as correct.

## What we measure

Primary safety metric: **false negatives (critical missed attention)**, with the complete case IDs. Secondary: **unnecessary reviews** (false positives), accuracy-independent API failure rate, mean/median wall-clock API latency, token usage, and provider-reported costs where available. Never treat a provider's missing billable cost as zero.

**Next release gate:** review samples with domain experts; create independently labelled blinded examples, realistic OCR/multilingual and adversarial samples, and evaluate route separation and source grounding as separate tasks. This demo is only a controlled developer study.
