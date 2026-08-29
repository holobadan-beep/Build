import React from "react";
import { useI18n } from "../i18n";

type DragStyle = React.CSSProperties & { WebkitAppRegion?: "drag" | "no-drag" };

export default function TitleBar({ onMenuAction }: { onMenuAction: (action: string) => void }) {
  const { t } = useI18n();
  const menus = [
    { key: "file", label: t("menu.file") },
    { key: "edit", label: t("menu.edit") },
    { key: "view", label: t("menu.view") },
    { key: "run", label: t("menu.run") },
    { key: "terminal", label: t("menu.terminal") },
    { key: "help", label: t("menu.help") }
  ];

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        height: 32,
        background: "var(--cx-titlebar)",
        borderBottom: "1px solid var(--cx-border)",
        padding: "0 10px",
        flexShrink: 0,
        WebkitAppRegion: "drag"
      } as DragStyle}
    >
      <svg width="18" height="18" viewBox="0 0 512 512" style={{ marginRight: 10, WebkitAppRegion: "no-drag" } as DragStyle}>
        <path d="M198 156 L110 256 L198 356" fill="none" stroke="#22d3ee" strokeWidth="40" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M314 156 L402 256 L314 356" fill="none" stroke="#a855f7" strokeWidth="40" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M225 366 L287 146" fill="none" stroke="#f8fafc" strokeWidth="34" strokeLinecap="round" />
      </svg>
      <span style={{ fontWeight: 700, fontSize: 13, marginRight: 16 }}>Code X</span>
      {menus.map((m) => (
        <div
          key={m.key}
          onClick={() => onMenuAction(m.key)}
          style={{
            fontSize: 12,
            padding: "4px 8px",
            cursor: "pointer",
            borderRadius: 3,
            WebkitAppRegion: "no-drag"
          } as DragStyle}
          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--cx-bg-2)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          {m.label}
        </div>
      ))}
    </div>
  );
}
