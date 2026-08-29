import React, { useEffect, useState } from "react";
import { useI18n } from "../i18n";

const APP_VERSION = "0.1.0";
const SUPPORT_EMAIL = "support@code.x";
const SUPPORT_TELEGRAM = "@gwrandi";
const UPDATES_CHANNEL = "@Code-X_Offc";

export default function AboutModal({ onClose }: { onClose: () => void }) {
  const { t } = useI18n();

  return (
    <div style={overlay} onClick={onClose}>
      <div style={modal} onClick={(e) => e.stopPropagation()}>
        <svg width="56" height="56" viewBox="0 0 512 512" style={{ marginBottom: 12 }}>
          <path d="M198 156 L110 256 L198 356" fill="none" stroke="#22d3ee" strokeWidth="36" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M314 156 L402 256 L314 356" fill="none" stroke="#a855f7" strokeWidth="36" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M225 366 L287 146" fill="none" stroke="#f8fafc" strokeWidth="30" strokeLinecap="round" />
        </svg>
        <h2 style={{ margin: "0 0 4px" }}>{t("about.title")}</h2>
        <div style={{ color: "var(--cx-fg-muted)", marginBottom: 12 }}>
          {t("about.version")} {APP_VERSION}
        </div>

        <div style={{ borderTop: "1px solid var(--cx-border)", paddingTop: 12, width: "100%" }}>
          <h4 style={{ margin: "0 0 8px" }}>{t("support.title")}</h4>
          <ContactRow label={t("support.email")} value={SUPPORT_EMAIL} href={`mailto:${SUPPORT_EMAIL}`} />
          <ContactRow
            label={t("support.telegram")}
            value={SUPPORT_TELEGRAM}
            href={`https://t.me/${SUPPORT_TELEGRAM.replace("@", "")}`}
          />
          <ContactRow
            label={t("support.updates")}
            value={UPDATES_CHANNEL}
            href={`https://t.me/${UPDATES_CHANNEL.replace("@", "")}`}
          />
        </div>

        <button onClick={onClose} style={closeBtn}>
          Close
        </button>
      </div>
    </div>
  );
}

function ContactRow({ label, value, href }: { label: string; value: string; href: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
      <span style={{ color: "var(--cx-fg-muted)" }}>{label}</span>
      <a href={href} target="_blank" rel="noreferrer" style={{ color: "var(--cx-accent)" }}>
        {value}
      </a>
    </div>
  );
}

const overlay: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000
};

const modal: React.CSSProperties = {
  background: "var(--cx-bg-1)",
  border: "1px solid var(--cx-border)",
  borderRadius: 8,
  padding: 24,
  width: 320,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  textAlign: "center"
};

const closeBtn: React.CSSProperties = {
  marginTop: 16,
  background: "var(--cx-accent)",
  color: "#0b0f19",
  border: "none",
  borderRadius: 4,
  padding: "6px 16px",
  fontWeight: 600,
  cursor: "pointer"
};
