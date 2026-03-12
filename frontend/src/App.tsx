import { useState } from "react";
import { LeaseGate } from "./components/LeaseGate";
import { loadAppState, type AppState } from "./app/storage";

type Lang = "en";

const STRINGS = {
    en: {
        appName: "LeaseCopilot",
    },
};

export default function App() {
    const [appState, setAppState] = useState<AppState>(() => loadAppState());
    const lang: Lang = "en";
    const t = STRINGS[lang];

    return (
        <div className="app">
            <header className="topbar" role="banner">
                <div className="topbar-left">
                    <div className="brand">
                        <div className="brand-dot" aria-hidden="true" />
                        <span className="brand-name">{t.appName}</span>
                    </div>
                </div>
            </header>

            <main className="container" role="main">
                <LeaseGate
                    lang={lang}
                    appState={appState}
                    onChangeAppState={setAppState}
                />
            </main>

            <footer className="footer" role="contentinfo">
                <span className="muted">Tip: Send with Enter, new line with Shift+Enter.</span>
            </footer>
        </div>
    );
}