from __future__ import annotations

import asyncio
import json
import os
from pathlib import Path

from fastapi import FastAPI
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

from agent import run_steward
from core.models import StewardRequest
from core.store import PortfolioStore


ROOT = Path(__file__).resolve().parent
WEB = ROOT / "web"
store = PortfolioStore()
app = FastAPI(title="Open Steward", version="0.1.0")
app.mount("/assets", StaticFiles(directory=WEB), name="assets")


@app.get("/")
async def index():
    return FileResponse(WEB / "index.html")


@app.get("/api/health")
async def health():
    return {
        "ok": True,
        "version": "0.1.0",
        "openai_configured": bool(os.getenv("OPEN_STEWARD_OPENAI_API_KEY", "").strip()),
        "model": os.getenv("OPEN_STEWARD_MODEL", "gpt-5-mini"),
        "mode": "live" if os.getenv("OPEN_STEWARD_OPENAI_API_KEY", "").strip() else "demo",
        "systems": {
            "portfolio_steward": True,
            "project_manifests": True,
            "decision_packets": True,
            "approval_policy": True,
            "audit_log": True,
            "mcp_server": True,
            "deterministic_evals": True,
        },
    }


@app.get("/api/state")
async def state():
    return store.snapshot()


@app.post("/api/run")
async def run(request: StewardRequest):
    try:
        brief = await run_steward(request, store)
        return brief.model_dump(mode="json")
    except Exception as exc:
        return JSONResponse(
            status_code=500,
            content={"error": "steward_run_failed", "detail": str(exc)},
        )


async def smoke() -> None:
    brief = await run_steward(StewardRequest(force_demo=True), store)
    print(json.dumps(brief.model_dump(mode="json"), indent=2))


if __name__ == "__main__":
    port = os.getenv("PORT")
    if port:
        import uvicorn
        uvicorn.run("main:app", host="0.0.0.0", port=int(port), reload=False)
    else:
        asyncio.run(smoke())
