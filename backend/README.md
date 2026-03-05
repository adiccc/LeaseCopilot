# LeaseCopilot -- Backend

Production‑style Retrieval Augmented Generation (RAG) system for
analyzing lease agreements.

This backend allows property owners and managers to upload lease
contracts and query them using natural language.\
The system retrieves relevant clauses from the contracts and generates
grounded answers with citations.

------------------------------------------------------------------------

# What This Project Demonstrates

This project was designed as a **portfolio‑grade AI backend system**
that demonstrates modern enterprise patterns used in production AI
applications.

Key engineering skills shown in this project:

• Retrieval Augmented Generation (RAG) architecture\
• Hybrid search (BM25 + vector search)\
• Cross‑encoder reranking\
• Modular backend architecture\
• Vector database integration\
• Local LLM orchestration\
• Document ingestion pipelines\
• AI system reliability practices (citation validation)

The architecture reflects the pattern used in many real enterprise AI
knowledge systems.

------------------------------------------------------------------------

# System Architecture

    User Question
          │
          ▼
    Hybrid Retrieval (Weaviate)
    BM25 + Vector Search
          │
          ▼
    Cross‑Encoder Reranking (Cohere)
          │
          ▼
    Context Selection
          │
          ▼
    LLM Generation (Ollama)
          │
          ▼
    Citation Validation
          │
          ▼
    Final Answer + Sources

------------------------------------------------------------------------

# Key Components

## Document Ingestion Pipeline

Uploaded contracts pass through a structured ingestion pipeline:

1.  File upload (PDF / DOCX)
2.  Document parsing
3.  Text chunking with overlap
4.  Metadata enrichment
5.  Storage in the vector database

Each chunk stores:

• document_id\
• property_id\
• owner_id\
• page numbers\
• text content

This enables precise citation mapping later during answer generation.

------------------------------------------------------------------------

## Hybrid Retrieval (Weaviate)

The retrieval layer combines:

• **BM25 keyword search** • **Vector similarity search**

Hybrid search provides both:

High recall (semantic search)\
High precision (exact phrase matching)

This is particularly important for legal documents where wording
matters.

------------------------------------------------------------------------

## Cross‑Encoder Reranking

Initial retrieval may return loosely related clauses.

A **cross‑encoder model (Cohere Rerank)** reorders retrieved chunks
based on deep semantic similarity to the user query.

Benefits:

• higher precision answers\
• reduced hallucinations\
• improved context quality for the LLM

------------------------------------------------------------------------

## LLM Generation (Local via Ollama)

Instead of relying on external APIs, the system supports **local LLM
inference using Ollama**.

Advantages:

• No API costs\
• Full data privacy\
• Offline capability\
• Easy model swapping

Example models:

• llama3.1:8b\
• llama3.2:3b

------------------------------------------------------------------------

## Citation Enforcement

The system enforces grounded answers by requiring citations in the
generated response.

Example output:

    The lease may be terminated with a 60‑day written notice. [1]

Each citation maps directly to a retrieved document chunk.

A validation layer ensures:

• all citations are valid\
• each claim references a source\
• invalid answers are regenerated or rejected

------------------------------------------------------------------------

# Backend Architecture

The backend follows a **clean modular architecture**.

    backend/
    │
    ├── app
    │   ├── api
    │   │   FastAPI endpoints
    │   │
    │   ├── core
    │   │   Business logic
    │   │   ├── ingestion
    │   │   └── qa
    │   │
    │   ├── adapters
    │   │   External integrations
    │   │   ├── weaviate
    │   │   ├── storage
    │   │   ├── llm
    │   │   └── rerank
    │
    ├── data
    │   uploads
    │
    ├── scripts
    │   weaviate_bootstrap.py
    │
    ├── docker-compose.yml
    └── pyproject.toml

Adapters isolate infrastructure dependencies so components can be
swapped easily.

Examples:

• change vector database\
• change LLM provider\
• change reranking model

without modifying core logic.

------------------------------------------------------------------------

# Technology Stack

Backend

• Python\
• FastAPI

AI Infrastructure

• LangChain • Weaviate (vector database) • Cohere Rerank • Ollama (local
LLM)

Evaluation (planned)

• Ragas

Infrastructure

• Docker • Virtual environments

------------------------------------------------------------------------

# Local Development Setup

## 1. Clone repository

    git clone <repo-url>
    cd LeaseCopilot/backend

------------------------------------------------------------------------

## 2. Create virtual environment

    python3.11 -m venv .venv
    source .venv/bin/activate

------------------------------------------------------------------------

## 3. Install dependencies

    pip install -e .

------------------------------------------------------------------------

## 4. Start vector database

    docker compose up -d

Check readiness:

    curl http://localhost:8080/v1/.well-known/ready

------------------------------------------------------------------------

## 5. Initialize Weaviate schema

    python -m scripts.weaviate_bootstrap

------------------------------------------------------------------------

## 6. Install and run Ollama

Install (Mac):

    brew install ollama

Start server:

    ollama serve

Pull a model:

    ollama pull llama3.1:8b

------------------------------------------------------------------------

## 7. Start backend server

    uvicorn app.api.main:app --reload

API runs at:

    http://localhost:8000

------------------------------------------------------------------------

# Upload a Contract

Example request:

    curl -X POST "http://localhost:8000/documents" \
      -F "file=@LeaseAgreement.pdf" \
      -F "property_id=apt_12" \
      -F "owner_id=adi"

Example response:

    {
      "document_id": "...",
      "chunks_indexed": 35,
      "storage_uri": "..."
    }

------------------------------------------------------------------------

# Ask Questions

Example query:

    curl -X POST "http://localhost:8000/ask" \
      -H "Content-Type: application/json" \
      -d '{
        "owner_id": "adi",
        "question": "What is the lease termination notice period?",
        "property_id": "apt_12"
      }'

Example response:

    {
      "answer": "The lease may be terminated with a 60-day written notice. [1]",
      "sources": [
        {
          "doc_name": "LeaseAgreement.pdf",
          "page_start": 4,
          "snippet": "Either party may terminate..."
        }
      ]
    }

------------------------------------------------------------------------

# Reliability Considerations

The system includes several mechanisms to improve answer reliability:

• Hybrid retrieval to reduce missing context\
• Cross‑encoder reranking to improve relevance\
• Citation enforcement to prevent hallucinations\
• Structured prompts to control generation behavior

These patterns reflect best practices used in modern RAG systems.

------------------------------------------------------------------------

# Future Improvements

Planned extensions:

• Vector embeddings during ingestion\
• Automated evaluation with **Ragas**\
• CI pipeline for regression testing\
• Web interface for property managers\
• Multi‑document reasoning

------------------------------------------------------------------------

# License

MIT License
