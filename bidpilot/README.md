# BID✳PILOT 1.2 — Calm opportunity desk

**Live site:** https://mikelninh.github.io/bidpilot/ (updated when v1.2 merges)

The first screen now offers up to **three actual source-linked competition notices** and **one next-best verification action**, instead of requiring users to sift through 550+ source notices and many filters. No invented leads, eligibility claims, or win probability.

## Release 1.2 improvements

- Editorial landing dashboard with a profile summary, up to three real top-ranked opportunities, explicit source links and one next best action.
- Source-backed deterministic shortlist uses notice type, published upcoming lot/participation date, local keyword matching, risk flags and saved no-bid decisions. Hard excludes prevent results, call-offs and expired/missing/far-out dates from appearing as recommended opportunities.
- Honest sample profile indicator until saved; responsive tablet/mobile layout and native disclosure for the full legacy workflow.
- Prior settings, favourites, notes, decisions and CSV exports are preserved. Everything stays in browser localStorage.
- All ranking terms, confidence boundaries, empty/stale/loading states, accessibility requirements and pilot release gates are in [the UX specification](./UX-SPEC-1.2.md).
- Added pure JavaScript ranking module `priority.js` with unit tests and browser-less dashboard smoke tests.

**Run tests:**
~~~bash
python -m unittest discover -s bidpilot -p "test_*.py" -v
node --check bidpilot/app.js
node --check bidpilot/priority.js
node --test bidpilot/test_*.cjs
~~~

**Important:** text relevance and title-based warnings are not legal participation checks. No attachments are analysed or bids submitted. The source feed is bounded and updates twice daily; verify all official TED notice amendments and exact times.

---

## Release 1.1 history

**Live site:** https://mikelninh.github.io/bidpilot/

BIDPILOT discovers a *bounded* shortlist of genuine TED notices and provides an **explainable, local-only first-pass screening** for small European software/AI studios. This is not a qualification engine, legal opinion, bid-writing service, or award prediction.

## What shipped in 1.1

- **Notice stages:** official `notice-type` field is preserved, with competition, planning, results/awards, other and unknown. The default view includes **competition only**. An unclassified or legacy notice is **never** automatically treated as an open opportunity.
- **Deadline evidence:** published submission/participation dates preserved by lot and type; the source can omit these. A passed date is a warning, not proof a procedure is legally closed.
- **Decision desk:** headline metrics, notice-stage/deadline/warning filters, textual fit scores, explicit risk signals (e.g. mini-competition under a framework, reseller licences), and a per-notice **evidence brief** with outstanding verification questions.
- **Local review workflow:** mark "Review" / "No bid", add private notes, save, give feedback and export shortlisted records. Data stays on the browser. No account or analytics.
- **Safer feed:** up to three pages of 100 records per query (previously one); three German-focused IT/software/AI searches, 60-day window, ACTIVE search scope, no synthetic records. Both total and partial query errors are surfaced; the feed is explicitly incomplete.
- **Quality checks:** Python tests validate normalization, classification, lot deadlines and paging. Browser-less Node tests exercise loading, stage/deadline filters and decision notes.

## Source and confidence

**Source:** https://docs.ted.europa.eu/api/latest/search.html

POST https://api.ted.europa.eu/v3/notices/search

Search fields: https://docs.ted.europa.eu/ODS/latest/reuse/field-list.html

Notice-type codes: https://docs.ted.europa.eu/eforms/latest/reference/code-lists/notice-type.html

TED says **ACTIVE** includes planning notices, competition notices *and* result notices — it does **not** guarantee every item is an available bid. The app therefore defaults to source-coded competitions, and still requires checking the official notice. Some records have no tender deadline or a separate participation deadline; all dates are **date-only**, and the exact time and later modifications must be checked at TED.

Data is **not comprehensive** (not all German national/regional notices, not all IT/AI notices and not all historical pages). No claims about unique opportunities, current availability, contract budgets, supplier eligibility or probability of winning.

**Text relevance ≠ eligibility.** Keyword, buyer and CPV matching is deterministic in-browser, not an LLM score. Some risk flags are keyword heuristics and may be false positives or miss constraints in tender attachments.

## Privacy and security

- No documents uploaded, sent to AI or used to train models.
- Firm settings, bookmarks, votes, review status and notes use browser localStorage only; not shared across devices and cleared if browser storage is cleared.
- Display public source text using textContent and constrain source links to a TED publication URL.
- CSV guards against spreadsheet formula injection.
- The "Request pilot" button is a **public GitHub form**: don't submit confidential documents. There is no payment checkout and no private pilot onboarding yet.

## Development / release gates

Run locally (no secrets, paid model or dependencies):

~~~bash
python -m unittest discover -s bidpilot -p "test_*.py" -v
node --check bidpilot/app.js
node --test bidpilot/test_ui.cjs
python -m http.server 8000
~~~

Open http://localhost:8000/bidpilot/. GitHub workflow `.github/workflows/bidpilot-ci.yml` runs tests on PRs and main. `bidpilot-feed.yml` runs twice daily on **main** (plus manual dispatch) and fails closed on total TED query failure.

## Next, not yet implemented

1. Verify production refresh and TED stage/deadline semantics against **actual eForms notices**, including multiple lots and corrections.
2. Integrate German Bekanntmachungsservice and reliable update/duplicate tracking.
3. Secure private pilot onboarding, user accounts, consented alerts and GDPR flows.
4. Attachment parsing + citations, formal criteria extraction, human-reviewed bid/no-bid matrices and tender versioning.
5. Pilot with five real studios and measure precision of top ten, minutes saved, return use, and willingness to pay.

© Independent beta, not affiliated with the EU Publications Office.
