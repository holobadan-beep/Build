import React, { useEffect, useState } from "react";
import SplashScreen from "./components/SplashScreen";
import TitleBar from "./components/TitleBar";
import ActivityBar, { ActivityView } from "./components/ActivityBar";
import Explorer from "./components/Explorer";
import EditorArea from "./components/EditorArea";
import BottomPanel from "./components/BottomPanel";
import StatusBar from "./components/StatusBar";
import SettingsPanel from "./components/SettingsPanel";
import AboutModal from "./components/AboutModal";
import CommandPalette, { Command } from "./components/CommandPalette";
import MobileShell from "./components/MobileShell";
import { useWorkspace } from "./store/workspaceStore";
import { useI18n } from "./i18n";

const SPLASH_SEEN_KEY = "codex.splashSeen";

export default function App() {
  const [showSplash, setShowSplash] = useState(() => !sessionStorage.getItem(SPLASH_SEEN_KEY));
  const [activityView, setActivityView] = useState<ActivityView>("explorer");
  const [showAbout, setShowAbout] = useState(false);
  const [showPalette, setShowPalette] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState<string | null>(null);

  const { rootPath, theme, openFolder } = useWorkspace();
  const { t } = useI18n();

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "p") {
        e.preventDefault();
        setShowPalette(true);
      }
    };
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, []);

  const handleSplashFinish = () => {
    sessionStorage.setItem(SPLASH_SEEN_KEY, "1");
    setShowSplash(false);
  };

  const handleDownloadProject = async () => {
    if (!rootPath) return;
    const projectName = rootPath.split(/[\\/]/).pop() || "project";
    const dest = await window.codex.dialog.saveZip(`${projectName}.zip`);
    if (!dest) return;
    setDownloadStatus(t("project.downloading"));
    try {
      await window.codex.zip.downloadProject(rootPath, dest);
      setDownloadStatus(null);
    } catch (err: any) {
      setDownloadStatus(err.message || String(err));
      setTimeout(() => setDownloadStatus(null), 4000);
    }
  };

  const handleOpenFolder = async () => {
    const dir = await window.codex.dialog.openFolder();
    if (dir) openFolder(dir);
  };

  const commands: Command[] = [
    { id: "open-folder", label: t("explorer.openFolder"), run: handleOpenFolder },
    { id: "download-project", label: t("project.download"), run: handleDownloadProject },
    { id: "toggle-terminal", label: "Toggle Terminal", run: () => {} },
    { id: "settings", label: t("settings.title"), run: () => setActivityView("settings") },
    { id: "about", label: t("about.title"), run: () => setShowAbout(true) }
  ];

  const handleMenuAction = (action: string) => {
    if (action === "file") handleOpenFolder();
    if (action === "help") setShowAbout(true);
  };

  return (
    <>
      {showSplash && <SplashScreen onFinish={handleSplashFinish} />}
      {!showSplash && (
        <>
          {/* Desktop layout */}
          <div className="cx-desktop-shell">
            <TitleBar onMenuAction={handleMenuAction} />
            <div style={{ flex: 1, display: "flex", minHeight: 0 }}>
              <ActivityBar active={activityView} onSelect={setActivityView} />
              <div
                style={{
                  width: 260,
                  background: "var(--cx-bg-1)",
                  borderRight: "1px solid var(--cx-border)",
                  flexShrink: 0,
                  overflow: "hidden"
                }}
              >
                {activityView === "explorer" && <Explorer />}
                {activityView === "settings" && <SettingsPanel />}
                {(activityView === "search" || activityView === "git" || activityView === "run" || activityView === "extensions") && (
                  <div style={{ padding: 16, color: "var(--cx-fg-muted)", fontSize: 13 }}>
                    {t(`activity.${activityView}`)} — coming soon.
                  </div>
                )}
              </div>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
                <div style={{ flex: 1, minHeight: 0 }}>
                  <EditorArea />
                </div>
                <div style={{ height: 220, flexShrink: 0 }}>
                  <BottomPanel />
                </div>
              </div>
            </div>
            <StatusBar onDownload={handleDownloadProject} />
          </div>

          {/* Mobile layout */}
          <div className="cx-mobile-shell">
            <MobileShell onOpenAbout={() => setShowAbout(true)} />
          </div>

          {showAbout && <AboutModal onClose={() => setShowAbout(false)} />}
          {showPalette && <CommandPalette commands={commands} onClose={() => setShowPalette(false)} />}
          {downloadStatus && (
            <div
              style={{
                position: "fixed",
                bottom: 40,
                right: 20,
                background: "var(--cx-bg-2)",
                border: "1px solid var(--cx-border)",
                borderRadius: 6,
                padding: "8px 14px",
                fontSize: 12,
                zIndex: 1200
              }}
            >
              {downloadStatus}
            </div>
          )}
        </>
      )}
    </>
  );
}
