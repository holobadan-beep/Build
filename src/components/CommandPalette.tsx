import React, { useEffect, useMemo, useState } from "react";
import { useI18n } from "../i18n";

export interface Command {
  id: string;
  label: string;
  run: () => void;
}

export default function CommandPalette({
  commands,
  onClose
}: {
  commands: Command[];
  onClose: () => void;
}) {
  const { t } = useI18n();
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return commands.filter((c) => c.label.toLowerCase().includes(q));
  }, [query, commands]);

  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, [onClose]);

  return (
    <div style={overlay} onClick={onClose}>
      <div style={box} onClick={(e) => e.stopPropagation()}>
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("commandPalette.placeholder")}
          style={input}
        />
        <div style={{ maxHeight: 300, overflowY: "auto" }}>
          {filtered.map((c) => (
            <div
              key={c.id}
              onClick={() => {
                c.run();
                onClose();
              }}
              style={row}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--cx-bg-2)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              {c.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const overlay: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.35)",
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "center",
  paddingTop: "12vh",
  zIndex: 1000
};

const box: React.CSSProperties = {
  width: 480,
  maxWidth: "90vw",
  background: "var(--cx-bg-1)",
  border: "1px solid var(--cx-border)",
  borderRadius: 6,
  overflow: "hidden",
  boxShadow: "0 8px 24px rgba(0,0,0,0.4)"
};

const input: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  background: "var(--cx-bg-2)",
  color: "var(--cx-fg)",
  border: "none",
  outline: "none",
  fontSize: 14,
  boxSizing: "border-box"
};

const row: React.CSSProperties = {
  padding: "8px 14px",
  fontSize: 13,
  cursor: "pointer"
};
