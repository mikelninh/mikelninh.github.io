# INCA · Real Model Improvement Loop

This is an actual bounded OpenAI model experiment on developer-authored fictional insurance text. It is not an INCA integration, production benchmark, automated coverage decision or payment workflow.

The experiment sends 20 distinct cases through both a baseline and revised extraction workflow: 40 model calls. One development case and one held-out case are selected from each of ten failure families. The prompts are frozen before holdout calls.

Baseline: basic JSON extraction plus deterministic routing. Revised: evidence-aware extraction plus source-ID and injection safety checks. Same model and strict output schema.

Saved output includes actual model JSON, corresponding invented documents, authored expected routing, false automatic continuations, unnecessary reviews, API errors, latency, usage and estimated USD costs. The public interface reads only a complete 40-call report and does not call OpenAI from visitors' browsers.

Limits: all labels and examples were authored by the developer. The holdout is unseen during this run but shares templates and is not an independent blind evaluation. Neither workflow makes coverage decisions, contacts claimants, authorizes payments or measures actual savings. A no-improvement or worse-result outcome is reported honestly.

Offline checks: python -m unittest discover inca-proof/model-eval -p test_*.py -v

Free dry run: python inca-proof/model-eval/release_experiment.py --mode dry-run

Explicit live command: python inca-proof/model-eval/release_experiment.py --mode live --out inca/live-model-eval.json

GitHub Actions workflow INCA Live Model Release Experiment can be started manually or via a main-branch change to the RELEASE_EXPERIMENT_REQUEST.md trigger. Uses existing OPENAI_API_KEY secret only on the server. The live plan makes exactly 40 requests to gpt-4o-mini with up to 1,100 output tokens each. Public price assumption: $0.15/M input tokens and $0.60/M output tokens. Recorded token counts determine an estimated cost; it is not an invoice.

If a model request fails, the workflow retains the incomplete JSON as a run artifact and does not publish it as a complete experiment.
