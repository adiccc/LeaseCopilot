import { useMemo, useRef, useState } from "react";
import { uploadDocument } from "../api/client";
import type { ActiveLease } from "../app/storage";

type Lang = "he" | "en";

const STRINGS = {
    he: {
        help: "כדי להתחיל לשאול שאלות, העלי חוזה (PDF).",
        instruction: "אפשר להעלות קובץ או לגרור ולשחרר PDF כאן.",
        dropTitle: "גררי לכאן קובץ PDF או לחצי לבחירה",
        dropSub: "העלאה או גרירה ושחרור. תמיכה ב־PDF.",
        chooseFile: "בחרי קובץ",
        upload: "העלאה",
        uploading: "מעלה…",
        noFile: "לא נבחר קובץ",
        success: "הועלה בהצלחה",
        errorGeneric: "משהו השתבש בהעלאה",
    },
    en: {
        help: "To start asking questions, upload a lease PDF.",
        instruction: "Upload a file or drag and drop a PDF here.",
        dropTitle: "Drag a PDF here or click to choose a file",
        dropSub: "Upload or drag and drop. PDF supported.",
        chooseFile: "Choose file",
        upload: "Upload",
        uploading: "Uploading…",
        noFile: "No file selected",
        success: "Uploaded successfully",
        errorGeneric: "Upload failed",
    },
};

function classNames(...xs: Array<string | false | undefined | null>) {
    return xs.filter(Boolean).join(" ");
}

export function UploadCard(props: {
    lang: Lang;
    onUploaded: (lease: ActiveLease) => void;
    simple?: boolean;
}) {
    const { lang, onUploaded, simple = false } = props;
    const t = useMemo(() => STRINGS[lang], [lang]);

    const ownerId = (import.meta.env.VITE_OWNER_ID as string) ?? "demo_owner";

    const [file, setFile] = useState<File | null>(null);

    const [dragOver, setDragOver] = useState(false);
    const [busy, setBusy] = useState(false);

    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const inputRef = useRef<HTMLInputElement | null>(null);

    const canSubmit = !!file && !busy;

    async function onSubmit() {
        setError(null);
        setSuccess(null);

        if (!file) {
            setError(t.noFile);
            return;
        }

        setBusy(true);
        try {
            const res = await uploadDocument({ file, ownerId });
            setSuccess(t.success);

            onUploaded({
                documentId: res.document_id,
                filename: file.name,
                chunksIndexed: res.chunks_indexed,
                storageUri: res.storage_uri,
                uploadedAtIso: new Date().toISOString(),
            });
        } catch (e: any) {
            const msg = typeof e?.message === "string" ? e.message : t.errorGeneric;
            setError(msg);
        } finally {
            setBusy(false);
        }
    }

    if (simple) {
        return (
            <div className="stack gap-md upload-simple">
                <p className="muted">{t.instruction}</p>
                <div
                    className={classNames("dropzone dropzone-simple", dragOver && "dragover")}
                    role="button"
                    tabIndex={0}
                    aria-label={t.dropTitle}
                    onClick={() => inputRef.current?.click()}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
                    }}
                    onDragOver={(e) => {
                        e.preventDefault();
                        setDragOver(true);
                    }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={(e) => {
                        e.preventDefault();
                        setDragOver(false);
                        const f = e.dataTransfer.files?.[0];
                        if (f && f.type === "application/pdf") setFile(f);
                    }}
                >
                    <div className="dropzone-simple-text">
                        {file ? file.name : t.dropSub}
                    </div>
                </div>
                <div className="upload-simple-row">
                    <button
                        type="button"
                        className="btn secondary"
                        onClick={() => inputRef.current?.click()}
                    >
                        {file ? file.name : t.chooseFile}
                    </button>
                    <button
                        type="button"
                        className="btn primary"
                        disabled={!canSubmit}
                        onClick={() => void onSubmit()}
                    >
                        {busy ? t.uploading : t.upload}
                    </button>
                </div>
                <input
                    ref={inputRef}
                    type="file"
                    accept="application/pdf"
                    className="sr-only"
                    onChange={(e) => {
                        const f = e.target.files?.[0] ?? null;
                        setFile(f);
                    }}
                />
                {error && (
                    <div className="alert error" role="alert">
                        <pre className="alert-body" dir="ltr">{error}</pre>
                    </div>
                )}
                {success && (
                    <div className="alert success" role="status">
                        <div className="alert-body">{success}</div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="stack gap-lg">
            <p className="muted">{t.help}</p>

            <div className="field">
                <label className="label">{lang === "he" ? "קובץ" : "File"}</label>
                <div className="file-pill" aria-live="polite">
                    {file ? file.name : <span className="muted">{t.noFile}</span>}
                </div>
            </div>

            <div
                className={classNames("dropzone", dragOver && "dragover")}
                role="button"
                tabIndex={0}
                aria-label={t.dropTitle}
                onClick={() => inputRef.current?.click()}
                onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
                }}
                onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                    e.preventDefault();
                    setDragOver(false);
                    const f = e.dataTransfer.files?.[0];
                    if (f) setFile(f);
                }}
            >
                <div className="dropzone-title">{t.dropTitle}</div>
                <div className="dropzone-sub">{t.dropSub}</div>

                <div className="dropzone-actions">
                    <button
                        type="button"
                        className="btn secondary"
                        onClick={(e) => {
                            e.stopPropagation();
                            inputRef.current?.click();
                        }}
                    >
                        {t.chooseFile}
                    </button>

                    <button
                        type="button"
                        className="btn primary"
                        disabled={!canSubmit}
                        onClick={(e) => {
                            e.stopPropagation();
                            void onSubmit();
                        }}
                    >
                        {busy ? t.uploading : t.upload}
                    </button>
                </div>

                <input
                    ref={inputRef}
                    type="file"
                    accept="application/pdf"
                    className="sr-only"
                    onChange={(e) => {
                        const f = e.target.files?.[0] ?? null;
                        setFile(f);
                    }}
                />
            </div>

            {error && (
                <div className="alert error" role="alert">
                    <div className="alert-title">{lang === "he" ? "שגיאה" : "Error"}</div>
                    <pre className="alert-body" dir="ltr">{error}</pre>
                </div>
            )}

            {success && (
                <div className="alert success" role="status">
                    <div className="alert-title">{lang === "he" ? "הצלחה" : "Success"}</div>
                    <div className="alert-body">{success}</div>
                </div>
            )}
        </div>
    );
}