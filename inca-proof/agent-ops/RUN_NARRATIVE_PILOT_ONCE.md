# One-time consented INCA narrative AI test

User requested: "let's do a real test ... show and prove that it works ... realistic cases".
This file is the deliberate one-time trigger for workflow
`.github/workflows/inca-narrative-pilot.yml` on `main`.

- Exactly six developer-authored, fictional narrative cases.
- At most six gpt-4o-mini requests (one per case, no retries).
- Existing repository secret OPENAI_API_KEY; no credentials in source.
- Results saved as an Actions artifact for 30 days; never automatically published.
- No real clients, claim mutations, communications or insurance approval.
- Provider billing is unknown until separately verified.
- This trigger will NOT be edited to rerun silently.

Date: 2026-10-21.

## Corrected authorized attempt

The first attempt failed locally before any successful provider response because the workflow introduced a backslash before the GitHub secret. The artifact name was also malformed. This commit reruns the same six fictional cases once after correcting those expressions, with the same six-request ceiling and no automatic retries within the runner. Keep both run histories.
