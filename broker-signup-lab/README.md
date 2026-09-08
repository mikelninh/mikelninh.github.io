# Broker Signup Lab

**Wo verlieren wir Nutzer — und warum?**

Independent Tech Analyst work sample by Michael Ninh. The demo generates 10,000 deterministic synthetic broker-signup cases, identifies the largest influenceable drop-off, isolates a provider/device hotspot, and translates the finding into a concrete resumable identity-flow user story with acceptance criteria.

## Reviewer path

1. Read the funnel in 10 seconds.
2. See the root-cause and segment diagnosis.
3. Inspect the chosen intervention and model assumption.
4. Read the user story and acceptance criteria.
5. Run the deterministic test contract.

## Run locally

```bash
python -m http.server 8080
# open http://localhost:8080/broker-signup-lab/
```

## Verify

```bash
cd broker-signup-lab
node test.mjs
```

## Deliberate constraints

- synthetic data only
- no DKB or real broker data
- no copied bank UI or production architecture claims
- modeled uplift is a prioritization hypothesis, not an observed experiment result
- compliance and identity mismatches remain hard review boundaries
