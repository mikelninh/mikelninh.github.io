# GOOD QUESTION — The Slow Edition · Founder's Issue 001

**Live after GitHub Pages publication:** https://mikelninh.github.io/good-question/slow/

An original magazine prototype with a **reader-controlled finite feed**, five editorial worlds, six published/interactive pieces in DE/EN/VI, primary-source panels, a qualitative reef ethics experiment, a transparent four-product shelf with private ratings, a four-page English-first WUNDERPOST preview, an honest AI newsroom blog, and a dedicated Codex handoff and editorial backlog. No account, analytics, auto-play, scoring manipulation or infinite feed.

## Start local

```sh
python3 good-question/slow/build_content.py --check
python3 good-question/newsroom/check_content.py
python3 good-question/slow/qa_slow.py
python3 -m http.server 8000 -d good-question/slow
# http://localhost:8000
```

`content.json` is canonical for product/issue/source records. Run `python3 good-question/slow/build_content.py` after editing it. `app.js` holds translations and complete essays. `style.css` holds visual design and responsive styles. Do not alter files in `good-question/read` or overwrite Issue 03. A link back to the Slow Edition is added in the Issue 03 footer.

## Reader interactions

- Follow specific topics; preferences localStorage; share topics using `?topics=...&lang=...#slow-feed` (does not expose individual user identity or reading activity).
- Story permalinks `?story=reef&lang=en`, German/Vietnamese variants; native HTML dialog with keyboard close and evidence cards.
- One reef, three futures: an ethical prompt, **not** ecological simulation. No absolute right answer or fabricated probabilities.
- Pantry tiers are reader's private local ratings; founders' favourites are explicitly not blind-tested or sponsored. German Toomba remains unverified as vegan.
- Four-page WUNDERPOST preview in English; no email sign-up/sending system is connected. The website is readable in three languages; written translations remain unreviewed by native-language editors.

## Unfinished (intentionally honest)

Human expert review, verified SKU photographs, formal taste tests, a subscriber consent system, paid brand partnerships, live affiliate URLs, sustained user research and authentic editorial interviews remain ahead. An official Vegan Society definition is paraphrased here and linked to its complete original. Product claims use official brand sources only and are not independently certified. Ecology research includes counterevidence about limitations of lionfish removal. The newsroom automation creates planning issues, never automatic public articles or messages.

## Status

Local browser QA: run `qa_slow.py`. It tests four viewport widths in three languages and key interactions. Source truth, actual brand labels and professional review require further human work. This is a **pilot to share and improve**, not a claim of 10/10 perfection.
