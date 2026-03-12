# LeaseCopilot

AI-powered system for understanding lease agreements using Retrieval
Augmented Generation (RAG).

LeaseCopilot allows property owners and managers to upload lease
contracts and ask natural-language questions about them. The system
retrieves relevant clauses from the documents and generates grounded
answers with citations.

This project demonstrates how modern AI knowledge systems are built
using hybrid retrieval, reranking, and local LLM orchestration.

------------------------------------------------------------------------

# Problem

Lease agreements are long, complex documents that are difficult to
navigate.

Property owners often need quick answers to questions like:

-   What is the lease termination notice period?
-   Who is responsible for maintenance?
-   Are pets allowed?

Manually searching through contracts is time-consuming and error-prone.

LeaseCopilot solves this by turning contracts into a searchable AI
knowledge base.

------------------------------------------------------------------------

# Key Features

• Upload lease contracts (PDF / DOCX) • Natural language question
answering • Hybrid retrieval (semantic + keyword search) • Cross-encoder
reranking for improved relevance • Grounded answers with citations •
Local LLM inference using Ollama

------------------------------------------------------------------------

# System Architecture

User Question
↓
Hybrid Retrieval (BM25 + Vector Search)
↓
Cross-Encoder Reranking
↓
Context Selection
↓
LLM Generation
↓
Citation Validation
↓
Final Answer + Sources

------------------------------------------------------------------------

# Technology Stack

## Backend

-   Python
-   FastAPI

## AI Infrastructure

-   LangChain
-   Weaviate (vector database)
-   Cohere Rerank
-   Ollama (local LLM)

## Frontend

-   React

## Infrastructure

-   Docker
-   Virtual environments

------------------------------------------------------------------------

# Project Structure

    LeaseCopilot
    │
    ├── backend
    │   AI backend and RAG pipeline
    │
    ├── frontend
    │   Web interface for uploading contracts and asking questions
    │
    └── README.md

For detailed backend documentation see:

    backend/README.md

------------------------------------------------------------------------

# Quick Start

## 1 Clone repository
git clone <repo-url>
cd LeaseCopilot

## 2 Setup backend
cd backend

python3.11 -m venv .venv
source .venv/bin/activate

pip install -e .

## 3 Start infrastructure
docker compose up -d

## 4 Run backend
uvicorn app.api.main:app --reload

Backend API will run at:

    http://localhost:8000

------------------------------------------------------------------------

# Example Usage

Upload a lease document:

    POST /documents

Ask a question:

    POST /ask

Example response:

    The lease may be terminated with a 60-day written notice. [1]

------------------------------------------------------------------------

# Future Improvements

• automated evaluation with RAGAS • multi-document reasoning • improved
UI for property managers • CI pipeline for regression testing

------------------------------------------------------------------------
