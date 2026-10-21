# BIDPILOT + RETURN LOOP · v13 (21 October 2026)

Two independent, truthful application work samples. Not affiliated with A11, SNOCKS, OpenAI, TED or any public buyers.

## BIDPILOT

`bidpilot/bidpilot-v13.html` is a self-contained browser demo with six historical, document-linked TED references. It lets users compare a potential fit, a barrier and the official original, then record/export a go/clarify/no-go choice. Two examples per team is **curation**, not the output of an exhaustive live procurement search. Open the HTML locally, or serve as a static site.

**First-value hypothesis:** reviewing known barriers before preparing an offer could reduce wasted pursuit time. We have not measured time savings or user conversion. This is not a procurement-eligibility checker and cannot guarantee the notices are open now.

## RETURN LOOP

`return-loop/index.html` showcases 24 explicitly synthetic e-commerce messages including complaints about size, shipping, returns, order errors and distinct defect subtypes. The rule baseline executes in the browser, users can review classifications and export a local JSON report. The OpenAI button calls a **real serverless API** only if a server-side key is configured; otherwise it is clearly disabled. Never show invented model output.

### Run locally without an API key

```bash
cd return-loop
npm run check
npm run dev
# Visit http://localhost:3000
```

You can also open the HTML locally: the embedded synthetic fixtures are a static fallback and the live AI call remains disabled.

### Run real OpenAI requests

Deploy `return-loop/` as the Vercel project's **root directory** (Node.js framework, or automatic framework detection). Configure `OPENAI_API_KEY` as a **server-side encrypted environment variable**, for Production (and Preview if needed). Never use `NEXT_PUBLIC_OPENAI_API_KEY`, never put a key in GitHub, browser JavaScript or a chat message. Optionally set `OPENAI_MODEL=gpt-4.1-mini` (default). Redeploy after setting the environment variable. Then check `/api/status` returns `configured:true`, and press **Mit echter KI analysieren** on a synthetic ticket.

The `/api/classify` route only accepts listed case IDs and uses the Responses API with `store:false` and strict structured JSON output. It checks evidence snippets and returns a real model name, request ID, token usage and latency. There are no real orders, carriers, refunds, external actions or customer data.

**Before publishing with a paid key:** configure a hard project/org usage budget and global distributed request rate limiting / bot protection (e.g., Vercel WAF or external KV-based limit). The current per-process 5/min throttle is not globally robust across serverless instances. For a public hiring demo, keep inference restricted to synthetic fixtures. Confirm production requests and billing limits before sharing widely.

### Evaluate rather than guess

```bash
cd return-loop
# Only after the API key has been securely configured in your shell (never check it in):
npm run eval -- --confirm-cost
```

This sends 12 deliberately held-aside synthetic messages to the real OpenAI model, compares against fixed rules and exports precision, recall, F1 and defect misses per class to `eval-results-v13.json`. No evaluations have been performed with a live key as part of this handoff; the evaluation is not a customer-level accuracy estimate, even after it is run. Human-annotated real cases, consent, PII handling, metrics and measured latency/cost are required for production readiness.

### Important deployment status

The connected Vercel account returned HTTP 403 on both creating a new project and deploying to the existing `return-loop-proof-mn-2026` project. Therefore **the real OpenAI deployment is NOT yet public**. GitHub contains the v13 code, and you can deploy it with an account that has permissions. Do not change CV/cover-letter links from v12 until the API is confirmed live. BIDPILOT can be deployed as a static page separately.
