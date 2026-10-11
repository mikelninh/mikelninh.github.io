# GOOD QUESTION — Issue 02 · A magazine for the curious

A trilingual veganism publication (DE · EN · VI) with ten evidence-led stories, a searchable interactive editorial index, source trail, and links to the complementary vegan-food project **Plant Table**.

**Public:** https://mikelninh.github.io/good-question/  
**Evidence register:** https://mikelninh.github.io/good-question/issue02-evidence.json  
**Plant Table:** https://mikelninh.github.io/vegan/

## Editorial standards

- Each article presents a charitable version of the objection, the available evidence, methodological limits, ethical distinctions and an actionable next step.
- No synthetic certainty percentages. Scientific study design is identified. A philosophical claim is not given a scientific confidence score.
- Source type, publisher, live external URL and scope of editorial checking are stored in `stories.json`, with a public claim-level record in `issue02-evidence.json`.
- AI-assisted source-to-claim editorial comparisons have been conducted; **no independent academic, dietetic or medical expert review, original-data reanalysis, full systematic review or formal GRADE assessment has been completed.** No claim should be described as medically certified or independently peer-reviewed.
- Children, pregnancy, breastfeeding, older people, special medical conditions: the site gives background, **not personalised medical or nutrition advice**. For these populations specialist medical and dietetic support is essential.
- No affiliate tracking, paid rankings or sponsorship on Issue 02. A future paid partnership must be clearly labelled separately from scientific information.

## What is shipped

- 10 essays × three locales = 30 independently linkable and search-indexable reading pages.
- The homepage retains the original argument explorer, food coach and curated pantry; the new magazine is progressive enhancement.
- Editorial typography, illustrations and interactive filters designed for phones and desktops.
- Original-source cards, limitations and AI-review methodology; public JSON audit trail.
- Two original-source-based diagrams; the figures are study-level comparisons, not universal individual projections.

## Updating an article

1. Amend the corresponding article in `stories.json` for `de`, `en`, `vi`, the `ref` source keys and English canonical `claim`/`limit`.
2. Verify original source, date, population, study design, comparable outcomes and contraindications. Update `sources[k].check`. If independent review has not occurred, do not label it completed.
3. Run `python generate_issue02.py` to rebuild `stories.js`, 30 article pages, `issue02-evidence.json` and `sitemap.xml`.
4. Run `python audit_issue02.py` with BeautifulSoup and Playwright installed; visually review narrow phones and desktops with `python qa_magazine.py`.
5. Confirm scientific and linguistic text is correct **before publishing**, not just that tests pass. Invite qualified human reviewers, using `REVIEW_CHECKLIST.md` to document actual sign-off.

## Files

- `index.html`, `app.js`, `style.css`, `release.js`, `release.css` — original site.
- `issue02.js`, `issue02.css` — editorial homepage layer.
- `reader.css`, `read/<slug>/<locale>/index.html` — longform editorial stories.
- `stories.json` — canonical editorial text and source metadata (10 × 3 locales).
- `generate_issue02.py` — static article and audit build.
- `issue02-evidence.json`, `evidence-register.json` — evidence register and legacy bridge.
- `audit_issue02.py` — machine-testable multilingual, internal-link and responsive smoke tests.

## AI-generated content and reviewers

Issue 02 is written with AI assistance. All authorship and editorial checking assertions should accurately reflect the work completed. Specialist review is **pending**, not implied by publication.
