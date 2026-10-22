# INCA · H1 and H5 — last small decision models benchmark

**User goal:** Compare a dedicated Jev decision head with a dedicated GPT decision head (H1), and test four questions batched in one TypeSafe request versus both GPT JSON and individual sequential Jev calls (H5).

## Fair task and pre-registered targets

This is **new developer-authored fiction**: 40 canonical verified-fact bundles about five kinds of claims, 10 development cases + 30 fixed holdout cases with distinct phrasing. No model sees label, scenario or split metadata. The **upstream document extraction is assumed already successfully completed** (not measured), and a source-evidence verifier is mandatory for every route. No insurance approval, payout, customer contact, or real insurer integration.

Every case asks four questions about *exactly the same verified state*:

1. `specialist` — five whitelisted tools.
2. `next_action` — `CONTINUE_CHECKS`, `REQUEST_INFORMATION` or `HUMAN_REVIEW`.
3. `evidence_action` — none, missing-document request, discrepancy reconciliation, or suspicious-instruction review.
4. `priority` — routine/standard/urgent triage.

**H1 isolated decision:** Jev makes only `next_action`, GPT makes only `next_action`, and trivial rule code computes the same on all 40 cases. Count any unsupported model output as an error; check for critical under-escalations. Research targets: ≥95% authored-route accuracy, within 3 points of GPT, ≥40% shorter p95 model API time, ≥50% lower isolated API cost, and no worse critical misses. If simple code achieves the same quality, Jev is not a necessary component for this structured task.

**H5 combined decisions:** Jev asks all four typed `choice` questions in one request; GPT outputs all four in one strict JSON-schema response. For **12 pre-selected holdout cases** (all travel and home, across routine, missing, contradiction and suspicious-instruction examples), Jev also asks the exact four questions as **four sequential provider requests**, with all call times and tokens summed. Research targets: ≥30% cheaper **and** faster on a like-for-like four-decision task, no safety degradation. Comparing four sequential Jev calls against a single Jev call is an engineering optimization, but note the four input messages share state; this is not a multi-stage agent execution.

**Maximum 208 provider requests**: 40 Jev single + 40 GPT single + 40 Jev batched + 40 GPT batched + 12×4 sequential Jev calls. No retries. No previous H1/H5 results claimed.

## Cost and timing

Dated list-price assumptions (not vendor invoices): Jev $0.042 per million input tokens, GPT-4o mini $0.15 input + $0.60 output. Record actual provider tokens, actual returned revision and milliseconds for every request. Cost per *decision-only API call* is not cost per completed claim. Human review time, retries, extraction, source verification and workflow queues are not in these measurements.

## Reproduce and inspect

```bash
python -m unittest discover inca-proof/agent-ops -p 'test_*.py' -v
python inca-proof/agent-ops/jev_h1_h5.py --mode dry-run
```

The workflow is triggered only by the user-authorized `RUN_H1_H5_ONCE.md` marker and preserves all 40 records + scored outputs as a 30-day artifact. A public summary is published **only after examining the actual recorded responses**.

## Interpretation cautions

- Synthetic and rule-generatable facts are intentionally easy for rules. High performance does not establish claims-domain judgment.
- Dev/holdout variants share one scenario generator; not independent claims-professional labeling or unseen real-world distributions.
- H1 cannot be used to argue that Jev replaces GPT that already extracts **and** decides in one call.
- H5 measures four parallel bounded classifications on one immutable state, not planning multi-step work or reducing human reviewer effort.
- Count all unsuccessful calls and inaccurate decisions. Publish a negative result rather than improving only the prompt and calling the same holdout unseen.
