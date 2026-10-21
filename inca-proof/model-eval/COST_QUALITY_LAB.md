# INCA Model Lab — Cost × Quality v1

**Live demo:** https://mikelninh.github.io/inca/model-lab.html

## Recorded measurements vs. demonstrations

1. The 8-case OpenAI extraction run is a real recorded API run on **developer-authored fictional** source texts. All eight route labels matched the authored expectations; none of this establishes real-world insurance performance.
2. A separate 15-call / 5-cases-per-model OpenAI comparison is documented in `reports/RESULTS_2026-10-20.md`. These are separate datasets.
3. A cost projection uses recorded token counts (2,596 input / 1,185 output over eight OpenAI calls) and published list prices; it is an **estimate**, not an actual invoice.
4. Until a recorded Jev result is specifically approved for publication, the public threshold chart shows **clearly labeled illustrative** scores only.
5. The Jev adapter sends synthetic document texts **only to TypeSafe's official API** at `POST https://api.typesafe.ai/v1/systemone`, using `model=jev-latest`, an explicit `noul` judgment, and bearer authorization. The API answer is read from `answers.needs_attention.noul`.

This is an independent work sample and not an INCA deployment. No real claim or customer data are processed, and no coverage/payment/customer decisions are taken.

## Safe default

- **Do not paste API keys into chat, source code or public webpages.** Use the GitHub Actions repository secret `TYPESAFE_API_KEY` (organization-scoped TypeSafe API key).
- Only developer-authored fictional documents are sent to the model. Document instructions are untrusted data.
- A model judgment runs strictly **in shadow mode**. It may suggest additional human review but **cannot override** a baseline `HUMAN_REVIEW` or `NEED_INFO`.
- A failed, missing or malformed Jev response is **unscored** and causes the shadow gate to fail closed to `HUMAN_REVIEW`.
- Tests and dry runs make **zero billable AI calls**.
- The established GitHub Actions workflow requires a manual choice of `run_mode=jev`, and caps paid Jev requests to **1, 3, or 8** fictional cases; it never publishes reports to the public site.
- Any results stay in a short-retention GitHub Actions artifact, pending human inspection.
- Model version alias `jev-latest` may change; pin a tested version before any real deployment or threshold calibration.

## Offline (zero cost)

From the repository root:

```bash
python -m unittest discover inca-proof/model-eval -p 'test_*.py' -v
python inca-proof/model-eval/cost_quality.py --mode dry-run --limit 8
```

## First actual TypeSafe API request (one fictional case)

1. Create an API key in the [official TypeSafe console](https://console.typesafe.ai/).
2. Repository **Settings → Secrets and variables → Actions → New repository secret**: name `TYPESAFE_API_KEY`, value your actual key. Never enter it in this document or commit it.
3. Open **[INCA Synthetic Model Eval](https://github.com/mikelninh/mikelninh.github.io/actions/workflows/inca-model-eval.yml)** and choose **Run workflow**.
4. Choose `main` and set `run_mode=jev`, `jev_cases=1` for the first live request. Leave `models` and `cases_per_model` unchanged (they are ignored in Jev mode).
5. Inspect the logs for API/schema errors and download the short-retention `inca-typesafe-jev-...` report artifact. Never assume a green workflow means a correct model decision.
6. Only after a successful first call, consider `jev_cases=8` and assess scores, false negatives, failure rates, latency, and provider-reported costs. There is no auto-publishing step.

**Endpoint:** `https://api.typesafe.ai/v1/systemone` (TypeSafe official; NOT the third-party `jevtypesafeai.com` gateway).

**Billing:** TypeSafe's public token pricing is indicative; check the account billing page before paid calls. Provider cost is reported only when supplied by the actual API response. An absent provider cost field is `null`, never misrepresented as zero.

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
- [Official TypeSafe OpenAPI reference](https://api.typesafe.ai/redoc)
- [TypeSafe AI](https://typesafe.ai/)
- [OpenAI API published token pricing](https://developers.openai.com/api/docs/pricing)
- [Original independent deterministic claims routing](../src/claims_eval.py)
