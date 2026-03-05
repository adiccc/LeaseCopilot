from __future__ import annotations
from typing import List

from weaviate.util import generate_uuid5

from app.adapters.weaviate.client import get_weaviate_client
from app.adapters.weaviate.schema import LEASECHUNK_COLLECTION
from app.core.ingestion.chunker import Chunk

class WeaviateLeaseChunkIndex:
    def __init__(self):
        self._client =get_weaviate_client()


    def close(self):
        self._client.close()

    def upsert_chunks(self, chunks: List[Chunk]) -> int:
        col = self._client.collections.get(LEASECHUNK_COLLECTION)

        with col.batch.dynamic() as batch:
            for ch in chunks:
                # stable UUID so re-indexing is idempotent
                uid = generate_uuid5(ch.chunk_id)
                batch.add_object(
                    properties={
                        "text": ch.text,
                        "owner_id": ch.meta["owner_id"],
                        "property_id": ch.meta["property_id"],
                        "document_id": ch.meta["document_id"],
                        "doc_name": ch.meta["doc_name"],
                        "page_start": ch.page_start,
                        "page_end": ch.page_end,
                        "chunk_index": ch.chunk_index,
                    },
                    uuid=uid,
                )

        return len(chunks)