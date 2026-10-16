# FIRST MILE v1

Independent product / engineering portfolio proof by Michael Ninh. Not affiliated with HTGF.

Live experience: https://mikelninh.github.io/first-mile/

## What really works

Text-based PDF files are extracted client-side using PDF.js 4.10.38 (fetched from jsDelivr); TXT is also supported. The public sample uses two fictional documents with deliberately different figures. A deterministic engine selects a small set of claims and attaches document name, page and literal excerpt. Missing topics and differing figures remain visible. A human reviewer writes notes and exports a Markdown briefing.

The documents are not uploaded by this tool, although fetching PDF.js contacts a CDN. Do not provide sensitive/confidential material without appropriate authorisation. No analytics or external AI API is used by this app.

## What is not proved

The parser is heuristic, not an LLM. No OCR, no judgement about company attractiveness, no verification of financial truth, no broad document accuracy claims, no real HTGF workflow integrations, and no measured time savings. The page reconstruction may struggle with multi-column layouts. Text-free scans fail clearly.

## Evaluation

Run: node --test tests/first-mile.test.mjs

18 synthetic deterministic contract checks cover source attribution, positive/negative extraction, differences and missing fields. These are not real-world accuracy metrics. Pilot next with consenting reviewers on representative documents; compare elapsed time including corrections, missed facts, unsupported observations and usefulness of questions.

Related deeper research prototype: https://mikelninh.github.io/venture-intelligence/
