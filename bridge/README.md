# BRIDGE · Founder Support MVP

**Live public demo:** https://mikelninh.github.io/bridge/

Independent product discovery exercise by Michael Ninh, **not an official HTGF product**.

## Problem hypothesis

Founder support is often distributed across know-how, people and public resources. A small, source-linked "next step" briefing might help founder-support teams handle an incoming request more clearly and quickly.

This is **not** a claim about what HTGF staff currently need. The next step is to interview actual users.

## Working public prototype

- Choose one of three fictional challenges: MedTech clinical pilots; Climate Tech industrial pilots; B2B SaaS early sales.
- Edit the fictional founder request in the browser (not sent anywhere).
- Deterministic keyword routing selects a category and three documented public resources from an **eight-item curated catalogue**.
- Each resource has an original external link, why it might matter, and a clear caveat about availability and eligibility.
- Two honest clarifying questions and a suggested next *human* step.
- Briefing copy / Markdown export requires explicit human confirmation.
- Optional local feedback via browser localStorage and voluntary mailto contact.

**There is no hosted API, external LLM, RAG pipeline, authenticated network database, actual personal contact recommendation or automatic outreach.** This is a public product hypothesis test, not a deployed founder-support service.

## Source principles

Most resources describe publicly available information. Historical HTGF Academy material is explicitly marked as older context rather than a live calendar. A citation supports what a published source says, not actual access to a person or benefit.

## First test plan

Interview 2–3 founder-support professionals and 3–5 founders who voluntarily provide non-confidential example needs. Ask them to finish one task using BRIDGE and one manually. Measure:

1. Time to a useful next action versus the present process.
2. % of recommended sources rated actually helpful.
3. Missing context or follow-up questions.
4. False matches and misleading assumptions.
5. Whether anyone asks to return to the workflow.

**Release gate:** Do not add a private CRM or send emails until the need, data rights and review process are validated.

## Engineering

- [HTML](index.html) · [CSS](style.css) · [vanilla JavaScript](app.js)
- Static GitHub Pages hosting; deliberately no secrets
- No tracking script; typed request stays on device
- [Original portfolio](https://mikelninh.github.io/) · [Beyond the CV](https://mikelninh.github.io/beyond-cv/)

## Known shortcomings

Keyword routing can fail on unfamiliar terms. The catalogue is manually curated and can become stale. The app cannot confirm eligibility, availability or current human contacts. Browser-local usefulness feedback is **not** centralized analytics. Nothing here demonstrates a production-grade agent or verified user demand.
