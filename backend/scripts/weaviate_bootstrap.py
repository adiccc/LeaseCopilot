from dotenv import load_dotenv

from weaviate.classes.config import Configure, Property, DataType

from adapters.weaviate.client import get_weaviate_client
from adapters.weaviate.schema import LEASECHUNK_COLLECTION

def main() -> None:
    load_dotenv()
    client = get_weaviate_client()

    try:
        existing = client.collections.list_all(simple=True)
        if LEASECHUNK_COLLECTION in existing:
            print(f"[OK] Collection already exists: {LEASECHUNK_COLLECTION}")
            return

        client.collections.create(
            name=LEASECHUNK_COLLECTION,
            vector_config=Configure.Vectorizer.none(),
            properties=[
                Property(name="text", data_type=DataType.TEXT),
                Property(name="owner_id", data_type=DataType.TEXT),
                Property(name="property_id", data_type=DataType.TEXT),
                Property(name="document_id", data_type=DataType.TEXT),
                Property(name="doc_name", data_type=DataType.TEXT),
                Property(name="page_start", data_type=DataType.INT),
                Property(name="page_end", data_type=DataType.INT),
                Property(name="chunk_index", data_type=DataType.INT),
            ],
        )
        print(f"[CREATED] Collection: {LEASECHUNK_COLLECTION}")

    finally:
        client.close()

if __name__ == "__main__":
    main()