import React from "react";
import { useI18n, LANGUAGES } from "../i18n";
import { useWorkspace } from "../store/workspaceStore";

const THEMES = [
  { id: "codex-dark", label: "Code X Dark" },
  { id: "codex-light", label: "Code X Light" },
  { id: "codex-midnight", label: "Code X Midnight" },
  { id: "codex-hc", label: "Code X High Contrast" }
];

export default function SettingsPanel() {
  const { t, lang, setLang } = useI18n();
  const { theme, setTheme } = useWorkspace();

  return (
    <div style={{ padding: 16, overflowY: "auto", height: "100%" }}>
      <h3 style={{ marginTop: 0 }}>{t("settings.title")}</h3>

      <section style={{ marginBottom: 20 }}>
        <div style={sectionLabel}>{t("settings.language")}</div>
        <select value={lang} onChange={(e) => setLang(e.target.value)} style={selectStyle}>
          {Object.entries(LANGUAGES).map(([code, meta]) => (
            <option key={code} value={code}>
              {meta.label}
            </option>
          ))}
        </select>
      </section>

      <section style={{ marginBottom: 20 }}>
        <div style={sectionLabel}>{t("settings.theme")}</div>
        <select value={theme} onChange={(e) => setTheme(e.target.value)} style={selectStyle}>
          {THEMES.map((th) => (
            <option key={th.id} value={th.id}>
              {th.label}
            </option>
          ))}
        </select>
      </section>

      <section style={{ marginBottom: 20 }}>
        <div style={sectionLabel}>{t("settings.editor")}</div>
        <label style={rowLabel}>
          {t("settings.fontSize")} <input type="number" defaultValue={14} style={numInput} />
        </label>
        <label style={rowLabel}>
          {t("settings.tabSize")} <input type="number" defaultValue={2} style={numInput} />
        </label>
        <label style={rowLabel}>
          <input type="checkbox" defaultChecked /> {t("settings.wordWrap")}
        </label>
        <label style={rowLabel}>
          <input type="checkbox" defaultChecked /> {t("settings.minimap")}
        </label>
        <label style={rowLabel}>
          <input type="checkbox" /> {t("settings.autoSave")}
        </label>
      </section>
    </div>
  );
}

const sectionLabel: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  color: "var(--cx-fg-muted)",
  marginBottom: 8,
  letterSpacing: 0.5
};

const selectStyle: React.CSSProperties = {
  background: "var(--cx-bg-2)",
  color: "var(--cx-fg)",
  border: "1px solid var(--cx-border)",
  borderRadius: 4,
  padding: "6px 10px",
  width: "100%",
  maxWidth: 240
};

const rowLabel: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  fontSize: 13,
  marginBottom: 10
};

const numInput: React.CSSProperties = {
  background: "var(--cx-bg-2)",
  color: "var(--cx-fg)",
  border: "1px solid var(--cx-border)",
  borderRadius: 4,
  padding: "4px 8px",
  width: 60
};
