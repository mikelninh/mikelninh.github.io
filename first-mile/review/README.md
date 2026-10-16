# FIRST MILE — The Failure Clinic

Purpose: a junior AI engineering proof demonstrating how a team **observes a model miss, diagnoses it, applies a bounded patch, runs regression tests and makes an honest release decision**. This is an independent synthetic portfolio demonstration, not HTGF's software or a production workload.

## Evidence
- The authenticated one-shot OpenAI run was completed: https://github.com/mikelninh/mikelninh.github.io/actions/runs/38906414912
- Thirty-six actual provider requests across nine effort configurations, following the same authored synthetic cases.
- Luna None 45/48 ($0.0011405), Sol Medium 45/48 ($0.02741), Astra High 43/48 ($0.21815), each with two quote rejections.
- Historical deterministic baseline 42/48 on these six synthetic cases. The source-code rule change below was authored **after inspecting the challenge case**.
- Benchmark data shown here is a manually minimised, provenance-linked snapshot of the real measured aggregate JSON. No API key, personal data or raw private decks are included.

## One real corrective change
The old rule extractor treated "2028 TARGET" followed by "ARR: €2m" as an actual revenue number because it checked the ARR line alone. The patched version accepts a directly adjacent explicit forecast header for ARR, but prevents the context from bleeding to unrelated funding lines and other pages/documents. See core.mjs and tests/first-mile.test.mjs.

The browser Release Gate computes the current rule engine against the same six authored fixtures. Historical 42/48 is an immutable prior observation. A stronger score on an already-reviewed case is development-set progress, **not independent model/generalisation performance**.

## Expected Engineering Review steps
1. Reproduce 6-case status agreement and the exact forecast miss.
2. Read source excerpt and write the plausible root cause.
3. Introduce the smallest bounded change (no expensive model change).
4. Add negative tests: unrelated funding isn't forecast; header doesn't cross pages.
5. Run CI and inspect any failure; don't assume green tests mean real-world readiness.
6. Maintain an explicit hold decision for production until blind labelled real documents, privacy, monitoring, and user-time impact are measured.

## Interview practice
- What exactly is the difference between extraction accuracy and quotation reliability?
- Why does a high match rate on synthetic development cases fail to justify deployment?
- Which improvement would you test next, and how would you avoid label leakage?
- What are the tradeoffs between deterministic rules, structured-output LLMs, RAG and agents?
- How would you design an idempotent API, privacy-safe monitoring, failure fallback and human approval?

## Reproducible review and API tests

From repository root:

    node --test first-mile/review/review.test.mjs
    node --test tests/first-mile.test.mjs
    python -m pytest first-mile/service/test_api.py -q

The service remains local-only; browser review stays static and uses no secret.
