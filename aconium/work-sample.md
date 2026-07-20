# Evidence-First Document AI for Public-Sector Workflows

**Michael Ninh - work sample for aconium**

## Goal

Help public-sector reviewers answer domain questions across evolving document sets while keeping evidence, freshness, uncertainty and human responsibility visible.

## Proposed system

```text
Documents / scans / forms
        |
Ingestion + OCR + metadata + PII policy
        |
Hybrid retrieval: BM25 + vector search + filters
        |
Agent orchestrator: retrieve -> compare -> reason -> verify
        |
MCP tools: exact lookup, citation verification, workflow actions
        |
Evaluation: golden questions, deterministic checks, groundedness
        |
Reviewer interface: answer, evidence, confidence, next action
```

## Trust contracts

1. Every material claim links to document, page, section and version.
2. Invalid or stale references return structured failure states rather than plausible prose.
3. Deterministic checks run before model-based judging.
4. External actions require an explicit human checkpoint.
5. Every run records prompt version, model, latency, cost, retrieved evidence and tool results.

## Existing proof

- **GitLaw:** 5,936 federal laws, hybrid retrieval, 94K-node citation graph and 53/53 passing citation evals.
- **SafeVoice:** bounded eight-tool agent, structured outputs, audit trails and human approval.
- **Civic AI MCP Toolkit:** shared infrastructure extracted from six MCP systems with 19/19 hermetic tests.
- **Agent Loop Lab:** checkpointed workflow that retries only the failed step.

## First 30-day contribution

- map the highest-value reviewer workflow and its failure costs;
- define input/output schemas and a small golden dataset with domain experts;
- ship a vertical slice from ingestion to cited answer;
- add retrieval metrics, groundedness checks, latency/cost budgets and failure review;
- extract reusable MCP skills and document the handover path.

The model remains replaceable. The evaluation data, tool contracts, evidence chain and workflow knowledge become the durable product asset.
