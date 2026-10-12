# CODEX HANDOFF · GOOD QUESTION / The Slow Edition

**Updated:** 12 October 2026  
**Publisher:** Michael Ninh (human final editorial owner)  
**Release:** `/good-question/slow/` = The Founders' Issue, edition `001` (pilot); `/good-question/` = existing Issue `003`; `/vegan/` = Plant Table.  
**Newsletter:** WUNDERPOST / The Good Letter: fortnightly, initially four pages in English, expanding to eight only when consistently excellent. Website supports DE, EN, VI; native-language review remains pending.

## Mission in one breath

Create the independent, human-led, AI-assisted magazine about 'the many ways to live a good life': compassionate food, ethical dilemmas, science, yoga philosophy and contemplative practice, tea, art, film, games, and a transparent studio building in public. Readers can choose what to follow. **Finite, deliberate, beautiful.** We do not pursue engagement for engagement's sake.

## First principle

**It won't and can't be perfect. Do the next good thing and make the uncertainty visible.** Do not add speculative capabilities, clutter, fake metrics or unverified claims to manufacture a 10/10 launch.

## Architecture and source of truth

- `good-question/AGENTS.md`: scoped project guardrails for Codex.
- `good-question/slow/index.html`: editorial experience / Slow Feed / interactive ethic / product shelf / Wunderpost / open newsroom.
- `good-question/slow/style.css`: warm editorial design with cobalt energy and a responsive mobile composition. No copied publisher UI.
- `good-question/slow/content.json`: canonical content, claims, source URLs, market-specific product statuses, issue and newsletter.
- `good-question/slow/build_content.py`: validates/regenerates `content.js`; `app.js` holds read experiences and translated copy.
- `good-question/slow/qa_slow.py`: browser checks for desktop/mobile, DE/EN/VI, links, interactions, and absence of console errors. Run before publication.
- `good-question/newsroom/BACKLOG.json`: canonical backlog with owner, phase, size, source needs, publication target, priority.
- `good-question/newsroom/brief.py`: deterministic weekly-plan brief with biweekly due date; works offline and cannot hallucinate recent events.
- `good-question/newsroom/check_content.py`: cheap evidence and editorial lint.
- `.github/workflows/good-question-editorial-brief.yml`: creates a public planning **GitHub issue every second Monday** when there isn't already one; it **does not publish an article, email or social post**.

Use GitHub issues for reader questions, partnerships and editorial planning; do not expose private contact or health data. Add an email provider only after obtaining explicit opt-in and a privacy/consent design.

## Agent team (lean on purpose)

### QUILL — dedicated Editor-in-Chief agent

Primary role: own the small editorial queue and maintain a consistent voice. Every run:
1. Read this handoff, Charter, BACKLOG and latest published issue.
2. Select the 1 most important outcome of the session (one story or one concrete product improvement).
3. Suggest 4 candidate stories for the fortnightly four-page issue, ordered by audience value and readiness.
4. Hand concrete research claims to PROOF, experience drafts to ATELIER. Don't silently 'approve' your own work.
5. Update backlog statuses, draft brief and release checklist; make human decisions explicit.
6. Never fabricate a contributor's involvement, a product test, an interview or a scheduled send.

### PROOF — Research Editor / Fact-checker

For each material claim: original link, title/authors/date, claim–passage mapping, study design/method, unit/population, strongest limitation, conflicting evidence, whether accessed directly, review status and reviewer signature (if real). Review environmental, nutrition, product-label claims separately; food packaging must match region and SKU. Capture honest unanswered questions. Do not invent confidence percentages. Escalate substantive disputes to human publisher / qualified outside reviewer.

### ATELIER — Interaction & Visual Editor

Turn human-approved copy into a beautiful, readable, accessible artefact (editorial mobile/desktop), with illustrations, licensed imagery and meaningful interactivity, not generic dashboards. Source chart figures from auditable data, preserve a no-script fallback, never substitute a game result for scientific evidence. Test focus, contrast, motion preferences and 360–1440px breakpoints. Build the **first 90 seconds** to feel delightful; show the actual story rather than shiny widgets.

### HUMAN — Publisher

Choose the angle; review harm and source evidence; agree on words, translations, product claims, affiliations and partnerships; approve the final publish. Do not infer approval from silence or a green CI badge.

## Publication gate (non-negotiable)

- [ ] Real story or original art; title answers what reader gains
- [ ] Source register complete for factual claims; counterarguments not caricatured
- [ ] Ecological or medical specialist sign-off, if needed; otherwise clearly labelled pending
- [ ] Vegan labels specific to exact market/pack; no unsupported 'vegan' badge for Toomba
- [ ] Locales checked or translated drafts explicitly marked unreviewed
- [ ] Marketing and editorial separation; sponsorships and affiliates transparently marked
- [ ] Images original/licensed; claims about interviews/tests/partners backed by evidence
- [ ] Browser QA at 360/390/768/1440, navigation, keyboard, reduced motion, links
- [ ] Human publisher approves release candidate
- [ ] Update changelog, archive, source and RSS; only then merge/release
- [ ] Monitor for reader feedback, corrections and broken sources

