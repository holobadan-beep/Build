import React, { useEffect, useState } from "react";
import { useI18n } from "../i18n";

const DURATION_MS = 7000;

export default function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const { t } = useI18n();
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFadeOut(true), DURATION_MS - 500);
    const doneTimer = setTimeout(onFinish, DURATION_MS);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(doneTimer);
    };
  }, [onFinish]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #1e1b4b, #4c1d95)",
        zIndex: 9999,
        opacity: fadeOut ? 0 : 1,
        transition: "opacity 500ms ease"
      }}
    >
      <svg width="120" height="120" viewBox="0 0 512 512" style={{ animation: "cx-pulse 1.6s ease-in-out infinite" }}>
        <path d="M198 156 L110 256 L198 356" fill="none" stroke="#22d3ee" strokeWidth="30" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M314 156 L402 256 L314 356" fill="none" stroke="#a855f7" strokeWidth="30" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M225 366 L287 146" fill="none" stroke="#f8fafc" strokeWidth="26" strokeLinecap="round" />
      </svg>
      <div style={{ marginTop: 24, fontSize: 32, fontWeight: 700, color: "#f8fafc", letterSpacing: 2 }}>
        {t("welcome.title")}
      </div>
      <div style={{ marginTop: 6, fontSize: 14, color: "#c4b5fd" }}>{t("welcome.subtitle")}</div>
      <div style={{ marginTop: 28, fontSize: 13, color: "#e0e7ff", maxWidth: 320, textAlign: "center" }}>
        {t("welcome.message")}
      </div>
      <style>{`
        @keyframes cx-pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.08); opacity: 0.85; }
        }
      `}</style>
    </div>
  );
}
