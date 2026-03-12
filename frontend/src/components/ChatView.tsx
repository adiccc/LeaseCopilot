import { useMemo, useRef, useState } from "react";
import { ask } from "../api/client";
import type { ActiveLease } from "../app/storage";
import type { Source } from "../api/types";
import { SourcesDrawer } from "./SourcesDrawer";

type Lang = "he" | "en";

type Msg =
    | { id: string; role: "user"; text: string; createdAtIso: string }
    | { id: string; role: "assistant"; text: string; createdAtIso: string; sources: Source[] };

const STRINGS = {
    he: {
        placeholder: "שאלי שאלה על החוזה…",
        send: "שליחה",
        sending: "שולח…",
        sources: "מקורות",
        noSources: "לא נמצאו מקורות להצגה.",
        errorTitle: "שגיאה",
        errorBody: "לא הצלחתי לקבל תשובה. נסי שוב.",
        uploadNew: "העלאת חוזה חדש",
        emptyTitle: "הצ'אט נעול",
        emptySub: "העלו קובץ כדי לפתוח את הצ'אט ולשאול שאלות על החוזה.",
    },
    en: {
        placeholder: "Ask a question about the lease…",
        send: "Send",
        sending: "Sending…",
        sources: "Sources",
        noSources: "No sources to display.",
        errorTitle: "Error",
        errorBody: "Couldn’t get an answer. Please try again.",
        uploadNew: "Upload new file",
        emptyTitle: "Chat locked",
        emptySub: "Upload a file to unlock the chat and start asking questions about the lease.",
    },
};

function uid() {
    return Math.random().toString(16).slice(2) + "-" + Date.now().toString(16);
}

export function ChatView(props: {
    lang: Lang;
    activeLease?: ActiveLease;
    onOpenUpload: () => void;
    onSourceClick?: (source: Source) => void;
}) {
    const { lang, activeLease, onOpenUpload, onSourceClick } = props;
    const t = useMemo(() => STRINGS[lang], [lang]);

    const ownerId = (import.meta.env.VITE_OWNER_ID as string) ?? "demo_owner";

    const [messages, setMessages] = useState<Msg[]>([]);
    const [draft, setDraft] = useState("");
    const [busy, setBusy] = useState(false);

    const [drawerOpen, setDrawerOpen] = useState(false);
    const [drawerSources, setDrawerSources] = useState<Source[]>([]);
    const [drawerTitle, setDrawerTitle] = useState<string>("");

    const listRef = useRef<HTMLDivElement | null>(null);

    function scrollToBottom() {
        const el = listRef.current;
        if (!el) return;
        el.scrollTop = el.scrollHeight;
    }

    async function send() {
        const q = draft.trim();
        if (!q || busy || !activeLease) return;

        setBusy(true);

        const userMsg: Msg = { id: uid(), role: "user", text: q, createdAtIso: new Date().toISOString() };
        setMessages((m) => [...m, userMsg]);
        setDraft("");

        // allow UI to paint
        setTimeout(scrollToBottom, 0);

        try {
            const res = await ask({
                owner_id: ownerId,
                question: q,
                document_id: activeLease.documentId,
                // keep defaults internal; you can tweak later centrally if needed
                hybrid_limit: 20,
                alpha: 0.5,
                top_n: 8,
            });

            const assistantMsg: Msg = {
                id: uid(),
                role: "assistant",
                text: res.answer,
                createdAtIso: new Date().toISOString(),
                sources: res.sources ?? [],
            };

            setMessages((m) => [...m, assistantMsg]);
            setTimeout(scrollToBottom, 0);
        } catch (e: any) {
            const errText =
                typeof e?.message === "string" && e.message.length > 0 ? e.message : t.errorBody;

            const assistantMsg: Msg = {
                id: uid(),
                role: "assistant",
                text: `${t.errorBody}\n\n${errText}`,
                createdAtIso: new Date().toISOString(),
                sources: [],
            };

            setMessages((m) => [...m, assistantMsg]);
            setTimeout(scrollToBottom, 0);
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className="chat">
            <div className="chat-list" ref={listRef} role="log" aria-live="polite" aria-relevant="additions">
                {!activeLease ? (
                    <div className="empty-chat">
                        <div className="empty-chat-title">{t.emptyTitle}</div>
                        <div className="empty-chat-sub">{t.emptySub}</div>
                        <button
                            type="button"
                            className="btn primary upload-cta"
                            onClick={onOpenUpload}
                        >
                            {t.uploadNew}
                        </button>
                    </div>
                ) : messages.length === 0 && !busy ? (
                    <div className="empty-chat">
                        <div className="empty-chat-title">
                            {lang === "he" ? "אפשר להתחיל לשאול 😊" : "You can start asking 😊"}
                        </div>
                        <div className="empty-chat-sub">
                            {lang === "he"
                                ? "נסי שאלות כמו: “מה תקופת ההודעה המוקדמת?” או “מה כוללת הערבות?”"
                                : "Try: “What is the notice period?” or “What does the deposit cover?”"}
                        </div>
                    </div>
                ) : (
                    <>
                        {messages.map((m) => (
                            <div key={m.id} className={`bubble-row ${m.role === "user" ? "right" : "left"}`}>
                                <div className={`bubble ${m.role}`}>
                                    <div className="bubble-text" dir={lang === "he" ? "rtl" : "ltr"}>
                                        {m.text}
                                    </div>

                                    {m.role === "assistant" && (
                                        <div className="bubble-actions">
                                            <button
                                                type="button"
                                                className="link-btn"
                                                onClick={() => {
                                                    const sources = (m as any).sources as Source[];
                                                    setDrawerSources(sources ?? []);
                                                    setDrawerTitle(t.sources);
                                                    setDrawerOpen(true);
                                                }}
                                                disabled={((m as any).sources as Source[])?.length === 0}
                                                aria-disabled={((m as any).sources as Source[])?.length === 0}
                                            >
                                                {t.sources}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {busy && (
                            <div className="bubble-row left">
                                <div className="bubble assistant thinking-bubble">
                                    <div className="thinking-dots" aria-hidden="true">
                                        <span>.</span>
                                        <span>.</span>
                                        <span>.</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {activeLease && (
                <div className="composer" aria-label="Message composer">
                    <textarea
                        className="textarea"
                        placeholder={t.placeholder}
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                void send();
                            }
                        }}
                        rows={3}
                        dir={lang === "he" ? "rtl" : "ltr"}
                    />
                    <div className="composer-buttons">
                        <button
                            type="button"
                            className="composer-plus"
                            onClick={onOpenUpload}
                            title={t.uploadNew}
                            aria-label={t.uploadNew}
                        >
                            +
                        </button>
                        <button type="button" className="btn primary" onClick={() => void send()} disabled={busy || !draft.trim()}>
                            {busy ? t.sending : t.send}
                        </button>
                    </div>
                </div>
            )}

            <SourcesDrawer
                lang={lang}
                open={drawerOpen}
                title={drawerTitle}
                sources={drawerSources}
                onClose={() => setDrawerOpen(false)}
                onSourceClick={(source) => {
                    onSourceClick?.(source);
                    setDrawerOpen(false);
                }}
            />
        </div>
    );
}