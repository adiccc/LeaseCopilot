from __future__ import annotations
import re
from dataclasses import dataclass
from typing import List

@dataclass
class ValidationResult:
    ok: bool
    errors: List[str]

_cite_pattern = re.compile(r"\[(\d+)\]")

def extract_citations(text: str) -> List[int]:
    return [int(m.group(1)) for m in _cite_pattern.finditer(text)]

def validate_citations(answer_text: str, num_sources: int) -> ValidationResult:
    cites = extract_citations(answer_text)
    if not cites:
        return ValidationResult(False, ["No citations found."])
    bad = [c for c in cites if c < 1 or c > num_sources]
    if bad:
        return ValidationResult(False, [f"Invalid citation indices: {bad} (sources=1..{num_sources})"])
    return ValidationResult(True, [])