# Digitize Germany — reference architecture

## Mission

Make government feel like one coherent service rather than thousands of offices citizens must coordinate themselves.

The architecture is deliberately **federated**. It does not replace Germany's registers or specialist procedures. It coordinates trusted evidence, rules, workflow and status around life events while keeping legal authority and source-of-truth ownership explicit.

## Reuse before replacement

Germany already has important rails: BundID, NOOTS, specialist registers/procedures, emerging EUDI Wallet capabilities and federal standards for online access. V1 therefore assumes adapters around these systems instead of a new national master database.

## Core flow

```text
VERIFIED LIFE EVENT
        ↓
IDENTITY / VERIFIED ATTRIBUTES
        ↓
AUTHORITY + CONSENT POLICY
        ↓
SERVICE DISCOVERY
        ↓
EVIDENCE RETRIEVAL FROM AUTHORITATIVE SOURCES
        ↓
VERSIONED RULES / ELIGIBILITY / OBLIGATIONS
        ↓
OUTCOME ORCHESTRATOR
        ↓
BOUNDED AGENTS
        ↓
HUMAN AUTHORITY GATES WHEN REQUIRED
        ↓
ACTION / PAYMENT / DOCUMENT / STATUS
        ↓
AUDIT + OUTCOME EVIDENCE
```

## Why this shape

### 1. Life events are the user-facing unit
Citizens do not naturally think in ministry or authority boundaries. Birth, moving house, job loss, starting a company and caring for a relative are coherent goals. The system maps those goals to the authorities behind the scenes.

### 2. Source data stays with the source
A national coordination layer should not become a second shadow population register. Prefer signed claims, references and purpose-bound retrieval. This is compatible with the direction of once-only exchange and reduces drift, breach surface and reconciliation work.

### 3. Rules remain inspectable
Eligibility and obligations must be versioned and traceable. Models may explain and structure, but deterministic or otherwise formally governed policy services decide facts such as which rule version applies and whether a mandatory condition is satisfied.

### 4. Agents work inside capabilities
Agents are useful for research, retrieval, reconciliation, explanation, drafting, routing, retries and evidence packaging. They may not invent legal authority or silently cross a consequential boundary.

### 5. Exceptions are first-class
The goal is not 100% automation. The goal is high straight-through completion for safe standard cases and excellent exception handling for the rest.

## Reference birth journey

A hospital/birth centre emits or causes an authoritative birth record. The citizen workspace discovers related services, retrieves allowed evidence, evaluates what is known/missing, creates a service plan and asks the parent only for genuinely missing choices or evidence. Participating workflows then progress behind one status thread.

The standard reference case targets:

- one citizen review/confirmation interaction;
- zero citizen-carried birth certificates between participating services;
- one coherent status thread;
- source + rule + authority + approval evidence for every automated step.

These are **prototype targets**, not claims about current national production capability.

## Golden-case release gate

1. **Standard birth** — reuse evidence and prepare the full service plan without duplicate asks.
2. **Ambiguous family situation** — preserve uncertainty and request only the missing evidence.
3. **Dangerous mismatch / authority gap** — stop before consequential action and create a human review packet.

No mission milestone is called proven unless all three behaviors are exercised at the relevant integration level.

## Scaling beyond birth

The reusable architecture should survive additional journeys without changing its core trust model:

- moving home;
- losing a job;
- starting a company;
- disability / care needs;
- death of a relative;
- hospital admission and discharge.

If each new journey requires new identity, consent, evidence exchange, audit or agent-authority infrastructure, the platform architecture has failed to become reusable.

## Hospitals

The same primitives transfer into CareOS:

```text
patient identity
→ consent / authority
→ source clinical systems
→ provenance-preserving context
→ versioned rules / policy
→ workflow + bounded agents
→ clinician authority gate
→ action / documentation
→ audit + outcome
```

The domain rules differ. The trust architecture should not.
