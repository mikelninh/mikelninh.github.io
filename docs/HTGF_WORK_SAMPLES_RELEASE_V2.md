# HTGF Work Samples — Editorial Release 2.0

Three independent, runnable public-case experiences designed around the same question:

> What gets easier for the person doing the work, and what remains under human control?

## The three cases

| Experience | First question | What the user can actually do | Evidence |
|---|---|---|---|
| [Digital Worker Factory](../agents/) | A tenant needs help. Can AI prepare the work safely? | Prepare a fictional hand-off, remove source evidence, observe the stop, simulate approval and retry | [Executable ProductionAgentGateway test](https://github.com/mikelninh/digital-worker-factory/blob/main/proofs/htgf-boundary-release.test.mjs) / [passing CI](https://github.com/mikelninh/digital-worker-factory/actions/runs/38720612981) |
| [GitLaw](../gitlaw-proof/) | €900 becomes €1,008. What can be established? | Inspect original BGB links, open an unresolved-fact box and explore the deeper case | [GitLaw repository](https://github.com/mikelninh/gitlaw) |
| [PrüfPilot](../pruefpilot/) | Five documents needed, three provided. What now? | Run three fictional document scenarios, inspect evidence, prepare the next step, approve simulated release | [PrüfPilot repository](https://github.com/mikelninh/pruefpilot) |

## Visual system

[application-showcase-v2.css](../assets/application-showcase-v2.css) is the shared design layer: warm ivory, dark forest green, restrained terracotta caution, human readable serif headings, consistent controls and less card-heavy layout. Each case keeps its own content and states.

Release tenets:
- one primary question and one action per hero
- central user task above long technical explanations
- source and approval boundaries visible when relevant
- technical depth available through a source link/disclosure
- useful static reading with JavaScript disabled
- responsive 390px layouts, visible focus and reduced-motion support

## What has been actually tested

[Chromium desktop/mobile release test](../tests/htgf-showcase-e2e.py) launches the site locally, inspects:
- Digital Worker Factory preparation, missing property record stop, human approval and duplicate retry
- GitLaw source disclosure and both original statute links
- PrüfPilot document check and evidence disclosure
- All three 390px layouts for horizontal overflow and browser exceptions

[Release workflow](../.github/workflows/htgf-showcase-release.yml) records desktop and mobile screenshots as GitHub Actions artifacts. [Copy/structure contract](../tests/htgf-portfolio-proof.test.cjs) runs in a separate CI workflow.

**Truth boundary:** The public browser cases use synthetic fixtures. A successful interface test is not proof of safety in a deployed property/legal/public-funding system. Digital Worker Factory's gateway has separate executed synthetic tests, not an external tenant/contractor integration. No time saved, real client outcomes, or production approval rates are claimed.

## Next release gate (after an interview or real user feedback)

1. Ask 3 reviewers unfamiliar with these projects to complete one task without coaching.
2. Measure whether each person can identify the problem, next action and uncertain facts.
3. Ask an engineer to review the production boundary and repeat the test from the repository.
4. Prioritise the most frequent confusion, not another set of animations.

This work is independently authored as an application portfolio, **not affiliated with HTGF**.
