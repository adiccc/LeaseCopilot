import { useEffect, useMemo, useRef } from "react";
import type { Source } from "../api/types";

type Lang = "he" | "en";

const STRINGS = {
    he: { close: "סגירה", empty: "לא נמצאו מקורות להצגה." },
    en: { close: "Close", empty: "No sources to display." },
};

export function SourcesDrawer(props: {
    lang: Lang;
    open: boolean;
    title: string;
    sources: Source[];
    onClose: () => void;
    onSourceClick?: (source: Source) => void;
}) {
    const { lang, open, title, sources, onClose, onSourceClick } = props;
    const t = useMemo(() => STRINGS[lang], [lang]);
    const dialogRef = useRef<HTMLDialogElement | null>(null);

    useEffect(() => {
        const el = dialogRef.current;
        if (!el) return;

        if (open && !el.open) el.showModal();
        if (!open && el.open) el.close();
    }, [open]);

    return (
        <dialog
            ref={dialogRef}
            className="drawer"
            onCancel={(e) => {
                e.preventDefault();
                onClose();
            }}
            onClose={onClose}
            aria-label={title}
        >
            <div className="drawer-header">
                <div className="drawer-title">{title}</div>
                <button className="btn secondary" onClick={onClose}>
                    {t.close}
                </button>
            </div>

            <div className="drawer-body">
                {(!sources || sources.length === 0) ? (
                    <div className="muted">{t.empty}</div>
                ) : (
                    <div className="stack gap-md">
                        {sources.map((s, idx) => {
                            const text =
                                (s as any).snippet ??
                                (s as any).text ??
                                (s as any).content ??
                                "";
                            const trimmed = String(text).trim();
                            const hasPage = typeof (s as any).page_start === "number";
                            return (
                                <button
                                    key={idx}
                                    type="button"
                                    className="source-card source-card-btn"
                                    onClick={() => onSourceClick?.(s)}
                                    disabled={!onSourceClick || !hasPage}
                                    title={hasPage ? "Jump to page in document" : undefined}
                                >
                                    <div className="source-content" dir="ltr">
                                        {trimmed ? `... ${trimmed} ...` : "—"}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        </dialog>
    );
}