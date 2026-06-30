# Charly Micro-Sandbox

A small, testable GovTech AI sandbox for the fictional city Beispielsburg.

## What works on GitHub Pages

- Local knowledge base from `knowledge.json`
- Browser retrieval over knowledge chunks
- Source ranking and source display
- Action router for appointment, callback, ticket and answer flows
- Simulated appointment / callback / ticket receipts
- Evaluation set from `eval.json`

## What works on Vercel with OpenRouter

- Server-side LLM call through `/api/charly`
- Retrieved chunks are passed as grounded context
- JSON output includes citizen answer, intent, department, action, confidence, sources, next steps and receipt
- Provider is OpenRouter only, to keep usage cheap and avoid OpenAI fallback costs

## Cheapest first test setup

```bash
OPENROUTER_API_KEY=your_openrouter_key_here
LLM_MODEL=qwen/qwen3-32b
SITE_URL=https://YOUR-VERCEL-DOMAIN/zaitgeist-v2/
```

## Upgrade model if needed

```bash
# Stronger still cheap model
LLM_MODEL=deepseek/deepseek-chat-v3.1

# Long-context model
LLM_MODEL=google/gemini-2.5-flash-lite
```

Start with Qwen3 32B for cheap testing. If German answer quality or JSON discipline is not good enough, switch to DeepSeek V3.1. If the knowledge base becomes much larger, test Gemini Flash Lite.

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
