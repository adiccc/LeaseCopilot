from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
import traceback
from fastapi import Request
from fastapi.responses import PlainTextResponse

from app.adapters.weaviate.client import get_weaviate_client, get_url
from app.adapters.storage.local_storage import LocalFileStorage
from app.core.ingestion.service import IngestionService
from pydantic import BaseModel
from typing import Optional

from app.core.qa.service import QAService
load_dotenv()

app = FastAPI(title="LeaseCopilot API", version="0.1.0")

UPLOAD_DIR = Path(__file__).resolve().parents[2] / "data" / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

storage = LocalFileStorage(base_dir=UPLOAD_DIR)
ingestion = IngestionService(storage=storage)
url=get_url()

class AskRequest(BaseModel):
    owner_id: str = "adi"
    question: str
    property_id: Optional[str] = None
    document_id: Optional[str] = None
    hybrid_limit: int = 20
    alpha: float = 0.5
    top_n: int = 8

@app.post("/ask")
def ask(req: AskRequest):
    qa = QAService()
    try:
        res = qa.ask(
            owner_id=req.owner_id,
            question=req.question,
            property_id=req.property_id,
            document_id=req.document_id,
            hybrid_limit=req.hybrid_limit,
            alpha=req.alpha,
            top_n=req.top_n,
        )
        return {"answer": res.answer, "sources": [s.__dict__ for s in res.sources]}
    finally:
        qa.close()

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/health/weaviate")
def health_weaviate():
    client = get_weaviate_client()
    try:
        ready = client.is_ready()
        return {"weaviate_ready": bool(ready), "weaviate_url": url}
    finally:
        client.close()

@app.post("/documents")
async def upload_document(
    file: UploadFile = File(...),
    property_id: str = Form(...),
    owner_id: str = Form("demo_owner"),
):
    if not file.filename:
        raise HTTPException(status_code=400, detail="Missing filename")

    data = await file.read()
    if not data:
        raise HTTPException(status_code=400, detail="Empty file")

    res = ingestion.ingest(
        owner_id=owner_id,
        property_id=property_id,
        filename=file.filename,
        content_type=file.content_type or "",
        file_bytes=data,
    )

    return {
        "document_id": res.document_id,
        "chunks_indexed": res.chunks_indexed,
        "storage_uri": res.storage_uri,
    }


@app.exception_handler(Exception)
async def all_exception_handler(request: Request, exc: Exception):
    return PlainTextResponse(traceback.format_exc(), status_code=500)