from __future__ import annotations
from dataclasses import dataclass

LEASECHUNK_COLLECTION = "LeaseChunk"

@dataclass(frozen=True)
class LeaseChunkSchema:
    """
    We store chunks with metadata needed for filtering and citations.
    Vectorizer is disabled (we provide vectors manually in Phase 2).
    """
    collection_name: str = LEASECHUNK_COLLECTION

    properties = [
        # Core text
        {"name": "text", "dataType": ["text"]},

        # Multi-tenant-ish fields (simple)
        {"name": "owner_id", "dataType": ["text"]},
        {"name": "property_id", "dataType": ["text"]},
        {"name": "document_id", "dataType": ["text"]},

        # Citation metadata
        {"name": "doc_name", "dataType": ["text"]},
        {"name": "page_start", "dataType": ["int"]},
        {"name": "page_end", "dataType": ["int"]},
    ]