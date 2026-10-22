# RETURN LOOP · Jev final experiment (2026-10-22)

## Question, not model hype

Before introducing Jev to the production architecture, ask two falsifiable questions:

1. **Routing:** On the same synthetic support messages, does TypeSafe Jev 1.14 identify more product-quality issues than free deterministic rules without additional false quality alarms?
2. **Draft safety:** Can Jev identify unsupported factual promises in generated customer replies, while avoiding false alarms on safe replies?

Jev is not a text generator. It cannot replace an LLM when the workflow requires newly written prose, and adding Jev to every reply cannot automatically save LLM-generation cost.

## Pre-registered experimental design

* Model: `typesafe/jev-1.14`, via `POST https://openrouter.ai/api/alpha/decisions`, not the chat endpoint.
* Questions: 5 independent typed `noul` judgments per ticket; `other` is derived in code when none passes.
* Threshold: 0.5 for classification; 0.5 for reply risk, plus *precommitted* sensitivity analysis at 0.3.
* Inputs: 24 existing synthetic development cases; 16 distinct synthetic challenge cases from an earlier reserved evaluation; 12 deliberate safe/unsafe reply pairs, shuffled and sent without their expected labels.
* Responses are validated strictly. Missing, malformed, nonnumeric or out-of-range scores fail closed.
* Measures: exact-match classification, product-quality false negatives and false positives, macro-F1, risk-review misses and false alarms, true provider latency, reported API cost.
* Limitations: synthetic examples, not independently collected or blind human-labelled. Avoid tuning thresholds on the challenge cases. Draft-pair expected outcomes are constructed, not independent certification.
* Policy: **No automatic refunds, customer messages, or store actions**; every generated reply needs human review regardless of Jev's score.

## What is *actually* measured as of 2026-10-22

| Metric | Deterministic rules | Archived OpenAI LLM | Jev 1.14 |
|---|---:|---:|---|
| Existing 24 development cases, exactly correct | 20/24 | 22/24 (archived real API study) | **Not yet called** |
| Existing 24 cases, quality misses | 1/12 | 0/12 | **Not yet called** |
| New 16 synthetic challenge cases, exactly correct | **7/16** | Not tested on same set | **Not yet called** |
| New 16, quality misses | **3/6** | Not tested on same set | **Not yet called** |
| New 16, quality false alarms | **0** | Not tested on same set | **Not yet called** |

The archived OpenAI LLM results are a development-only exploratory experiment and cannot be compared directly to Jev scores from a different set.

## Implementation status and blocker

A standalone Node.js 20+ experimental harness, frozen synthetic datasets, 7 successful local tests, offline preflight, validated OpenRouter calls and report viewer have been produced for this conversation and can be downloaded there. The harness deliberately defaults to zero API calls. It requires `OPENROUTER_API_KEY` plus an explicit `--live --confirm-cost` argument for real inference; up to four batched provider requests are made.

The Vercel project `return-loop-model-arena` currently has no `OPENROUTER_API_KEY`, so the Jev integration in its public application remains disabled. **No Jev effectiveness or speed numbers are claimed.**

### Decision gate

Test, then decide:

- **Try Jev routing** only if Jev beats 7/16 on challenge exact match *while not missing more than 3/6 quality issues or adding any new quality false alarms*. This only warrants further validation, not deployment.
- **Explore Jev safety review** only if it detects all 12 constructed unsafe drafts with at most 2 false alarms among 12 safe drafts at the precommitted 0.5 threshold.
- **Otherwise:** retain deterministic rules and human approvals; use the proven generative LLM only where actual prose is needed.

Source references: [TypeSafe Jev 1.14](https://openrouter.ai/typesafe/jev-1.14), [Jev batch decisions documentation](https://openrouter.ai/labs/jev), [RETURN LOOP live demo](https://return-loop-model-arena.vercel.app/).
