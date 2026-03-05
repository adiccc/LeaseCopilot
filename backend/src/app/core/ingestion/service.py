from __future__ import annotations
from dataclasses import dataclass
import uuid
from typing import Dict

from app.adapters.storage.local_storage import LocalFileStorage
from app.adapters.weaviate.index import WeaviateLeaseChunkIndex
from .parser import DocumentParser
from .chunker import SimpleOverlapChunker

@dataclass
class IngestionResult:
    document_id: str
    chunks_indexed: int
    storage_uri: str

class IngestionService:
    def __init__(self, storage: LocalFileStorage):
        self.storage = storage
        self.parser = DocumentParser()
        self.chunker = SimpleOverlapChunker()

    def ingest(self, owner_id: str, property_id: str, filename: str, content_type: str, file_bytes: bytes) -> IngestionResult:
        document_id = str(uuid.uuid4())
        storage_uri = self.storage.save(owner_id=owner_id, filename=filename, data=file_bytes)

        pages = self.parser.parse(file_bytes=file_bytes, content_type=content_type)

        base_meta: Dict[str, str] = {
            "owner_id": owner_id,
            "property_id": property_id,
            "document_id": document_id,
            "doc_name": filename,
        }

        chunks = self.chunker.chunk(pages=pages, base_meta=base_meta)

        index = WeaviateLeaseChunkIndex()
        try:
            chunks_indexed = index.upsert_chunks(chunks)
        finally:
            index.close()

        return IngestionResult(document_id=document_id, chunks_indexed=chunks_indexed, storage_uri=storage_uri)