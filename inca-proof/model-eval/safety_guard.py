"""Conservative deterministic guard for model-targeted instructions in claim documents.

An LLM output cannot override this guard. This is a narrow, evolving pattern
check: a production system needs adversarial and false-positive validation.
Do not mistake a guard-assisted route for model-only accuracy.
"""
from __future__ import annotations
import re

_PATTERNS = (
    re.compile(r"\bignore\s+(?:all\s+|previous\s+)?instructions\b", re.I),
    re.compile(r"\bals\s+ki\b[^\n]{0,120}\b(?:musst|überspringen|ignoriere)\b", re.I),
    re.compile(r"\b(?:approve\s+claim|auto[_ -]?approve|route\s+auto_ready|skip\s+(?:all\s+)?checks)\b", re.I),
    re.compile(r"<\/?(?:system|developer)>", re.I),
)

def guard_signal(*documents: str) -> bool:
    """Flag explicit attempts to redirect the model; not general urgency."""
    return any(pattern.search(str(doc or "")) is not None for doc in documents for pattern in _PATTERNS)

def guarded_decision(original: bool | None, *documents: str) -> dict:
    """Return attention routing signal. Unknown model output goes to review."""
    if type(original) not in (bool, type(None)):
        raise ValueError("Model result must be boolean or None")
    detected = guard_signal(*documents)
    return {
        "needs_attention": original is None or original or detected,
        "guard_triggered": detected,
        "model_output_missing": original is None,
        "reason": "DOCUMENT_INJECTION" if detected else ("MODEL_UNAVAILABLE" if original is None else "MODEL_DECISION"),
    }
