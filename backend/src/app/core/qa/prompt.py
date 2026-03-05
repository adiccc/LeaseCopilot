from __future__ import annotations
from typing import List
from app.adapters.weaviate.retriever import RetrievedChunk

def build_prompt(question: str, contexts: List[RetrievedChunk]) -> str:
    # numbered sources
    sources_block = []
    for i, c in enumerate(contexts, start=1):
        snippet = c.text[:800]
        sources_block.append(
            f"[{i}] Doc: {c.doc_name} | Pages: {c.page_start}-{c.page_end}\n{snippet}"
        )

    return f"""
You are a contract Q&A assistant. Answer the user's question using ONLY the sources below.
Rules:
- Every sentence must end with at least one citation like [1] or [2].
- If the sources do not contain enough information, say: "I couldn't find a supporting clause in the provided documents." and cite the closest relevant source.

Question:
{question}

Sources:
{chr(10).join(sources_block)}

Return ONLY the answer text with citations.
""".strip()