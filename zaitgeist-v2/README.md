# Charly Micro-Sandbox

A small, testable GovTech AI sandbox for the fictional city Beispielsburg.

## What works on GitHub Pages

- Local knowledge base from `knowledge.json`
- Browser retrieval over knowledge chunks
- Source ranking and source display
- Action router for appointment, callback, ticket and answer flows
- Simulated appointment / callback / ticket receipts
- Evaluation set from `eval.json`

## What works on Vercel with an LLM key

- Server-side LLM call through `/api/charly`
- Retrieved chunks are passed as grounded context
- JSON output includes citizen answer, intent, department, action, confidence, sources, next steps and receipt
- Provider can be OpenRouter/DeepSeek or OpenAI

## Cheap default: OpenRouter + DeepSeek V3.1

Recommended environment variables:

```bash
LLM_PROVIDER=openrouter
OPENROUTER_API_KEY=your_openrouter_key_here
LLM_MODEL=deepseek/deepseek-chat-v3.1
SITE_URL=https://YOUR-VERCEL-DOMAIN/zaitgeist-v2/
```

## Optional: OpenAI instead

```bash
LLM_PROVIDER=openai
OPENAI_API_KEY=your_openai_key_here
LLM_MODEL=gpt-5.5
```

## Deploy

1. Import this GitHub repo into Vercel.
2. Add the environment variables above.
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
