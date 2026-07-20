# Agentic systems that survive contact with reality

**Michael Ninh · Work sample for OH-SO Digital · Agentic Engineer**

Portfolio: https://mikelninh.github.io/oh-so/  
GitHub: https://github.com/mikelninh  
Email: mikel_ninh@yahoo.de

## The thesis

A useful AI feature is not a prompt wrapped in a page. It is a system of contracts:

- what the user is trying to achieve;
- which context may be trusted;
- which tools may act;
- how uncertainty is represented;
- what gets evaluated;
- what happens when a step fails;
- where a human must approve;
- and what another engineer needs to safely inherit it.

The four projects below show the patterns I currently use to turn model capability into reliable product behaviour.

---

## 1. GitLaw: citations, not confident prose

### Problem

Legal RAG can produce answers that sound plausible while citing a paragraph that does not exist, has been repealed, or does not support the answer.

### System pattern

GitLaw separates retrieval, generation, and citation verification. The model does not get the final word on whether a citation is valid. A local verifier checks the requested paragraph against the indexed corpus and returns structured failure reasons such as `paragraph_not_found`.

### Evidence

- 5,936 German federal laws indexed at paragraph level
- 98,367 vectors plus BM25 hybrid retrieval
- 94,178 paragraph nodes and 200,464 graph edges
- 53/53 hand-labelled citation evaluation cases pass in CI
- central LLM gateway with schema validation, retries, exponential backoff, prompt attribution, token/cost logging, and distinct validation versus provider errors
- MCP tools expose search, exact lookup, citation verification, and graph traversal

### Why it matters

The trust layer is independent from the provider. A different model can be introduced without throwing away the retrieval tests, citation contract, or evaluation set.

Code: https://github.com/mikelninh/gitlaw

---

## 2. SafeVoice: bounded autonomy and visible responsibility

### Problem

A court-preparation workflow can save hours, but an unbounded agent that silently sends or invents legal certainty would create unacceptable risk.

### System pattern

SafeVoice’s Court-Prep Agent uses eight tools inside a bounded runtime:

- `max_iterations = 10`
- `max_cost_usd = 0.50`
- idempotency key per run, tool, and input hash
- agent-run and tool-call audit tables
- structured Pydantic outputs
- prompt version stored with every classification
- human checkpoint before any external send
- evaluation set executed when the prompt changes

### Evidence

- 35 real test cases for the classifier
- 12 permitted legal entries enforced server-side
- clean failure when safety refusal or schema validation fails; no weak regex fallback
- telemetry for model, tokens, cost, request ID, and prompt version
- court package produced in roughly 30 seconds versus roughly three hours of manual preparation

### Why it matters

The agent is allowed to prepare, route, and package. It is not allowed to hide uncertainty or cross the external-action boundary without a person.

Code: https://github.com/mikelninh/safevoice

---

## 3. Civic AI MCP Toolkit: capability transfer through a shared backbone

### Problem

After building several MCP servers, I found the same infrastructure repeating: server setup, transport selection, structured logs, health endpoints, error handling, and fixture loading.

### System pattern

I extracted the common shape into a reusable Python package:

- server factory
- `@traced` tool decorator with request ID, latency, and status
- structured error envelopes instead of transport-breaking exceptions
- health endpoint
- cached fixture loader
- stdio and SSE configuration
- CLI scaffolder for a complete new MCP project

### Evidence

- derived from six MCP systems
- 19/19 hermetic tests
- end-to-end test for the project scaffolder
- no network or model dependency in the core test suite

### Why it matters

The output is not only one working server. It is a capability other engineers can use to create the next server faster and with the same operational contract.

Code: https://github.com/mikelninh/civic-ai-mcp-toolkit

---

## 4. Agent Loop Lab: retry the failed step, not the universe

### Problem

Long-running AI workflows often repeat expensive model calls or create duplicate side effects after a partial failure.

### System pattern

The Agent Loop Lab uses Inngest to checkpoint each workflow step. A fixture intentionally fails the tracker write once. On retry, the completed fetch and draft steps are memoised; only the failed write step runs again. A permanently failing fixture exhausts retries and enters an explicit `onFailure` path without writing partial data.

### Evidence

- scheduled and event-triggered loop
- durable multi-step skill
- step-level observability
- retry budget and failure hook
- explainable fit score with a proof project attached to each capability

### Why it matters

Reliability is not merely “try/catch”. It is a runtime model that knows which work has already succeeded and which side effects must remain unique.

Code: https://github.com/mikelninh/agent-loop-lab

---

## The architecture I would bring to OH-SO

```text
Human experience
      ↓
Intent + constraints + approval state
      ↓
Context layer: documents · memory · permissions · freshness
      ↓
Durable orchestrator: state · checkpoints · retries · budgets
      ↓
MCP / API skills: typed actions and deterministic rules
      ↓
Evaluation and guardrails: assertions · judges · regression sets
      ↓
Decision receipt + observability + human escalation
```

The model provider remains replaceable. The contracts, evaluation data, observability, and reusable skills become the long-lived asset.

## A useful first contribution

A focused first contribution to an AI-brain MCP and skill library could be a shared evaluation contract:

```python
class SkillEvaluation(BaseModel):
    grounded: bool
    complete: bool
    actionable: bool
    safe: bool
    evidence: list[str]
    escalation_reason: str | None
```

Each skill would ship with:

1. a typed input and output contract;
2. golden and adversarial fixtures;
3. deterministic assertions where possible;
4. model-based judging only where necessary;
5. a cost, latency, and retry budget;
6. a documented human-approval boundary;
7. a small decision receipt that can be inspected by engineers, strategists, and clients.

That is how I understand agentic-first work: not more invisible automation, but more capable teams with clearer systems.
