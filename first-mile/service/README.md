# FIRST MILE · Reference Verification API

This is a **real, locally runnable FastAPI + Pydantic API**, separate from the deployed static FIRST MILE browser product. It deliberately exposes a small, safe piece of the pipeline: given structured extraction claims, verify literal source text, source name, page number and normalised numeric values. It has no LLM calls, investment score, autonomous decisions, document persistence or outbound actions.

DO NOT deploy this unauthenticated service on a public server or send confidential founder material to it. Before production it would need auth, rate limiting, an approved data policy, audit infrastructure and a security review.

## Local development

From the repo root:

    python -m pip install -r first-mile/service/requirements.txt
    uvicorn api:app --app-dir first-mile/service --host 127.0.0.1 --port 8000

Then open http://127.0.0.1:8000/docs for the generated OpenAPI documentation.

Test it:

    python -m pytest first-mile/service/test_api.py -q

## Example request

POST /v1/verify

    {
      "docs":[{"name":"Synthetic deck.pdf","pages":[{"number":2,"text":"ARR: €240k"}]}],
      "claims":[{"field":"arr","kind":"actual","value":"EUR:240000","source":"Synthetic deck.pdf","page":2,"quote":"ARR: €240k"}]
    }

Responses include accepted and rejected claims, with human_review_required=true and external_actions=0. Invalid input returns 422. HTTP Cache-Control: no-store is set, but this is not a complete privacy guarantee for reverse proxies or deployment platforms.

## Why this architecture for an interview?

- **FastAPI** provides HTTP endpoints, OpenAPI, and async-capable handlers.
- **Pydantic** validates types, constraints, and forbids unexpected fields before domain logic runs.
- The domain verification function is reused from the actual model benchmark, rather than creating a second contradictory truth source.
- **Dependency boundaries:** the reference verifier never receives the provider API secret.
- **Negative tests:** quoted text that wasn't in the claimed source must be rejected even if a model returned it in valid JSON.
- **Human authority:** the API verifies evidence consistency, but cannot establish whether the founder's statement is true.

Production next step: implement authentication/permissions, async external data access where appropriate, confidential-data controls, observability and repeatable end-to-end evaluations.
