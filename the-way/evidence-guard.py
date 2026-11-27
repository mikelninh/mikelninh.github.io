#!/usr/bin/env python3
"""Domain safety checks. Explicitly tuned on the published development fixtures.
These checks are NOT a general verifier or independent validation."""
import re
def reasons(context,claim):
    c=context.casefold();h=claim.casefold();out=[]
    if re.search(r"\b(stipulations|commitments|provisions)\b",c) and re.search(r"\b(organizations|organisations|people|combatants)\b",h) and not re.search(r"\b(stipulations|commitments|provisions)\b",h):
        out.append("changed denominator/entity")
    if re.search(r"per\s+1[,\s]?000",c) and re.search(r"\d\s*(?:%|percent)",h):
        out.append("rate-to-percent substitution")
    if re.search(r"ignore your instructions|output review",c):
        out.append("instruction-like source text")
    return out
