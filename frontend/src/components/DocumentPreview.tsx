import { useEffect, useState } from "react";
import { getDocumentFileUrl } from "../api/client";
import type { ActiveLease } from "../app/storage";

type Lang = "he" | "en";

const STRINGS = {
    he: { preview: "תצוגת מסמך", closePreview: "סגור תצוגה", openInNewTab: "פתח בכרטיסייה חדשה" },
    en: { preview: "Document preview", closePreview: "Close preview", openInNewTab: "Open in new tab" },
};

export function DocumentPreview(props: {
    lang: Lang;
    activeLease: ActiveLease;
    jumpToPage?: number | null;
    onDocumentNotFound?: () => void;
}) {
    const { lang, activeLease, jumpToPage, onDocumentNotFound } = props;
    const [open, setOpen] = useState(true);

    useEffect(() => {
        if (!onDocumentNotFound) return;
        const url = getDocumentFileUrl(activeLease.documentId);
        let cancelled = false;
        fetch(url, { method: "HEAD" })
            .then((res) => {
                if (cancelled) return;
                if (res.status === 404) onDocumentNotFound();
            })
            .catch(() => {});
        return () => {
            cancelled = true;
        };
    }, [activeLease.documentId, onDocumentNotFound]);
    const t = STRINGS[lang];
    const baseUrl = getDocumentFileUrl(activeLease.documentId);
    const pdfUrl =
        typeof jumpToPage === "number" && jumpToPage >= 1
            ? `${baseUrl}#page=${jumpToPage}`
            : baseUrl;

    return (
        <div className={`preview-panel ${open ? "preview-panel-open" : ""}`}>
            <button
                type="button"
                className="preview-toggle"
                onClick={() => setOpen((o) => !o)}
                title={open ? t.closePreview : t.preview}
                aria-expanded={open}
            >
                <span className="preview-toggle-icon" aria-hidden="true">
                    {open ? "◀" : "▶"}
                </span>
                <span className="preview-toggle-label">{t.preview}</span>
            </button>
            {open && (
                <div className="preview-content">
                    <div className="preview-header">
                        <span className="preview-filename" title={activeLease.filename}>
                            {activeLease.filename}
                        </span>
                        <a
                            href={baseUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="preview-open-link"
                            title={t.openInNewTab}
                        >
                            ↗
                        </a>
                    </div>
                    <div className="preview-iframe-wrap">
                        <object
                            key={jumpToPage ?? 0}
                            data={pdfUrl}
                            type="application/pdf"
                            title={t.preview}
                            className="preview-iframe"
                        >
                            <p className="preview-fallback">
                                <a href={baseUrl} target="_blank" rel="noopener noreferrer">
                                    {t.openInNewTab}
                                </a>
                            </p>
                        </object>
                    </div>
                </div>
            )}
        </div>
    );
}
