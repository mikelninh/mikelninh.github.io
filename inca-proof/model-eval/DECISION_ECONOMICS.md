# INCA · Decision Economics Lab (Jev vs GPT)

**Question:** Could a specialized binary decision model improve the *complete* claims-operation workflow, not merely a per-token benchmark?

This is an **offline retrospective calculation**, not a live insurer pilot and not evidence that Jev can replace evidence extraction, policy checking or a human decision.

## Verified recorded development numbers

Original real 20-case paired API run: [GitHub Actions #39633113245](https://github.com/mikelninh/mikelninh.github.io/actions/runs/39633113245) → artifact `inca-paired-39633113245`.

| Metric on 20 *authored* fictional cancellations | Jev | GPT-4o mini |
|---|---:|---:|
| Correct binary needs-attention signals | 17 | 16 |
| Flagged actions (TP + FP) | 13 | 10 |
| Unnecessary flags (FP) | 3 | 2 |
| Missed needs-attention (FN) | 0 | 2 |
| Mean API call time | 191 ms | 690 ms |
| Recorded input tokens | 8,613 | 3,821 |
| Recorded output tokens | Not billed | 120 |
| **Estimated list-price inference cost per 20** | **$0.000361746** | **$0.00064515** |

Provider-reported billing cost was **unknown**, not zero. Prices applied as of October 21, 2026: Jev $0.042/1M input, output free ([TypeSafe](https://typesafe.ai/)); GPT-4o mini $0.15/1M input and $0.60/1M output ([OpenAI model pricing](https://developers.openai.com/api/docs/models/gpt-4o-mini)). Rate cards can change.

The **isolated binary decision** is ~44% cheaper for Jev on this test, and the Jev API call returned ~3.6x faster on average. But at 100,000 otherwise identical decisions, the model bill difference is only **~$1.42**. It does not pay for a single human review.

### Cost sensitivity: why the review queue matters

For a *purely illustrative* per-case attention action costing **$5** (not a measured insurer expense) on the same hypothetical 20-case mix:

- Jev raises 13 flags → $65 hypothetical action spending + $0.000362 inference.
- GPT raises 10 flags → $50 hypothetical action spending + $0.000645 inference.
- Jev catches two developer-authored attention cases GPT missed, but generates an extra false positive. The cost of missing a critical case is **not quantified**; model-only cost cannot decide which system is better.
- Applying the *retrospectively tuned deterministic injection guard* to both models removes the two known GPT misses. Jev still raises 13 vs guarded GPT's 12 attention flags. This same inspected set is **not a blind retest**, and all flagged actions are not necessarily human reviews.

Never interpret these artificial numbers as actual insurer prevalence, employee cost or expected financial savings.

## Reproduce the math

```bash
python -m unittest discover inca-proof/model-eval -p 'test_*.py' -v
python inca-proof/model-eval/decision_economics.py --volume 100000 --action-cost 5 --miss-cost 0
```

Download the original Actions artifact and extract `paired_39633113245.json` locally to verify every numeric field:

```bash
python inca-proof/model-eval/decision_economics.py --recorded-json paired_39633113245.json
```

All steps are offline. Monetary scenario parameters are hypothetical and explicitly labelled; provider list prices are not bills.

## The useful INCA pilot: three choices on the same cases

**A · Single LLM**: extract evidence + determine the bounded next action in one LLM call. Source validation and mandatory deterministic guard always run.

**B · LLM + Jev**: the *same* evidence extraction is reused; Jev then supplies the binary attention signal or second opinion. Safety gate still decides whether to proceed. This adds a model call, so value must come from fewer misses or better review queues—not per-token price.

**C · Jev first / selective LLM**: use Jev to triage raw case text. Only low-risk, validated cases can skip expensive downstream work *when the insurer's SOP truly allows skipping it*; ambiguous cases get full LLM evidence extraction and expert review. Be explicit that regulated/required checks may never be skipped.

**Do not conflate a binary attention label with HUMAN_REVIEW vs NEED_INFO vs CONTINUE_CHECKS.** These require separate evaluations with expert-defined SOP labels.

Measure **per-case**: original source type, model/version, tools and extracted citations, Jev score/threshold, LLM calls skipped/added, API latency and token usage, complete workflow wall time including retrieval and retries, mandatory gate violations, exact human work minutes, follow-up requests, missed attention, unnecessary human handoffs, eventual expert-confirmed resolution, and actual invoiced provider costs. Predefine acceptable missed-critical-case rates and abstain when uncertain.

Use a mixed, previously unseen evaluation set: different claim types, clean/ambiguous/contradictory cases, missing documents, malicious content, German/English phrasing, long scanned/OCR material (separate input tier), with *independent expert labels* once a pilot is possible. Report base rates and confidence intervals. Run in **shadow mode** (never affecting a real payout) before any production claim.

### Decision rule

Only ship Jev to a production decision path if, at the same pre-agreed safety threshold, **total cost per resolved case falls, latency/review effort improves, and critical misses do not worsen** on external expert-reviewed data. Otherwise keep it as a cheap shadow signal or leave it out.

For the current INCA application, this is an informed and measurable *hypothesis*, not a deployed Jev architecture.
