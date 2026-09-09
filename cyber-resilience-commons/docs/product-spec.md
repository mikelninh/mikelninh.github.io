# Product Spec

## V1 capabilities
- choose one of five synthetic organization templates;
- choose one of five safe incident scenarios;
- toggle eight defensive boundaries;
- deterministically simulate the same incident path;
- show impact reached before containment;
- compare template baseline vs current controls;
- rank disabled controls by modeled impact reduction across scenarios;
- show recovery planning assumptions;
- print a resilience brief.

## Non-goals
- no real-target scanning;
- no exploit execution;
- no vulnerability claim;
- no universal risk/security score;
- no certification or compliance attestation.

## Acceptance
1. Strong baseline contains stolen credentials before impact.
2. Ransomware scenario always assumes at least one compromised endpoint.
3. Recommendations only include disabled controls that materially change a modeled outcome.
4. The UI states the synthetic truth boundary prominently.
5. Desktop and mobile flows remain usable.
