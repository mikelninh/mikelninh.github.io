# LifeBench · Long-Term Masterplan
**Version:** 1.0 · 21 November 2026  
**Status:** Living, public plan. NOT an official bill, legal opinion, political mandate or verified impact claim.

> **North star:** Turn collective intelligence into independently verified reductions in avoidable suffering and gains in wellbeing, freedom and human agency.

## Executive thesis

LifeBench is an open civic engineering system. People identify a concrete problem and its baseline; researchers compare options and trade-offs; AI helps formulate non-official drafts and identifies uncertainties; humans consult, decide and submit through lawful institutions; the system monitors verified legal milestones; independent evaluators test what actually changed for living beings.

**A drafted law is not a victory. A parliamentary vote is not necessarily a law in force. A law in force is not proof that suffering decreased.**

Start in Germany with animal welfare (Tierschutzgesetz) and a second pilot improving plant-based public catering. Then reproduce the method for consumer rights, responsible AI, civic transparency and other public-interest topics.

## 1. The seven-stage mission loop

| Stage | Core question | Evidence needed | Failure mode to prevent |
|---|---|---|---|
| 1 · Understand | What exact harm needs reducing? | Law, baseline, research, affected populations | Vague values without measurable problem |
| 2 · Design | Which lawful intervention works best? | Alternatives, jurisdiction, rights, costs and incentives | Infeasible or misleading draft |
| 3 · Consult | What do affected people actually think? | Consent, diverse feedback, dissent and substantive responses | Astroturfing or unrepresentative signals |
| 4 · Decide | Did an institution formally act? | Primary parliamentary and official documents | Treating a press release as law |
| 5 · Enact | Was it promulgated and made effective? | Bundesgesetzblatt, commencement provision, amendments | Conflating parliamentary vote and effect |
| 6 · Implement | Was it funded and enforced? | Budgets, accountable agency, subordinate rules, inspections | Paper law without implementation |
| 7 · Evaluate | Did outcomes improve because of it? | Baseline, counterfactual, uncertainty, independent review | Claiming causal effects from correlation |

Not all interventions need a new law. Possible routes include federal statutes, EU law, ordinances, state/municipal policy, public procurement, funding and voluntary programmes. Always compare against the no-new-law option.

## 2. First flagship: Germany's animal-welfare transition

### What we'd aim for

Fewer animals exposed to avoidable suffering through stronger enforceable protection, effective inspection, economically fair transition opportunities and better food choices. We do not assume any single legislative approach is the shortest or most legitimate path.

### Five reform tracks

1. **Protect:** Prioritise severity-weighted harms, inspection quality and enforceable requirements.
2. **Transition:** Provide predictable milestones, incentives, training and financing for farmers and workers; minimise unintended hardship.
3. **Feed well:** Expand nutritious, affordable, appealing plant-based meals in public institutions through appropriate catering standards and procurement rules.
4. **Show the facts:** Publish transparent, privacy-conscious enforcement and correction data, with context and appeal routes.
5. **Evaluate independently:** Register outcomes early, use reliable denominators and separate observed conditions from effects caused by the reform.

### What we must examine

Which legal powers sit with the EU, federal government, Länder and municipalities? Which existing provisions are not enforced? How do affected farmers, workers, caterers, consumers, scientists and animal-welfare practitioners view each option? What are the strongest counterarguments? Could reforms displace harm abroad or unintentionally make food less affordable?

The first official watched case is **DIP 334563**, an amendment to the German Animal Welfare Act and animal-husbandry labelling law. It is not the same as the broader LifeBench citizen proposal.

**Initial observational baseline:** Destatis reported around 693.3 million chickens, turkeys and ducks slaughtered in 2024 and 697.3 million in 2025. These figures describe conditions and are not independent proof of animal welfare or any legislative effect. Further welfare and enforcement measures are required.

## 3. Product architecture

### Evidence engine
Gather versioned primary records and published statistics with their source IDs, URLs, source dates, retrieval timestamps, parser versions, uncertainty and corrections. Never fill absent official events with model guesses. A red/degraded state is better than an invented green badge.

### Legislation engine
Map one issue to actual legal instruments and amendments. Compare present versus proposed statutory text with anchored citations. Track introduction, readings, committees, Bundestag and Bundesrat, mediation as appropriate, official promulgation, commencement, implementation, amendment, repeal and evaluation.

