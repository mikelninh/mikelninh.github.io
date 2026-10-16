# FIRST MILE — GPT-6 Luna / Sol / Astra reasoning matrix

This is a budget-aware, reproducible OpenAI-only comparison. No Claude needed.

## Budget and model settings

User-reported API credit balance: $2.58. Our initial conservative runner budget: $1.50. Keep the rest available for a follow-up experiment.

Nine variants, all using OpenAI Responses API structured JSON output:

- GPT-6 Luna with none, low, medium and high reasoning.
- GPT-6.1 Sol with low, medium and high reasoning.
- GPT-6 Astra with low and high reasoning.

First, all nine settings evaluate the same three synthetic examples: Asterion, Riverbend and Tomorrow Mobility. That is 24 expected field labels per configuration. Then the strongest completed setting in each model family continues with the remaining three cases. This yields up to 48 matched field labels for each finalist.

The comparison records exact field classification, rejected ungrounded quotes, provider tokens, latency and observed cost. It recommends the cheapest full six-case finalist within one correct field of the best-quality finalist, and labels this outcome PROVISIONAL. If budget or model access prevents complete data, no valid winner is declared.

Current standard input/output rates per one million tokens:
- gpt-6-luna: $0.10 / $0.50
- gpt-6.1-sol: $2.00 / $10.00
- gpt-6-astra: $10.00 / $50.00

Rate differences across effort levels are not intrinsic; higher reasoning can consume more tokens. Confirm provider prices before a real run.

## How to test

From the cloned repository root with Python 3.11+:

Dry run, no provider requests and no credit consumption:

    python first-mile/lab/matrix.py --budget-usd 1.50 --output first-mile/lab/results.matrix.dry.local.json

With a private OPENAI_API_KEY configured in your LOCAL shell, authorize real billable model calls:

    python first-mile/lab/matrix.py --allow-billable --budget-usd 1.50 --output first-mile/lab/results.matrix.local.json

Import the local resulting JSON file in the FIRST MILE Model Lab matrix importer. The web page does not need or receive your API key.

## Important limitations

This is a self-authored synthetic test set, not independent representative deck evaluation. Structured outputs can still be incorrect. A deterministic validator rejects mismatched citations, page names or numbers. The API runner sets store=false and max_output_tokens=1400. High reasoning may exhaust output tokens without producing structured JSON; that is an observed failure, not a quality score.

The $1.50 budget guard conservatively reserves capacity before requests and uses token usage after responses. It is NOT a provider-enforced hard account spending limit, especially if a failed request is charged differently than expected. Set spending limits in the OpenAI Platform dashboard as a second safeguard. Actual pricing may change.

Model access also depends on the API account/project. If a request is rejected, the case is recorded as failed, not silently replaced with a different model. Results and confidential documents must not be committed to this public repository.

## Windows starter

In Windows PowerShell after cloning the repository:

    powershell -ExecutionPolicy Bypass -File first-mile/lab/run-matrix.ps1

This prompts for the API key (hidden), displays the budget, and requires typing RUN to authorize paid calls. The key is cleared from the current process after execution if entered by the script. No API key is uploaded to the website or GitHub.
