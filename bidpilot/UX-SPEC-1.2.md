# BID✳PILOT 1.2 — Release-ready UX specification
Status: **implemented on release branch; must pass CI and visual QA before promotion**.
Owner: BIDPILOT · Audience: independent German/EU software, AI, and automation studios.
Design principle: **Less dashboard. More decisions.**

## 1. Product promise, constraints and user job

**Primary job:** "In under a minute, show me a small set of real procurement notices worth checking and the single best next verification step."

**Secondary jobs:** configure a studio profile, inspect source evidence, save/reject a notice, keep private notes, investigate the rest of the feed.

**Non-goals for 1.2:** legal or technical eligibility verification, estimated chance of winning, automated bid submission, document extraction, private team collaboration, cross-device storage, complete coverage of German tenders or claim of current legal availability.

**Trust statement:** "Published competition" means TED classified the source as a competition notice, **not** confirmation that the user is eligible or bidding is currently open. Published *date-only* fields do not show the submission time; always verify the live notice, amendments, lot and exact deadline. These notices come from a bounded data snapshot.

## 2. Information architecture / hierarchy

Desktop, first visit:

1. Header: BID✳PILOT brand · "Live TED data / 1.2 beta" · methodology · Edit profile.
2. Editorial introduction: "Find the work worth pursuing." with one explanatory sentence.
3. Profile strip: "Example studio profile · Berlin AI Studio" until preferences saved; then company name and matching terms.
4. Main spotlight:
   - Headline "Worth a closer look."
   - A row of **up to three** real ranked notice cards: TED number, source classification, buyer, title, published date deadline, matched text signals, Inspect opportunity and TED source links.
   - One dark **Next best action** panel with a specific verification instruction attached to the highest-ranked notice.
   - A low-contrast disclaimer describing the shortlist as screening, not eligibility.
5. Quiet statistics strip: total source notices, competition notices, upcoming competition dates and locally saved items.
6. Closed "Explore all opportunities" disclosure containing the existing advanced filters, editable profile, note-taking and full-feed review.
7. Trust footer with TED source, beta limitations and privacy expectation.

Mobile (< 800px): one-column, next-action panel appears ahead of cards; no horizontal overflow or clipped controls. Below 590px all controls have full-width arrangements where necessary.

## 3. Components and content design

### 3.1 Opportunity card
**Structure:** "01" index; "Published competition"; "N days until published date"; source title (may wrap); buyer + TED number; evidence line; exact published date; Inspect opportunity (primary, opens detailed brief); TED source (secondary, official link).

**Wording guardrails:**
- Use "worth a closer look" rather than "you can win".
- Show text score as "text match", never "fit probability", "confidence" or "win chance".
- Use "Published competition" rather than "open tender".
- Use "date", not "deadline guaranteed". Remind users the date is subject to amendments and exact time is not ingested.
- Never substitute fake notices, prices, vendors, missing deadlines, or fabricated requirements.

### 3.2 Next-best-action panel
**One task only**, tied to source notice #1. Deterministic conditional copy:
- Stale snapshot (>3 days): "Verify the published notice is still current"; open TED.
- Published date in next 14 days: "Confirm the exact submission deadline"; open TED.
- Visible medium risk: "Check the participation conditions first"; open evidence brief.
- Other source-backed competition: "Check the mandatory eligibility requirements"; open TED.
- No eligible shortlist: "Start with your company profile"; open profile editor.
No task implies BidPilot has read attachment documents.

### 3.3 Profile strip and editor
- Default profile is an **explicit example**, not a discovered or verified company.
- Primary one-click action opens the advanced workspace and focuses company name.
- On save: recompute shortlist immediately; persist company name, keywords, exclusions, score threshold in browser only; update heading and top three without a page reload.
- No server-side account, synchronisation, or claim of consented analytics.