## Cadence and exact commands

```bash
# repository root
python3 good-question/newsroom/check_content.py
python3 good-question/slow/build_content.py --check
python3 good-question/slow/qa_slow.py
python3 good-question/newsroom/brief.py --force --output /tmp/GOOD_QUESTION_BRIEF.md
# local site preview
python3 -m http.server 8000 -d good-question/slow
```

Fortnightly planning issue is created by scheduled GitHub Action; always check for duplicates. The job itself cannot query live studies or author trustworthy reporting. PROOF uses external research deliberately in a separate, traceable session. WUNDERPOST starts as a **web-published four-page letter**. RSS is available; email delivery, subscriber data and brand sponsorships must be set up separately with consent. If no valuable story is ready, publish a short, honest field note or skip the date.

## Next three release candidates

1. **Review pilot with 5 people** (including a sceptical reader): what did they understand, enjoy, trust and want to return to? Capture consent and anonymise feedback. Prioritise genuinely useful interactions, not scroll-time.
2. **Expert-reviewed cover investigation:** lionfish, reef ecology and ahimsa. Interview ecologist and yoga ethics scholar only after they agree; document real answers and sources. Do not solicit a fake quote.
3. **Real honest product tier list and newsletter opt-in:** inspect and photograph exact German Shin/Toomba packs, date taste tests, log criteria, build an affiliate disclosure system, and implement privacy-compliant subscriber opt-in. No affiliate link until terms and product suitability verified.

## Partner wishlist, not claims of collaboration

Scientific/conservation: marine ecologists, NOAA-linked researchers, local invasive species managers, university ethicists. Food: Nongshim Germany/Kreyenhop, Alpro/Danone, independent plant-based shops and chefs. Culture: yoga teachers, environmental filmmakers (Open Planet Studios), tea producers, original artists/game developers; potential editorial collaborations with clear independence. Affiliate networks: identify programmes and acceptance criteria first; reach out only with publisher approval. **No partnership here is signed or endorsed by these organisations.**

## Suggested Codex starting prompt

> Read `good-question/AGENTS.md` and `good-question/newsroom/CODEX_HANDOFF.md`. Act as QUILL, our Editor-in-Chief. Inspect the live and local publication, run the checks, read the existing backlog, and select ONE highest-value item we can finish today. Work on a branch, preserve Issue 03, keep public claims conservative, draft and verify with PROOF, make the interface lovely with ATELIER, and present a working link/diff plus QA report and a concise human approval checklist. Do not publish or claim professional review without my approval. Keep the next WUNDERPOST at four pages. Remember: it won't and can't be perfect; it can be honest and useful.


## WUNDERPOST 001 — Mikel & Huong / usable release (12 October 2026)

The first *full shareable letter* lives at `good-question/slow/first-letter/` and is linked from the Slow Edition homepage. This is separate from the old 4-page WUNDERPOST preview but follows the same four-page philosophy: one idea, one pantry experiment, one gentle ritual, and the next question.

- Audience: ordinary curious people, not followers of an ideology; three languages DE/EN/VI.
- People: **Mikel & Huong**. Do not infer personal ratings or quotations simply because the names label columns. The initial tier lists are intentionally blank. Any grades supplied via a shared URL are **unverified user-entered snapshots** until both publishers explicitly approve named ratings.
- Six shortlisted plant-based products and one conspicuous Toomba label warning. Do not represent the linked German Toomba cup as vegan when its retailer listing contains animal ingredients.
- Live affiliate status **none**; discount codes **none**. KoRo DE's Awin merchant profile is a real lead, not an accepted deal. Partner rules and approved SKU checks in `newsroom/PARTNERS.md`.
- Audio: `good-question/slow/audio.js` adds browser text-to-speech to the letter and story modals with 1×/1.25×/1.5×/2× plus pause/resume/stop. It is not a mastered audio file, podcast, offline download or guaranteed background playback. Improve only with real recordings/licenses and native voice QA.
- `good-question/slow/first-letter/data.js` is the source for translations and product provenance; `app.js` holds local ratings and shareable tier URL parsing, with zero rating API/accounts. `style.css` holds the original editorial visual system. Do not add tracking or an email field until data protection and real consent are implemented.
- Test before release: `python3 good-question/slow/first-letter/qa_release.py`, Slow Edition regressions, 390px and desktop browser interactions, cross-language share-list roundtrip, Android TTS reality check. Do not claim passed checks that are not actually run.
- To add new products: keep original exact SKU/country/source/date, manufacturer vs third-party evidence, actual first-hand tests and commercial status separate in data; never preassign S/A/B/C as somebody else's opinion.
- First WUNDERPOST commercial experiment: Apply to **one** eligible partner, obtain real terms, then put one clearly disclosed link behind a product personally tested and reviewed. A conversion is only counted after merchant confirmation. Reader discounts exist only when real and valid.
- Publish when the user clearly authorises a shareable release, but not fabricated human reviews. A content release is not medical or ecological expert certification.

Remember that it won't and can't be perfect: ship one charming, useful, honest edition rather than a thousand half-truths.
