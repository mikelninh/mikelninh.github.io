# INCA · Jev Research Plan V2 — falsifiable hypotheses

**Status (2026-10-22):** H1–H7 have now been investigated. H1/H5: 208 actual new Jev/GPT API requests; H2/H6: explicitly posthoc analysis of the previously inspected 300-case responses (no new API requests); H3/H4: 600 real model calls; H7: 160 Jev pinned-version calls. No production claims have been validated. See the [applicant's field notes](https://mikelninh.github.io/inca/field-notes.html), the [detailed study](https://mikelninh.github.io/inca/jev-research.html), and [H1/H5 run](https://github.com/mikelninh/mikelninh.github.io/actions/runs/39761548020). See [live reviewer report](https://mikelninh.github.io/inca/jev-research.html) and [source run](https://github.com/mikelninh/mikelninh.github.io/actions/runs/39691808881).  
**Date:** 2026-10-22  
**Question:** Where can a structured, low-latency decision model *replace or selectively avoid* more expensive work in claims AI Operations, while preserving evidence integrity and human control?

## Prior evidence and why the experiment must change

Our six-case A/B/C comparison (real run [39669379581](https://github.com/mikelninh/mikelninh.github.io/actions/runs/39669379581)) used five attention-worthy cases and one apparently clear case. At the exploratory 0.5 threshold, Jev scored **all six** above 0.5 (including the clear bicycle example at 0.62), so C skipped no GPT calls. This result is **not a representative test of high-volume triage**.

Jev returns bounded typed decisions (`noul`, `choice`, `score`) instead of evidence quotations or human-readable explanations. It should not be used to replace essential source extraction, deterministic source matching, claim approval or mandatory insurer policy checks. A probability is not evidence. The threshold needs calibration rather than assuming 0.5 is universally correct.

Also test model identity explicitly: TypeSafe announced `jev-1.14.0` in October 2026 with particular multilingual improvements. **Pin and log actual model revision for every call**, including aliases, before drawing conclusions about versions.

## Pre-registered evaluation: no outside reviewer required for engineering tests

**Corpus proposal:** 300 **new** wholly fictional claim pairs across travel, household/water damage, bicycle theft, liability and electronics. **Exclude the six prior pilot cases.** 60 development / 240 *frozen* holdout; prevent near-duplicate document templates and paraphrase variants from crossing the split. Record fixture generator version, seed, source types, language, logical facts, ground-truth next workflow gate, and dataset checksum. Do not send labels, outcomes, or generator metadata to Jev or GPT.

The records should include normal matching evidence, genuine missing paperwork, inconsistent amounts/dates/IDs, ambiguous narratives, date-decoy distractors, adversarial instructions, conflicting statements, German/English paraphrases, spelling noise and long extracted PDF-like text. Generate cases from underlying machine-readable facts first, then render into varied narrative documents. **Ground truth applies only to the invented workflow policy**, not to actual insurance coverage or a legal judgment.

Keep two reporting cohorts:

1. **Clean-heavy mix** (hypothetical high-volume intake): predominately routine/matching records; emphasizes avoided expensive steps.
2. **Stress mix** (deliberately risky): missing/contradictory/instruction-bearing records; emphasizes missed critical exceptions.

These are **scenario assumptions**, not an assertion about INCA's actual base rates. Publish stratified findings and hypothetical sensitivity to 50%/70%/90% clean-case prevalence rather than claiming representative real-life prevalence.

**Fair baselines:** same source text or same verified structured state; (i) deterministic keyword/field rules, (ii) GPT-4o mini configured for the identical *decision-only* output, (iii) Jev; optionally a stronger LLM in a distinct expensive-agent scenario. Record per-model schema, release/version, tokens, measured call p50/p95, errors, retries, and actual or rate-card API costs. For avoidable-work experiments, use *the same upstream verified evidence* for each arm. Mandatory source verification, prompt-injection defense, access controls and human approval remain common to all routes.

**Design discipline:** Choose prompts/thresholds exclusively on the 60 development cases. Freeze before viewing any of the 240 holdout outcomes. An update after holdout is a **new experiment**. Bootstrap paired uncertainty intervals; report all trials and failed cases, not only the best slice. Given small scale, this remains developer-authored simulation and **cannot certify production reliability**.

## Hypotheses and stopping rules (gates are research targets, NOT achieved results)

| ID | Falsifiable hypothesis | Exact experimental treatment | What would count as useful evidence | Stop / reject when |
|---|---|---|---|---|
| **H1 · Replace one costly decision call** | Jev can substitute for a standalone GPT decision that happens *after* evidence extraction | Supply the same independently verified fact bundle; compare Jev `choice`, GPT decision-only, and deterministic rules on all frozen cases | >=95% correct workflow gate on authored policy, within 3 percentage points of GPT, >=40% lower p95 model-call latency **and** >=50% lower decision-call API cost, with no extra critical under-escalations | Deterministic rules achieve the same quality cheaper; or Jev under-escalates critical cases |
| **H2 · Selective expensive-agent invocation** | Jev cheaply routes routine cases past a *non-mandatory* expensive generative judge | Jev `noul` scores; compare always-judge, Jev→selective-judge, and rule→selective-judge. Maintain all mandatory source checks and human approval | On clean-heavy cohort avoid >=30% expensive judge calls while retaining >=98% authored *critical-attention recall*; total modeled dollars + mandatory review burden less than always-judge | Critical cases are skipped or manual verification erases savings. Never skip evidence extraction required for the decision |
| **H3 · Agent failure sampler** | Jev can prioritize which traces are audited by an expensive LLM-as-judge or specialist | Inject seeded verifiable tool failures into fictional agent traces; ask Jev to score trace concern; judge only top 20%; compare rules, random sampling, GPT on all | Top 20% captures >=65% of seeded critical failures **and** >=2x the recall of uniform random at the same 20% budget; actual judge-call count reduced, no safety gate bypass | Jev ranking is no better than cheap rules or misses disproportionately severe errors |
| **H4 · Tool / specialist routing** | Jev `choice` can select one of five safe specialist tools without an LLM planning step | Input raw documents but hide claim label. Compare fixed-rule classifier, GPT structured tool selection and Jev choice; tools allowed by whitelist only | >=95% tool-choice accuracy across held-out types, within 3 pp of GPT, >=40% lower p95 model-call time, no cross-split leakage | Existing rules are equal or better / wrong specialist implies missed obligatory checks |
| **H5 · Several small decisions per request** | Jev's typed multi-question request saves sequential decision overhead | On the **same verified state**, ask 4–6 distinct questions (document type, attention risk, missing info, contradiction, routing class, escalation need) in one Jev request. Compare single structured-output GPT request and sequential single-question Jev | >=30% lower total decision-call time and cost **at matching required-gate recall**, counting all questions and not double-counting decisions | Coarse one-shot outputs have no advantage over one GPT structured output or fixed rules |
| **H6 · Trustworthy uncertainty / abstention** | Jev scores can identify cases where extra review is genuinely valuable | Validate score/risk ordering and calibration on holdout; freeze thresholds using dev only. Compare rule confidence, Brier, ECE, risk–coverage curve and high-risk recall | Brier improvement >=10% vs prevalence-only baseline; ECE <=0.10; useful reviewer prioritization at fixed workload. No assumption that 0.5 is calibrated | Confidence is uninformative, poorly calibrated or disproportionately wrong on vulnerable slices |
| **H7 · Multilingual and model-version stability** | A newer Jev revision improves German narrative decisions without sacrificing English quality | Pin `jev-1.13.0` and, if available, `jev-1.14.0`/`jev-preview`, log actual response revisions; paired semantically equivalent DE/EN/VN only when oracle translation is checked; compare on held-out paraphrase families | DE tool-choice accuracy gains >=3 pp over old version with no >2 pp English loss; >=95% identical correct *workflow gates* across same-fact DE/EN paraphrases | Drift, regressions, inability to pin actual model revision, or loss of critical recall |

**Safety gate for every hypothesis:** no automated payment, liability acceptance, coverage approval, customer communication or real claims mutation. Any unsupported source evidence, parser exception, model API failure, missing metadata, mandatory policy condition or suspicious instruction must cause abstention or the prescribed human-controlled path. Never use Jev's numerical score as proof of source truth.

## Architecture candidates, explicitly separating the work that is being saved

### A. Evidence-first with replaceable decision head (H1, H5, H6)

```text
fictional documents → extraction (LLM or deterministic)
                 → verify quotes and facts (hard code)
                 → Jev typed decision(s) vs GPT typed decision vs rules
                 → safety / domain policy gate
                 → next work step or human review
```

**Opportunity:** replace a dedicated *decision-only GPT call* if it exists. If GPT already jointly extracts and decides in one call, adding Jev can make the workflow slower and more expensive.

### B. Cheap triage before a costly optional judge (H2, H3)

```text
verified data or immutable trace → Jev score
     ├─ selected / concerning → expensive LLM-as-judge (or human)
     └─ not selected → essential checks still happen; optional judge skipped
```

**Opportunity:** many repetitive cheap choices and a genuinely expensive downstream step. For observability sampling, the question is *which failures get examined*, not *whether a claim may be approved*.

### C. Fast tool selector (H4, H7)

```text
untrusted evidence → Jev typed tool choice → strict whitelist
                → specialist extraction/check → verified source / mandatory safety gate
                → human review or remaining checks
```

**Opportunity:** only if otherwise one or more model planning calls or manual triage exist. Compare against deterministic rules; do not charge Jev for tasks that code already solves exactly.

## Business metrics and a fair savings equation

At the workflow level record:

- **Errors:** critical under-escalations, unnecessary reviews, missing-information requests, wrong tools, unsupported quotes, unhandled API errors.
- **Actual work:** model calls, tokens, costs per case (rate-card estimate vs invoice), p50 and p95 wall time including orchestration, LLM-as-judge calls avoided, human reviewer minutes (*not available in our offline test*).
- **Economics:** `total_cost = model + infrastructure + reviewer_minutes × loaded_hourly_rate / 60 + retries + downstream work`. Until actual human time exists, present 0/2/5/10-minute sensitivity examples **as assumptions**, not measured savings.
- **Quality at workload:** recall of authored critical exceptions vs share of cases selected for a second check, plus confidence intervals and per-type/language results.

**Explicit research failure is a valid result:** if Jev cannot remove an optional expensive call without causing missed critical exceptions or additional human effort, prefer simpler GPT+rules and retain Jev only for more suitable decision points.

## Recommended execution order

**Phase 1:** Build 300 new synthetic cases with controlled source truth and template-disjoint splits. Run free fixture generation, leak checks and deterministic-rule baseline. Freeze 240-case holdout.

**Phase 2:** Pilot H3 *agent failure sampler* and H4 *specialist routing* on the development split, plus test whether the system already has an expensive optional judge. These have the strongest theoretical alignment to repeated typed decisions.

**Phase 3:** Run paired Jev/GPT experiments on the frozen holdout only after thresholds and model revisions are fixed. Publish successful and failed outcomes with uncertainty and 2-3 representative failure examples.

**Phase 4:** Model total operational value under clean-heavy and stress prevalence scenarios, with human-review sensitivity; select architecture only if its value is evidenced, not because Jev is cheaper per token.

### Relevant evidence (background, not our findings)

- [TypeSafe's September 2026 explanation of Jev and model limitations](https://typesafe.ai/blog/introducing-system-one-models-and-jev)
- [TypeSafe Jev 1.14 announcement (Oct 14, 2026)](https://typesafe.ai/blog/jev-1-14)
- [TypeSafe Jack & Jill case study: candidate scoring (provider-authored)](https://typesafe.ai/blog/jack-jill-jev-case-study)
- [three.dev: Jev vs LLM judge — sampler more useful than full replacement](https://three.dev/blog/jev-vs-the-llm-as-a-judge)

**Shareable recommendation for the INCA application:** “We compared decision-model architectures and found that adding Jev to a small exception-heavy sample increased reviews and costs. Rather than assume a universal winner, we pre-registered tests for high-volume triage, tool routing, trace evaluation and score calibration on a new blinded synthetic holdout. Each has quality, cost and abstention gates.”

## First completed result · H3 and H4 (2026-10-22)

The 240-case frozen synthetic holdout contained 49 seeded critical tool/trace errors. At the 20% audit budget (48 records), Jev prioritized 38/49, GPT-4o mini 15/49, hash-random selection 10/49, and the deliberately simple deterministic rules **44/49**. Jev **passed the preregistered recall-vs-random criterion** but **did not beat simple rules**. Exact tool routing was 240/240 for Jev, GPT and rules, so Jev cannot claim incremental routing value. Model p95 API time was Jev 129ms vs GPT 927ms; full workflow time and human review cost unmeasured. Returned Jev revision was 1.13.0; multilingual/version H7 remains untested. All examples use one deterministic generator with intentionally easy structural fault patterns. No insurer claims or expert labels.

## Closing experiments: H1 and H5 (actual run 39761548020)

40 new developer-authored, *already-verified* fictional claim fact bundles, 10 dev / 30 fixed holdout; one `jev-1.14.0` choice versus one GPT-4o-mini structured-output choice (H1), then four typed Jev choices in one request against GPT batched and four serial Jev requests on 12 matched holdout cases (H5). **208 actual API calls**, zero provider errors. These labels are synthetic policy decisions, *not* adjudicated insurance claims; source extraction is explicitly out of scope.

- **H1:** Jev 30/30 correct bounded next actions vs GPT 10/30 on the frozen synthetic holdout; Jev 149ms p95 versus GPT 879ms; rate-card inference cost $0.000644 vs $0.001312. But deterministic Python rules also achieved 30/30 with no model calls. GPT under-escalated 20 authored conflict/instruction cases: an important prompt-specific failure, **not general GPT capability evidence**.
- **H5:** Jev batched four questions correct on 28/30 cases (118/120 individual choices), GPT on 13/30 (103/120), code on 30/30. On exactly the same **12 preselected cases**, Jev batch had 94ms median and estimated $0.000422 versus 4 sequential Jev requests 306.5ms and $0.001004. **Quality trade-off:** batch 10/12 cases all correct vs sequential 12/12; two unnecessary document-request decisions, none of the safety-gate routes missed.
- **Research verdict:** H1 reaches its isolated Jev-versus-GPT gates on this artificial decision-only task, but does not improve on straightforward code. H5 saves model cost and time but fails strict exact-quality equivalence. Neither demonstrates a cheaper end-to-end insurer process.

Source: [H1/H5 recorded GitHub API run](https://github.com/mikelninh/mikelninh.github.io/actions/runs/39761548020); [method](JEV_H1_H5_METHOD.md); [public measured summary](https://mikelninh.github.io/inca/jev-h1-h5.json). Note: six-case, 20-case and other historical pilot tests are not included in the 968-call / ~$0.04819 consolidated later-study cost summary.
