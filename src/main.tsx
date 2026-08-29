import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { I18nProvider } from "./i18n";
import { WorkspaceProvider } from "./store/workspaceStore";
import { installCapacitorBridge } from "./platform/capacitorBridge";
import "./styles/theme.css";

// Electron's preload script injects window.codex synchronously before this
// module runs. If it's missing, we're either running under Capacitor
// (Android/iOS) or a plain browser tab — install the Capacitor-backed
// implementation so every component that calls window.codex.* keeps working
// unchanged.
if (!window.codex) {
  installCapacitorBridge();
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <I18nProvider>
      <WorkspaceProvider>
        <App />
      </WorkspaceProvider>
    </I18nProvider>
  </React.StrictMode>
);
