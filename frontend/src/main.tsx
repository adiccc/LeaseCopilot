import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles.css";
import logoUrl from "./assets/logo.png";

const link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
if (link) link.href = logoUrl;

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);