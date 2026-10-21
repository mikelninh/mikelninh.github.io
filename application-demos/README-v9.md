# FINAL v9 · Two application proofs

**A usable decision in 60 seconds, followed by evidence and honest limits.**

## A11 — BIDPILOT
**User problem:** A small software team spends time reading public tenders before discovering it has no relevant experience or lacks documents.

**Try it:** [BIDPILOT](https://mikelninh.github.io/application-demos/?demo=bidpilot). The first screen shows a plausible opportunity and a potentially blocking requirement. Change the example company to an AI team or IT-operations company; the recommendation changes. Every recommendation has its original publication link and is derived from the actual procurement subject, not generic category words. You can declare references and documents, override the decision, and export your decision note.

**Product rationale:** Show the decision before the search form. An early, intelligible warning is more useful than a wall of results. This is a hypothesis, not measured time savings.

**Evidence and boundaries:** Limited 549-notice public import dated October 20, 2026; only one procurement has additional publicly summarized participation criteria. The app filters by current deadlines, which means results will decrease as the snapshot ages. It cannot decide legal eligibility or success probability. If the feed fails, it falls back to **three explicitly labeled offline examples**. No user-entered data is sent to a remote service.

## SNOCKS — RETURN LOOP
**User problem:** Repeated quality complaints can get lost in single-ticket support workflows.

**Try it:** [RETURN LOOP](https://mikelninh.github.io/application-demos/?demo=return-loop). On entry, 20 synthetic customer messages are scored by two methods (rules and a genuinely trained character/word n-gram Naive Bayes model). Both methods agree on seven possible material complaints for socks. Eight messages have disagreement and two have no product assignment; these remain visible for review. Drill down into every example, correct classifications or product assignment, prepare a human review note, and download a report including original messages and local edit events. Optionally paste a new message or import anonymized CSV; the CSV parser correctly handles quoted commas.

**Model evaluation:** Naive Bayes trained in-browser on **136 human-authored synthetic labeled sentences**, evaluated on **29 separate synthetic sentences**. Naive Bayes **19/29** correct, rule baseline **15/29** correct. These are developer-authored examples, **not** real-world generalization, independently collected evaluation, calibrated probabilities, or a production acceptance threshold. The classifier is **not an LLM** and the public demo is **not connected** to the separate FastAPI/SQLite backend.

**Safety:** No customer messages, refunds, shop orders or approvals are transmitted to an external system. Data from the demo is temporary and local to the page. A pattern of complaints is an alert to inspect, not proof of a defective product. Grouping uses a provisional four-message threshold.

## Reproduce

From this GitHub repository:

\`\`\`bash
node application-demos/tests-v9.cjs
\`\`\`

The suite covers data provenance, specific exclusion warnings, profile-sensitive results, honest zero matches, synthetic model evaluation, support signal counting, override effects, product routing and CSV edge cases.

## Release gate

- [x] Focused 60-second experience, sourced outcomes
- [x] Source-level scripted interaction tests and reproducible domain tests
- [x] Honest technical limitations and documented synthetic error cases
- [ ] Independent desktop/mobile testing by uninvolved users
- [ ] Observed use by five people and measured time saved / quality on real data

Until the final two items are measured, do not claim verified end-user utility or production readiness.