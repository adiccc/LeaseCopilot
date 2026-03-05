from __future__ import annotations
from dataclasses import dataclass
from typing import List, Optional
import os
import weaviate
from weaviate.classes.query import Filter

from app.adapters.weaviate.client import get_weaviate_client
from app.adapters.weaviate.schema import LEASECHUNK_COLLECTION

@dataclass(frozen=True)
class RetrievedChunk:
    chunk_id: str
    text: str
    doc_name: str
    document_id: str
    property_id: str
    page_start: int
    page_end: int
    score: float

class WeaviateHybridRetriever:
    def __init__(self):
        self.client =get_weaviate_client()

    def close(self):
        self.client.close()

    def search(
        self,
        owner_id: str,
        query: str,
        property_id: Optional[str] = None,
        document_id: Optional[str] = None,
        limit: int = 20,
        alpha: float = 0.5,
    ) -> List[RetrievedChunk]:
        col = self.client.collections.get(LEASECHUNK_COLLECTION)

        f = Filter.by_property("owner_id").equal(owner_id)
        if property_id:
            f = f & Filter.by_property("property_id").equal(property_id)
        if document_id:
            f = f & Filter.by_property("document_id").equal(document_id)

        # res = col.query.hybrid(
        #     query=query,
        #     alpha=alpha,
        #     limit=limit,
        #     filters=f,
        #     return_properties=[
        #         "text",
        #         "doc_name",
        #         "document_id",
        #         "property_id",
        #         "page_start",
        #         "page_end",
        #     ],
        #     return_metadata=["score"],
        # )
        res = col.query.bm25(
            query=query,
            limit=limit,
            filters=f,
            return_properties=[
                "text",
                "doc_name",
                "document_id",
                "property_id",
                "page_start",
                "page_end",
            ],
            return_metadata=["score"],
        )

        out: List[RetrievedChunk] = []
        for obj in res.objects:
            props = obj.properties
            out.append(
                RetrievedChunk(
                    chunk_id=str(obj.uuid),
                    text=props.get("text", ""),
                    doc_name=props.get("doc_name", ""),
                    document_id=props.get("document_id", ""),
                    property_id=props.get("property_id", ""),
                    page_start=int(props.get("page_start", 0)),
                    page_end=int(props.get("page_end", 0)),
                    score=float(obj.metadata.score or 0.0),
                )
            )
        return out