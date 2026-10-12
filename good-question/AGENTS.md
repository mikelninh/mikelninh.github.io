# GOOD QUESTION — project instructions for Codex and coding agents

Read this file, `newsroom/CODEX_HANDOFF.md`, `newsroom/EDITORIAL_CHARTER.md`, `newsroom/BACKLOG.json`, and `slow/content.json` before editing this media project. Root repository instructions continue to apply; do not edit the general portfolio or other projects without an explicit task.

## Mission

Build an original **independent, multilingual editorial magazine** about better ways to live: food, veganism and kindness, nature and ethics, yoga and consciousness, tea, science, culture, film, games, and a transparent human–AI creative studio. Our standing attitude: **curiosity before certainty, less avoidable suffering, truth before sales, playful joy, humility about imperfect work.**

GOOD QUESTION = main publication. **WUNDERPOST / The Good Letter** = 4-page English-first fortnightly web letter, later email only when a real opt-in system is live. **Plant Table** = separate shopping and food companion. We do not pretend these are three profitable companies, nor do we build unnecessary dashboards for them.

## Non-negotiable release gates

- One **human publisher** approves public content, source labels, brand-partner claims and product recommendations. QUILL, PROOF and ATELIER are advisory personas or workflows, **not autonomous authorities**.
- No fabricated interviews, firsthand journalism, taste tests, ratings, user analytics, testimonials, partner deals, affiliate links, source access, scientific certainty, discounts, nutritional plans, revenues or expert signatures.
- Publish original writing and artwork only with appropriate permissions; no copied newspaper design or branding. Link copyrighted passages rather than reproduce them.
- Fairly present the strongest arguments you disagree with. Separate measurable claims, normative values, and uncertain evidence. Expert review must say **pending** until it actually happens.
- A plant-based food label in one region is not automatically vegan in all markets. Verify **specific SKU, ingredients and date**. Shin Germany and Toomba are different verification cases. Never silently mark Toomba vegan.
- No political advocacy dressed as journalism. For contentious public issues show relevant positions and defensible sources.
- No personalised medical advice, dietary prescriptions or promises. B12 and vulnerable populations deserve appropriately scoped professional guidance.
- Keep languages DE / EN / VI for the magazine; WUNDERPOST was intentionally English-first. Translation by AI is labelled and requires human/native-language review for full publication quality.
- Never merge a pending source audit into a green 'verified' badge. Never infer that tests establish scientific truth.
- Preserve `/good-question/` Issue 03; `/good-question/slow/` is a separately linked editorial pilot. Preserve 30 old article paths and their sources.
- No infinite-scroll, autoplay or manipulative streaks. A finite reading feed, no account requirement and privacy-aware defaults are features.
- **It will not be perfect and it cannot be perfect.** Ship useful slices with honest boundaries; maintain a backlog rather than polishing forever.

## Commands

```sh
python3 good-question/newsroom/brief.py --force --output /tmp/gq-brief.md
python3 good-question/newsroom/check_content.py
python3 good-question/slow/qa_slow.py
python3 -m http.server 8000 -d good-question/slow
# open http://localhost:8000
```

## Development discipline

Use a dedicated branch for substantial changes, protect the main published site, and show a working preview and QA results with each proposed release. Update `slow/content.json`, then regenerate `slow/content.js` using `slow/build_content.py` rather than editing the generated JS independently. Source and story content should always support what the UI displays.

For each issue: propose 4 story candidates, one favourite product or useful tool, one optional interactive/cultural piece, source audit, DE/EN/VI review status, newsletter preview, 390px and 1440px QA, approval checklist, only then publish. The GitHub scheduled workflow may open an editorial **planning issue**, never publish on its own.
