# OpenLeistung v0.1

**Public services, end to end.**

OpenLeistung is an open-source reference implementation for complete, understandable and human-controlled public services in Germany. Version 0.1 demonstrates a synthetic Berlin workflow for participation in communal school lunch.

It is not an official government service, does not access public registers, does not process real personal data and cannot issue a legally effective decision.

## Why this exists

German public infrastructure is converging around shared D-Stack components:

- identity and trust: eID / EUDI Wallet
- data transport: FIT-Connect
- evidence retrieval: NOOTS
- payment: ZBDS
- mailbox and notification: ZaPuk

OpenLeistung explores the missing service layer that connects these primitives to a coherent journey for citizens and caseworkers. It reuses the ideas of the German Service Standard, KERN, Once Only, digital-ready legislation and public-code collaboration rather than proposing another isolated portal.

## What v0.1 proves

- a guided citizen application using synthetic data
- explicit consent before a simulated register lookup
- versioned and testable eligibility hints
- evidence provenance and visible missing information
- a structured caseworker view
- human approval before any consequential outcome
- a citizen status timeline and structured requests for information
- an append-only in-browser audit trail
- a machine-readable service contract in `service.json`
- deterministic workflow and rule tests

## Run locally

From the repository root:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000/openleistung/`.

## Run tests

```bash
node --test openleistung/tests/*.test.mjs
```

## Repository map

```text
openleistung/
├── index.html          Citizen, status, caseworker and architecture UI
├── app.js              End-to-end interaction and state transitions
├── rules.js            Versioned demonstration rules and evidence plan
├── service.json        Machine-readable service contract
├── styles.css          Responsive and accessible presentation layer
├── tests/              Rule and workflow regression scenarios
├── ARCHITECTURE.md     Production target and integration boundaries
└── LICENSE             EUPL-1.2-or-later notice
```

## Safety and legal boundaries

1. Positive or negative hints are not legal decisions.
2. Every final decision has a human gate.
3. Register access is simulated and requires visible consent.
4. All names and records in the demo are synthetic.
5. Legal references are displayed for traceability but require validation by the responsible authority before a pilot.
6. A production pilot requires a public-sector data controller, security and privacy review, accessibility testing, operating model and formal D-Stack sandbox access.

## Proposed pilot path

1. Validate the service journey with families, schools and caseworkers.
2. Replace the demonstration rules with a jointly owned, versioned ruleset.
3. Connect only to official sandboxes, beginning with identity and evidence retrieval.
4. Pilot in one responsible authority with assisted-digital support.
5. Measure completion, missing-evidence rate, processing time, review rate and user confidence.
6. Publish reusable components and findings on openCode.

## Contributing

Issues should describe the user or operator problem, the affected stage, expected evidence and the cost of failure. Contributions should keep domain rules separate from transport and UI, add regression scenarios for behaviour changes, and preserve a non-digital route.

## Licence

Licensed under the European Union Public Licence, version 1.2 or later (`EUPL-1.2-or-later`). See `LICENSE`.
