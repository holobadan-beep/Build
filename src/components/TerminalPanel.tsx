import React, { useEffect, useRef, useState } from "react";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import "xterm/css/xterm.css";
import { useWorkspace } from "../store/workspaceStore";
import { useI18n } from "../i18n";

export default function TerminalPanel() {
  const { rootPath } = useWorkspace();
  const { t } = useI18n();
  const containerRef = useRef<HTMLDivElement>(null);
  const termRef = useRef<Terminal | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const term = new Terminal({
      cursorBlink: true,
      fontSize: 13,
      fontFamily: "Consolas, 'Courier New', monospace",
      theme: { background: "#1e1e1e" }
    });
    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(containerRef.current);
    fitAddon.fit();
    termRef.current = term;

    let unsubData: (() => void) | null = null;
    let unsubExit: (() => void) | null = null;

    window.codex.terminal
      .create(rootPath || "")
      .then(({ id }) => {
        sessionIdRef.current = id;

        unsubData = window.codex.terminal.onData(({ id: dataId, data }) => {
          if (dataId === id) term.write(data);
        });
        unsubExit = window.codex.terminal.onExit(({ id: exitId, code }) => {
          if (exitId === id) term.write(`\r\n[process exited with code ${code}]\r\n`);
        });

        term.onData((data) => {
          window.codex.terminal.write(id, data);
        });

        term.onResize(({ cols, rows }) => {
          window.codex.terminal.resize(id, cols, rows);
        });
      })
      .catch((err) => setError(err?.message || t("terminal.notAvailable")));

    const resizeObserver = new ResizeObserver(() => fitAddon.fit());
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      unsubData?.();
      unsubExit?.();
      if (sessionIdRef.current) window.codex.terminal.kill(sessionIdRef.current);
      term.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ height: "100%", padding: "4px 8px", background: "#1e1e1e" }}>
      {error && <div style={{ color: "var(--cx-danger)", fontSize: 12, marginBottom: 4 }}>{error}</div>}
      <div ref={containerRef} style={{ height: "100%" }} />
    </div>
  );
}