### Design and drafting engine
Give users an understandable proposal with a theory of change, alternative routes, legal competence check, exact text as a clearly labelled working draft, funding mechanism, affected groups, strongest objections and review requirements. Use an independent critic/evaluator separate from the drafting model. Do not infer legal correctness from fluent language.

### Participation engine
Support open public discussion (clearly non-official), consultation records and human-controlled submission packages. Link to the applicable Bundesministerium, Bundestag, Land or EU portal and verify a specific deadline before saying a consultation is open. Users, never AI agents, submit political actions. Record acknowledgement and official response only when evidence exists.

### Impact engine
Define the baseline and outcome measure before reforms take effect; choose observation frequency and counterfactual. Track welfare, enforcement, affordability, public budgets, worker transitions and displacement effects. Publish uncertainty, null results and harmful results. Independent domain and statistical reviewers approve any causal claim.

### Shared open protocol
Machine-readable records for policy proposal, evidence item, legal event, consultation, implementation and outcome. Open version history, correction trails, documented model tests and multilingual accessibility.

## 4. What AI may and may not do

**Yes:** summarise retrieved source-backed facts, identify legal questions and alternatives, draft non-official text, challenge assumptions, organise public comments, explain process, propose evaluation designs and translate into accessible language.

**No without human authorisation:** send political messages, submit petitions or consultations, create fake supporters, impersonate institutions, claim citations were reviewed when they weren't, change official legal status or assert impact from a model prediction.

**Current product:** Optional Chrome on-device Prompt API on compatible desktop devices. The fallback is an explicitly labelled structured draft template. Neither provides legal advice or autonomous verification. No API keys are embedded in public code.

**Future service:** Authenticated server-side models with evidence retrieval, source verification, rate/cost limits, data deletion, prompt-injection resistance, consent, red-teaming and independent legal-drafting benchmarks. Deploy only after security, governance and funding exist.

## 5. Governance and ethical design

- Open source, open methods, transparent funding and declared conflicts of interest.
- Private drafts by default; no silent disclosure of a user's political views.
- Peer review separated into evidence validation, legal review, stakeholder analysis and impact methodology.
- Accessible, mobile-first, plain-language and multilingual pathways.
- Genuine representation of affected people and substantive opposition; no hidden targeting, mass persuasion automation or engagement-as-consensus metrics.
- Correction and appeals channels; review and retraction procedures for incorrect claims.
- Funding must not buy favourable impact scores or legal-review conclusions.

Proposed roles (not yet staffed): product steward, source/data maintainer, qualified legal reviewer, impact scientist, community moderator, privacy/accessibility reviewer and affected-community advisers.

## 6. Roadmap and release gates

### Phase 0: November–December 2026 · Working product
**Shipped:** Official-source monitor; legislative milestones; six missions; open consultation handoff; source health; editable proposals; optional local AI on supported Chrome; human-reviewed export; private submission record; Destatis baseline; evaluation-plan export; desktop/mobile tests and automated refresh.

**Next release gate:** A source-by-source, independently reviewed legal problem definition for one Tierschutzgesetz intervention, with failures and counterarguments. Validate unsupported-AI fallback, source outages and full keyboard flow.

