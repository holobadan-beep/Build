import React from "react";
import { useI18n } from "../i18n";

export type ActivityView = "explorer" | "search" | "git" | "run" | "extensions" | "settings";

const ICONS: Record<ActivityView, string> = {
  explorer: "▤",
  search: "⌕",
  git: "⎇",
  run: "▶",
  extensions: "⧉",
  settings: "⚙"
};

export default function ActivityBar({
  active,
  onSelect
}: {
  active: ActivityView;
  onSelect: (v: ActivityView) => void;
}) {
  const { t } = useI18n();
  const items: ActivityView[] = ["explorer", "search", "git", "run", "extensions"];

  return (
    <div
      style={{
        width: 48,
        background: "var(--cx-bg-1)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: 8,
        justifyContent: "space-between",
        flexShrink: 0
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
        {items.map((item) => (
          <button
            key={item}
            title={t(`activity.${item}`)}
            onClick={() => onSelect(item)}
            style={{
              width: 40,
              height: 40,
              background: "transparent",
              border: "none",
              borderLeft: active === item ? "2px solid var(--cx-accent)" : "2px solid transparent",
              color: active === item ? "var(--cx-fg)" : "var(--cx-fg-muted)",
              fontSize: 18,
              cursor: "pointer"
            }}
          >
            {ICONS[item]}
          </button>
        ))}
      </div>
      <button
        title={t("activity.settings")}
        onClick={() => onSelect("settings")}
        style={{
          width: 40,
          height: 40,
          marginBottom: 8,
          background: "transparent",
          border: "none",
          borderLeft: active === "settings" ? "2px solid var(--cx-accent)" : "2px solid transparent",
          color: active === "settings" ? "var(--cx-fg)" : "var(--cx-fg-muted)",
          fontSize: 18,
          cursor: "pointer"
        }}
      >
        {ICONS.settings}
      </button>
    </div>
  );
}
