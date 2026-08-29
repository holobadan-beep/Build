import { ipcMain, BrowserWindow } from "electron";
import fs from "fs";
import fsp from "fs/promises";
import path from "path";
import chokidar, { FSWatcher } from "chokidar";

export interface FileEntry {
  name: string;
  path: string;
  isDirectory: boolean;
}

const MAX_UPLOAD_BYTES = 100 * 1024 * 1024; // 100 MB
const BLOCKED_UPLOAD_EXTENSIONS = new Set([".png", ".jpg", ".jpeg"]);

const watchers = new Map<string, FSWatcher>();

/** Prevents any path from escaping outside of an allowed root (used for uploads/extracts). */
function assertInsideRoot(root: string, target: string) {
  const resolvedRoot = path.resolve(root);
  const resolvedTarget = path.resolve(target);
  if (!resolvedTarget.startsWith(resolvedRoot)) {
    throw new Error("Path traversal blocked: target is outside the allowed workspace root.");
  }
}

export function registerFsHandlers() {
  ipcMain.handle("fs:readDir", async (_e, dirPath: string): Promise<FileEntry[]> => {
    const entries = await fsp.readdir(dirPath, { withFileTypes: true });
    return entries
      .map((entry) => ({
        name: entry.name,
        path: path.join(dirPath, entry.name),
        isDirectory: entry.isDirectory()
      }))
      .sort((a, b) => {
        if (a.isDirectory !== b.isDirectory) return a.isDirectory ? -1 : 1;
        return a.name.localeCompare(b.name);
      });
  });

  ipcMain.handle("fs:readFile", async (_e, filePath: string) => {
    return fsp.readFile(filePath, "utf-8");
  });

  ipcMain.handle("fs:writeFile", async (_e, filePath: string, content: string) => {
    await fsp.writeFile(filePath, content, "utf-8");
    return true;
  });

  ipcMain.handle("fs:createFile", async (_e, filePath: string) => {
    if (fs.existsSync(filePath)) throw new Error("File already exists.");
    await fsp.writeFile(filePath, "", "utf-8");
    return true;
  });

  ipcMain.handle("fs:createFolder", async (_e, dirPath: string) => {
    await fsp.mkdir(dirPath, { recursive: true });
    return true;
  });

  ipcMain.handle("fs:rename", async (_e, oldPath: string, newPath: string) => {
    await fsp.rename(oldPath, newPath);
    return true;
  });

  ipcMain.handle("fs:delete", async (_e, targetPath: string) => {
    await fsp.rm(targetPath, { recursive: true, force: true });
    return true;
  });

  ipcMain.handle("fs:exists", async (_e, targetPath: string) => {
    return fs.existsSync(targetPath);
  });

  ipcMain.handle("fs:watch", async (event, rootPath: string) => {
    if (watchers.has(rootPath)) return true;
    const win = BrowserWindow.fromWebContents(event.sender);
    const watcher = chokidar.watch(rootPath, {
      ignored: /node_modules|\.git/,
      ignoreInitial: true,
      depth: 20
    });
    watcher
      .on("add", (p) => win?.webContents.send("fs:changed", { type: "add", path: p }))
      .on("unlink", (p) => win?.webContents.send("fs:changed", { type: "unlink", path: p }))
      .on("addDir", (p) => win?.webContents.send("fs:changed", { type: "addDir", path: p }))
      .on("unlinkDir", (p) => win?.webContents.send("fs:changed", { type: "unlinkDir", path: p }))
      .on("change", (p) => win?.webContents.send("fs:changed", { type: "change", path: p }));
    watchers.set(rootPath, watcher);
    return true;
  });

  ipcMain.handle("fs:unwatch", async (_e, rootPath: string) => {
    const w = watchers.get(rootPath);
    if (w) {
      await w.close();
      watchers.delete(rootPath);
    }
    return true;
  });

  // Upload takes a SOURCE path already selected via the native file-picker
  // dialog (dialog:openFiles) and copies it into the workspace. Doing the
  // copy entirely in the main process avoids ever handing raw file bytes to
  // the renderer, and lets us validate extension/size before touching disk.
  ipcMain.handle("fs:uploadFile", async (_e, targetDir: string, sourcePath: string) => {
    const fileName = path.basename(sourcePath);
    const ext = path.extname(fileName).toLowerCase();
    if (BLOCKED_UPLOAD_EXTENSIONS.has(ext)) {
      throw new Error("Image files are not supported. PNG/JPG/JPEG uploads are disabled.");
    }

    const stat = await fsp.stat(sourcePath);
    if (stat.size > MAX_UPLOAD_BYTES) {
      throw new Error("File exceeds the maximum allowed size of 100 MB.");
    }

    const destPath = path.join(targetDir, fileName);
    assertInsideRoot(targetDir, destPath);

    await fsp.copyFile(sourcePath, destPath);
    return { path: destPath, size: stat.size };
  });
}

export { assertInsideRoot, MAX_UPLOAD_BYTES, BLOCKED_UPLOAD_EXTENSIONS };
