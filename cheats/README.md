# CHEATS — Real-life superpowers / Memory Palace 001

**Play:** https://mikelninh.github.io/cheats/
**Share a direct invitation:** https://mikelninh.github.io/cheats/?play=memory

A playful, mobile-friendly, self-contained learning game. A person first tries to remember eight concrete nouns without a suggested strategy, learns the **method of loci**, and then tries eight different nouns paired with eight locations along a reusable route.

## What works
- Real 60-second baseline study → free recall with eight text slots → exact score and order bonus.
- Guided lesson with eight distinctive landmarks and visual-encoding instructions.
- New items and same study time on a second attempt with spatial cues.
- Actual before/after recall scores, including negative changes. No invented efficacy or users.
- Three counterbalanced pairs of lists (= six sets). Assignment swaps between runs.
- Replay and locally stored numeric session data. No answers, names or email captured.
- Native share if available; fallback copying and downloadable locally-rendered PNG power card.
- Optional sound, mobile layout, focus styles and reduced-motion support.
- Direct optional link to the existing STATE FOCUS 25 beta.
- No libraries, cookies, login, trackers, fonts or requests to servers other than static hosting and explicitly followed external links.

## Measurement caveats
Both study rounds last 60 seconds. The second challenge is aided by room cues and follows practice and instruction; different words may vary in difficulty. Therefore the change in recalled objects **does not establish causal improvement, general memory ability, or durability**. This is an educational experience and preliminary product experiment.

Background reading: [2025 method-of-loci systematic review](https://pubmed.ncbi.nlm.nih.gov/40457944/) — possible recall benefits with methodological limitations and low to very low certainty.

## MVP quality gate
- [ ] Public GitHub Pages link returns 200, assets load.
- [ ] Start and leave challenge with accessible keyboard.
- [ ] 60-second timer ticks, expires correctly even when a tab is backgrounded.
- [ ] Each recall accepts at most eight answer slots; duplicate entries do not earn duplicate points.
- [ ] Baseline and spatial learning challenges have distinct word sets.
- [ ] Finish screen shows actual baseline and second score even if second is lower.
- [ ] Local-only high score survives reload; typed answers are never persisted.
- [ ] Downloaded card contains actual scores; challenge share does not transmit scores.
- [ ] Mobile (360 px), desktop, keyboard, reduced-motion QA.
- [ ] GitHub Pages publish workflow completed.

## Next business experiment
Invite 15–20 people for a no-payment beta, observe five on a mobile phone, and ask:
1. What did you understand in the first ten seconds?
2. Which step was confusing?
3. Was this enjoyable enough to finish?
4. Could you use the method on something important in real life?
5. Would a structured seven-day practice pack be worth €9–€19? Why?

Only offer paid access after delivery, support, pricing, consent, consumer information, legal imprint and refunds are actually configured. The currently active product is entirely free.

*Working title: CHEATS. Not trademark-cleared.*

## Implementation
Plain index.html + style.css + app.js and icon.svg, served via existing GitHub Pages. No build dependencies.
