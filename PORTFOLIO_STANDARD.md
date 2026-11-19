# Portfolio experience standard

## The hard rule

A recruiter should be able to understand the candidate, experience the strongest proof and know the next action in **30–60 seconds**.

Do not optimise portfolio pages for completeness. Optimise them for comprehension, proof and curiosity.

## Default page shape

1. **One-line identity** — who Michael is for this role.
2. **One clear problem/question** — what the proof demonstrates.
3. **One primary interaction** — try, decide, inspect or test something.
4. **One evidence/result block** — the strongest metric or observable outcome.
5. **One gap/boundary** — what is not proven or not yet built.
6. **One next action** — CV, code, contact or deeper technical proof.

Everything else is progressive disclosure.

## Time budget

### First 5 seconds
The visitor should know:
- who Michael is;
- what kind of work he builds;
- what to click.

### First 30 seconds
The visitor should understand:
- the problem;
- the product idea;
- one meaningful proof/result.

### By 60 seconds
The visitor should have been able to:
- interact with the proof or inspect a concrete result;
- understand the key technical/business judgement;
- see the important limitation;
- decide whether to open code/CV or contact Michael.

## Content limits

- Main portfolio: **3 featured proofs maximum**.
- Targeted application page: **1 hero proof + at most 1 supporting proof**.
- Default page: aim for **2–3 meaningful screenfuls**, not a long report.
- One primary CTA per viewport.
- No architecture section before the user understands the product.
- No giant project archive on the hiring path.
- No repeated role-matching prose that can be demonstrated by the proof itself.

## Interaction rule

Prefer:

**Try → decide → reveal → verify**

or

**Question → answer → evidence → gap → next move**

over explanatory paragraphs.

The visitor should feel the product, not study a case study about it.

## Deep detail

Code, schemas, CI, benchmarks, architecture, raw metadata and full project history remain available, but behind explicit links such as:
- `Inspect code`
- `Technical proof`
- `Open original source`
- `See benchmark`

Deep detail is valuable. It is simply not the front door.

## Final test

Give the page to someone for one minute. Afterwards they should be able to answer:
1. What does Michael build?
2. What is the strongest proof here?
3. What did I personally see/test?
4. What is still uncertain or limited?
5. What should I click next?

If they cannot, simplify again.

## Impact principle · 2026-11-19

> **We measure our success not by what we create, but by what changes because we created it.**
>
> **Love is our intention. Action is our expression. Impact is our evidence.**

For each project, provide three scannable fields: **Now → Desired change → Next action and measurable success**. Separate these from actual measured evidence. Never promote a target to a result.

Each case study links to a reproducible test or a clear validation gap, and identifies:
- Whose experience should improve and why.
- The observed baseline (or **not yet measured**).
- The proposed intervention and test population.
- Decision-quality metrics, human time, and harm / equity safeguards.
- A concrete stop / revise / expand threshold.
- A working demo or source link; if external uptime could not be checked, mark it unverified.

The portfolio homepage retains **at most three featured proofs**. The broader register lives at [impact.html](impact.html).

**Example:** INCA's new 30-case developer-authored cancellation-date benchmark found 24/30 correct routes, 2 unsafe continuations, and **blocked** the release; it is not expert-reviewed and does not measure time saved. See [recorded results](inca/impact-30-report.json).
## Visual proof and design quality · 2026-11-19

Beauty is part of usefulness: the interface should invite attention, reduce cognitive effort and make the outcome legible. Visual quality is **not** a reason to inflate impact claims.

**Prefer in this order:**
1. **Actual product screenshot** linked to the working page, visibly labelled as a saved screenshot and dated/versioned where possible.
2. **Real recorded evidence** (small honest chart, before/after comparison, verified quote, sample audit or interaction).
3. **Purpose-made explanatory diagram** if it clarifies the user journey or underlying system.
4. **Generated illustration** for mission, community or conceptual storytelling only. Label illustrations clearly; never present an imagined interface as a live product screenshot or a fabricated impact chart.

**Visual quality release checks:**
- Screenshots must originate in the project's own build, never be invented. The link and screenshot path must resolve.
- Every image needs accurate alt text, an honest caption, and an intentional mobile crop. Lazy-load images below the fold; use dimensions to avoid layout jumps.
- Preserve one strong visual per section; avoid decorative clutter or repeated images that explain nothing.
- Keep core text and calls to action accessible when images fail to load.
- Mobile reading, clear typography, spacing, contrast, and attractive layout must survive a real viewport test.
- Measured numbers remain bound to test evidence. Green engineering CI does not mean impact or safety is established.

For the public portfolio, three screenshots are preserved at `assets/project-shots/{gitlaw,good-things,claims-ops}.png`. The [impact register](impact.html) uses them as clickable real-project previews. Animal Voices art is explicitly marked as an illustration.
### Fresh screenshot source of truth (19 November 2026)

The existing GitHub Actions workflow [capture-project-shots.yml](.github/workflows/capture-project-shots.yml) now captures real browser views of 12 routes using Chromium/Playwright on Ubuntu 24.04, including nine project prototypes featured in [impact.html](impact.html). Screenshot provenance and any failures are stored at [assets/project-shots/capture-manifest.json](assets/project-shots/capture-manifest.json).

**Verified capture result:** 12/12 target screenshots recorded on 2026-11-19; the automated capture workflow completed successfully. This validates screenshots of the loaded pages, **not every interactive behaviour, model response or real-world project impact**.

