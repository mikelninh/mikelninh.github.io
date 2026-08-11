# OpenLeistung target architecture

## Product boundary

OpenLeistung is the orchestration and experience layer between people, public-sector base components and the responsible authority. It does not become the source of truth for identity, registers, payments or legal decisions.

## Target flow

1. A person authenticates with an approved identity component.
2. The service explains the outcome, required data and optional Once-Only retrieval.
3. With purpose-bound consent, adapters request evidence from official components.
4. The workflow evaluates deterministic preconditions and creates an explainable eligibility hint.
5. The case is transferred to the responsible authority with evidence provenance and open questions.
6. A caseworker reviews exceptions and makes the decision.
7. A decision or request is delivered through the approved mailbox and notification infrastructure.
8. Events remain attributable, time-bound and available for appeal, support and service improvement.

## Production components

| Component | Responsibility | v0.1 implementation |
|---|---|---|
| Citizen frontend | Accessible service journey | Static browser application |
| Service schema | Inputs, evidence, stages, rules and metrics | `service.json` |
| Rules service | Versioned deterministic hints | `rules.js` |
| Durable workflow | State, retries, deadlines and handoffs | Explicit in-browser state machine |
| Evidence gateway | Consent, provenance and official retrieval | Synthetic eID/NOOTS lookup |
| Caseworker workspace | Review, requests and human decision | Interactive synthetic view |
| Event ledger | Auditable case events | In-memory append-only log |
| D-Stack adapters | FIT-Connect, NOOTS, eID/EUDI, ZBDS, ZaPuk | Documented seams only |

## Non-negotiable production qualities

- WCAG 2.2 AA and assisted-digital access
- threat modelling, BSI-aligned security controls and privacy impact assessment
- data minimisation, purpose limitation and explicit retention rules
- tenant and role isolation with least privilege
- idempotent external actions and durable recovery
- human review of adverse and ambiguous outcomes
- complete decision provenance and legal-version history
- outcome metrics, not only launch metrics
- open interfaces and a credible long-term operating model

## Scaling model

The shared platform should remain small. Individual services contribute domain packs containing their schema, questions, evidence plan, rules, content, metrics and adapters. A domain pack can be reused across authorities while allowing explicitly versioned local differences.