[Milestone 01 · Legal drafting & review](https://github.com/mikelninh/mikelninh.github.io/issues/152)  
[Milestone 03 · Official event graph](https://github.com/mikelninh/mikelninh.github.io/issues/154)

### Phase 1: Q1–Q2 2027 · First formal civic action
Produce a compact, legally reviewable animal-welfare memorandum; recruit independent legal, farm/worker and welfare feedback; compare at least three feasible intervention paths; find a genuinely open official consultation or petition; let a human submit; record the institutional response if and when obtained. Document null results and dead ends.

[Milestone 02 · Consultation and institutional response](https://github.com/mikelninh/mikelninh.github.io/issues/153)

### Phase 2: Q2–Q4 2027 · Collaboration and trust
Extend primary-source coverage to Bundesrat and Länder, link exact statutory versions/diffs, add controlled collaborative review and evidence de-duplication, publish robust model evaluations and accessibility tests. Introduce identity and hosted AI only if privacy, abuse prevention, cost limits and consent controls are in place.

[Milestone 03 · Official event graph](https://github.com/mikelninh/mikelninh.github.io/issues/154)  
[Milestone 05 · Governance and partnerships](https://github.com/mikelninh/mikelninh.github.io/issues/156)

### Phase 3: 2028–2029 · Measure real impacts
Establish an independent evaluation consortium, pre-register primary animal welfare outcomes, collect credible measures and conduct appropriately designed research where possible. Publish positive, null and negative effects with uncertainty, data-quality audits and limitations. Do not equate a law's adoption with its measured effect.

[Milestone 04 · Animal welfare evaluation](https://github.com/mikelninh/mikelninh.github.io/issues/155)

### Phase 4: 2030–2035 · Replicate and scale
Make the civic lifecycle reusable across federal, Land, municipal and EU contexts. Pilot nutritious public catering and at least one additional policy domain. Build an open standard and reproducible case studies, with clear limits to transferability.

[Milestone 06 · Repeatable toolkit](https://github.com/mikelninh/mikelninh.github.io/issues/157)

### Beyond 2035
Support cross-border knowledge exchange and improved governance where institutions welcome it. Measure flourishing and suffering reduction with humility. Avoid civilisation-wide scores that hide who is worse off.

## 7. Next 30 days: concrete execution

**Week 1:** Release LifeBench 3.0; regression-test mobile/desktop, offline source handling, local AI availability and no-submission guarantees. Publish this plan and its open engineering issues.

**Week 2:** Compile a specific Tierschutzgesetz legal issue tree: exact current sections, candidate change, prior debates, legislative competence, affected groups, cost assumptions and strongest objections.

**Week 3:** Organise voluntary feedback from a lawyer, researcher, welfare practitioner and affected farming/worker perspective; record disagreements in the public issue, with consent.

**Week 4:** Select one feasible reform route, draft and review a precise policy memorandum, determine whether there is an actually open official channel, and define an outcome study before claiming impact.

These are *targets*, not completed actions or promises of institutional participation.

## 8. Quality gates, metrics, stop conditions

**Source gate:** IDs, URLs, raw statuses, dates, full provenance, freshness, source health and independent checks. No false promulgation or commencement.

**Drafting gate:** Legal competence and alternatives checked, annotated original text, uncertainty, costs, opposition, accessible language, human review and zero fabricated citations in tested scenarios.

**Participation gate:** Legitimate open channel and deadline, user consent, privacy review and institutional acknowledgement before claiming submission.

**Impact gate:** Pre-registered indicator, trustworthy denominator, reliable comparison and independent reviewer. Correlation alone does not permit causation.

**Safety stop:** Halt automation if a source is unavailable, an issue could trigger mass political messaging, a consultation misrepresents consensus or a model invents legal authority.

**Success:** Meaningful legal and institutional process improvements, effective implementation and independently evidenced benefit to life. Not number of AI outputs, issue comments, signatures or media impressions.

## 9. Current limitations (honest status)

This is a **public-source-connected interactive prototype**, not an autonomous legislature, certified legal advice service, official petition portal or proven impact engine. Direct AI drafting requires a compatible Chrome on-device model. Formal submissions are deliberately performed by people. Private records in the app live in one browser. Verified outcomes require years of well-designed data collection, institutional partners and review.

## 10. First official source links

- [Bundestag DIP API](https://search.dip.bundestag.de/api/v1/swagger-ui/)
- [Animal welfare legislative case 334563](https://dip.bundestag.de/vorgang/334563)
- [Bundesgesetzblatt](https://www.recht.bund.de/)
- [Gesetze im Internet](https://www.gesetze-im-internet.de/)
- [Bundestag Petitionsausschuss](https://www.bundestag.de/petitionen)
- [EU public consultations](https://have-your-say.ec.europa.eu/index_en)
- [Destatis official poultry statistics](https://www.destatis.de/DE/Presse/Pressemitteilungen/2026/02/PD26_049_413.html)
- [Chrome built-in AI Prompt API](https://developer.chrome.com/docs/ai/prompt-api)
- [LifeBench source and issue tracker](https://github.com/mikelninh/mikelninh.github.io/tree/main/firstlight-lab)

**Final question:** What can an independent observer verify became better for real living beings because of this work?
