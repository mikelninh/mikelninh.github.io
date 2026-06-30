# Charly Micro-Sandbox

A small, testable GovTech AI sandbox for the fictional city Beispielsburg.

## What works on GitHub Pages

- Local knowledge base from `knowledge.json`
- Browser retrieval over knowledge chunks
- Source ranking and source display
- Action router for appointment, callback, ticket and answer flows
- Simulated appointment / callback / ticket receipts
- Evaluation set from `eval.json`

## What works on Vercel with `OPENAI_API_KEY`

- Server-side OpenAI call through `/api/charly`
- Retrieved chunks are passed as grounded context
- GPT-5.5 generates a plain-German citizen answer
- JSON output includes intent, department, action, confidence, sources, next steps and receipt

## Deploy

1. Import this GitHub repo into Vercel.
2. Add environment variables:

```bash
OPENAI_API_KEY=your_api_key_here
OPENAI_MODEL=gpt-5.5
```

3. Open:

```text
https://YOUR-VERCEL-DOMAIN/zaitgeist-v2/
```

4. Test the button `LLM/RAG fragen`.

## Honest scope

Real:
- local knowledge base
- lexical retrieval
- source ranking
- server-side LLM call on Vercel
- structured LLM output
- eval set

Simulated:
- calendar booking
- callback creation
- municipal ticket system

Next production step:
- real municipal crawler
- vector retrieval / embeddings
- real calendar and ticket integrations
- auth, logging, PII handling and monitoring