### 3.4 Explorer
Closed by default. Browser-native \`<details>\` interaction for keyboard and screen-reader semantics. Includes existing full feed, type/date/warning filters, on-device text relevance, source briefs, notes, CSV and saved state. Open automatically for "Inspect opportunity" and scroll/focus to that notice's evidence brief. Existing bookmarks/notes remain backward-compatible.

## 4. Deterministic shortlist rules (source-only)

Input: official TED snapshot schema 2, the existing company profile, and local decisions. No LLM call.

Hard eligibility **for shortlist inclusion**, not supplier eligibility:
1. Valid TED notice URL/id, with stage classified as **competition**.
2. Matches company profile keywords/CPV: text score >= max(40, user's minimum).
3. No keyword exclusions, and not locally marked "no bid".
4. A published future tender or participation date with at least **3 and at most 120 calendar days** remaining, at the viewer's local calendar date.
5. No current **high-risk title warning**, e.g. mini-competition under an existing framework. Medium warnings may be shown with caution.
6. If fewer than three survive, show **fewer than three** and an informative explanation; never pad.

Ordering, **not displayed as an eligibility or win score**:
- Existing explainable text score (0–100).
- Deadline window bonus: 3–6d +5; 7–30d +16; 31–60d +10; 61–120d +4.
- Recently published: <=7d +10; 8–30d +5; otherwise +0.
- Medium risk flag penalty: -22 each, capped at 2 flags.
- Locally marked review +3.
- Sort deterministically by priority, text score, earliest date, then TED id.
- Prefer distinct buyers across three slots. When fewer than three distinct buyers exist, remaining slots can feature another notice from an existing buyer.

Transparency: display source-backed reasons and published date. Data value, source coverage, stage and date may be incomplete. Publish this formula and test it. Title warnings are heuristics and should trigger manual review; they are **not** confirmed restrictions.

## 5. Visual design system

**Personality:** editorial, considered, professional, quietly optimistic. No neon AI glow, excessive hero illustrations or stacked dashboards.

Tokens:
- Warm canvas \`#f6f5f0\`
- Ink \`#22342c\`
- Pine \`#234739\`
- Terracotta emphasis \`#aa6048\`
- Pastel lime \`#cfe5a5\`
- White cards \`#fffefa\`
- Soft border \`#dedfd7\`
- Secondary text \`#6d776f\`

Typography: Georgia/Times editorial display, system sans-serif for interface and content, monospace for IDs/micro-data.
Spacing: 8px-inspired steps; spacious hero, 10px separation between cards, 22px main columns.
Radius: 8–12px, restrained; no decorative shadows except mild sidebar offset.
Desktop width max 1276px; full-width focus states; strong dark/light contrast.
Motion: subtle hover translation only; honour prefers-reduced-motion.

## 6. States and error handling

| State | Expected response |
|---|---|
| Loading | Skeleton-like "Finding strongest signals" text; no fake ranked cards |
| Valid, 3+ shortlisted | Exactly three source-linked cards + one next action |
| Valid, 1–2 shortlisted | Exactly 1–2 cards, count such as 02/03, no placeholder |
| Valid, 0 shortlisted | Empty recommendation explanation, profile edit action |
| TED feed error | No invented notices; source unavailable warning; direct TED link |
| Legacy / schema mismatch | Hide ranked recommendations; full manual feed accessible; warn notice types unverified |
| Stale snapshot >72h | Visible freshness warning and "verify latest notice" next action |
| Partial ingest errors | Warn feed incomplete, show source-linked candidates cautiously |
| "No bid" choice | Remove from top-three automatically, retain review record |
| Profile modified | Re-rank instantly without changing saved/reviewed data |

## 7. Accessibility and performance requirements

- Semantic heading hierarchy (h1 -> section h2 -> notice h3); accurate buttons vs outbound links.
- Skip-link to shortlist, explicit labels, visible focus rings, disclosure keyboard toggling, clear focus when review opens.
- All source anchors must be HTTPS \`ted.europa.eu\` links; target \`_blank\` with \`rel=noopener noreferrer\`.
- Tap targets >= 40px (where practical); text wraps; no horizontal scrolling at 360px.
- Contrast objective WCAG AA for normal UI text and focus indicators; audit visually before public release.
- Respect prefers-reduced-motion.
- No third-party fonts, heavy frameworks, paid LLM calls or analytics required for client.
- Limit full-feed DOM to first 150 rendered items, as in v1.1; browser computes top 3 against full bounded JSON snapshot.
- On-device computation must not upload the user's company profile, decisions or notes.

## 8. Acceptance / release gates

Automated in CI:
- Python normalization and source ingestion regression tests still pass.
- Node parses JavaScript.
- Browser-less DOM tests: render exactly 3 real official-source notices; mark default company as example; open detail; empty/legacy states; no invention.
- Unit tests: result notices excluded, missing/past/far-away deadlines excluded, no-bid excluded, high-risk access warning excluded, duplicate-buyer diversity, stable next-step policy.
- Existing v1.1 saved notes and full-feed interactions preserved.

Manual before claiming full production QA:
- Desktop at 1440x900 and 1280x800, mobile at 390x844 and 360x740.
- Verify keyboard navigation through profile and disclosure, opening and closing brief, focus/contrast/overflow.
- Open 3 production-card TED links; check the stage and published date against official notices and current amendments.
- Confirm source snapshot freshness, partial failures, and the absence of made-up data.
- Test profile changes and reload persistence, empty profile, no matches, "no bid" changes and local notes retention.
- Five real studio pilots: measure useful shortlists, time to first screening, repeat use and user-rated clarity. Until tested, avoid marketing claims of saved time.

## 9. Implementation plan / sequencing

**A. Source truth (implemented):** Keep TED schema 2, official links, types, lot-specific dates and bounded fetching.
**B. Ranking (implemented):** Deterministic shortlist module, risk/date guardrails, tie handling and buyer diversity.
**C. First-fold UX (implemented):** Hero, profile strip, three cards, next action, responsible copy, mobile layout.
**D. Progressive disclosure (implemented):** Existing full feed, profile editing and local bid/no-bid notes under explorer.
**E. Automated gates (implemented):** Rank tests and browser-less dashboard smoke tests in CI.
**F. Pre-promotion release check (required):** CI pass, preview review, manual mobile/desktop QA, source-link verification.
**G. Pilot learning (next):** Collect feedback with informed consent, evaluate real relevance/effort and prioritise follow-up improvements.

## 10. Definition of success

At least 3 of 5 recruited pilot users independently report that the first three shown notices deserve review **or clearly explain why not**, and 3 of 5 can reach a source-backed next step without guidance. These are pilot *targets*, not measured product outcomes.

**North-star proxy:** percent of top-three clicks leading to a meaningful review action (inspect requirements, save for review or record no-bid reason), only once appropriately consented first-party analytics exists.

Version 1.2 keeps its promises narrow: **real leads, understandable screening, one next move.**
