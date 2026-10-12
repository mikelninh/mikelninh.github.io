# GOOD QUESTION · WUNDERPOST 001 · Release 1.1

**Status:** Release candidate. Editorial facts and licensing still need ongoing review.
**Reader link after merge:** https://mikelninh.github.io/good-question/slow/first-letter/
**Play link:** https://mikelninh.github.io/good-question/slow/first-letter/label-lab/
**Original Ramen Passport:** https://mikelninh.github.io/vegan/#ramen

## Shipped in 1.1
- Six genuine product packshots for the shortlisted vegan/plant-based pantry, with external original-image URLs, photo credits and source-page links.
- A seventh real **Shin Toomba cup (EAN 8801043017022)** photo, held separately in the non-vegan ingredient-warning panel; this *particular retailer variant* contains animal-derived ingredients. Do not generalise to all Toomba products.
- No stock AI placeholder mistaken for an exact commercial product: CSS illustrations are only a graceful fallback if external image hosting fails.
- A more useful device-based article reader: best installed language-matching/natural voice preference, manual voice selection, 1×/1.25×/1.5×/2×, pause/stop, previous/next sentence, progress, highlights, Media Session handlers where supported. **No studio voice, MP3 file, offline download, video captions or guaranteed locked-screen playback yet.**
- A finite Play Desk: three-clue sourced Label Detective, the original reef/ahimsa interactive piece, and links to Mia & The Little Lights and Tiny Tactics Friends.
- A reader-directed feedback form (rating + idea) which opens a **GitHub issue draft**, and a copy-to-clipboard option. Nothing submitted automatically; GitHub login required to actually send.
- Mikel/Huong independent S/A/B/C inputs remain **blank by default**; shareable URLs are unverified personal snapshots. No affiliate approval, code or paid sponsorship is active.

## Authoritative source files
- `first-letter/photos.js` – 7 source-linked photos, original publisher, variant caveats, and alternates when proven.
- `first-letter/release11.js` + `release11.css` – progressive photos, Play Desk and reader-feedback UI.
- `slow/audio-v11.js` – improved narration, optional and device-dependent.
- `first-letter/label-lab/` – original mini-game with sourced disclosures, three languages, explicit ending, no score.
- `first-letter/browser_smoke.mjs` – 115 passing real-browser checks from QA run 38256364862 before this handoff.
- `first-letter/qa_release.py` – offline product-claim, syntax, translation and commercial guardrail checks.
- `newsroom/CODEX_HANDOFF.md`, `BACKLOG.json`, `PARTNERS.md` – canonical newsroom operation and ethics.
- `.github/workflows/good-question-wunderpost-qa.yml` – static + browser checks on PR and main.

## What actually keeps people returning
Our goal is not compulsive use. Offer a reason to return **when something worth their time exists**:
1. **Every fortnight:** a small WUNDERPOST letter, 4 excellent pages, one useful discovery, one personal product test or studio note, and one new playable question.
2. **One fresh, finite game per issue**, less than five minutes; a meaningful question before any scoreboard. Never fabricate conservation outcomes or confidence levels. Promote existing original IP when appropriate.
3. **Show what changed** since last time: dated issue archive, transparent corrections, source updates, a better recipe/product and completed experiments. No fake "daily news".
4. **Invite readers to respond:** currently GitHub drafts/copy. Later test a consent-aware no-login feedback endpoint (minimum data, moderation, retention and privacy policy) and real opt-in mailing/RSS subscriptions. Neither exists today; don't claim collected feedback.
5. **Reader-selected topics** continue in the parent Slow Edition; preferences stored locally, finite feed, no infinite scroll/streaks/forced accounts.

## Proposed backlog for v1.2 (prioritised)
- P0 **Owned authentic photos**: request image-reuse permissions or take and edit our own exact-product photos for each SKU. Current externally hotlinked assets may break or have copyright limits.
- P0 **Real Mikel and Huong taste tests**: photograph exact German SKU labels, date each test, explicitly obtain both people's approval for attributed S/A/B/C rankings; *no fabricated opinions*.
- P1 **Offline/bike-friendly premium narration**: select/licence voices or record our own; generate and review actual MP3/Opus with DE/EN/VI scripts, offline/background player, transcripts, correct rights. Separate voice quality from speech-controls usability.
- P1 **Accessible feedback pipeline**: opt-in, anonymous optional, protected against spam and personal data exposure, manually reviewed, publicly track corrections only with consent. Compare genuine user comments rather than conversion tricks.
- P1 **One reader-tested mini-game**: playtest Label Detective with five people, including sceptics; measure completion, clarity, trust and whether they'd share, without surveillance.
- P2 **Ramen integration**: connect existing Plant Table Ramen Passport and the GOOD QUESTION two-person shelf, keeping exact market ingredient warnings.
- P2 **Affiliate pilot**: only a genuine personally tested product, accepted commercial terms, current verified discount where real, explicit disclosure before click. Commission must never determine tiers.

## Release gate
```bash
python3 good-question/slow/first-letter/qa_release.py
python3 good-question/newsroom/check_content.py
python3 good-question/slow/build_content.py --check
python3 -m http.server 8099 --directory good-question/slow
node good-question/slow/first-letter/browser_smoke.mjs
```

Check original links, 7 images actually load on 1440px, all three locales on 390/768/1440px, rating URL round-trip, TTS controls, Label Detective all three steps, source disclosures, feedback draft and old article listening. **Tests cannot establish human expert review or high-quality voice rendering on a particular phone.** QA is not a substitute for real-device Android listening or human editorial approval.

## Editor-in-chief / Codex
Read `good-question/AGENTS.md` and `good-question/newsroom/CODEX_HANDOFF.md`. Run the tests, choose **one** measurable outcome, write a small working change on a branch, show preview and evidence, ask for publisher approval on sensitive claims. No silent paid partnership or auto-publication.

**It won't and can't be perfect. Publish truthfully, learn from readers, and keep the charm.**
