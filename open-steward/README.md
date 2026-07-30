# Open Steward

**An open-source operating system for founder-led, agent-run projects.**

Open Steward keeps the founder in control while a portfolio steward and specialist agents prepare plans, reviews, decision packets, and bounded operational work.

## What V0.1 proves

- A **Portfolio Steward** owns the final executive brief.
- Project GMs and specialist agents are used as bounded tools.
- A policy engine separates **automatic**, **approval-required**, and **forbidden** actions.
- SOULBODY is the first managed project; Tiny Tactics and SafeTrace are included as portfolio examples.
- A browser dashboard surfaces only decisions, risks, opportunities, and project health.
- An MCP server exposes the same project registry to other compatible agents.
- Deterministic evals test approval boundaries even without an API key.

## Architecture

```text
Founder / CEO
     │
Portfolio Steward (manager agent)
     ├── Project GM
     ├── Product Experience Lead
     ├── Engineering Lead
     └── Trust & Safety Lead
             │
     policies + manifests + audit log
```

The manager-style design keeps one agent responsible for the final report while specialists contribute bounded analyses.

## Local run

```bash
cp .env.example .env.local
# Add OPEN_STEWARD_OPENAI_API_KEY to .env.local
uv sync
PORT=8421 uv run python main.py
```

Open `http://127.0.0.1:8421`.

Without a key, the dashboard runs in deterministic **demo mode**.

## CLI smoke

```bash
uv run python main.py
```

## Tests and evals

```bash
uv run python -m unittest discover -s tests -v
uv run python evals/run_local.py
```

Live agent evals require the key:

```bash
uv run python evals/run_local.py --live
```

## MCP server

```bash
uv run python mcp_server.py
```

Example client configuration:

```json
{
  "mcpServers": {
    "open-steward": {
      "command": "uv",
      "args": ["--directory", "/absolute/path/open-steward", "run", "python", "mcp_server.py"]
    }
  }
}
```

## Deployment

The repository includes a Vercel-compatible FastAPI entrypoint. Configure the secret:

```text
OPEN_STEWARD_OPENAI_API_KEY
```

Optional:

```text
OPEN_STEWARD_MODEL=gpt-5-mini
```

The secret must never be committed.

## Open-source extension points

- Add a project manifest under `data/projects/`.
- Add or replace specialist agents in `agent.py`.
- Extend the action policy in `core/policy.py`.
- Add connectors under `adapters/`.
- Expose new portable tools in `mcp_server.py`.
- Add regression cases under `evals/cases.jsonl`.

## Current limitations

- V0.1 proposes actions but does not autonomously execute external side effects.
- Browser approvals are local to the device in the hosted demo.
- Durable multi-user state and real GitHub/Vercel write adapters are planned for V0.2.
- Production deployment and public communication remain approval-gated by default.

## License

Apache-2.0. See `LICENSE`.
