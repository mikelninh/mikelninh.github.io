# BIDPILOT — 3-minute first-value product study (v1.3)

**Try it:** [BIDPILOT user task](https://mikelninh.github.io/bidpilot/#product-study)

## Product question

Can a small business find **one personally relevant procurement opportunity** quickly enough to justify coming back? The goal is a short, honest test, not to make the interface look busy.

### Voluntary task

> Imagine you run a small B2B studio or service business. Use BIDPILOT to identify one tender that looks worth further investigation. You don't have to prove eligibility or submit a bid. Please say what helped and what was confusing.

1. Open the link, choose variant **A — Current experience** or **B — Guided** (assign in advance if comparing people).
2. Start the task. Read the current source-backed shortlist or adjust the business profile.
3. Open a tender to inspect it. The study records the actual TED notice ID, not an invented opportunity.
4. Decide **Yes, worth reviewing** or **No useful opportunity found**. A positive result is disallowed until a real notice has been inspected.
5. Download the resulting **JSON** file and, if willing, send it to the person running the pilot. Without explicit sharing, no session data leaves the browser.

## Measurements

- **Time to first value:** time from Start until the participant confirms a TED notice as worth reviewing.
- Inspected notice count; time to first inspection; success or no match; 3-minute target met or missed.
- Self-reported relevance, **not** proof of legal tender eligibility.
- Source coverage/freshness and understandable fit explanations are separate concerns.

The JSON is entirely local. No tracking pixel, customer account, remote telemetry, fake A/B traffic or centralised analytics. Selecting A vs B only changes study instructions; it does not alter the ranking algorithm. This is a *qualitative comparative study*, **not** an A/B efficacy claim.

## Suggested pilot (not completed yet)

Ask 5 voluntary people who might actually use public procurement information. Try alternating A/B by participant. Observe where they hesitate, whether they understand the source links, and whether they can explain why a tender is relevant. Do not coach during the task. Collect their JSON reports with permission and ask what they would change. Review **all** failures.

Pilot hypotheses: a relevant opportunity may be found in ≤ 3 minutes; guided orientation may reduce confusion. Both are **unverified**.

## Reproducible engineering gates

- [Session state and tests](study.js) · [6 new regression tests](test_study.cjs)
- [Existing ranking and browser-free UI tests](test_ui.cjs)
- [CI workflow](../.github/workflows/bidpilot-product-gate.yml) · [Passing v1.3 run](https://github.com/mikelninh/mikelninh.github.io/actions/runs/38721298850)
- Current public feed is fetched from [notices.json](notices.json), an imported TED snapshot, not a live suitability or eligibility assessment.

## Honest limitations

No human usability outcomes collected here yet. No verified conversion improvement, bid acceptance, saved business time or causal experiment. The participant's 'worth reviewing' selection may be wrong; evidence/eligibility still require checking the official TED record and full tender documents.
