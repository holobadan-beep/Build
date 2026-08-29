import React from "react";
import { useWorkspace } from "../store/workspaceStore";
import { useI18n } from "../i18n";

export default function StatusBar({ onDownload }: { onDownload: () => void }) {
  const { activeTabPath, tabs } = useWorkspace();
  const { t } = useI18n();
  const activeTab = tabs.find((t2) => t2.path === activeTabPath);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: 22,
        background: "var(--cx-accent)",
        color: "#0b0f19",
        fontSize: 11,
        padding: "0 10px",
        flexShrink: 0
      }}
    >
      <div style={{ display: "flex", gap: 14 }}>
        <span>UTF-8</span>
        <span>LF</span>
        <span>Spaces: 2</span>
      </div>
      <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
        {activeTab && <span>{activeTab.name}</span>}
        <span onClick={onDownload} style={{ cursor: "pointer", fontWeight: 700 }}>
          ⬇ {t("project.download")}
        </span>
      </div>
    </div>
  );
}
