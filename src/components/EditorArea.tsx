import React, { useCallback, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { useWorkspace } from "../store/workspaceStore";
import { getFileIcon } from "../utils/fileIcons";

const LANGUAGE_BY_EXT: Record<string, string> = {
  js: "javascript",
  jsx: "javascript",
  ts: "typescript",
  tsx: "typescript",
  py: "python",
  java: "java",
  kt: "kotlin",
  go: "go",
  rs: "rust",
  cpp: "cpp",
  c: "c",
  h: "cpp",
  php: "php",
  rb: "ruby",
  html: "html",
  css: "css",
  scss: "scss",
  json: "json",
  xml: "xml",
  yaml: "yaml",
  yml: "yaml",
  md: "markdown",
  sql: "sql",
  sh: "shell",
  bash: "shell",
  vue: "html"
};

function languageFor(name: string) {
  const ext = name.includes(".") ? name.slice(name.lastIndexOf(".") + 1).toLowerCase() : "";
  return LANGUAGE_BY_EXT[ext] || "plaintext";
}

export default function EditorArea() {
  const { tabs, activeTabPath, setActiveTab, closeTab, updateTabContent, saveTab } =
    useWorkspace();
  const activeTab = tabs.find((t) => t.path === activeTabPath);

  const handleSave = useCallback(() => {
    if (activeTabPath) saveTab(activeTabPath);
  }, [activeTabPath, saveTab]);

  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, [handleSave]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", minWidth: 0 }}>
      <div style={{ display: "flex", background: "var(--cx-bg-1)", overflowX: "auto", flexShrink: 0 }}>
        {tabs.map((tab) => {
          const icon = getFileIcon(tab.name, false);
          const active = tab.path === activeTabPath;
          return (
            <div
              key={tab.path}
              onClick={() => setActiveTab(tab.path)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "6px 10px",
                background: active ? "var(--cx-bg-0)" : "transparent",
                borderRight: "1px solid var(--cx-border)",
                borderTop: active ? `2px solid var(--cx-accent)` : "2px solid transparent",
                cursor: "pointer",
                fontSize: 12,
                whiteSpace: "nowrap"
              }}
            >
              <span
                style={{
                  fontSize: 8,
                  fontWeight: 700,
                  color: "#0b0f19",
                  background: icon.color,
                  borderRadius: 3,
                  padding: "1px 3px"
                }}
              >
                {icon.label}
              </span>
              <span>{tab.name}</span>
              {tab.dirty && <span style={{ color: "var(--cx-warning)" }}>●</span>}
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  closeTab(tab.path);
                }}
                style={{ marginLeft: 4, color: "var(--cx-fg-muted)" }}
              >
                ×
              </span>
            </div>
          );
        })}
      </div>
      <div style={{ flex: 1, minHeight: 0 }}>
        {activeTab ? (
          <Editor
            key={activeTab.path}
            height="100%"
            language={languageFor(activeTab.name)}
            value={activeTab.content}
            theme="vs-dark"
            onChange={(value) => updateTabContent(activeTab.path, value ?? "")}
            options={{
              fontSize: 14,
              minimap: { enabled: true },
              automaticLayout: true,
              wordWrap: "off",
              bracketPairColorization: { enabled: true },
              cursorBlinking: "smooth",
              scrollBeyondLastLine: false
            }}
          />
        ) : (
          <div
            style={{
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--cx-fg-muted)"
            }}
          >
            Code X
          </div>
        )}
      </div>
    </div>
  );
}
