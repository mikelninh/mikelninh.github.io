# LifeBench · Democracy Lab

[Public workbench](https://mikelninh.github.io/firstlight-lab/lifebench.html)

A civic engineering prototype that separates **citizen proposals**, **official legislative records**, **promulgation**, **entry into force**, and **measurable effects**.

## Data pipeline

- `scripts/monitor.py` reads the official Bundestag **DIP API** (public API key until May 2027, optionally override using the `DIP_API_KEY` Actions secret), Bundesgesetzblatt Teil I RSS, Gesetze im Internet RSS and public GitHub consultation issues. No scraping of social media or private data.
- `.github/workflows/lifebench-monitor.yml` runs twice daily and on manual dispatch. It runs offline tests, fetches data, validates invariants, and commits only `data/law-feed.json`.
- Source IDs, official URLs, updated dates, source health, and raw parliamentary statuses remain visible. Promulgation is verified only by a structured DIP record or **exact GESTA match** in official BGBl RSS. Entry into force and impact remain unverified until separately reviewed.
- If a source fails, the Action fails without silently replacing it with fabricated or stale data. The website will show an out-of-date warning.

## Consultation and outcomes

GitHub Issue forms are the **public consultation channel**, not an official legislative consultation. People must sign in, review and submit voluntarily. The dashboard only displays issue titles, URLs, counts, and status; it does not infer public opinion from participation. Governance and moderation remain the repository maintainer's responsibility. No bulk outreach or automatic lobbying is performed.

`data/impact-registry.json` defines useful measures. No outcome claim is valid without an independently reviewable baseline, source, date, and reviewer. Corrections should be made in a public GitHub pull request, not by automatically approving unreviewed user input.

## AI drafting

The browser exports a structured, evidence-constrained German drafting brief and can open ChatGPT for the human operator to review and iterate. It does **not** claim an autonomous in-site AI service, since one has not been provisioned. All suggested text is a **non-official Arbeitsentwurf**, not legal advice.

## Run and test

```bash
python -m unittest discover firstlight-lab/tests -p 'test_monitor.py' -v
python firstlight-lab/scripts/monitor.py --out firstlight-lab/data/law-feed.json
```

The monitor uses the Python standard library only. GitHub Pages is static, so it cannot accept unauthenticated private form submissions or safely embed model API keys. Public participation is handed off to GitHub Issues. All work remains subject to citizen judgement and democratic procedure.
