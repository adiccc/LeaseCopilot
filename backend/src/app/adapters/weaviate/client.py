import os
from urllib.parse import urlparse

import weaviate

def get_weaviate_client() -> weaviate.WeaviateClient:
    url = os.getenv("WEAVIATE_URL", "http://localhost:8080")
    parsed = urlparse(url)
    return weaviate.connect_to_local(host=parsed.hostname or "localhost",port=parsed.port or 8080,)

def get_url() -> str:
    return os.getenv("WEAVIATE_URL", "http://localhost:8080")