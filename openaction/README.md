# OpenAction 0.2 — action + approval foundation

> **Information is not the goal. Human agency is.**

OpenAction is a tiny, provider-neutral contract for moving from evidence to a permission-aware action and back to a measurable outcome.

The key addition in 0.2 is the **Approval Path**: the non-technical work needed to make a real deployment possible becomes a first-class, inspectable object instead of a late-stage email chain.

## Try the first approval workspace

The first interactive reference implementation is a fully synthetic **CareOS hospital pilot**:

**[`workspace/`](./workspace/)**

It gives every stakeholder the same overall view while highlighting what matters to Clinical, IT, Privacy, Security, Workforce, Procurement and Regulatory/TI. It includes:

- shared pilot-readiness view
- role-aware Approval Graph
- evidence completeness per gate
- Trust Passport
- downloadable Adoption Package
- synthetic before/after benefits clearly separated from real pilot proof
- real metrics we intend to collect once a partner uses the workflow

There is no patient data, login or backend in this reference workspace.

## What OpenAction is

`evidence → proposed action → permissions → approval → execution → outcome`

## What OpenAction is not

It does **not** replace FHIR, ERP systems, government case-management, OAuth, CloudEvents, OpenTelemetry, GDPR processes, procurement law, medical-device regulation or human accountability.

It is the thin interoperability layer between them.

## 3 integration levels

### 1. JSON only

Produce an object that validates against [`spec/0.2/openaction.schema.json`](./spec/0.2/openaction.schema.json). No SDK or central server required.

### 2. Tiny SDK

```html
<script src="https://mikelninh.github.io/openaction/sdk/openaction.js"></script>
<script>
const action = OpenAction.create({
  kind: 'finance.invoice.review',
  label: 'Review invoice',
  reason: 'Invoice received; payment requires human review.',
  actor: {type:'service', id:'erp'},
  evidence: [{kind:'document', source:'invoice-1187'}],
  risk: 'medium',
  permissions: [],
  approval: {required:true, mode:'human', status:'pending'}
});
</script>
```

Exports: `create`, `assertValid`, `approve`, `complete`, `toCloudEvent`, `fromFHIRTask`.

### 3. Gateway / webhook

Implement [`openapi.yaml`](./openapi.yaml):

- `POST /v1/actions` — propose
- `POST /v1/actions/{id}/approve` — approve
- `POST /v1/actions/{id}/complete` — outcome
- optional CloudEvents lifecycle webhook

Organisations can run their own gateway. OpenAction does not require a central OpenAction cloud.

## Approval Path

[`approval-path.schema.json`](./spec/0.2/approval-path.schema.json) turns deployment friction into a visible graph.

Typical gates:

- intended purpose / scope
- AI Act role and risk assessment
- privacy / DPIA / DPA
- data rights and retention
- security review
- model, software and data licensing
- procurement
- works council / workforce participation
- domain regulation
- clinical safety / medical-device assessment where relevant
- quality and operations
- final accountable owner

OpenAction may **prepare evidence and route decisions**. It must never impersonate the authorised approver.

A gate therefore has an owner, required evidence, dependencies, blocking status and a decision record. This lets reviews run in parallel instead of being discovered one after another.

## Trust Passport

[`trust-passport.schema.json`](./spec/0.2/trust-passport.schema.json) packages the reusable evidence adopters repeatedly ask for:

- product/version + intended use
- architecture and data-flow map
- model/provider inventory
- data location, retention and subprocessors
- licences
- security controls
- AI Act assessment
- privacy assessment / DPIA status
- workforce consultation status
- domain-specific classification
- eval results and known limitations
- incident / rollback contacts

The goal is **answer once, reuse many times** — while every receiving organisation still makes its own accountable decision.

## Existing standards stay the source of truth

### Healthcare

FHIR remains the clinical interoperability layer. OpenAction maps only the workflow-level action that another authorised system needs. Clinical meaning and patient records stay in FHIR / the hospital systems.

### SMEs

ERP, CRM, email and accounting stay in place. Existing automations can emit or consume OpenAction JSON.

### Public administration

Official registers and case-management systems remain authoritative. OpenAction carries only the minimum action, evidence references, permissions and outcome needed for interoperability.

## Public proof before promises

We distinguish:

- **built:** schema, SDK, gateway contract, Approval Path, Trust Passport, CareOS workspace and cross-domain examples
- **demonstrated:** the same structure can represent healthcare, SME and public-service workflows, and generate a reusable adoption package
- **not yet proven:** adoption speed, cost savings, approval-time reduction and production reliability

Those become measurable pilot outcomes rather than marketing claims.

## First real-world pilot objective

Do **not** ask an organisation to approve the product in the first meeting. Ask them to:

1. confirm or correct the Approval Graph,
2. identify the accountable owner for each gate,
3. mark which evidence is reusable versus organisation-specific,
4. define the smallest bounded pilot they could responsibly approve,
5. measure approval lead time, duplicate evidence requests, late blockers and evidence reuse.

That turns the workspace itself into a testable product.

## Standards we deliberately compose with

- JSON Schema 2020-12 for validation
- CloudEvents 1.0-compatible lifecycle events
- OpenAPI 3.1 for a minimal HTTP gateway
- FHIR adapter pattern for healthcare workflow interoperability
- OpenTelemetry-compatible correlation IDs / future semantic conventions for observability

## License

AGPL-3.0-or-later for the reference implementation. Domain integrations can keep their own licences and infrastructure; the protocol is designed to remain provider-neutral and forkable.
