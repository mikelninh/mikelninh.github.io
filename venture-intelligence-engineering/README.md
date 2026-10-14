# Venture Intelligence v0.5 · Engineering evidence

**Great ideas deserve a chance to be understood.**

Independent AI-engineering portfolio project by Michael Ninh. Not affiliated with HTGF; not an investment scoring product. [Try the fictional public investigation](https://mikelninh.github.io/venture-intelligence/?demo=investigation).

## What the project proves
An actual local FastAPI/PyMuPDF application can read a PDF, bind extracted facts to line citations, refuse conflicting values (NovaSense says **8** and **80** paying customers), record a four-stage execution trace, and require human review before any decision. It saves review notes in SQLite and displays a reproducible synthetic evaluation lab.

The complete runnable v0.5 source package is provided separately with the application materials. **This GitHub folder currently contains a public core-workflow excerpt and evaluation documentation, not the entire independently runnable FastAPI repo.** It is published here so reviewers can inspect the boundaries and orchestration without being misled by the static web showcase.

## Workflow
`ingest → extract → verify → review_checkpoint`. The true LangGraph StateGraph entrypoint lives in `workflow.py`; if LangGraph is missing, a separate local sequential runner reports its engine accurately rather than pretending to be LangGraph.

### Engineering checkpoints
- 19 local Python tests passed; 1 real LangGraph integration test skipped due to package-download restrictions.
- Chromium browser smoke passed with real FastAPI ASGI, source inspector, conflict case, SQLite review notes, evaluation lab, responsive navigation and four-step trace.
- Synthetic evaluation: **505/510** baseline field exact matches → **510/510** after a known-label patch, **on the same fixtures**. This is in-sample correction, not real-world model accuracy. Conflicts: 5/5; accepted values with no matching citation: 0.

## Limits
No production LangGraph run verified in the offline sandbox. Langfuse metadata-only integration is optional and untested here. No OCR, confidential production PDFs, authenticated uploads, portfolio RAG or autonomous investment decisions. **Do not deploy the local upload API publicly.**

## What to inspect
- [Live public synthetic case](https://mikelninh.github.io/venture-intelligence/?demo=investigation)
- [Static case-study source](https://github.com/mikelninh/mikelninh.github.io/blob/main/venture-intelligence/index.html)
- [Full personal portfolio](https://mikelninh.github.io/)
- [Beyond the CV](https://mikelninh.github.io/beyond-cv/)
