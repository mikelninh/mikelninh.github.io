# BRIEF → BUILD

**Independent concept study for THE BRETTINGHAMS** — by Michael Ninh, November 2026.

## Project

**Now:** incoming agency briefings can be incomplete, inconsistent, and hard to turn into an actionable discovery process. This is a *proposed* problem to validate with the team, not a confirmed internal agency bottleneck.

**Desired change:** evidence-backed, structured project intake with explicit human ownership of ambiguous and high-risk decisions.

**Next action:** test 30 unseen anonymised briefs with a domain expert, and compare against a manually reviewed gold standard. Measure exact/critical extraction error rates, unflagged high-risk failures, manual minutes per briefing, and operator confidence. Success gate: zero unflagged critical errors and real measurable reduction in review time while maintaining quality.

## Prototype

Open `index.html` locally in any current browser. No build or account required.

- Two fictional example client briefings + custom text.
- Deterministic extraction of goals, audiences, platforms, integrations, budget, deadlines, privacy-related issues, accessibility.
- **Verbatim evidence** for every extracted field.
- Rule-triggered human review gates (not autonomous approval).
- Task proposals with definitions of done (hypotheses, not commitments).
- One-click JSON export and clipboard copy.
- A visible eight-case executable browser test suite.
- Responsive desktop/mobile interface and reduced-motion support.

## What is *not* implemented

No LLM/API calls, RAG, integrations, real private data access, server persistence, authenticated user actions, verified compliance/legal claims, cost/time savings, or actual agents. UI describes a rule-based concept, not a deployed multi-agent system. This is the honest v0.1 user-facing product shell.

## QA

1. Load `index.html` in a browser.
2. Click "Test-Suite ausführen"; 8/8 deterministic unit checks expected.
3. Test scenario extraction and switch tabs.
4. Ensure privacy scenario cannot be "approved" until all listed manual checks are acknowledged.
5. Export JSON and inspect raw data and evidence.
6. Test at 375px mobile and desktop widths.

## Proposed production architecture

- API-based intake, isolated tenant storage, PII redaction, per-tenant retention.
- Structured LLM extraction with strict JSON schema and passage-level citation verification.
- Retrieval against approved project material (with access control and provenance).
- Evaluation harness with unseen cases, annotation and failure taxonomy.
- Human review and audit trail for risk, access, cost, technical feasibility and scope.
- Integrations to whichever project-management platform the agency actually uses, only after team discovery.

## Licensing / affiliation

Independent work sample; not endorsed by or affiliated with THE BRETTINGHAMS. All sample customer organisations and briefs are fictional. Public company references consulted at https://www.brettingham.de/ and https://www.xinnovations.org/mitglieder/brettinghams/.