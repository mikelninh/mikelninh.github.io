# Almedia — Junior Engineer (AI) application package

Role status checked 2026-09-05: publicly listed in Berlin, full-time, on-site, salary range EUR 60k–75k.

## Role thesis

Almedia is not primarily asking for an ML researcher. The role is an AI-native engineering / data-automation role:

- debug and maintain data automations;
- build agents for repeatable data tasks end to end;
- work across fragmented data sources and systems;
- collaborate with business stakeholders to remove manual data bottlenecks;
- build self-service data access.

Must-haves emphasise hands-on AI-agent / LLM use, coding fundamentals, business mindset and curiosity. Python or Node.js, orchestration tooling and SQL are nice-to-haves.

## Why Michael fits

### 1. Exact role-specific proof

**Almedia Self-Service Data Proof** targets the role's stated problem rather than a generic chatbot demo.

Synthetic flow:

`business question → 3 fragmented sources → join → deterministic metrics → threshold checks → provenance → reusable check`

Failure test:

`remove required revenue source → block answer rather than guess`

Live: https://mikelninh.github.io/almedia/

### 2. Agent engineering foundation

Digital Worker Factory demonstrates reusable agent infrastructure: capability gates, required evidence, human release, fail-closed behaviour and replayable failures.

A published 100-case synthetic release run completed without runtime errors, unsafe executions or false execution claims.

### 3. Data / debugging / evaluation foundation

DRV SignalLab demonstrates Python-based deterministic data processing, data quality, drift checks, statistical uncertainty and regression-tested golden cases over 50,000 synthetic records.

SafeTrace demonstrates evaluation discipline and explicit abstention when evidence is ambiguous instead of forcing a confident answer.

### 4. Business mindset

Founder, product/business-development and high-tempo operations experience supports the part of the role that requires going to stakeholders, understanding the bottleneck and building the useful thing rather than only the technically interesting thing.

## Recommended CV

Use `almedia/cv.html` rather than the generic master CV.

Selection order:

1. Almedia Self-Service Data Proof
2. Digital Worker Factory
3. DRV SignalLab
4. SafeTrace Entity Resolution
5. TrustReady as secondary evidence only

The target CV deliberately foregrounds self-service data, agents, Python/Node.js, SQL/structured data and business workflow thinking.

## Short application note — recommended

Hi Almedia team,

Your Junior Engineer (AI) role stood out because the problem is unusually concrete: reduce recurring ad-hoc data work by building agents and self-service workflows across fragmented sources.

I built a small proof specifically around that bottleneck. A stakeholder asks which campaigns need attention; the workflow loads three separate synthetic sources, joins them, computes the required metrics, returns provenance, and turns the recurring request into a reusable check. If a required source is removed, it fails closed instead of inventing an answer.

Proof: https://mikelninh.github.io/almedia/

My broader work is in agentic systems, automation and evaluation. I use coding agents heavily, while owning architecture, autonomy boundaries, tests/evals and evidence. Before AI engineering I also worked as a founder, in product/business development and in operations, so I naturally start from the business bottleneck.

I’d love to discuss how I could apply that approach inside Almedia’s data team.

Michael Ninh
https://mikelninh.github.io/

## Ultra-short form answer — “Why Almedia / Why this role?”

The role combines exactly the work I enjoy most: finding repetitive business/data bottlenecks and turning them into reliable agentic workflows. I built a role-specific self-service data proof around Almedia’s stated problem — fragmented sources, recurring requests, deterministic checks and fail-closed behaviour — because I wanted to demonstrate how I would approach the job rather than only describe it.

## “Why you?” / profile answer

I bring an unusual combination for a junior AI role: hands-on agent/LLM engineering plus founder, product and operations experience. My projects focus on bounded agents, fragmented data, evaluation and self-service workflows, and I use AI coding agents every day. I am comfortable moving quickly, but I care about visible evidence and failure behaviour rather than pretending an automation worked when it did not.

## Salary

The advertised range is **EUR 60,000–75,000**. If a single expectation is required, use **EUR 68,000 gross/year** as a balanced target inside the stated band unless there is a reason to optimise differently at submission time.

## Availability

Do not invent a start date. Use the user's actual current availability when the form asks.

## Proof links

- Targeted proof: https://mikelninh.github.io/almedia/
- Portfolio: https://mikelninh.github.io/
- Targeted web CV after merge: https://mikelninh.github.io/almedia/cv.html
- GitHub: https://github.com/mikelninh
- Digital Worker Factory: https://github.com/mikelninh/digital-worker-factory
- DRV SignalLab: https://github.com/mikelninh/drv-signallab

## Submission rule

Do not attach a pile of projects. The application should make one argument:

> **I understood the bottleneck in your role and built a small, inspectable version of the solution.**

Primary proof = Almedia self-service workflow. Portfolio/GitHub are supporting evidence.
