# INCA Model Lab — Cost × Quality v1

**Live page:** https://mikelninh.github.io/inca/model-lab.html

## What this release actually does

1. Replays the **8 real OpenAI API responses** recorded in `inca/ai-evidence.json` on eight **developer-authored fictional** text cases. Eight next-route labels matched the author's expectations, no unsafe continuation was observed within that tiny set. Quoted excerpts were validated by deterministic substring/date checks.
2. Shows the separate measured **15-call / 5-cases-per-model** comparison from `reports/RESULTS_2026-10-20.md`. Do **not** combine its sample size with the eight-case experiment.
3. Estimates token-only costs by using recorded GPT-6 Luna usage (2,596 input + 1,185 output tokens over eight calls) and the published **$0.10/M input, $0.50/M output** standard list rates. Result: about **$0.000852** for eight calls. Prices may change; this excludes hosting, retries, review time, PDFs and the actual invoice.
4. Provides interactive threshold curves from an **explicitly illustrative** score list. Until measured Jev data exists, there are no claimed Jev scores, AUCs, latency measurements or savings.
5. Includes an **opt-in, server-side Jev gateway adapter** using documented `POST https://jevtypesafeai.com/api/v1/decisions` and the `noul` decision primitive. Scores measure whether the two fictional documents appear to need **attention** rather than continuing remaining checks.

This is a personal independent work sample, **not** an INCA deployment. Neither provider performs a claim payment, coverage decision, or customer communication.

## Security boundary

- Only known, fictional records are used. They are explicitly treated as untrusted data.
- Never paste a key into a webpage. The `JEV_API_KEY` secret is read only in GitHub Actions or a trusted local process.
- A Jev score is **shadow-only**. It may add a review flag, but it cannot override `HUMAN_REVIEW` or `NEED_INFO` returned by the independently verified OpenAI extraction gate.
- An invalid, missing or failed Jev response has no usable score; if the shadow gate is enabled it fails to `HUMAN_REVIEW`.
- The public page only reads a saved synthetic report. Opening it makes **no API request to an AI model**.
- There is no automatic paid workflow on git push. Maximum **8 paid Jev requests** per manual run, with no retries. The report is published only when the operator chooses `publish_snapshot=true` and all eight scores are valid, and only when launched from `main`.

## How to run the free tests

From the repository root:

```bash
python -m unittest discover inca-proof/model-eval -p 'test_*.py' -v
python inca-proof/model-eval/cost_quality.py --mode dry-run --limit 8
```

The dry-run makes **zero** external calls and produces no made-up Jev scores.

## Optional live Jev test

A separate secret is required. Jev is developed by TypeSafe AI; this particular implementation uses **jevtypesafeai.com**, an **independent, third-party hosted gateway** rather than TypeSafe's direct API. The gateway quotes **$0.42 per million input tokens** for Jev, while TypeSafe's direct advertised price is **$0.042 per million**. Do not confuse them. Verify both privacy/data terms and current prices before using even fictional records; never send real personal data with this demo.

1. Obtain a compatible prepaid `jv_live_...` key from the gateway.
2. GitHub repository → Settings → Secrets and variables → Actions → New repository secret: `JEV_API_KEY`.
3. GitHub Actions → **INCA Decision Model Lab (manual only)** → Run workflow → first choose **dry-run** (free).
4. For a bounded measurement choose **jev** (max 8 paid calls) and leave **publish_snapshot=false** at first. Inspect the archived JSON report and the API statement.
5. If those results are trustworthy, rerun with `publish_snapshot=true` on **main**. A public `inca/jev-evidence.json` report will only be committed if all 8 scores exist and pass validation.

Run locally only with an appropriately secured secret:

```bash
JEV_API_KEY=<your-secure-shell-secret> python inca-proof/model-eval/cost_quality.py \
  --mode jev --limit 8 --threshold 0.5 --out inca/jev-evidence.json
```

The shown shell syntax is illustrative; on Windows PowerShell use an environment variable instead of the inline Unix assignment.

## What is scored (and what is NOT)

The standalone decision score estimates `needs_attention` for the *next operational step*, not liability or payout eligibility. This binary label combines `HUMAN_REVIEW` and `NEED_INFO`, which are distinct in the deterministic workflow. On the eight authored cases, five require attention and three may **continue other checks**, not be approved.

For a chosen threshold `t`:
- True positive: attention case with score >= t.
- False negative: attention case below t (**critical**).
- False positive: clean-to-continue case with score >= t (extra review).
- True negative: clean-to-continue case below t.
- `recall = TP / (TP + FN)`, `precision = TP / (TP + FP)`.
- `Brier = mean((score - binary_label)^2)`; 5-bin ECE is descriptive only, not meaningful on eight cases.
- API errors appear as **unscored**, not as correct classifications; shadow route fails closed to human review.

**The threshold slider is exploratory**, not validation. Never tune a threshold on the same eight cases and claim generalisation. A proper release gate requires independent expert-labelled development and holdout sets, blinded multilingual/ambiguous documents, confidence intervals for costly false negatives, independent provenance checking, calibration and drift monitoring, and measured human review time.

The earlier three-model result (five synthetic cases per model) is a different dataset, so those token-cost numbers cannot be compared to Jev scores on eight cases as an equal-quality A/B result. Jev is also an *additional judge*, not a drop-in replacement for evidence extraction.

## Sources and reproducibility

- [Recorded 8-case OpenAI run](https://github.com/mikelninh/mikelninh.github.io/blob/main/inca/ai-evidence.json)
- [Recorded 15-call comparison, provenance and limitations](reports/RESULTS_2026-10-20.md)
- [Jev hosted gateway request and billing fields](https://jevtypesafeai.com/docs/decisions)
- [TypeSafe AI's directly advertised Jev pricing](https://typesafe.ai/)
- [OpenAI API published token pricing](https://developers.openai.com/api/docs/pricing)
- [Original independent deterministic claims routing](../src/claims_eval.py)
