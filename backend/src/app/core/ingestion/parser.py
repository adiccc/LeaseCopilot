from __future__ import annotations
from dataclasses import dataclass
from io import BytesIO
from typing import List

from pypdf import PdfReader
import docx  # python-docx

@dataclass(frozen=True)
class PageText:
    page_no: int
    text: str

class DocumentParser:
    def parse(self, file_bytes: bytes, content_type: str) -> List[PageText]:
        ct = (content_type or "").lower()

        if "pdf" in ct:
            return self._parse_pdf(file_bytes)

        if "word" in ct or "docx" in ct or ct.endswith("docx"):
            return self._parse_docx(file_bytes)

        # fallback based on magic: try pdf first, then docx
        try:
            return self._parse_pdf(file_bytes)
        except Exception:
            return self._parse_docx(file_bytes)

    def _parse_pdf(self, file_bytes: bytes) -> List[PageText]:
        reader = PdfReader(BytesIO(file_bytes))
        pages: List[PageText] = []
        for i, p in enumerate(reader.pages, start=1):
            text = (p.extract_text() or "").strip()
            pages.append(PageText(page_no=i, text=text))
        return pages

    def _parse_docx(self, file_bytes: bytes) -> List[PageText]:
        # docx doesn't have pages, so we treat it as one page
        from io import BytesIO
        d = docx.Document(BytesIO(file_bytes))
        text = "\n".join([para.text for para in d.paragraphs]).strip()
        return [PageText(page_no=1, text=text)]