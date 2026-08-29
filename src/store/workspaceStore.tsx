import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

export interface OpenTab {
  path: string;
  name: string;
  content: string;
  dirty: boolean;
}

interface WorkspaceState {
  rootPath: string | null;
  tabs: OpenTab[];
  activeTabPath: string | null;
  expandedFolders: Set<string>;
  theme: string;
}

interface WorkspaceContextValue extends WorkspaceState {
  openFolder: (path: string) => void;
  openFile: (path: string, name: string) => Promise<void>;
  closeTab: (path: string) => void;
  setActiveTab: (path: string) => void;
  updateTabContent: (path: string, content: string) => void;
  saveTab: (path: string) => Promise<void>;
  toggleFolder: (path: string) => void;
  setTheme: (theme: string) => void;
}

const STORAGE_KEY = "codex.workspace";
const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

function loadPersisted(): Partial<WorkspaceState> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return { rootPath: parsed.rootPath ?? null, theme: parsed.theme ?? "codex-dark" };
  } catch {
    return {};
  }
}

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const persisted = loadPersisted();
  const [rootPath, setRootPath] = useState<string | null>(persisted.rootPath ?? null);
  const [tabs, setTabs] = useState<OpenTab[]>([]);
  const [activeTabPath, setActiveTabPath] = useState<string | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [theme, setThemeState] = useState<string>(persisted.theme ?? "codex-dark");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ rootPath, theme }));
  }, [rootPath, theme]);

  const openFolder = useCallback((path: string) => {
    setRootPath(path);
    setTabs([]);
    setActiveTabPath(null);
    setExpandedFolders(new Set([path]));
  }, []);

  const openFile = useCallback(
    async (path: string, name: string) => {
      const existing = tabs.find((t) => t.path === path);
      if (existing) {
        setActiveTabPath(path);
        return;
      }
      const content = await window.codex.fs.readFile(path);
      setTabs((prev) => [...prev, { path, name, content, dirty: false }]);
      setActiveTabPath(path);
    },
    [tabs]
  );

  const closeTab = useCallback(
    (path: string) => {
      setTabs((prev) => prev.filter((t) => t.path !== path));
      if (activeTabPath === path) {
        const remaining = tabs.filter((t) => t.path !== path);
        setActiveTabPath(remaining.length ? remaining[remaining.length - 1].path : null);
      }
    },
    [activeTabPath, tabs]
  );

  const setActiveTab = useCallback((path: string) => setActiveTabPath(path), []);

  const updateTabContent = useCallback((path: string, content: string) => {
    setTabs((prev) => prev.map((t) => (t.path === path ? { ...t, content, dirty: true } : t)));
  }, []);

  const saveTab = useCallback(
    async (path: string) => {
      const tab = tabs.find((t) => t.path === path);
      if (!tab) return;
      await window.codex.fs.writeFile(path, tab.content);
      setTabs((prev) => prev.map((t) => (t.path === path ? { ...t, dirty: false } : t)));
    },
    [tabs]
  );

  const toggleFolder = useCallback((path: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  }, []);

  const setTheme = useCallback((t: string) => setThemeState(t), []);

  const value: WorkspaceContextValue = {
    rootPath,
    tabs,
    activeTabPath,
    expandedFolders,
    theme,
    openFolder,
    openFile,
    closeTab,
    setActiveTab,
    updateTabContent,
    saveTab,
    toggleFolder,
    setTheme
  };

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error("useWorkspace must be used within WorkspaceProvider");
  return ctx;
}
