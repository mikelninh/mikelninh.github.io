# SafeTrace · UVgO Reform Tracker 2026

Germany-first public-accountability tracker for the 2026 reform of the Unterschwellenvergabeordnung (UVgO).

## What it does

- separates official facts, draft provisions, secondary analysis and evidence gaps
- maintains a dated evidence log
- tracks the public consultation deadline (28 Aug 2026)
- exposes stakeholder positions without implying influence or wrongdoing
- defines post-reform outcome metrics
- exports the evidence log as JSON/CSV

## Data model

All case data lives in `data.js`. Each claim has a `type`, legal/status label, source id and confidence. Sources are ranked Tier 1 (official primary) or Tier 2 (reputable secondary analysis).

## Guardrail

A documented relationship, consultation response, lobbying activity or temporal overlap is not evidence of improper influence. Missing public evidence is recorded as a gap, not treated as proof of non-compliance.

## Production next steps

1. ingest newly published consultation responses and final UVgO automatically
2. hash/version source documents and store diffs
3. add reviewer approval before public status changes
4. connect procurement outcome data after implementation
