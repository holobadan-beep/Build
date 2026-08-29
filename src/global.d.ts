export interface FileEntry {
  name: string;
  path: string;
  isDirectory: boolean;
}

export interface CodeXAPI {
  app: {
    getVersion: () => Promise<string>;
    getPlatform: () => Promise<string>;
  };
  dialog: {
    openFolder: () => Promise<string | null>;
    openFiles: () => Promise<string[]>;
    saveZip: (defaultName: string) => Promise<string | null>;
  };
  fs: {
    readDir: (dirPath: string) => Promise<FileEntry[]>;
    readFile: (filePath: string) => Promise<string>;
    writeFile: (filePath: string, content: string) => Promise<boolean>;
    createFile: (filePath: string) => Promise<boolean>;
    createFolder: (dirPath: string) => Promise<boolean>;
    rename: (oldPath: string, newPath: string) => Promise<boolean>;
    delete: (targetPath: string) => Promise<boolean>;
    exists: (targetPath: string) => Promise<boolean>;
    watch: (rootPath: string) => Promise<boolean>;
    unwatch: (rootPath: string) => Promise<boolean>;
    onChange: (cb: (e: { type: string; path: string }) => void) => () => void;
    uploadFile: (targetDir: string, sourcePath: string) => Promise<{ path: string; size: number }>;
  };
  zip: {
    extract: (zipPath: string, targetDir: string) => Promise<{ extractedEntries: number }>;
    downloadProject: (
      projectDir: string,
      destZipPath: string
    ) => Promise<{ path: string; bytes: number }>;
    onProgress: (cb: (p: { id: string; percent: number }) => void) => () => void;
  };
  terminal: {
    create: (cwd: string, shell?: string) => Promise<{ id: string; shell: string }>;
    write: (id: string, data: string) => Promise<boolean>;
    resize: (id: string, cols: number, rows: number) => Promise<boolean>;
    kill: (id: string) => Promise<boolean>;
    onData: (cb: (p: { id: string; data: string }) => void) => () => void;
    onExit: (cb: (p: { id: string; code: number }) => void) => () => void;
  };
}

declare global {
  interface Window {
    codex: CodeXAPI;
  }
}
