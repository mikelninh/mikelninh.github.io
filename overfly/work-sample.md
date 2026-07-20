# Applied AI Reliability Kit

**A practical first contribution for Overfly**

Overfly helps enterprises move from valuable use case to production. The recurring risk is that each prototype invents its own prompt structure, evaluation logic, telemetry and approval boundary. I would explore a lightweight kit that speeds up delivery while preserving project-specific freedom.

## Six reusable pieces

1. **Use-case canvas** - user, decision, current cost, evidence, action, risk and measurable success.
2. **Typed skill contract** - explicit inputs, outputs, permissions, failure states and human checkpoint.
3. **Golden-set harness** - representative, adversarial and edge cases with deterministic assertions first.
4. **Operational rails** - prompt/model version, latency, cost, retries, idempotency and tool-call logs.
5. **Decision receipt** - concise record of evidence, assumptions, uncertainty and action taken.
6. **Handover pack** - architecture decision, runbook, eval set, known limits and next experiments.

## Why I can contribute

- GitLaw implements hybrid retrieval, local citation verification and CI evaluation.
- SafeVoice implements bounded autonomy, audit trails and human approval.
- Agent Loop Lab implements checkpoints and selective retry.
- Civic AI MCP Toolkit turns repeated infrastructure into a tested shared package.

The kit should not become a heavy framework. Its purpose is to help a small team answer four questions early: **Is it useful? Is it grounded? Does it recover? Can the client inherit it?**
