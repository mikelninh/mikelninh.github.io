# CHOICE LAB · Behaviour by Design

**Live experience:** https://mikelninh.github.io/choice-lab/

Choice Lab is a research prototype for testing whether small changes to menus and incentives alter *hypothetical* decisions. It is part of the wider LifeBench idea: understanding how environments, institutions and laws shape behaviour.

## What is implemented

- Responsive, accessible first-run interface with an interactive 3-condition designer preview.
- Participant flow: study information → explicit consent → randomised menu → choice → optional reason and confidence → thank-you.
- Three arms (1:1:1): equal-price control, 20.8% plant-based discount, preselected plant-based meal with easy opt-out.
- Browser-stable assignment and random token; single recorded completion per browser.
- Public Supabase Edge Function, `choice-lab-v1-api`, accepting bounded JSON inputs. No API keys appear in frontend source.
- RLS-protected response table that denies browser SELECT, and an aggregate-only public results table.
- Dashboard with explicit **live study** versus **invented scenario** modes, and aggregate CSV export.
- Transparent methods, limitations and a shareable collaboration brief.

## Scientific interpretation

**Primary outcome:** choosing plant-based Phở or traditional Phở in one simulated web menu.

This is **not** evidence of real purchases, long-term dietary change, or reduced animal suffering. The participants are self-selected, the instrument is not preregistered, the sample size has not been powered, participation cannot be perfectly de-duplicated across devices, and optional self-report reasons are not causal mediators.

The example dashboard data are invented solely to demonstrate how results might look. They are never mixed into the live counts.

Do not use the prototype to claim that a policy works. Upgrade to a preregistered cafeteria field trial to study actual sales, satisfaction, nutrition, choice freedom, affordability, and repeated selections.

## Consent and privacy

The study saves a pseudonymous random token, assigned arm, selected meal, optional reason, optional confidence, and timestamp after explicit consent. It does **not** request a name, email, account or free text. The database does not store raw IPs; hosting providers may collect technical logs separately. A public privacy notice and retention/deletion policy should be reviewed before broader public recruitment.

## Suggested collaboration with Christopher

1. **30-second test:** Can a new visitor explain what this is, what they can try, and what we will learn?
2. **UX review:** Clarify labels and defaults; audit accessibility, mobile usability and consent experience.
3. **Research review:** Preregister hypotheses, power the design, control menu comparability, add uncertainty estimates and check exclusion criteria.
4. **Pilot partner:** Find a willing restaurant, cafeteria or institution for actual purchase-data testing.
5. **LifeBench:** Compare environment, incentives, information and later institutional-policy changes, with real-world impact measures and public legitimacy safeguards.

## Deployment

Frontend: GitHub Pages, from `choice-lab/index.html` in `mikelninh/mikelninh.github.io`.

Backend: Supabase project `company-01`, isolated tables `choice_lab_v1_responses` and `choice_lab_v1_totals` plus `choicelab_private.update_totals` trigger, and public function `choice-lab-v1-api` (without public credentials). Public function uses server-side legacy anon key and still follows table RLS policies.

## Checks performed

- JavaScript parses without errors and first-load runtime passes a lightweight DOM-stub smoke test.
- Database anonymous INSERT and aggregate SELECT passed within a rolled-back SQL transaction.
- Public API GET returned six aggregate rows with zero saved responses.
- Public GitHub Pages build and smoke-test workflow succeeded after deployment retry.
- A full browser click-through was not automated due to unavailable browser-automation credits. This is a known QA gap.

## Next phase

A founder/designer pilot is a starting point, not a validated behavioural instrument. Keep testing and publishing negative findings.

**Design experiments. Observe reality. Improve the system.**
