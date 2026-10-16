# FIRST MILE — Better founder conversations, backed by evidence

**Independent portfolio engineering project · not affiliated with HTGF.**

Live product: https://mikelninh.github.io/first-mile/

**Model Lab:** https://mikelninh.github.io/first-mile/lab/

**Failure Clinic (release-gate demonstration):** https://mikelninh.github.io/first-mile/review/

## The everyday problem

A founder submits a pitch deck. An investor has to identify what was claimed, compare updates, notice gaps and prepare good questions. FIRST MILE prepares an inspectable draft so the conversation can focus on people rather than document hunting.

## Current publicly deployed experience

- Pick from four explicitly fictional startup cases; each produces distinct findings.
- Upload text-based PDF or TXT documents (processed locally, not uploaded by this site). PDF.js is loaded from a third-party CDN.
- Inspect original extracted text with document/page references.
- Surface selected numbers, missing topics, differences and forecast-vs-actual clues with deterministic rules.
- Prepare five questions, add reviewer notes and export an editable Markdown brief.
- No investment score, automatic rejection or external actions.

The rule engine is deliberately narrow. It uses JavaScript/regular expressions, not an LLM. Its citation excerpts are literal page text and should never be confused with proof that a business claim is true.

## What's new in the Model Lab

Five methods are configured for a fair, reproducible comparison:

1. Current deterministic rules
2. OpenAI GPT (configurable API model)
3. Anthropic Claude (configurable API model)
4. Source-verified two-stage GPT workflow
5. Source-verified two-stage Claude workflow

The final two perform a model extraction stage, then a deterministic citation/number guard, then a separate founder-question stage. Not an autonomous investor.

All methods share six author-created, fictional pitch cases (four original and two harder challenge formats), with eight pre-labelled statuses per case = 48 comparisons. We also track citation verification, latency, token usage and optional cost estimates. Models cannot authorise their own sources.

**Historical rule baseline v2:** 42/48 labelled matches. **Post-fix v3 rule candidate:** 43/48 on the same authored development set, after the split-line forecast failure was inspected and specifically addressed. The latter score is not independently blind. This is not accuracy on real pitch decks.

**Real OpenAI GPT-6 benchmark completed on 2026-10-16:** 36 authenticated calls, estimated total $0.355237 based on token usage/rates. Six-case finalists: Luna None 45/48 ($0.0011405), Sol Medium 45/48 ($0.02741), Astra High 43/48 ($0.21815). Every finalist had two rejected quotations. Original measured run: https://github.com/mikelninh/mikelninh.github.io/actions/runs/38906414912. These are synthetic field-label matches, not real-world accuracy. **No Claude API experiment is claimed.**

Run comparison locally following [lab/README.md](lab/README.md). The lab compares results from locally imported JSON without uploading the report. It is intentionally not an unauthenticated public LLM proxy.

## Quality gates

- 31 deterministic frontend behavior tests, including the scoped forecast fix and negative cases.
- Model Lab tests for labelled scenarios, baseline reproducibility and unsupported quotation rejection.
- Provider-free Python tests for staged orchestration, source safety and no unintended paid calls.
- Failure Clinic benchmark replay and release-gate tests.
- Independent local FastAPI/Pydantic verification service with negative HTTP tests. This service is NOT integrated into the hosted frontend and is NOT a production API.
- GitHub Actions runs the tests without calling paid APIs.

## What is not proved

No independently measured productivity gains, source reliability for arbitrary PDFs, OCR, broad claim accuracy or real HTGF workflow integration. This is an engineering and product-learning prototype.

The next meaningful pilot: obtain consented, representative founder materials; establish human-labelled ground truth; compare end-to-end reviewer time including corrections; and only expand automation where verified evidence supports it.

Built by Michael Ninh · Berlin · October 2026.

## Interview engineering proof

- [Failure Clinic](review/): Reproduce one miss, inspect the source, run regression checks and explain why production is held.
- [Reference verification API](service/): async-capable FastAPI + Pydantic with schema and citation checks; locally runnable, not deployed.
- [Interview questions and practice rubric](review/INTERVIEW.md): honest examples for source verification, evaluation, APIs, agent boundaries and product sense.
