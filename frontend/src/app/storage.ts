export type Lang = "he" | "en";

export type ActiveLease = {
    documentId: string;
    filename: string;
    chunksIndexed?: number;
    storageUri?: string;
    uploadedAtIso: string;
};

export type AppState = {
    lang?: Lang;
    activeLease?: ActiveLease;
};

const KEY = "leasecopilot_app_state_v1";

export function loadAppState(): AppState {
    try {
        const raw = localStorage.getItem(KEY);
        if (!raw) return { lang: "he" };
        const parsed = JSON.parse(raw) as AppState;
        return {
            lang: parsed.lang ?? "he",
            // Never restore activeLease on load: start with chat locked until user uploads a file
            activeLease: undefined,
        };
    } catch {
        return { lang: "he" };
    }
}

export function saveAppState(state: AppState) {
    try {
        localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
        // ignore
    }
}

export function clearActiveLease() {
    const s = loadAppState();
    saveAppState({ ...s, activeLease: undefined });
}