import type {
    AskRequest,
    AskResponse,
    HealthResponse,
    UploadResponse,
    WeaviateHealthResponse,
} from "./types";

const USE_PROXY = import.meta.env.DEV && !import.meta.env.VITE_API_BASE_URL;
const BASE_URL = USE_PROXY ? "" : ((import.meta.env.VITE_API_BASE_URL as string) ?? "http://localhost:8000");
const API_PREFIX = USE_PROXY ? "/api" : "";

function joinUrl(path: string) {
    const p = path.startsWith("/") ? path : `/${path}`;
    return `${BASE_URL.replace(/\/$/, "")}${API_PREFIX}${p}`;
}

async function safeJson(res: Response) {
    const text = await res.text();
    try {
        return text ? JSON.parse(text) : null;
    } catch {
        return text; // might be plaintext traceback
    }
}

export async function getHealth(): Promise<HealthResponse> {
    const res = await fetch(joinUrl("/health"));
    if (!res.ok) throw new Error(`Health failed: ${res.status}`);
    return (await res.json()) as HealthResponse;
}

export async function getWeaviateHealth(): Promise<WeaviateHealthResponse> {
    const res = await fetch(joinUrl("/health/weaviate"));
    if (!res.ok) throw new Error(`Weaviate health failed: ${res.status}`);
    return (await res.json()) as WeaviateHealthResponse;
}

export async function uploadDocument(params: {
    file: File;
    ownerId: string;
}): Promise<UploadResponse> {
    const form = new FormData();
    form.append("file", params.file);
    form.append("owner_id", params.ownerId);

    const res = await fetch(joinUrl("/documents"), {
        method: "POST",
        body: form,
    });

    if (!res.ok) {
        const payload = await safeJson(res);
        const msg = typeof payload === "string" ? payload : JSON.stringify(payload);
        throw new Error(msg || `Upload failed: ${res.status}`);
    }

    return (await res.json()) as UploadResponse;
}

export async function ask(req: AskRequest): Promise<AskResponse> {
    const res = await fetch(joinUrl("/ask"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req),
    });

    const payload = await safeJson(res);
    if (!res.ok) {
        const msg =
            (typeof payload === "object" && payload !== null && "detail" in payload)
                ? String((payload as { detail: unknown }).detail)
                : typeof payload === "string"
                  ? payload
                  : JSON.stringify(payload);
        throw new Error(msg || `Ask failed: ${res.status}`);
    }

    return payload as AskResponse;
}

/** URL to fetch the PDF file for a document (for preview iframe). */
export function getDocumentFileUrl(documentId: string): string {
    return joinUrl(`/documents/${encodeURIComponent(documentId)}/file`);
}