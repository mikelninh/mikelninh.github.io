# ESCRIBA — AI Enablement Work Sample

Independent application work sample by Michael Ninh for the **AI Enablement Engineer (m/w/d)** role in Berlin.

## What this demonstrates

The public role description emphasizes:

- finding high-leverage AI use cases across Finance, HR, Operations and Sales
- building useful internal MVPs quickly with AI coding tools
- deciding when AI is appropriate and where deterministic logic should come first
- maintaining Markdown specs, prompt libraries, templates and guardrails
- enabling colleagues to use modern AI tools in practice

This proof turns that operating loop into a small, inspectable workflow.

## Synthetic backlog

Three fictional internal use cases are scored on:

- repetition / volume
- data readiness
- business value
- AI fit
- inverse risk

The deterministic scorer recommends **invoice exception triage** first because it combines high repetition, measurable outcomes and a bounded human-review path.

The proposed system shape deliberately uses deterministic matching before an LLM is allowed to handle ambiguous exceptions.

## Run the prioritizer

```bash
python escriba-proof/prioritize.py
```

The script reads `use_cases.json`, applies the published weights and regenerates `report.json`.

## Reusable enablement artifacts

A useful internal MVP should ship with more than code:

- `AI Use-Case Brief.md` — problem, user, data, acceptance criteria, owner
- `Release Checklist.md` — source scope, PII handling, external-action boundary, fallback
- prompt + eval pairs — reusable prompts tied to examples and failure cases
- team quickstart — when to use the tool, when not to, and how to report failure
- pilot scorecard — handling time, corrections, escalation rate, false completion, adoption

## Claim discipline

- Synthetic scenarios only.
- No ESCRIBA customer or internal data is used.
- The ranking is a demonstration of prioritization logic, not measured business impact.
- The deeper bounded-agent implementation pattern is shown in Digital Worker Factory.

Engineering depth: https://github.com/mikelninh/digital-worker-factory

Public work sample: https://mikelninh.github.io/escriba/
