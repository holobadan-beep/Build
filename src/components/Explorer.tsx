import React, { useEffect, useState } from "react";
import { useWorkspace } from "../store/workspaceStore";
import { useI18n } from "../i18n";
import { getFileIcon } from "../utils/fileIcons";
import type { FileEntry } from "../global";

function TreeNode({ entry, depth }: { entry: FileEntry; depth: number }) {
  const { expandedFolders, toggleFolder, openFile } = useWorkspace();
  const [children, setChildren] = useState<FileEntry[] | null>(null);
  const isExpanded = expandedFolders.has(entry.path);
  const icon = getFileIcon(entry.name, entry.isDirectory);

  useEffect(() => {
    if (entry.isDirectory && isExpanded) {
      window.codex.fs.readDir(entry.path).then(setChildren).catch(() => setChildren([]));
    }
  }, [entry.path, entry.isDirectory, isExpanded]);

  const handleClick = () => {
    if (entry.isDirectory) toggleFolder(entry.path);
    else openFile(entry.path, entry.name);
  };

  return (
    <div>
      <div
        onClick={handleClick}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "3px 8px",
          paddingLeft: 8 + depth * 14,
          cursor: "pointer",
          fontSize: 13,
          whiteSpace: "nowrap",
          userSelect: "none"
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--cx-bg-2)")}
        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
      >
        {entry.isDirectory && (
          <span style={{ fontSize: 10, width: 10, color: "var(--cx-fg-muted)" }}>
            {isExpanded ? "▾" : "▸"}
          </span>
        )}
        {!entry.isDirectory && <span style={{ width: 10 }} />}
        <span
          style={{
            fontSize: 9,
            fontWeight: 700,
            color: "#0b0f19",
            background: icon.color,
            borderRadius: 3,
            padding: "1px 4px",
            minWidth: 18,
            textAlign: "center"
          }}
        >
          {icon.label}
        </span>
        <span>{entry.name}</span>
      </div>
      {entry.isDirectory &&
        isExpanded &&
        children?.map((child) => <TreeNode key={child.path} entry={child} depth={depth + 1} />)}
    </div>
  );
}

export default function Explorer() {
  const { rootPath, openFolder } = useWorkspace();
  const { t } = useI18n();
  const [rootEntries, setRootEntries] = useState<FileEntry[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    if (!rootPath) return;
    window.codex.fs.readDir(rootPath).then(setRootEntries).catch(() => setRootEntries([]));
    window.codex.fs.watch(rootPath);
    const unsub = window.codex.fs.onChange(() => {
      window.codex.fs.readDir(rootPath).then(setRootEntries).catch(() => {});
    });
    return () => {
      unsub();
      window.codex.fs.unwatch(rootPath);
    };
  }, [rootPath]);

  const handleOpenFolder = async () => {
    const dir = await window.codex.dialog.openFolder();
    if (dir) openFolder(dir);
  };

  const handleUpload = async () => {
    if (!rootPath) return;
    const files = await window.codex.dialog.openFiles();
    setUploadError(null);
    for (const filePath of files) {
      try {
        await window.codex.fs.uploadFile(rootPath, filePath);
      } catch (err: any) {
        setUploadError(err.message || String(err));
      }
    }
  };

  if (!rootPath) {
    return (
      <div style={{ padding: 16, textAlign: "center" }}>
        <div style={{ color: "var(--cx-fg-muted)", marginBottom: 12, fontSize: 13 }}>
          {t("explorer.openFolderPrompt")}
        </div>
        <button
          onClick={handleOpenFolder}
          style={{
            background: "var(--cx-accent)",
            color: "#0b0f19",
            border: "none",
            borderRadius: 4,
            padding: "6px 14px",
            fontWeight: 600,
            cursor: "pointer"
          }}
        >
          {t("explorer.openFolder")}
        </button>
      </div>
    );
  }

  return (
    <div style={{ height: "100%", overflowY: "auto" }}>
      <div
        style={{
          padding: "8px 12px",
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: 1,
          color: "var(--cx-fg-muted)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}
      >
        <span>{t("explorer.title").toUpperCase()}</span>
        <div style={{ display: "flex", gap: 8 }}>
          <button title={t("explorer.uploadFile")} onClick={handleUpload} style={iconBtn}>
            ⭱
          </button>
        </div>
      </div>
      {uploadError && (
        <div style={{ color: "var(--cx-danger)", fontSize: 11, padding: "0 12px 6px" }}>
          {uploadError}
        </div>
      )}
      {rootEntries.map((entry) => (
        <TreeNode key={entry.path} entry={entry} depth={0} />
      ))}
    </div>
  );
}

const iconBtn: React.CSSProperties = {
  background: "transparent",
  border: "none",
  color: "var(--cx-fg-muted)",
  cursor: "pointer",
  fontSize: 13
};
