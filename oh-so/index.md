# Michael Ninh — Agentic Engineer

**Berlin · available immediately · German C2 · English C1**

I build agentic systems with RAG, MCP, structured outputs, evaluations, guardrails, observability, and durable workflows — designed for real users, changing requirements, and recoverable failure.

- Portfolio: https://mikelninh.github.io/oh-so/
- GitHub: https://github.com/mikelninh
- LinkedIn: https://www.linkedin.com/in/michael-ninh
- Email: mikel_ninh@yahoo.de
- CV: ./Michael_Ninh_OH-SO_Agentic_Engineer_CV.md
- Work sample: ./Michael_Ninh_OH-SO_Work_Sample.md

## Shipped proof

### GitLaw — RAG + MCP + evaluation

Legal knowledge and workflow system with verified citations, hybrid retrieval, structured failure modes, a reusable MCP surface, and a closed-beta workflow tier in pilot with a Berlin law firm.

- 5,936 German federal laws indexed
- 98,367 FAISS vectors
- 94,178 citation-graph nodes
- 53/53 hand-labelled citation evaluation cases pass in CI
- Python, React, TypeScript, FAISS, BM25, MCP, AWS ECS/Fargate, Terraform
- Code: https://github.com/mikelninh/gitlaw

### SafeVoice — bounded agent + human checkpoint

Agentic court-preparation workflow with eight tools, idempotent tool calls, explicit iteration and cost limits, audit tables, and a human checkpoint before any external send.

- 35 real evaluation cases
- Eight-tool Court-Prep Agent
- Approx. 30 seconds versus approx. three hours of manual preparation
- FastAPI, Pydantic structured outputs, telemetry, prompt versioning
- Code: https://github.com/mikelninh/safevoice

### Civic AI MCP Toolkit — shared backbone

Reusable Python package extracted from six MCP servers: server factory, traced tools, JSON logs, error envelopes, health checks, fixture loading, and a CLI scaffolder.

- 19/19 hermetic tests
- One-command server scaffolding
- Code: https://github.com/mikelninh/civic-ai-mcp-toolkit

### Agent Loop Lab — durable orchestration

TypeScript + Inngest workflow where every step is checkpointed. When a tracker write fails, only that step retries; completed work is memoised and duplicate LLM calls are avoided.

- Step-level checkpoints
- Explicit retry and onFailure path
- Explainable fit scoring with evidence
- Code: https://github.com/mikelninh/agent-loop-lab

## Integration shape

1. **Human interface** — clear intent, uncertainty, approval, and recovery states.
2. **Retrieval layer** — documents, memory, permissions, freshness, and citations.
3. **Orchestrator** — state, checkpoints, retries, budgets, and hand-offs.
4. **MCP skills** — typed tools, APIs, deterministic rules, and reusable capabilities.
5. **Evaluation** — assertions, judges, regression sets, receipts, and escalation.

Cross-cutting rails: observability, security, prompt/version contracts, cost and latency tracking, audit trails, and documentation for inheritance.

## Why OH-SO

OH-SO’s two tracks — Experiences and Systems — match how I work.

**Experiences:** I care about interaction, copy, hierarchy, performance, and the moment a user understands the next step.

**Systems:** I treat prompts, tools, retrieval, evaluations, and error paths as versioned software. The model is a component, not the architecture.

I am early in my formal AI-engineering career, but already comfortable owning a useful slice end to end: clarify the problem, build the flow, expose the failure paths, prove quality, and improve it with the team.

## Working principles

- Ask the purpose and name the constraint.
- Ship the smallest proof of the risky assumption.
- Evaluate before believing.
- Show rough work and invite challenge.
- Leave reusable skills, clear contracts, and fewer heroic dependencies.
