# BIDPILOT 1.0 — source-linked European tender discovery

**Site:** https://mikelninh.github.io/bidpilot/

BIDPILOT makes a focused, real-data-only shortlist of publicly available EU procurement notices from **TED** (Tenders Electronic Daily). It is a beta, not a paid SaaS service or tender-submission tool.

## User journey

1. Enter company name, relevant keywords and exclusions.
2. A scheduled GitHub Action calls the **official TED Search API v3**, which requires no login for public notices, and publishes a compact JSON feed.
3. The browser deterministically computes **relevance** from title matches, buyer matches and CPV IT/software classifications. The score is **not** an AI score, eligibility probability or win prediction.
4. Search and sort the shortlist, open original notices, save promising items, vote useful/not for us and export as CSV.
5. Local profiles, saved items and feedback stay in browser localStorage. No account, analytics or billing backend has been configured.

## Data source and coverage

- Source: https://docs.ted.europa.eu/api/latest/search.html
- Endpoint: POST https://api.ted.europa.eu/v3/notices/search
- Queries: German buyers + IT services (72000000), software products (48000000), or artificial intelligence in full text.
- Window: latest 60 days, active TED scope, up to 100 records per query, deduplicated by publication number.
- Refresh: GitHub Action twice daily at 06:12 and 18:12 UTC (plus manual dispatch).
- Official notice URLs only. Missing values remain missing; nothing is invented.
- Scope is **not comprehensive**: smaller national/regional German tenders not on TED are excluded, and amendments may supersede feed data.
- When *all* queries fail, ingestion raises and retains the last good feed; it never replaces it with synthetic records. On partial failure, the UI flags incompleteness.

## Local development

No Node, API key or paid model is required for the public client.

~~~bash
python -m unittest discover -s bidpilot -p "test_*.py" -v
python bidpilot/ingest.py
python -m http.server 8000
~~~

Visit http://localhost:8000/bidpilot/.

To test offline, inspect bidpilot/notices.json; it remains empty until official ingestion succeeds. **Do not seed fictional contracts into production.**

## Security / trust

- Original links are pinned to https://ted.europa.eu.
- Titles and other public data enter the UI via textContent, avoiding HTML injection.
- CSV output is escaped, including spreadsheet formula-leading text.
- No secret credentials in browser.
- User profile and saved notices are local only, with no cloud sync or account promises.
- Never claim eligibility based on title + CPV. Human review of full documents is mandatory.

## Commercial release gates (NOT COMPLETE)

1. Verify first GitHub Action run and actual TED response, then browser-test production on mobile and desktop.
2. Create a genuine pilot signup channel with privacy notice and anti-spam.
3. Interview five potential customers and measure match usefulness and time saved.
4. Add genuine alerts (server-side, per-user and permissioned), owner/team accounts, GDPR retention/deletion, data freshness monitoring and support.
5. Activate billing only after the owner completes merchant/KYC setup and approves prices.
6. Add attachments/full text parsing, notice version tracking, qualification evidence and German state portals.

EU Publications Office/TED, independent third-party beta. No EU endorsement or affiliation.
