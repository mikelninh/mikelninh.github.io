# INCA A/B/C comparison · one-time authorized API test

User asked to build and genuinely compare three architectures as the final INCA work sample:
A · verified GPT evidence only
B · the same GPT evidence plus Jev attention routing
C · Jev-first and GPT selectively, without skipping mandatory evidence verification

Trigger exactly one GitHub Actions run on main for the bounded
`.github/workflows/inca-abc-comparison.yml` workflow.

This run uses six **developer-authored fictional narrative insurance claims**,
with at most **six GPT-4o mini + six Jev requests**. The repository's configured
OPENAI_API_KEY and TYPESAFE_API_KEY secrets remain hidden.

No retries, real insurer data, customer communication, payout, claims mutation,
or production deployment. Full model results archived as an Actions artifact.
The C branch is an explicitly named counterfactual replay with mandatory manual
verification for any skipped evidence extraction.

Date: 2026-10-21.
