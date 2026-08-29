import { contextBridge, ipcRenderer } from "electron";

/**
 * SECURITY NOTE:
 * The renderer process NEVER receives direct access to `fs`, `child_process`,
 * or any Node API. Every operation below is a whitelisted IPC channel that is
 * validated on the main-process side (see electron/ipc/*.ts). This is the
 * only bridge between renderer and OS.
 */
const api = {
  app: {
    getVersion: () => ipcRenderer.invoke("app:getVersion"),
    getPlatform: () => ipcRenderer.invoke("app:platform")
  },

  dialog: {
    openFolder: () => ipcRenderer.invoke("dialog:openFolder"),
    openFiles: () => ipcRenderer.invoke("dialog:openFiles"),
    saveZip: (defaultName: string) => ipcRenderer.invoke("dialog:saveZip", defaultName)
  },

  fs: {
    readDir: (dirPath: string) => ipcRenderer.invoke("fs:readDir", dirPath),
    readFile: (filePath: string) => ipcRenderer.invoke("fs:readFile", filePath),
    writeFile: (filePath: string, content: string) =>
      ipcRenderer.invoke("fs:writeFile", filePath, content),
    createFile: (filePath: string) => ipcRenderer.invoke("fs:createFile", filePath),
    createFolder: (dirPath: string) => ipcRenderer.invoke("fs:createFolder", dirPath),
    rename: (oldPath: string, newPath: string) =>
      ipcRenderer.invoke("fs:rename", oldPath, newPath),
    delete: (targetPath: string) => ipcRenderer.invoke("fs:delete", targetPath),
    exists: (targetPath: string) => ipcRenderer.invoke("fs:exists", targetPath),
    watch: (rootPath: string) => ipcRenderer.invoke("fs:watch", rootPath),
    unwatch: (rootPath: string) => ipcRenderer.invoke("fs:unwatch", rootPath),
    onChange: (cb: (event: { type: string; path: string }) => void) => {
      const listener = (_: unknown, payload: { type: string; path: string }) => cb(payload);
      ipcRenderer.on("fs:changed", listener);
      return () => ipcRenderer.removeListener("fs:changed", listener);
    },
    // Upload: renderer passes a source path (chosen via dialog.openFiles) and a
    // target dir; the main process validates extension (blocks png/jpg/jpeg)
    // and size (<=100MB), then copies the file directly on disk.
    uploadFile: (targetDir: string, sourcePath: string) =>
      ipcRenderer.invoke("fs:uploadFile", targetDir, sourcePath)
  },

  zip: {
    extract: (zipPath: string, targetDir: string) =>
      ipcRenderer.invoke("zip:extract", zipPath, targetDir),
    downloadProject: (projectDir: string, destZipPath: string) =>
      ipcRenderer.invoke("zip:downloadProject", projectDir, destZipPath),
    onProgress: (cb: (payload: { id: string; percent: number }) => void) => {
      const listener = (_: unknown, payload: { id: string; percent: number }) => cb(payload);
      ipcRenderer.on("zip:progress", listener);
      return () => ipcRenderer.removeListener("zip:progress", listener);
    }
  },

  terminal: {
    create: (cwd: string, shell?: string) => ipcRenderer.invoke("terminal:create", cwd, shell),
    write: (id: string, data: string) => ipcRenderer.invoke("terminal:write", id, data),
    resize: (id: string, cols: number, rows: number) =>
      ipcRenderer.invoke("terminal:resize", id, cols, rows),
    kill: (id: string) => ipcRenderer.invoke("terminal:kill", id),
    onData: (cb: (payload: { id: string; data: string }) => void) => {
      const listener = (_: unknown, payload: { id: string; data: string }) => cb(payload);
      ipcRenderer.on("terminal:data", listener);
      return () => ipcRenderer.removeListener("terminal:data", listener);
    },
    onExit: (cb: (payload: { id: string; code: number }) => void) => {
      const listener = (_: unknown, payload: { id: string; code: number }) => cb(payload);
      ipcRenderer.on("terminal:exit", listener);
      return () => ipcRenderer.removeListener("terminal:exit", listener);
    }
  }
};

contextBridge.exposeInMainWorld("codex", api);

export type CodeXAPI = typeof api;
