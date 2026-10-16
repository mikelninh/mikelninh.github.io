"""FIRST MILE reference API: bounded, typed source verification.

Local educational service. It does not call OpenAI, rank startups, persist documents,
or integrate with confidential HTGF systems. No authentication: DO NOT expose publicly.
"""
from __future__ import annotations
from pathlib import Path
import sys
from typing import Annotated, Literal

from fastapi import FastAPI, Response
from pydantic import BaseModel, ConfigDict, Field, StringConstraints

LAB = Path(__file__).resolve().parents[1] / "lab"
sys.path.insert(0, str(LAB))
from benchmark import verify as verify_observations  # reuse existing fail-closed verifier

SafeName = Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=140)]
SafeText = Annotated[str, StringConstraints(min_length=1, max_length=30000)]
SafeQuote = Annotated[str, StringConstraints(min_length=1, max_length=500)]
SafeValue = Annotated[str, StringConstraints(max_length=60)]

class Page(BaseModel):
    model_config = ConfigDict(extra="forbid", strict=True)
    number: int = Field(ge=1, le=30)
    text: SafeText

class Document(BaseModel):
    model_config = ConfigDict(extra="forbid", strict=True)
    name: SafeName
    pages: list[Page] = Field(min_length=1, max_length=30)

class Claim(BaseModel):
    model_config = ConfigDict(extra="forbid", strict=True)
    field: Literal["ask", "arr", "customers", "problem", "technology", "market", "ip", "team"]
    value: SafeValue
    kind: Literal["actual", "forecast", "unspecified"]
    source: SafeName
    page: int = Field(ge=1, le=30)
    quote: SafeQuote

class VerifyRequest(BaseModel):
    model_config = ConfigDict(extra="forbid", strict=True)
    docs: list[Document] = Field(min_length=1, max_length=3)
    claims: list[Claim] = Field(max_length=80)

class AcceptedClaim(Claim):
    pass

class RejectedClaim(BaseModel):
    reason: str
    field: str | None = None

class VerifyResponse(BaseModel):
    accepted: list[AcceptedClaim]
    rejected: list[RejectedClaim]
    human_review_required: bool = True
    external_actions: int = 0
    disclaimer: str = "Literal source verification does not prove that a business claim is true."

app = FastAPI(
    title="FIRST MILE — Citation Verification",
    version="0.1.0",
    description="Reference API for independent source verification, not a production investment system."
)

@app.get("/health")
async def health(response: Response) -> dict[str,str]:
    response.headers["Cache-Control"]="no-store"
    return {"status":"ok","service":"first-mile-reference-verifier"}

@app.post("/v1/verify", response_model=VerifyResponse)
async def verify_claims(payload: VerifyRequest, response: Response) -> VerifyResponse:
    """No LLM calls or document storage. Extra/malformed data is rejected with HTTP 422."""
    response.headers["Cache-Control"]="no-store"
    case = {"docs":[doc.model_dump() for doc in payload.docs]}
    raw_claims = [claim.model_dump() for claim in payload.claims]
    accepted, rejected = verify_observations(case, raw_claims)
    return VerifyResponse(
        accepted=[AcceptedClaim(**claim) for claim in accepted],
        rejected=[RejectedClaim(**item) for item in rejected],
        human_review_required=True,
        external_actions=0
    )
