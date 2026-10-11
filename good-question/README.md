# GOOD QUESTION — Issue 03 / Food & the future

Original trilingual editorial magazine by Michael Ninh. Built for curiosity, compassion and inspectable claims, not to imitate another publication's identity.

- Front page: https://mikelninh.github.io/good-question/
- Cover story: https://mikelninh.github.io/good-question/feature.html?lang=en
- Evidence: https://mikelninh.github.io/good-question/issue03-evidence.json
- Companion: https://mikelninh.github.io/vegan/

## What changed

A new editorial front page and original cover story, **The price of a plate**, in DE / EN / VI. One language at a time. An open price calculator separates the allocated cost of food consumed from buying whole packs at checkout. Six original retailer pages, three recipe bases, adjustable prices, portions, quantities and pantry flags. Copy a shopping list or export the actual calculation as CSV.

An accessible environmental comparison displays five indicators with the original study's 95% uncertainty intervals, a common zero-to-100 domain and an explicit high-meat reference group. Source data are downloadable. Unlike indicators are never added into a score.

Search, topic filters, local-device reading list, keyboard-accessible dialogs, a corrections draft and three RSS feeds are functional. Existing 30 static article pages are preserved; the former front page and prototype tools remain at `archive-02.html`.

## Boundaries that must remain visible

**Technical release, not independent scientific certification.** Source-to-claim comparisons are AI-assisted. Independent subject-matter and native-language reviews, formal GRADE assessment, a systematic review and raw-data reanalysis have not been completed. The new feature is desk research, not original field reporting.

Retail prices are reference values retrieved on 11 October 2026 from retailer pages which may be cached, not guaranteed live offers. One merchant is not a representative survey. Recipe bases exclude extra vegetables, oil, seasonings, cooking energy, water and delivery. They are not kitchen-tested recipes or complete nutrition plans. No meat-based basket was tested. No invented taste tests or paid product rankings.

No active affiliate links, newsletter email collection, payment checkout, personal clinical nutrition service or cross-device account is present. Reading lists and Plant Table favourites are not synced. B12 and nutrition information must retain scope and medical-care caveats.

## Data and maintenance

`edition03-data.js` is canonical Issue 03 editorial copy, all three UI translations, reference prices, source metadata and chart data. `edition03.js` implements interactions; `edition03.css` defines the original visual system. German semantic fallback content in `index.html` and `feature.html` remains readable without JavaScript; JavaScript activates the new multilingual interface and calculator. The previous edition still has 30 separately linkable static locale pages.

Run `python build_issue03.py` to export `issue03.json`, `issue03-evidence.json` and the DE / EN / VI RSS feeds. It does not check sources or renew dates. After editorial changes, update the German HTML fallback and source notes consistently. Do not label human review as completed without actual named sign-off.

Issue 02 content remains canonical in `stories.json`; its original generator and review checklist are retained.

## Verification

Install `playwright` and `beautifulsoup4`, provide Chromium, then run `python qa_issue03.py`. The release test run passes **174 technical checks**, including 24 viewport/language/page combinations, arithmetic, edge cases, CSV, search, bookmarks, source dialogs, correction-draft behaviour, 30 preserved reading pages, feeds and local links. Full results: `qa-issue03.json`.

Offline tests use local HTML via Playwright `set_content` with external requests blocked. They do not verify deployed HTTP, remote-photo loading, real-origin cross-reload storage, current checkout prices, full WCAG compliance or scientific truth. A live browser smoke test should supplement them.

## Privacy and credits

No analytics code or server-side reader database. Reading preferences use localStorage when available; when storage is unavailable the UI clearly reports session-only saving. External cover photography is credited to Anna Pelzer / Unsplash and fetched from Unsplash, which receives a network request. An original inline SVG is the fallback; the image is illustrative, not a tested dish. Source and licence are in the evidence file.

Corrections open a **prefilled public GitHub issue draft**. Nothing is automatically sent; a GitHub account is required to submit. Never include personal health information. Commercial relationships must be disclosed and must not influence science claims.
