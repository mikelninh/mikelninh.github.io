# FIRST MILE — Model Lab v2

Public comparison interface: https://mikelninh.github.io/first-mile/lab/

Goal: compare rule-based extraction, GPT, Claude, and a bounded source-verified two-stage workflow on exactly the same synthetic pitch documents and labelled expectations.

## Four approaches

- Rules: current deployed JavaScript extraction engine, executed locally in the browser and via Node.js.
- GPT: OpenAI Responses API JSON-schema output, one extraction pass.
- Claude: Anthropic Messages API JSON-schema output, one extraction pass.
- Verified workflow (GPT or Claude): extraction, deterministic source-quote/number verification and a second model request for interview questions. No external actions and no investment decision.

## Method

Six developer-authored synthetic cases, including four development examples and two authored challenge styles. Eight field statuses per case: 48 labels overall. Status agreement is measured exactly against the authored expected labels. Quote checks require identical text, filename and page; numeric values must match the cited quote. Metrics are field status agreement, missing/invalid quotations, provider tokens, wall-clock latency and optional user-supplied pricing estimates.

This is not independent field accuracy on real pitch decks; not all claims in these fixtures are fully verified business facts. Challenge cases are also developer-authored.

## Run without any API requests

From the root of the GitHub repository, with Python 3.11+ and Node.js 20+:

    node first-mile/lab/baseline.mjs
    python first-mile/lab/benchmark.py --engines rules --output first-mile/lab/results.rules.local.json

The real browser lab also executes the deployed rule baseline from the same fixtures.

## Run actual GPT, Claude and two-stage workflows

Configure environment variables on your own machine:

    OPENAI_API_KEY
    OPENAI_MODEL
    ANTHROPIC_API_KEY
    ANTHROPIC_MODEL

Set model IDs you have access to. Credentials must NEVER be added to source code, browser controls, or committed files.

Then run an explicitly authorised paid comparison:

    python first-mile/lab/benchmark.py --engines rules,gpt,claude,agent-gpt,agent-claude --allow-billable --output first-mile/lab/results.local.json

This can make up to 36 billable model calls for six cases (6 GPT + 6 Claude + 12 agent GPT + 12 agent Claude). No automatic retries. Only run against these fictional, synthetic data fixtures. There is no live API backend attached to the public site.

Open the public Model Lab and import results.local.json. The JSON stays in your browser; no upload endpoint is used.

Optional rate variables, if you want cost estimates, are OPENAI_INPUT_USD_PER_M, OPENAI_OUTPUT_USD_PER_M, ANTHROPIC_INPUT_USD_PER_M, ANTHROPIC_OUTPUT_USD_PER_M. When rates are not supplied, cost is unknown, not zero. These are user-defined estimates rather than quotes.

## Tests

    node --test tests/first-mile.test.mjs
    node --test first-mile/lab/lab.test.mjs
    python -m unittest first-mile/lab/test_benchmark.py -v

No silent claims: Structured outputs guarantee schema format, not truth. An invented source quote is rejected. Forecasts are distinct from current values. No model automatically sends messages, approves deals or decides on founders.

Next meaningful validation: obtain permission for blinded, labelled, representative real documents; measure errors, review time with corrections, and practical question quality. Repeat tests before increasing automation.
