# ST-104 · Synthetic Claims Quality SOP

> Independent INCA application work sample. This procedure is an illustrative training artefact, **not an INCA-approved SOP or insurance policy**.

## Goal and boundary

Keep conflicting or missing cancellation dates from being mistaken for a cleared claim. One small check is not a coverage decision, legal determination, insurer notification, or payment approval.

## Trigger

The operator reviews two synthetic texts: a customer cancellation notice and a booking system record. Each should contain an explicit labelled cancellation date. The review widget runs browser-local deterministic parsing, not an LLM.

## Process

| Stage | Operator action | Evidence / output |
| --- | --- | --- |
| 1. Intake | Confirm two distinct text sources exist; do not use personal or production records in this demo | Source A, Source B |
| 2. Verify | Extract date labels and check date validity and agreement | Source-labelled excerpts and normalized dates |
| 3. Decide | Missing or invalid → NEED_INFO; contradictory → HUMAN_REVIEW; matching → CONTINUE_CHECKS only | Route and reason |
| 4. Escalate | On HUMAN_REVIEW, pause automatic clearance; assign to a claims expert with the exact contradictory excerpts | Handoff with issue and suggested next step |
| 5. Communicate | Draft a neutral client update but require insurer policy and human verification before sending | **Unsent** customer draft |
| 6. Record feedback | If reviewer disagrees, capture corrected expected route plus a reason | Downloadable candidate JSON fixture |
| 7. Regression | Independently review fixture before adding it to a test set; never count an inspected case as new independent holdout | Versioned future regression test |
| 8. Handoff | Confirm a named owner, next action, handback condition and documented outcome in a real implementation | Not implemented in this browser demo |

## Quality measures worth tracking in a real pilot

- **Incorrect automatic clearance:** number of later-confirmed unsafe auto routes divided by independently adjudicated cases
- **Unnecessary escalation:** cases sent to human review despite no genuine blocker, divided by reviewed cases
- **Evidence traceability:** percentage of routes with valid, source-labelled original excerpts
- **Review completeness:** percentage of escalations with a reason, an owner and a next action
- **Turnaround and correction time:** include human review and rework, not just AI latency
- **Customer communication quality:** unsupported claims, confusing wording and reviewer edits

The application has not measured these pilot KPIs on insurer data. No quality claim about 10,000 production cases is made.

## Escalation acceptance check

A human-review task is ready only when:

- the contradiction has been stated precisely;
- both date excerpts and source labels are attached;
- no coverage or payment approval was executed;
- the expected reviewer action is explicit; and
- unresolved information remains visible.

## Release gate

Do not broaden automation based solely on a handful of synthetic cases or correct routing alone. Include independently held-out claim samples, false positives, structured-output errors, prompt injection, new model versions and human adjudications. Failed cases become versioned regression fixtures only after review.

## Demo links

- [Interactive case workshop](https://mikelninh.github.io/inca/60s.html#case-workshop)
- [Measured five-case-per-model API pilot](../model-eval/reports/RESULTS_2026-10-20.md)
- [Implementation and executable tests](../../inca/)
