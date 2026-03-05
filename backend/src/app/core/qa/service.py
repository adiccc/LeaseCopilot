from __future__ import annotations
from dataclasses import dataclass
from typing import Optional, List

from app.adapters.llm.ollama_llm import OllamaLLM
from app.adapters.weaviate.retriever import WeaviateHybridRetriever, RetrievedChunk
from app.adapters.rerank.cohere_reranker import CohereReranker
from .prompt import build_prompt
from .citations import validate_citations

@dataclass
class Source:
    index: int
    doc_name: str
    document_id: str
    property_id: str
    page_start: int
    page_end: int
    snippet: str

@dataclass
class AskResponse:
    answer: str
    sources: List[Source]

class QAService:
    def __init__(self):
        self.retriever = WeaviateHybridRetriever()
        self.reranker = CohereReranker()
        self.llm = OllamaLLM()

    def close(self):
        self.retriever.close()

    def ask(
        self,
        owner_id: str,
        question: str,
        property_id: Optional[str] = None,
        document_id: Optional[str] = None,
        hybrid_limit: int = 20,
        alpha: float = 0.5,
        top_n: int = 8,
    ) -> AskResponse:
        # 1) hybrid retrieve
        candidates = self.retriever.search(
            owner_id=owner_id,
            query=question,
            property_id=property_id,
            document_id=document_id,
            limit=hybrid_limit,
            alpha=alpha,
        )
        if not candidates:
            return AskResponse(
                answer='I couldn’t find a supporting clause in the provided documents. [1]',
                sources=[],
            )

        # 2) rerank via Cohere
        docs = [c.text for c in candidates]
        reranked = self.reranker.rerank(question, docs, top_n=min(top_n, len(docs)))
        contexts = [candidates[r.index] for r in reranked]

        # 3) generate answer with citations
        prompt = build_prompt(question, contexts)
        draft = self.llm.generate(prompt)

        # 4) validate citations
        vr = validate_citations(draft, num_sources=len(contexts))
        if vr.ok:
            return AskResponse(answer=draft, sources=_sources_from_contexts(contexts))

        # 5) retry once with stricter instruction
        fix_prompt = prompt + "\n\nYour previous answer had citation issues. Fix it and ensure every sentence ends with valid citations."
        fixed = self.llm.generate(fix_prompt)
        vr2 = validate_citations(fixed, num_sources=len(contexts))
        if vr2.ok:
            return AskResponse(answer=fixed, sources=_sources_from_contexts(contexts))

        # 6) fallback safe
        fallback = 'I couldn’t find a supporting clause in the provided documents. [1]'
        return AskResponse(answer=fallback, sources=_sources_from_contexts(contexts))

def _sources_from_contexts(contexts: List[RetrievedChunk]) -> List[Source]:
    out: List[Source] = []
    for i, c in enumerate(contexts, start=1):
        out.append(
            Source(
                index=i,
                doc_name=c.doc_name,
                document_id=c.document_id,
                property_id=c.property_id,
                page_start=c.page_start,
                page_end=c.page_end,
                snippet=c.text[:300],
            )
        )
    return out