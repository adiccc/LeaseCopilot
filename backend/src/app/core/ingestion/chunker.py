from __future__ import annotations
from dataclasses import dataclass
from typing import List, Dict
import re

from .parser import PageText

@dataclass(frozen=True)
class Chunk:
    chunk_id: str
    text: str
    page_start: int
    page_end: int
    chunk_index: int
    meta: Dict[str, str]

class SimpleOverlapChunker:
    def __init__(self, chunk_size: int = 800, chunk_overlap: int = 150):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap

    def chunk(self, pages: List[PageText], base_meta: Dict[str, str]) -> List[Chunk]:
        # join pages but keep page boundaries
        chunks: List[Chunk] = []
        chunk_index = 0

        for page in pages:
            page_text = self._clean(page.text)
            if not page_text:
                continue

            # sliding window on characters (simple & robust for MVP)
            start = 0
            while start < len(page_text):
                end = min(start + self.chunk_size, len(page_text))
                text_slice = page_text[start:end].strip()
                if text_slice:
                    chunk_index += 1
                    chunk_id = f"{base_meta['document_id']}::{page.page_no}::{chunk_index}"
                    chunks.append(
                        Chunk(
                            chunk_id=chunk_id,
                            text=text_slice,
                            page_start=page.page_no,
                            page_end=page.page_no,
                            chunk_index=chunk_index,
                            meta=dict(base_meta),
                        )
                    )

                if end == len(page_text):
                    break
                start = max(0, end - self.chunk_overlap)

        return chunks

    def _clean(self, s: str) -> str:
        s = re.sub(r"\s+", " ", s).strip()
        return s