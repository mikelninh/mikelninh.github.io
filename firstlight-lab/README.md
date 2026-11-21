# LifeBench · Democracy Lab 3.0

**Public workbench:** https://mikelninh.github.io/firstlight-lab/lifebench.html  
**Long-term plan:** https://mikelninh.github.io/firstlight-lab/masterplan.html  
**Full strategy:** [MASTERPLAN.md](./MASTERPLAN.md)  
**Execution issues:** [Six public milestones](https://github.com/mikelninh/mikelninh.github.io/issues?q=is%3Aissue+LifeBench+Roadmap)

A source-backed public-interest policy workspace. **It is not an official legislative portal, a law firm, a polling service or proof of political impact.**

## Try it in 60 seconds

1. Open the [app](https://mikelninh.github.io/firstlight-lab/lifebench.html). Select **Tierschutz**.
2. Inspect **Gesetz live**. DIP is the source of the parliamentary record. Publication, commencement and observed impact remain distinct.
3. Open **Vorschlag**. Edit your goal and evidence sources. **Gerüst erstellen** always works. On eligible desktop Chrome machines, **Mit lokaler KI ausarbeiten** attempts an on-device model; there is no undisclosed remote AI fallback.
4. Open **Mitmachen**. Choose a real institutional route and consciously verify sources, competence, counterarguments and intent. Only then can you export a *not-submitted* handoff packet.
5. If you genuinely submitted an action yourself, add a **private** record of the date, reference and public response URL. It remains unverified unless independently cross-checked.
6. Open **Wirkung**. Inspect the source-backed Destatis baseline and define a study protocol without claiming causation. Export for expert review.

All locally saved work is stored in your **current browser**; it is not encrypted or synchronised. Clear browser storage to remove it on the device. Do not enter confidential information or personal details into public issues.

## Shipped functionality

| Layer | Implemented | Important boundary |
|---|---|---|
| Official monitoring | Bundestag DIP, Bundesgesetzblatt RSS, Gesetze im Internet RSS | A source refresh is not legal validity |
| Legislative timeline | Parliament record and primary-source events | Commencement must be separately verified |
| Source health | Data age, status and updates | Degraded feeds are visible, not fabricated |
| Civic drafting | Editable structure and exportable evidence-constrained prompt | Not legal advice |
| Direct on-device AI | Optional Chrome Prompt API with availability check | Desktop/device-dependent; no remote fallback |
| Handoff | Human review gate, exportable evidence packet, official route links | **No automatic petitions, lobbying or submissions** |
| External action log | Local manually entered submission/response records | Self-reported, not official verification |
| Impact research | Official observed baseline and pre-registration-style method export | No validated causal effect yet |
| Roadmap | 2026–2035 masterplan and six GitHub milestones | Planned future work is not completed |
| QA | Desktop/mobile browser smoke tests, regression workflow | Does not replace legal, privacy or accessibility expert review |

## Data pipeline

- [Official monitor](./scripts/monitor.py) uses the Bundestag [DIP API](https://search.dip.bundestag.de/api/v1/swagger-ui/), [Bundesgesetzblatt RSS](https://www.recht.bund.de/), [Gesetze im Internet](https://www.gesetze-im-internet.de/) and public GitHub discussion metadata.
- The public historical snapshot is in [data/law-feed.json](./data/law-feed.json). It retains primary URLs, source health and timestamps.
- [.github/workflows/lifebench-monitor.yml](../../.github/workflows/lifebench-monitor.yml) refreshes twice daily and when triggered. It runs unit tests, checks output invariants and commits only changed evidence data.
- If a secondary source is unreachable, the monitor can complete with a **degraded** source status; that cannot be used to assert legal promulgation or commencement.
- [.github/workflows/lifebench-qa.yml](../../.github/workflows/lifebench-qa.yml) checks changed UI code and evidence contracts. The existing Pages pipeline deploys the website.
- Exactly matched official documents can establish specific official events. An individual government vote cannot establish the date a law took effect or prove that it improved life.

## Civic drafting, participation and AI

Chrome's [on-device Prompt API](https://developer.chrome.com/docs/ai/prompt-api) is only available on supported systems. Some browsers may need a model download; the availability state is displayed on request. The app does not embed private API keys, submit user text to an unspecified cloud service or pretend the fallback template is AI.

Bundestag petitions and ministry/EU consultations use **human-controlled official handoffs**. The previous Bundestag petition portal ended new submissions on 18 November 2026; users must verify the current route through the [official Bundestag Petitionsausschuss page](https://www.bundestag.de/petitionen). LifeBench's GitHub Issues are a *non-official* community dialogue, not a substitute.

No public opinion is inferred from issue/comment counts. No automated messages are sent to political actors.

## Outcomes and research

The [impact registry](./data/impact-registry.json) includes official observed poultry-slaughter figures for 2024 and 2025, with citations. These are *contextual observations*, not a comprehensive welfare index and not proof that an amendment changed conditions. The new evaluation-plan builder requires a research question, indicator, methodology, comparison, rival explanations and human review.

No verified causal outcome may be displayed without a defensible design, source, uncertainty and independent evaluation.

## Testing

Run from the repository root (Python standard library and Node installed):

    node --check firstlight-lab/law-os.js
    node --check firstlight-lab/law-os-v3.js
    python3 -m unittest discover firstlight-lab/tests -p 'test_*.py' -v
    python3 -m json.tool firstlight-lab/data/law-feed.json >/dev/null

Browser QA has been run at 1440px and 390px for creation, fallback, local-AI mock, review gating, exports, submission notes, evaluation protocols, page links and overflow checks. The browser-model mock is only a compatibility test; a real downloaded on-device model was **not** independently proven on the user's computer.

## Current priorities

1. [Source-cited legal reform memorandum and independent review](https://github.com/mikelninh/mikelninh.github.io/issues/152)
2. [Genuine official participation with a recorded institutional response](https://github.com/mikelninh/mikelninh.github.io/issues/153)
3. [Source-level legislative graph, Bundesrat coverage, law text versions](https://github.com/mikelninh/mikelninh.github.io/issues/154)
4. [Independent welfare and implementation evaluation](https://github.com/mikelninh/mikelninh.github.io/issues/155)
5. [Governance, privacy, accessibility and partners](https://github.com/mikelninh/mikelninh.github.io/issues/156)
6. [Replicable civic toolkit](https://github.com/mikelninh/mikelninh.github.io/issues/157)

**Guiding question:** What did a genuinely independent observer verify became better for real living beings?
