import React, { useState } from "react";
import { useI18n } from "../i18n";
import TerminalPanel from "./TerminalPanel";

type PanelTab = "problems" | "output" | "debug" | "terminal";

export default function BottomPanel() {
  const { t } = useI18n();
  const [active, setActive] = useState<PanelTab>("terminal");

  const tabs: { key: PanelTab; label: string }[] = [
    { key: "problems", label: t("panel.problems") },
    { key: "output", label: t("panel.output") },
    { key: "debug", label: t("panel.debugConsole") },
    { key: "terminal", label: t("panel.terminal") }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", borderTop: "1px solid var(--cx-border)" }}>
      <div style={{ display: "flex", background: "var(--cx-bg-1)", flexShrink: 0 }}>
        {tabs.map((tb) => (
          <div
            key={tb.key}
            onClick={() => setActive(tb.key)}
            style={{
              padding: "6px 12px",
              fontSize: 11,
              cursor: "pointer",
              borderBottom: active === tb.key ? "2px solid var(--cx-accent)" : "2px solid transparent",
              color: active === tb.key ? "var(--cx-fg)" : "var(--cx-fg-muted)"
            }}
          >
            {tb.label.toUpperCase()}
          </div>
        ))}
      </div>
      <div style={{ flex: 1, minHeight: 0 }}>
        {active === "terminal" && <TerminalPanel />}
        {active === "problems" && <EmptyState text="No problems detected." />}
        {active === "output" && <EmptyState text="No output yet." />}
        {active === "debug" && <EmptyState text="Debug console is idle." />}
      </div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div style={{ padding: 12, color: "var(--cx-fg-muted)", fontSize: 12 }}>{text}</div>
  );
}
