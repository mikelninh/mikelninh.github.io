# Beyond the CV × Semantic City

An additive chapter in Michael's existing portfolio, not a replacement homepage or a second identity.

## Entry points

- `/beyond-cv/`: the personal entry, retaining the approved English motto.
- `/beyond-cv/?for=dksr`: the same page with a concise DKSR-focused opening.
- Both entries retain direct CV, portfolio, evidence, code and contact links.
- The gift is optional and never gates the recruiter path.

The existing `index.html` source, CV and three featured proof families are preserved. During the Pages build, `link_portfolio.py` adds one navigation link and one secondary hero link. It checks exact anchors, is idempotent, and does not commit or push. Unexpected homepage structure causes a build failure rather than an unreviewed rewrite.

The previously generated standalone Beyond CV v1 HTML was not available in this checkout. This chapter implements the approved conversation/website-kit content and connects to the inspected portfolio. No original Beyond CV file was overwritten.

## Evidence boundaries

Semantic City is represented as an authored replay of one stored reference case, not a live query, model call or city-wide ranking. Displayed values link to the frozen source record at COMMONS commit `82f8d810762146eeda0d52b6fe02b87d4441f7d1`.

- Structural 2022 climate models are not today's weather.
- Planning-area context does not determine individual vulnerability.
- Approximate geometry distances are not walking routes or service accessibility.
- Reported beds are not available beds.
- The underlying recommendation is currently a fixed template.
- SHACL structure checks are not factual certification.
- The Cologne adapter is an additional ingestion example, not proof of the same heat use case in a second city.
- No DKSR commission, affiliation or CIVORA integration is claimed.

## Privacy and interaction

No third-party scripts, remotely loaded fonts, analytics, forms, API keys, model calls, payments or persistent visitor storage. Clipboard access happens only after a click; failure opens readable/selectable text. The download is a locally generated text file. Contact uses `mailto:` and never sends anything automatically.

Evidence and personal-topic tabs support arrow keys, Home and End. Native details keep all evidence and the gift readable with JavaScript disabled. Without JavaScript the page defaults to the personal opening. Reduced motion is honoured.

## Verification

Run from repository root:

```sh
python -m pip install playwright==1.55.0
python -m playwright install --with-deps chromium
python beyond-cv/check.py
```

The read-only `Beyond CV bridge QA` workflow checks both entry URLs, mode/history changes, keyboard tabs, decision gaps, copy/download/failure paths, no-JavaScript fallbacks, mobile overflow, no runtime errors and homepage preservation. Reports and screenshots are uploaded as artifacts; no test result is hardcoded into the public page.

The Pages deployment checks the published route, CSS, JavaScript and homepage entry links. No email, application or social post is sent by this release.
