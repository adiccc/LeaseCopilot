from __future__ import annotations
from dataclasses import dataclass
from pathlib import Path
import uuid

@dataclass
class LocalFileStorage:
    base_dir: Path

    def save(self, owner_id: str, filename: str, data: bytes) -> str:
        owner_dir = self.base_dir / owner_id
        owner_dir.mkdir(parents=True, exist_ok=True)

        doc_id = str(uuid.uuid4())
        safe_name = filename.replace("/", "_")
        path = owner_dir / f"{doc_id}__{safe_name}"
        path.write_bytes(data)
        return str(path)

    def open(self, uri: str) -> bytes:
        return Path(uri).read_bytes()