export type HealthResponse = { status: string };

export type WeaviateHealthResponse = {
    weaviate_ready: boolean;
    weaviate_url: string;
};

export type UploadResponse = {
    document_id: string;
    chunks_indexed: number;
    storage_uri: string;
};

export type AskRequest = {
    owner_id: string;
    question: string;
    document_id?: string | null;
    // We'll keep defaults internal (no UI exposure)
    hybrid_limit?: number;
    alpha?: number;
    top_n?: number;
};

export type Source = Record<string, any>;

export type AskResponse = {
    answer: string;
    sources: Source[];
};