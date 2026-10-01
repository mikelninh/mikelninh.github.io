# CareOS × dexter health — application work sample

Independent work sample by Michael Ninh for dexter health's AI Engineer (LLM) role.

## Product idea

A deliberately small reference workflow for care documentation:

1. messy care note / transcript
2. typed LLM draft
3. deterministic schema + evidence validation
4. explicit fallback for ambiguity or malformed output
5. caregiver review
6. bounded write-back only after approval

The page contains three synthetic scenarios: morning handover, family call, and an uncertain-input failure case. No real patient or resident data is used.

## Reliability contract

Run:

```bash
node careos/dexter/eval.mjs
```

Current reference result:

```json
{
  "fixtures": 40,
  "schema": 40,
  "evidence": 40,
  "authority": 40,
  "failures": 0
}
```

These are deterministic workflow-invariant checks, not clinical model-performance claims.

## Dexter context

The work sample is shaped around dexter's public product direction: voice documentation, structured care records, SIS support with caregiver review, and quality workflows. Public metrics displayed on the page are linked directly to dexter's product page.

## Scope

This is not a dexter health product, not a clinical system, and not medical advice. It is a product/engineering proof showing how I approach LLM features where quality, evidence, fallback behaviour and user authority matter.
