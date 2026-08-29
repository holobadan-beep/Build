import { ipcMain, BrowserWindow } from "electron";
import path from "path";
import fs from "fs";
import AdmZip from "adm-zip";
import archiver from "archiver";
import { assertInsideRoot } from "./fs";

export function registerZipHandlers() {
  // Safe extraction: every entry path is validated to stay inside targetDir
  // before being written, which prevents "zip slip" / path traversal attacks.
  ipcMain.handle("zip:extract", async (_e, zipPath: string, targetDir: string) => {
    const zip = new AdmZip(zipPath);
    const entries = zip.getEntries();

    for (const entry of entries) {
      const destPath = path.join(targetDir, entry.entryName);
      assertInsideRoot(targetDir, destPath);
    }

    fs.mkdirSync(targetDir, { recursive: true });
    zip.extractAllTo(targetDir, true);
    return { extractedEntries: entries.length };
  });

  // Zips an entire project directory, preserving folder structure, and
  // streams progress events back to the renderer.
  ipcMain.handle(
    "zip:downloadProject",
    async (event, projectDir: string, destZipPath: string) => {
      const win = BrowserWindow.fromWebContents(event.sender);
      const id = destZipPath;

      return new Promise((resolve, reject) => {
        const output = fs.createWriteStream(destZipPath);
        const archive = archiver("zip", { zlib: { level: 9 } });

        let totalBytes = 0;
        try {
          totalBytes = getDirSize(projectDir);
        } catch {
          totalBytes = 0;
        }

        output.on("close", () => resolve({ path: destZipPath, bytes: archive.pointer() }));
        archive.on("error", (err) => reject(err));
        archive.on("progress", (progress) => {
          const percent =
            totalBytes > 0
              ? Math.min(100, Math.round((progress.fs.processedBytes / totalBytes) * 100))
              : 0;
          win?.webContents.send("zip:progress", { id, percent });
        });

        archive.pipe(output);
        const projectName = path.basename(projectDir);
        archive.directory(projectDir, projectName, (entry) => {
          if (/node_modules|\.git\//.test(entry.name)) return false;
          return entry;
        });
        archive.finalize();
      });
    }
  );
}

function getDirSize(dir: string): number {
  let total = 0;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === "node_modules" || entry.name === ".git") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      total += getDirSize(full);
    } else {
      total += fs.statSync(full).size;
    }
  }
  return total;
}
