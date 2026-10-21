# INCA · Real model evidence pilot

**Purpose:** Demonstrate where AI genuinely contributes: selecting one relevant specialist check *without being told the claim category* and extracting a quoted fact from each of two narrative-style documents.

Six **fictional but natural-language** claims span travel, water damage, theft, liability and repair invoices, with a prompt injection edge case. All customer records, names and companies in this experiment are invented. Not an insurer's live case, independent gold set or proof of generalization.

## Real-life documents behind the sources

| Scenario | Document 1 | Document 2 |
|---|---|---|
| Trip cancellation | Customer's email about cancelling a trip | Travel provider cancellation confirmation |
| Water damage | Customer's damage description | Claims portal evidence checklist |
| Bicycle theft | Police incident report | Retailer purchase receipt |
| Liability | Insured person's statement | Other party's statement |
| Electronics | Customer reimbursement email | Repair shop final invoice |
| Suspected injection | Forwarded customer email | Hotel provider cancellation receipt |

## Four responsibilities

**AI**: reads both unstructured narratives, picks a specialist check from five allowed tools, and provides exact supporting quotations and literal field values. The model is NOT told the correct category or route. It is allowed to suggest, not authorize.

**Verifier**: independently checks literal quotations against the original documents and normalizes limited dates, identifiers, invoice amounts or statuses. Missing/fabricated/inconsistent quotes block model-driven clearance. We intentionally use narrow validators; no insurance policy reasoning is implied.

**Safety guard**: independently checks prompt injection and controls which bounded route is allowed (human review, request information, or continue remaining checks). A matching identifier never equals coverage approval.

**Human claims specialist**: resolves discrepancies and independently checks policy, identity, coverage and the original documents. No actual handoff, message or claim mutation is performed.

## Observed, actual model results (October 21, 2026)

**First authenticated live run:** [#39648228687](https://github.com/mikelninh/mikelninh.github.io/actions/runs/39648228687) — 6 actual GPT-4o mini responses, 4/6 source-grounded outputs matching the authored route, two blocked (missing-photo status and disputed liability statement).

**Retest after prompt improvement:** [#39648745136](https://github.com/mikelninh/mikelninh.github.io/actions/runs/39648745136) — 6 actual model responses, 6/6 correct specialist selections, **5/6** fully verified and matched the authored route, **1/6 blocked**. The remaining water-damage case changed `haven't taken` into `not taken` in its extracted value, violating our exact-substring evidence policy. Independent guard correctly rejected the model proposal. Neither run sent any claim action or approved coverage. Cost fields remain unknown.

The **same six inspected developer-authored cases** were used for both runs. Improvement from 4/6 to 5/6 is *development learning*, **not independent accuracy evidence**. More independently authored and professionally labelled examples are needed before using this approach on actual claims.

**Public, reviewed proof:** https://mikelninh.github.io/inca/real-model-proof.json

## Live test details

`narrative_pilot.py` makes **at most six gpt-4o-mini requests**, one per case, with no retries, only if a user deliberately opts into the dedicated one-shot GitHub Action. It saves the original responses, validation failures, timing and token counts in an artifact. The GitHub Actions job may fail if model outputs are ungrounded: **failure is evidence, not a reason to change the result secretly**. Provider costs aren't provided and are recorded as unknown.

The authored `expected_route` is independent of the model prompt. However, both examples and labels are developer-authored; this small suite is intended as engineering demonstration, not third-party accuracy assessment.

```bash
python -m unittest discover inca-proof/agent-ops -p 'test_*.py' -v
python inca-proof/agent-ops/narrative_pilot.py --mode dry-run
```

Public UI is a separate read-only replay. Any published model-result panel must reference the exact archived workflow run, show failures, and never imply model inference happens when the page is clicked.

The deterministic 1.1 baseline checks labelled fields and typically cannot extract implicit facts from this natural-language suite. This is an intentional **format challenge**, not a production-ready model accuracy victory.
