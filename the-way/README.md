# THE WAY ✳
### A living atlas for peace

**Live:** https://mikelninh.github.io/the-way/

An open, geographically grounded map of conflicts and crisis theatres, their drivers and civilian consequences, and **hypotheses for how durable peace might be built**. Built as a public research and design prototype.

> Peace is not a feeling. It is something we build.

## What is working

- Responsive editorial website with a true geographic world basemap (Leaflet + OpenStreetMap Standard geographic raster tiles with visible attribution).
- **53 curated geographic theatre anchors**, searched and filtered by region and three *distinct* types: armed conflict, organised violence, and tension / instability.
- Approximate latitude/longitude anchored to broad locations. **Not** frontlines, military movements, incidents or travel-safety assessments.
- Dossiers for all 53: involved actors, underlying drivers, impact on civilians, main negotiation barriers, peace-pathway hypotheses and tangible tests of progress.
- In-page source links to established conflict and humanitarian research.
- A clearly separate latest-reporting area using a public, read-only Supabase Edge Function fetching dated RSS items from UN News, BBC and The Guardian. The feed is a stream of headlines **not real-time battlefield events**.
- Shareable conflict deep links, keyboard navigation, exportable JSON, mobile layout and reduced-motion support.
- Editorial snapshot date and published provenance.
- No personal accounts, identifiers, cookies or analytics in the app.

## Coverage is not completeness

- **53** is the number of records/theatre anchors in this prototype. A theatre is not necessarily a distinct UCDP armed conflict; countries can have more than one and some entries concern tension rather than organised fighting.
- **65** is the number of *state-based armed conflicts in calendar year 2025* reported by Uppsala Conflict Data Program in June 2026. It is **not** a verified count of wars happening on 23 November 2026.
- Different classification schemes from UCDP, ACLED and CFR are not interchangeable.
- Every theatre description represents independently authored synthesis for review, not the original source's exact prose. The source references may be broad reports or monitoring programme homepages and do not necessarily document every sentence.
- The editorial registry was reviewed **23 November 2026**. It does **not** update automatically from headlines, which can be inaccurate or out of context.
- All peace proposals are **tentative ideas**, not a negotiated offer, a guarantee, or an endorsement of a political actor or policy. They require meaningful participation by affected people, independent legal review, human-rights protections and experienced mediators.

## Data and geography

