from __future__ import annotations
from dataclasses import dataclass
from typing import List
import os
import cohere

@dataclass(frozen=True)
class Reranked:
    index: int
    score: float

class CohereReranker:
    def __init__(self):
        key = os.getenv("COHERE_API_KEY")
        if not key:
            raise RuntimeError("COHERE_API_KEY is not set")
        self.client = cohere.Client(key)

    def rerank(self, query: str, documents: List[str], top_n: int = 8) -> List[Reranked]:
        resp = self.client.rerank(
            model="rerank-multilingual-v3.0",
            query=query,
            documents=documents,
            top_n=top_n,
        )
        return [Reranked(index=r.index, score=r.relevance_score) for r in resp.results]