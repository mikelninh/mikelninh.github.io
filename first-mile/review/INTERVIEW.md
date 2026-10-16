# FIRST MILE · Junior AI Engineer interview field guide

Independent engineering work sample for the HTGF Junior AI Engineer application. Not affiliated with HTGF.

## Your one-minute project explanation

"I wanted to understand whether we could shorten the first pass through a startup pitch deck without automating investment judgement. FIRST MILE extracts text from browser-local PDFs, highlights key figures and missing information, points back to source pages and prepares questions for a person to review. I began with small deterministic rules to get a testable baseline. Then I compared nine real OpenAI model/effort configurations on six developer-authored synthetic cases. The cheapest baseline matched the more expensive finalist on this limited task. But the failure patterns showed source-verification and context gaps, so I built a failure investigation, a narrow fix and regression tests instead of claiming production readiness."

## Questions a strong junior should be able to answer

**1. What actually happens when a PDF is uploaded?**
PDF.js parses the document locally into per-page text. The deployed rule-based extractor uses patterns to find topics, numeric values and some forecasts, attaches source/page/excerpt references, creates five draft follow-up questions, and lets a human export a Markdown brief. The public frontend is plain JavaScript. Do not claim this currently runs a live Python service, OpenAI call, RAG pipeline or MCP server.

**2. Why did Luna None win?**
It matched 45/48 authored field statuses, the same as Sol Medium, at lower measured token cost and shorter summed latency. The benchmark is small, developer authored, and mostly contains cases already seen in development. It establishes a provisional engineering baseline, not that Luna is universally superior.

**3. Does 45/48 mean 93.75% accuracy?**
It means 93.75% agreement with the 48 selected synthetic status labels, not independent precision or recall on real documents. For real claims you also need entity/value correctness, attribution, coverage, time-period handling, human question quality and a blinded test set.

**4. Why verify citations after an LLM produces structured JSON?**
A valid schema only proves that the shape is valid. The model can invent a page, quote or amount. The verifier rejects quotes not found literally in the named source/page and numeric values that disagree with the passage. That guards provenance but does not validate whether the founder's business claim is true. A too-strict verifier can also cause missed true positives.

**5. How did you debug the forecast failure?**
The fixture contained '2028 TARGET' and a following separate 'ARR: €2m'. The old regex looked only at the ARR line, so it called the value 'found' rather than 'forecast'. The narrow patch checks whether an explicit forecast/target heading occurs immediately before that ARR line. New tests prevent leakage to later funding facts or new pages. Because the failure case was used to develop the patch, 43/48 is a development regression score, not a new blind benchmark.

**6. Why an API instead of just a UI?**
A typed Pydantic contract separates model-generated candidate observations from trusted source verification. FastAPI exposes small, testable endpoints and validates sizes, enums, page numbers, extra fields and errors. The reference service is local-only and is not connected to the deployed frontend. For a production pilot add auth, access scoping, rate limits, data retention policy, trace IDs and audited deployments.

**7. What is the difference between RAG and agents?**
RAG retrieves relevant evidence to ground generation. A tool-using agent chooses or orchestrates steps/tools over a workflow. Neither is necessary to display a handful of fixed numeric checks, and more autonomous steps increase the failure and authorisation surface. GitLaw is the separate RAG/hybrid retrieval work sample; Digital Worker Factory is the separate governed-agent work sample.

**8. What would you add before a real HTGF pilot?**
Requirements interviews, data classification and source permissions, threat model, representative labelled decks with a sealed holdout, format/OCR evaluation, extraction precision and recall, quote correctness, negative tests, review-time-with-corrections, reviewer feedback, authenticated service, tracing, retries/timeout budgets, human approval, rollback and monitoring. Do not collect confidential founder data before an agreed handling process exists.

## Practice drill: a 90-second technical interview

You are shown two claims:

- Original pitch: "ARR: €240k"
- Later founder update: "ARR: €180k"

Both contain literal sources. What should the system do?

Answer with: **inputs → what is verified → what is uncertain → safe next action → how to test**.

Strong answer: Store both as separate observations with source, page and reporting date; flag numeric difference but don't assume wrongdoing; ask for definitions/date/current recognised revenue; require a human before any decision. Test same vs different values, different currencies/periods, malformed PDFs, invented quotes, and no silent overwrite.

## What not to overclaim in the interview

- No independent production results or saved staff hours.
- No live OpenAI agent or internal HTGF integration in the public FIRST MILE upload.
- No deployed FastAPI backend: the reference service is locally runnable.
- No Langfuse tracing or LangGraph production workflow implemented in FIRST MILE yet.
- No independent blind evaluation of model quality on real decks.

## Your next learning targets

Focus in order on (1) Python async + FastAPI/Pydantic tests, (2) SQL and document modelling, (3) evaluation/tracing with Langfuse, (4) scoped MCP tool calling with human approval, (5) container deployment and CI. Learn to explain which tool solves a real problem instead of adding complexity to sound impressive.
