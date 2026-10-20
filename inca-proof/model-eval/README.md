# INCA — Multi-model Document Evaluation (synthetic)

## First completed real API comparison — 2026-10-20

**[Measured results, token-cost estimate, and limitations](reports/RESULTS_2026-10-20.md)** · [GitHub Actions evidence](https://github.com/mikelninh/mikelninh.github.io/actions/runs/39431536440)

Five developer-authored synthetic document-text cases were run against `gpt-4o-mini`, `gpt-6-luna`, and `gpt-6.1-sol`: all three returned 5/5 matching next routes and zero API/schema errors. Combined token cost estimated at $0.0161. **This is a tiny non-independent pilot and not an insurance production benchmark.** Model extra-ambiguity flags differed, so don't infer one model is generally best.


A **runnable model-evaluation prototype**, separate from the existing deterministic `inca-proof/src/claims_eval.py` evaluation. This is an independent application work sample, **not an INCA integration**.

## Why this exists

The earlier 72-case suite receives already-structured facts such as `contradiction: true`. It tests operational routing and regression discipline, **not whether an LLM notices contradictions in documents**.

This new fixture set provides **100 developer-authored synthetic document-text cases** across ten families: cancellation-date conflicts and controls, amount conflicts and controls, missing evidence, liability dispute, sensitive interactions, document prompt-injection, coverage concerns and ambiguous dates. Every family has 10 variants: 6 development, 2 holdout and 2 stress examples. The entire set is public and developer-authored — *not* independent real-world validation or a secret blind benchmark. Similarities between variants limit statistical inference.

## Architecture

```text
synthetic untrusted document TEXTS
      ↓
OpenAI model (same prompt + strict structured JSON schema)
      ↓
validated extracted facts + evidence document IDs
      ↓
model-independent deterministic routing / fail-closed guard
      ↓
AUTO_READY | HUMAN_REVIEW | NEED_INFO
      ↓
metric report: false-auto, route accuracy, evidence references, flag recall, errors, tokens/latency
```

**Important:** These are synthetic text documents, not real PDFs, OCR, real policy contracts or production claims. A model's `evidence_refs` are checked for existing document IDs; they do not establish that an explanation is factually correct. The route is the **next handling step**, never a payout or coverage decision. No payment, customer communication, or other external customer action is possible.

## Run

```bash
# From the repository root. No API key and no cost for these commands:
python inca-proof/model-eval/generate_cases.py
python -m unittest discover inca-proof/model-eval -p 'test_*.py' -v
python inca-proof/model-eval/run_openai.py --dry-run --models gpt-4o-mini,gpt-4.1-mini,gpt-4.1 --limit 5

# Configure OPENAI_API_KEY securely in your own environment (never commit it).
# First run: only 5 cases per model = 15 billed requests.
python inca-proof/model-eval/run_openai.py --models gpt-4o-mini,gpt-4.1-mini,gpt-4.1 --limit 5

# Then optionally evaluate all 20 holdout cases per model = 60 requests.
python inca-proof/model-eval/run_openai.py --models gpt-4o-mini,gpt-4.1-mini,gpt-4.1 --split holdout --limit 20
```

Models are CLI arguments because model access changes over time. You need **one** suitably permissioned OpenAI project key, not a separate key per model. This harness uses the OpenAI **Chat Completions API** with strict JSON-schema Structured Outputs; choose models that support that API and schema. Unsupported models are recorded as failed calls, **not** silently counted as successful. API calls cost money. By default, the runner makes only 5 calls per model. `--dry-run` makes zero calls.

The real results are written locally into `reports/model_eval_*.json`. The code never publishes benchmark scores automatically. Nothing here demonstrates production reliability until real model runs, review by insurance professionals, robust untemplated cases, and controlled pilots exist. External documents must never be sent to a model without consent and appropriate data handling agreements.

## Scoring philosophy

Primary: **unsafe AUTO_READY** (would the workflow falsely let a case through?). Secondary: route match, unnecessary escalations, important-flag recall, matching known facts, valid references, schema/API errors, token usage, latency. A request failure is an evaluation failure; the gate would fail closed to human review. Measurements from 100 developer-authored fixtures are engineering signals only, not statistical claims about insurers.

## What still remains

- Real API run with valid credentials, then inspect individual errors and report model IDs/versions.
- Add untampered, realistic PDFs and source-level provenance verification.
- Have claims specialists label and independently review a distinct blind test set.
- Measure robustness to multilingual variations, duplicates, OCR errors, conflicting insurance terms and prompt injection.
- Define production thresholds and regression approvals with INCA's domain experts.
## Run directly from GitHub (no local Python required)

A **manual-only** GitHub Actions workflow is available at [INCA Synthetic Model Eval](../../.github/workflows/inca-model-eval.yml).

1. Repository → **Settings → Secrets and variables → Actions → New repository secret**.
2. Add one project-scoped secret named `OPENAI_API_KEY`; do not paste the key in issues, commits, logs or chat.
3. Repository → **Actions → INCA Synthetic Model Eval → Run workflow**.
4. Start with `dry-run` (free). For real model calls select `live` and `cases_per_model=5`. The workflow caps this at **3 models × 5 cases = 15 billable calls**, runs pipeline tests first and uploads the resulting synthetic aggregate JSON report to the workflow artifacts. Only manual runs are configured.

This does not publish any model results to the live INCA application. If the API key is absent, live mode fails before making requests. The repository is public; GitHub Actions logs are visible to visitors, but the code does not print the secret. The reports contain aggregate synthetic evaluation data only. Review actual API usage/billing in your OpenAI Platform account.
