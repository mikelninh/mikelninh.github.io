# THE WAY ✳
### A living atlas for peace

**Live:** https://mikelninh.github.io/the-way/

An open, geographically grounded map of conflicts and crisis theatres, their drivers and civilian consequences, and **hypotheses for how durable peace might be built**. Built as a public research and design prototype.

> Peace is not a feeling. It is something we build.

## What is working

- Responsive editorial website with a true geographic world basemap (Leaflet + OpenStreetMap Standard geographic raster tiles with visible attribution).
- **52 curated geographic theatre anchors**, searched and filtered by region and three *distinct* types: armed conflict, organised violence, and tension / instability.
- Approximate latitude/longitude anchored to broad locations. **Not** frontlines, military movements, incidents or travel-safety assessments.
- Dossiers for all 52: involved actors, underlying drivers, impact on civilians, main negotiation barriers, peace-pathway hypotheses and tangible tests of progress.
- In-page source links to established conflict and humanitarian research.
- A clearly separate latest-reporting area using a public, read-only Supabase Edge Function fetching dated RSS items from UN News, BBC and The Guardian. The feed is a stream of headlines **not real-time battlefield events**.
- Shareable conflict deep links, keyboard navigation, exportable JSON, mobile layout and reduced-motion support.
- Editorial snapshot date and published provenance.
- No personal accounts, identifiers, cookies or analytics in the app.

## Coverage is not completeness

- **52** is the number of records/theatre anchors in this prototype. A theatre is not necessarily a distinct UCDP armed conflict; countries can have more than one and some entries concern tension rather than organised fighting.
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
