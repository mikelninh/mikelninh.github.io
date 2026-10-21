# INCA · Jev Research V2 · 300-case executable benchmark

**What this actually tests (H3 + H4):**
- **H3 – AI-operations audit triage:** Rank fictional agent traces by probability of a *critical, seeded tool-execution failure*. With an audit budget of **20%**, measure how many critical trace faults are selected. Compare Jev against GPT, deterministic rules, and hash-based random selection.
- **H4 – Tool routing:** Choose one of five fictional claim specialist tools from the same original documents. Compare Jev, GPT and a trivial keyword rule. Explicitly report the cheap-rule baseline, even if it wins.

**Why different from the six-case A/B/C test:** The original 6 were five attention-positive and one routine case, so Jev at the exploratory 0.5 threshold could never save a GPT call. These 300 cases include routine and stressed scenarios, plus independently injected trace faults; we now test tasks Jev is actually designed for.

## Dataset

- Exactly 300 reproducible, wholly imaginary claim/agent-trace records (5 claim lines × 60).
- **60 dev cases**, **240 locked holdout cases**; source text templates differ by split. Fixed generator code + seed (20261022), recorded dataset SHA-256. No ground-truth label, case split or injected-fault label is sent to either API.
- 60% routine and 40% deliberately difficult scenario mix (synthetic assumptions, not insurer prevalence).
- Critical seeded faults include ungrounded evidence excerpts, attempted unauthorized payout, omitted verifier step, missing second source, and inappropriate automatic continuation. Extra cautious reviews are noncritical controls.
- All safety/coverage/payment decisions remain entirely outside this study. A risk score is not permission to proceed.

## Fair experiment

A **single TypeSafe API request** asks Jev both a closed **choice** tool-routing question and a **noul** trace-audit probability question. A **single GPT-4o mini API request** returns the same two fields as strict JSON. Fixed no-tuning-after-holdout model prompts are shared across all 300 cases.

Both models score all cases in one pre-registered execution, with independent shards for speed. No model is used to label its own data. Record actual returned model revision, token usage, API duration, all failures, and zero-retry status. The rules baseline requires no paid call.

**Upper bound: 300 Jev + 300 GPT API requests = 600 potentially billable calls**, spread across three 100-case parallel jobs (200 calls each). The workflow is intentionally only triggered by the explicit one-time marker or manual dispatch. GitHub secrets are read only in Actions; raw model outputs and labels remain in a 30-day artifact. Real invoice pricing is unknown.

## Executed run and result

[Real 600-request evaluation](https://github.com/mikelninh/mikelninh.github.io/actions/runs/39691808881) · [Public, reader-friendly H3/H4 report](https://mikelninh.github.io/inca/jev-research.html) · [Machine-readable aggregate](https://mikelninh.github.io/inca/jev-research-v2.json).

All 300 Jev and 300 GPT requests returned valid responses. Jev captured 38/49 critical synthetic trace faults in its highest-priority 48 holdout cases; rules captured 44/49. Both Jev and GPT selected the correct specialist 240/240, as did the cheap rule baseline. There is no measured additional business value over rules in this artificial corpus. Do not market either result as general insurer accuracy.

## Primary success measures

- H3: Top-20%-audited **critical error recall** on frozen 240-case holdout. Pre-registered target: ≥65% critical fault capture and at least twice random sampling at same budget. Compare rules and GPT directly. A missed critical fault remains a failure even if model probability is low.
- H4: Correct specialist class at fixed options, including abstentions/errors as incorrect. Target ≥95%, no critical misroutes, and ≥40% faster p95 API call than GPT, with a cheap keyword baseline.
- Report raw dev and holdout results separately, not a pooled vanity accuracy number. API errors are counted as unscored, not silently removed from denominators.
- Side metrics: p50/p95 API response, model revisions, actual tokens, and hypothetical provider rate-card costs; *not* end-to-end claim cost, human review minutes, insurance loss rates or production reliability.

**Limitations:** The synthetic generator includes deliberate patterns, uses a small number of distinct narrative templates and cannot model real claim-document variability or expert-labelled professional judgment. Distinct dev/holdout templates reduce direct leakage but do **not** make this an independent insurer-quality benchmark. The hash-random sampling control is one fixed replicate, not a distribution of 1,000 random seeds. Confidence intervals are not yet computed. We should not tune after inspecting holdout and re-report the same holdout as blind.

## Run free offline

```bash
python -m unittest discover inca-proof/agent-ops -p 'test_*.py' -v
python inca-proof/agent-ops/jev_v2_dataset.py
python inca-proof/agent-ops/jev_v2_eval.py --mode dry-run --shard 0 --out /tmp/part0.json
```

For the real API experiment, the GitHub Actions workflow `.github/workflows/inca-jev-v2-300.yml` verifies the code and samples all 300 cases once. It archives all original model outputs, not just success numbers.

## Application-facing verdict

Only after the recorded API run: show H3 capture at 20% budget, H4 routing accuracy, relative p95 latency and a few real example mistakes. If Jev is worse than rule-based routing, **say so explicitly**. If error sampling works but tool routing does not, Jev still has a valid specialized AI Operations use case. These results belong behind an optional **'Jev Research'** link, not on the simple INCA application hero.
