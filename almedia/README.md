# Almedia — Junior Engineer (AI) proof

A focused proof for one problem named in the role: reducing repeated ad-hoc data requests by turning them into inspectable self-service workflows.

## Try it

https://mikelninh.github.io/almedia/

## The synthetic request

> Which campaigns need attention today? Flag campaigns below 1.0x ROAS or above EUR 8 per verified user.

This is a **synthetic UA-style fixture**, not Almedia internal data or a claim about Almedia's actual metrics.

## What actually runs

The browser loads three separate JSON sources:

- `data/campaign_spend.json` — campaign spend
- `data/verified_outcomes.json` — verified users
- `data/revenue.json` — revenue

It then:

1. resolves the required sources;
2. joins the rows on `campaign_id`;
3. computes `ROAS = revenue / spend`;
4. computes `cost_per_verified_user = spend / verified_users`;
5. applies the visible thresholds;
6. returns the result with source provenance.

The current fixture flags `Pocket Arena` because its synthetic ROAS is below 1.0x and its cost per verified user is above EUR 8.

## Failure test

Use **Remove revenue source** and run the request again.

The workflow blocks the answer because ROAS cannot be calculated. It does not invent the missing value or present a partial result as complete.

This failure path is covered by the repository's `Interactive hiring proof QA` browser test together with the normal successful path and the three source files.

## What this demonstrates

- a recurring business question represented as a self-service workflow;
- fragmented sources joined into one answer;
- deterministic transformations and business checks;
- visible provenance;
- fail-closed behaviour when a required source is unavailable;
- a workflow that can be tested by non-engineering users and inspected by engineers.

## What it does not prove

- production access to Almedia systems;
- Almedia's actual data model, metrics or thresholds;
- production scale, latency or adoption;
- that this exact browser implementation is the intended production architecture.

A production version would normally put connectors, permissions, query/metric definitions, observability and policy checks behind a service boundary rather than load static fixtures in the browser.

## Existing engineering foundation

The broader runtime pattern is implemented in [Digital Worker Factory](https://github.com/mikelninh/digital-worker-factory): capability gates, evidence requirements, human approval, traces and replayable failures. Its public cases are synthetic and explicitly positioned as pilot-ready engineering candidates rather than production-validated autonomy.

[PruefPilot](https://github.com/mikelninh/pruefpilot) is a second proof of turning fragmented inputs into structured, reviewable workflow state.

## How I would pilot this at Almedia

1. rank recurring data requests by frequency, handling time and business value;
2. choose one narrow question with stable source definitions;
3. run self-service answers in shadow mode beside the existing data-team answer;
4. measure corrections, latency, failure recovery and adoption;
5. turn material failures into regression cases before expanding scope.
