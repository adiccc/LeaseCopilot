import React, { useEffect, useMemo, useRef, useState } from "react";
import type { AppState } from "../app/storage";
import { UploadCard } from "./UploadCard";
import { ChatView } from "./ChatView";
import { DocumentPreview } from "./DocumentPreview";

type Lang = "he" | "en";

const STRINGS = {
    he: { title: "שאלות על החוזה" },
    en: { title: "Ask about the lease" },
};

export function LeaseGate(props: {
    lang: Lang;
    appState: AppState;
    onChangeAppState: React.Dispatch<React.SetStateAction<AppState>>;
}) {
    const { lang, appState, onChangeAppState } = props;
    const t = useMemo(() => STRINGS[lang], [lang]);

    const hasLease = !!appState.activeLease?.documentId;
    const [jumpToPage, setJumpToPage] = useState<number | null>(null);
    const [uploadModalOpen, setUploadModalOpen] = useState(false);
    const uploadDialogRef = useRef<HTMLDialogElement | null>(null);

    useEffect(() => {
        const el = uploadDialogRef.current;
        if (!el || !uploadModalOpen) return;
        el.showModal();
        return () => {
            if (el.open) el.close();
        };
    }, [uploadModalOpen]);

    return (
        <section className="panel" aria-label="LeaseCopilot main">
            <div className="panel-header">
                <h1 className="h1">{t.title}</h1>
            </div>

            <div className="panel-body">
                <div className="chat-layout">
                    {hasLease && (
                        <DocumentPreview
                            lang={lang}
                            activeLease={appState.activeLease!}
                            jumpToPage={jumpToPage}
                            onDocumentNotFound={() =>
                                onChangeAppState((s) => ({ ...s, activeLease: undefined }))
                            }
                        />
                    )}
                    <div className="chat-main">
                        <ChatView
                            lang={lang}
                            activeLease={appState.activeLease}
                            onOpenUpload={() => setUploadModalOpen(true)}
                            onSourceClick={
                                hasLease
                                    ? (source) => {
                                          const p = (source as { page_start?: number }).page_start;
                                          if (typeof p === "number" && p >= 1) setJumpToPage(p);
                                      }
                                    : undefined
                            }
                        />
                    </div>
                </div>
            </div>

            {uploadModalOpen && (
                <dialog
                    ref={uploadDialogRef}
                    className="drawer upload-modal"
                    onCancel={(e) => {
                        e.preventDefault();
                        setUploadModalOpen(false);
                    }}
                    onClose={() => setUploadModalOpen(false)}
                    aria-label="Upload document"
                >
                    <div className="drawer-header">
                        <div className="drawer-title">
                            {lang === "he" ? "העלאת חוזה" : "Upload lease"}
                        </div>
                        <button
                            type="button"
                            className="btn secondary"
                            onClick={() => setUploadModalOpen(false)}
                        >
                            {lang === "he" ? "ביטול" : "Cancel"}
                        </button>
                    </div>
                    <div className="drawer-body">
                        <UploadCard
                            lang={lang}
                            simple
                            onUploaded={(lease) => {
                                onChangeAppState((s) => ({ ...s, activeLease: lease }));
                                setUploadModalOpen(false);
                            }}
                        />
                    </div>
                </dialog>
            )}
        </section>
    );
}