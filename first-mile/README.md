# FIRST MILE — Better founder conversations, backed by evidence

**Independent portfolio engineering project · not affiliated with HTGF.**

Live product: https://mikelninh.github.io/first-mile/

**NEW: Model Lab v2:** https://mikelninh.github.io/first-mile/lab/

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

**Measured rules baseline: 42/48 exact labelled status matches on this six-case synthetic set**, including 32/32 on four known development cases and 10/16 on two developer-authored challenge cases. This is **not accuracy on real pitch decks**. It reveals brittleness under unfamiliar phrasing and forecast context.

**No real GPT/Claude benchmark scores have been claimed or fabricated.** Those require actual model API credentials, configured model names, explicit approval for potentially billable calls, and an exported benchmark report. The static website never accepts API keys.

Run comparison locally following [lab/README.md](lab/README.md). The lab compares results from locally imported JSON without uploading the report. It is intentionally not an unauthenticated public LLM proxy.

## Quality gates

- 28 deterministic frontend contract tests for the original demo and picker.
- Model Lab tests for labelled scenarios, baseline reproducibility and unsupported quotation rejection.
- Provider-free Python tests for staged orchestration, source safety and no unintended paid calls.
- GitHub Actions runs the tests without calling paid APIs.

## What is not proved

No independently measured productivity gains, source reliability for arbitrary PDFs, OCR, broad claim accuracy or real HTGF workflow integration. This is an engineering and product-learning prototype.

The next meaningful pilot: obtain consented, representative founder materials; establish human-labelled ground truth; compare end-to-end reviewer time including corrections; and only expand automation where verified evidence supports it.

Built by Michael Ninh · Berlin · October 2026.