- [Uppsala Conflict Data Program](https://ucdp.uu.se/) and [2026 press release on 2025 findings](https://www.uu.se/en/press/press-releases/2026/2026-06-09-ucdp-record-number-of-conflicts-between-states)
- [CFR Global Conflict Tracker](https://www.cfr.org/global-conflict-tracker/dashboard) currently covers 27 situations with its own U.S.-policy-oriented scope.
- [ACLED Conflict Index / 2026 Watchlist](https://acleddata.com/conflict-index-2026-watchlist)
- [International Rescue Committee 2026 mid-year watchlist](https://www.rescue.org/sites/default/files/2026-06/2026_IRC_Watchlist_Midyear_Report_Full_F_UPDATE-DIGITAL-SPREAD.pdf)
- [UN DPPA Prevention & Mediation](https://dppa.un.org/en/prevention-and-mediation) and [UN Peacemaker](https://peacemaker.un.org/)
- [OCHA ReliefWeb](https://reliefweb.int/updates)

Tiles from OpenStreetMap Standard, with required visible attribution, adapted in CSS for a dark appearance. This small research prototype must comply with the OSM tile-use policy (https://operations.osmfoundation.org/policies/tiles/); commercial or high-traffic use would require a separately licensed map provider.

The 2026 UCDP API now requires a researcher access token in the `x-ucdp-access-token` header. Do not claim that the site retrieves current UCDP event data automatically until access is granted and a licensed, compliant pipeline is implemented.

## Running it

Open `index.html` via a local HTTP server, e.g. `python3 -m http.server 8000` from the repository root and navigate to `http://localhost:8000/the-way/`.

Source modules:
- `index.html`: structural and accessible app markup
- `style.css`: editorial design system, responsive layouts, dark geographic map
- `conflicts.js`: reviewed, per-record source-keyed registry
- `app.js`: filters, clustering, dossiers, news, copy URL, JSON export
- `checks.mjs`: deterministic data and source-contract tests

Public news endpoint: `https://htffcvdopavknnylbowl.supabase.co/functions/v1/the-way-news`. The serverless function has no credentials or user identities and does not accept POST requests. It caches successful reports for roughly twenty minutes. News links should be checked at their original source.

## The Peace Ledger (new)

**[Explore six documented processes](https://mikelninh.github.io/the-way/progress.html)**

This is a separate, source-linked evidence layer for **six selected peace processes**:
Colombia (2016 agreement), Sudan (2023 Jeddah civilian-protection declaration), Yemen (2018 Stockholm Agreement), South Sudan (2018 revitalised agreement), Armenia–Azerbaijan (2025 initialled peace text), and Ethiopia–Tigray (2022 Pretoria agreement).

Each case contains:
- the instrument's **actual legal/documentary character** (signed, declaration, initialled, partial agreement);
- three dated, source-cited milestones;
- three implementation commitments, their specific verification questions and the extent of available evidence;
- sources separated by role (primary document, UN mission mandate, monitoring or an independent rights report);
- editorial caveats, original links, shareable case URLs and an exportable JSON research note;
- **no synthetic peace score**, no claim that a signature proves compliance, and no fabrication of missing outcome measurements.

**Data limitations:** This is a curated 23 November 2026 snapshot, not continuous implementation verification. Official statements are evidence that institutions made statements, not independent proof of all their downstream claims. Future reviewers must adjudicate updated reports, evidence conflict and contested facts.

**PA-X copyright:** The University of Edinburgh’s PA-X v10 lists 2,257 agreements from 1990–2025. The dataset’s terms are CC BY-NC-SA for applicable materials, prohibit commercial reuse and prohibit duplicating the substantial/complete database in another competing tool. The site provides a source link and original research notes rather than reproducing its records or PDFs. See [PA-X Terms of Use](https://www.peaceagreements.org/cms/documents/8/Terms_of_Use_updated_added_local.pdf).

The new \`processes.js\`, \`progress.html\`, \`process.css\` and \`process-app.js\` modules keep source claims human-reviewable. \`checks.mjs\` validates every document and timeline date against the snapshot, all source keys, and the link to its actual geographic theatre. Automated browser tests cover both the original map and the Peace Ledger in mobile/desktop.

### Example research criteria

- Colombia: UN mission mandate, former-combatant safety, civic security and defined aspects of agreement implementation;
- Sudan: civilian-protection commitments, humanitarian access and free civilian movement;
- Yemen: Hudaydah port monitoring, prisoner-related measures and national talks;
- South Sudan: transition milestones, civilian safety and justice;
- Armenia–Azerbaijan: initialling versus legal entry into force, borders and displaced rights;
- Ethiopia–Tigray: ceasefire commitments, services and dialogue, with documented AU concerns.

## The work ahead

**0.2: Credible coverage:** Crosswalk UCDP conflict IDs, geographic theatres and ACLED political violence events; show coverage gaps, event date, publication delay, conflict taxonomy, and corrected classifications. Acquire UCDP API access legitimately.

**0.3: Humanitarian accuracy:** Add only independently verifiable, time-stamped figures for displacement, mortality, hunger and aid access, with definitions and ranges. Display missing data as missing.

**0.4: Multiple voices:** Have regional experts, affected communities, journalists, humanitarian workers and mediators review actors, disputed claims, translations and proposed pathways. Publish revisions and evidence disagreements.

**0.5: Peace agreement pathways:** Incorporate the UN Peacemaker agreement database; show past ceasefire terms, guarantees, security provisions and *actual implementation*.

**1.0: Measurable peace:** Test which interventions improve safety, rights, justice, access to services and freedom from displacement. Publish positive and negative findings. AI should support evidence and peace processes, not exercise political authority.

## Quality and safeguards

- Never invent or infer an event, death toll, incident location or crisis trend from a headline alone.
- Never place a dot on a specific shelter, person, military installation or tactical location.
- Do not automatically classify conflicts as improving/worsening based on sentiment analysis.
- Avoid manipulating political preferences; include multiple perspectives and the rights of all affected civilian populations.
- Expose editorial dates and source URLs, and never represent a yearly statistic as a current live figure.
- Use `node the-way/checks.mjs` to audit records.

**Make peace the way.**

## World Pulse edition · 27 November 2026

Shareable entry: https://mikelninh.github.io/the-way/pulse.html . The existing atlas remains at its stable URL. World Pulse distinguishes dated editorial stories from automatic RSS retrieval. Colombia has three short quotes matched against the retrieved UN source texts in a one-off AI-assisted investigation; this is not independently expert-verified or a continuous agent run. The Research Desk can load this public packet, import a local JSON report, or scan the public news feed for Colombia keyword matches (unverified headline leads only). No secrets, autonomous publishing, or fabricated source receipts. Independent LLM analysis requires separately configured credentials and evaluation. Mobile navigation now fits all four sections plus methodology. The atlas registry remains the 23 November snapshot, not an exhaustive live global conflict assessment.
