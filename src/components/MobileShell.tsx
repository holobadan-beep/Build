import React, { useState } from "react";
import { useWorkspace } from "../store/workspaceStore";
import { useI18n } from "../i18n";
import Explorer from "./Explorer";
import EditorArea from "./EditorArea";
import TerminalPanel from "./TerminalPanel";
import SettingsPanel from "./SettingsPanel";

type MobileTab = "explorer" | "search" | "git" | "run" | "more";
type MobileView = "editor" | "terminal";

export default function MobileShell({ onOpenAbout }: { onOpenAbout: () => void }) {
  const { t } = useI18n();
  const { tabs } = useWorkspace();
  const [navTab, setNavTab] = useState<MobileTab>("explorer");
  const [view, setView] = useState<MobileView>("editor");
  const [drawerOpen, setDrawerOpen] = useState(false);

  const navItems: { key: MobileTab; label: string; icon: string }[] = [
    { key: "explorer", label: t("mobile.nav.explorer"), icon: "▤" },
    { key: "search", label: t("mobile.nav.search"), icon: "⌕" },
    { key: "git", label: t("mobile.nav.git"), icon: "⎇" },
    { key: "run", label: t("mobile.nav.run"), icon: "▶" },
    { key: "more", label: t("mobile.nav.more"), icon: "⋯" }
  ];

  const handleNavTap = (key: MobileTab) => {
    setNavTab(key);
    if (key === "more") {
      setDrawerOpen(true);
    } else if (key === "explorer") {
      setDrawerOpen((v) => navTab === "explorer" ? !v : true);
    } else {
      setDrawerOpen(true);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* top bar */}
      <div
        style={{
          height: 44,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 12px",
          background: "var(--cx-titlebar)",
          flexShrink: 0
        }}
      >
        <span style={{ fontWeight: 700 }}>Code X</span>
        <span onClick={onOpenAbout} style={{ fontSize: 18, cursor: "pointer" }}>
          ⋮
        </span>
      </div>

      {/* stacked editor + terminal */}
      <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
        <div style={{ flex: view === "editor" ? 1 : 0.4, minHeight: 0 }}>
          <EditorArea />
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 8,
            padding: 4,
            background: "var(--cx-bg-1)",
            flexShrink: 0
          }}
        >
          <button onClick={() => setView("editor")} style={toggleBtn(view === "editor")}>
            Editor
          </button>
          <button onClick={() => setView("terminal")} style={toggleBtn(view === "terminal")}>
            {t("terminal.title")}
          </button>
        </div>
        <div style={{ flex: view === "terminal" ? 1 : 0.4, minHeight: 0 }}>
          <TerminalPanel />
        </div>
      </div>

      {/* bottom navigation */}
      <div
        style={{
          display: "flex",
          background: "var(--cx-bg-1)",
          borderTop: "1px solid var(--cx-border)",
          flexShrink: 0,
          paddingBottom: "env(safe-area-inset-bottom)"
        }}
      >
        {navItems.map((item) => (
          <button
            key={item.key}
            onClick={() => handleNavTap(item.key)}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
              padding: "8px 0",
              background: "transparent",
              border: "none",
              color: navTab === item.key ? "var(--cx-accent)" : "var(--cx-fg-muted)"
            }}
          >
            <span style={{ fontSize: 18 }}>{item.icon}</span>
            <span style={{ fontSize: 10 }}>{item.label}</span>
          </button>
        ))}
      </div>

      {/* drawer overlay for explorer/search/git/run/settings on small screens */}
      {drawerOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            zIndex: 500
          }}
          onClick={() => setDrawerOpen(false)}
        >
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              maxHeight: "70vh",
              background: "var(--cx-bg-0)",
              borderTopLeftRadius: 12,
              borderTopRightRadius: 12,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ padding: "10px 14px", borderBottom: "1px solid var(--cx-border)", fontWeight: 700 }}>
              {navItems.find((n) => n.key === navTab)?.label}
            </div>
            <div style={{ overflowY: "auto" }}>
              {navTab === "explorer" && <Explorer />}
              {navTab === "more" && <SettingsPanel />}
              {(navTab === "search" || navTab === "git" || navTab === "run") && (
                <div style={{ padding: 16, color: "var(--cx-fg-muted)", fontSize: 13 }}>
                  {navTab.toUpperCase()} — coming soon on mobile.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function toggleBtn(active: boolean): React.CSSProperties {
  return {
    padding: "4px 14px",
    borderRadius: 12,
    border: "1px solid var(--cx-border)",
    background: active ? "var(--cx-accent)" : "transparent",
    color: active ? "#0b0f19" : "var(--cx-fg)",
    fontSize: 12,
    cursor: "pointer"
  };
}
