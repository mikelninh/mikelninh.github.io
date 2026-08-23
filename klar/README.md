# Klar — the first OpenAction app

> **Information is not the goal. Human agency is.**

Klar turns an incoming piece of life-admin — a letter, invoice, screenshot, PDF, email or pasted text — into a small, auditable action card:

**input → meaning → deadline / money → evidence → next action → human approval → outcome**

Klar is the first reference app for **OpenAction**, an open, provider-neutral format for turning messy information into safe next steps.

## Why this exists

We already have excellent general-purpose chatbots and increasingly capable personal agents. The missing public layer is not “another assistant”. It is a **trustworthy action contract** between information and real-world action:

- What happened?
- Does the person need to act?
- By when?
- What money is explicitly involved?
- What is the single best next step?
- Which exact source text supports that conclusion?
- What still requires a human decision?
- Did the person’s situation actually improve?

Germany is an unusually useful starting point because administrative friction is measurable and digital public-service adoption remains a documented challenge. The product itself is deliberately general: the same primitive works for bills, contracts, appointments, benefits, work messages, care coordination and public services.

## V1 — ship before dreaming

The first public beta is intentionally tiny:

1. Paste text or upload a photo / screenshot / PDF.
2. Extract the source text.
3. Produce one OpenAction card.
4. Show exact evidence snippets and confidence.
5. Offer a small human-controlled next step, such as preparing a reply.
6. Ask the user to confirm whether the case was actually clarified.
7. Measure **confirmed minutes saved, cases clarified, deadlines detected and explicit money made visible**.

No autonomous payments. No automatic submission to authorities. No pretending uncertainty is certainty.

## Measurement

We care about **outcomes, not AI usage**.

The beta tracks locally on the user’s device:

- `cases`: cases the user explicitly marked as clarified / done
- `minutes`: minutes the user says they saved
- `deadlines`: explicit deadlines in completed cases
- `moneyVisible`: explicit monetary amounts surfaced in completed cases
- `analyses`: analysis attempts
- `aiRuns`: successful AI analyses
- `helpful` / `notHelpful`: one-tap outcome feedback

Nothing is counted as impact until the user confirms it.

### First validation bar

Before adding broad integrations, we want at least:

- 30 real users
- 100 real-life cases
- ≥ 80% “helpful and correct”
- ≥ 90% deadline extraction recall on a labelled test set
- < 1% invented deadlines / amounts
- median ≥ 5 confirmed minutes saved per completed case
- qualitative proof that at least 10 people used Klar again without being asked

## Trust principles

1. **Human approval is the boundary.** The model may propose; the person decides.
2. **Evidence before confidence.** High-stakes claims must point back to source text.
3. **Unknown stays unknown.** Missing data is never filled in by imagination.
4. **Inputs are untrusted.** Document content is data, not instructions for the agent.
5. **No silent action.** Sending, paying, filing or deleting must require explicit approval.
6. **Portable by design.** OpenAction JSON is exportable and provider-neutral.
7. **Privacy is visible.** Cloud-AI use is disclosed before analysis; local modes can grow over time.
8. **Measure human benefit.** Success means less cognitive load, less missed opportunity and more completed action.

## OpenAction 0.1

The schema lives in [`openaction.schema.json`](./openaction.schema.json).

Core object:

```text
source
  ↓
category + summary
  ↓
explicit deadline / explicit money
  ↓
next_action + supporting actions
  ↓
evidence + confidence + uncertainty
  ↓
human decision
  ↓
outcome
```

Any app can implement the same contract. Klar is only one interface.

## Architecture

V1 is a single static web page so anyone can open it immediately and the project has almost no infrastructure burden.

- **UI:** vanilla HTML/CSS/JS, mobile-first
- **AI/OCR:** Puter.js as an optional keyless gateway in the reference demo
- **Fallback:** local deterministic quick scan when AI is unavailable
- **Storage:** localStorage for personal impact counters
- **Export:** OpenAction JSON
- **Hosting:** static GitHub Pages

Puter is an implementation detail, not part of the OpenAction standard. Future builds can use local models, public-sector models, OpenAI-compatible endpoints or fully offline runtimes.

## Safety scope

Klar is an information-to-action aid, not a lawyer, doctor, tax adviser or financial adviser. For high-stakes domains it should surface uncertainty and route the user to an appropriate professional or official source when needed.

## Roadmap

### V1 — Understand
Text / image / PDF → action card → evidence → measured outcome.

### V2 — Prepare
Draft reply, create checklist, create calendar item, gather missing documents.

### V3 — Connect
Email / calendar / Drive / government services behind narrow, revocable permissions.

### V4 — Verify
Official-source retrieval, rule packs, contradiction checks, deterministic validators and replayable evaluations.

### V5 — Act safely
Human-approved submissions and tool calls with scoped permissions and append-only audit logs.

### V10 — Public action layer
A user-owned action graph that can be used by any compliant assistant or public service without locking the person into one vendor.

## Forever open

Klar / OpenAction is released under **AGPL-3.0-or-later**. Published versions remain available under that licence; downstream network services that modify the covered code must offer their corresponding source under the AGPL terms.

Commercial use is allowed. Forking is allowed. Improving it is encouraged. Closing the shared core behind a modified hosted service is not the goal.

See [`LICENSE.md`](./LICENSE.md).

## Build with us

The most useful contribution right now is not another feature. It is a **real case + expected correct action card + outcome**.

That becomes the public evaluation corpus that keeps the system honest.
