import { Filesystem, Directory, Encoding } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import JSZip from "jszip";
import type { CodeXAPI, FileEntry } from "../global";

/**
 * MOBILE PLATFORM NOTES
 * ----------------------------------------------------------------------
 * Android/iOS apps are sandboxed: there is no OS-wide "open any folder"
 * access like on desktop, and there is no shell process an app can spawn
 * without root. This bridge intentionally does NOT fake those things:
 *  - "Open Folder" becomes "Create/Open Project" scoped to the app's own
 *    Documents/CodeX directory (this is how every mobile IDE works).
 *  - The terminal is left unimplemented on purpose: `terminal.create`
 *    rejects, and TerminalPanel.tsx already shows the
 *    "No shell available on this platform" message instead of a fake
 *    terminal — per the product spec (section 42).
 * All other features (explorer, editor, upload, ZIP extract/download)
 * are real, backed by native filesystem + share APIs.
 */

const PROJECTS_ROOT = "CodeX";
const DIR = Directory.Documents;

const MAX_UPLOAD_BYTES = 100 * 1024 * 1024;
const BLOCKED_UPLOAD_EXTENSIONS = new Set([".png", ".jpg", ".jpeg"]);

// Holds files picked via the hidden <input type="file"> until fs.uploadFile()
// is called for them — this lets Explorer.tsx's existing
// "openFiles() -> uploadFile(dir, path)" flow work unmodified on mobile.
const pendingUploads = new Map<string, { name: string; base64: string; size: number }>();

function assertInProjects(path: string) {
  if (path.includes("..")) throw new Error("Invalid path.");
}

async function ensureDir(path: string) {
  try {
    await Filesystem.mkdir({ path, directory: DIR, recursive: true });
  } catch {
    // already exists — fine
  }
}

async function listProjects(): Promise<string[]> {
  await ensureDir(PROJECTS_ROOT);
  try {
    const res = await Filesystem.readdir({ path: PROJECTS_ROOT, directory: DIR });
    return res.files.filter((f) => f.type === "directory").map((f) => f.name);
  } catch {
    return [];
  }
}

async function readDirRecursiveForZip(
  zip: JSZip,
  relPath: string,
  zipFolder: JSZip
): Promise<void> {
  const res = await Filesystem.readdir({ path: relPath, directory: DIR });
  for (const entry of res.files) {
    const entryPath = `${relPath}/${entry.name}`;
    if (entry.name === "node_modules" || entry.name === ".git") continue;
    if (entry.type === "directory") {
      const sub = zipFolder.folder(entry.name)!;
      await readDirRecursiveForZip(zip, entryPath, sub);
    } else {
      const file = await Filesystem.readFile({ path: entryPath, directory: DIR });
      zipFolder.file(entry.name, file.data as string, { base64: true });
    }
  }
}

async function extractZipEntry(
  zipObj: JSZip,
  targetDir: string
): Promise<number> {
  let count = 0;
  const entries = Object.values(zipObj.files);
  for (const entry of entries) {
    assertInProjects(entry.name);
    const destPath = `${targetDir}/${entry.name}`;
    if (entry.dir) {
      await ensureDir(destPath);
    } else {
      const base64 = await entry.async("base64");
      const parentDir = destPath.substring(0, destPath.lastIndexOf("/"));
      if (parentDir) await ensureDir(parentDir);
      await Filesystem.writeFile({ path: destPath, directory: DIR, data: base64 });
      count++;
    }
  }
  return count;
}

export function installCapacitorBridge() {
  const api: CodeXAPI = {
    app: {
      getVersion: async () => "0.1.0",
      getPlatform: async () => "android"
    },

    dialog: {
      // Pragmatic first-pass UX: prompt for a project name, create it if new,
      // open it if it already exists. A dedicated project-list screen is a
      // natural next iteration but this is fully functional today.
      openFolder: async () => {
        const existing = await listProjects();
        const hint = existing.length
          ? `Existing projects: ${existing.join(", ")}\n\nType an existing name to open it, or a new name to create one.`
          : "No projects yet. Type a name to create your first project.";
        const name = window.prompt(hint);
        if (!name) return null;
        const projectPath = `${PROJECTS_ROOT}/${name.trim()}`;
        await ensureDir(projectPath);
        return projectPath;
      },

      openFiles: async () => {
        return new Promise((resolve) => {
          const input = document.createElement("input");
          input.type = "file";
          input.multiple = true;
          input.style.display = "none";
          input.onchange = async () => {
            const files = Array.from(input.files || []);
            const ids: string[] = [];
            for (const file of files) {
              const base64 = await fileToBase64(file);
              const id = `capacitor-upload://${crypto.randomUUID()}`;
              pendingUploads.set(id, { name: file.name, base64, size: file.size });
              ids.push(id);
            }
            document.body.removeChild(input);
            resolve(ids);
          };
          document.body.appendChild(input);
          input.click();
        });
      },

      saveZip: async (defaultName: string) => defaultName
    },

    fs: {
      readDir: async (dirPath: string): Promise<FileEntry[]> => {
        const res = await Filesystem.readdir({ path: dirPath, directory: DIR });
        return res.files
          .map((f) => ({
            name: f.name,
            path: `${dirPath}/${f.name}`,
            isDirectory: f.type === "directory"
          }))
          .sort((a, b) => {
            if (a.isDirectory !== b.isDirectory) return a.isDirectory ? -1 : 1;
            return a.name.localeCompare(b.name);
          });
      },

      readFile: async (filePath: string) => {
        const res = await Filesystem.readFile({ path: filePath, directory: DIR, encoding: Encoding.UTF8 });
        return res.data as string;
      },

      writeFile: async (filePath: string, content: string) => {
        await Filesystem.writeFile({ path: filePath, directory: DIR, data: content, encoding: Encoding.UTF8 });
        return true;
      },

      createFile: async (filePath: string) => {
        await Filesystem.writeFile({ path: filePath, directory: DIR, data: "", encoding: Encoding.UTF8 });
        return true;
      },

      createFolder: async (dirPath: string) => {
        await ensureDir(dirPath);
        return true;
      },

      rename: async (oldPath: string, newPath: string) => {
        await Filesystem.rename({ from: oldPath, to: newPath, directory: DIR, toDirectory: DIR });
        return true;
      },

      delete: async (targetPath: string) => {
        try {
          await Filesystem.deleteFile({ path: targetPath, directory: DIR });
        } catch {
          await Filesystem.rmdir({ path: targetPath, directory: DIR, recursive: true });
        }
        return true;
      },

      exists: async (targetPath: string) => {
        try {
          await Filesystem.stat({ path: targetPath, directory: DIR });
          return true;
        } catch {
          return false;
        }
      },

      // Real-time file-system watching isn't exposed by the Capacitor
      // Filesystem plugin. No-op rather than a fake watcher.
      watch: async () => true,
      unwatch: async () => true,
      onChange: () => () => {},

      uploadFile: async (targetDir: string, sourcePath: string) => {
        const pending = pendingUploads.get(sourcePath);
        if (!pending) throw new Error("Upload source not found.");
        const ext = pending.name.slice(pending.name.lastIndexOf(".")).toLowerCase();
        if (BLOCKED_UPLOAD_EXTENSIONS.has(ext)) {
          pendingUploads.delete(sourcePath);
          throw new Error("Image files are not supported. PNG/JPG/JPEG uploads are disabled.");
        }
        if (pending.size > MAX_UPLOAD_BYTES) {
          pendingUploads.delete(sourcePath);
          throw new Error("File exceeds the maximum allowed size of 100 MB.");
        }
        const destPath = `${targetDir}/${pending.name}`;
        await Filesystem.writeFile({ path: destPath, directory: DIR, data: pending.base64 });
        pendingUploads.delete(sourcePath);
        return { path: destPath, size: pending.size };
      }
    },

    zip: {
      extract: async (zipPath: string, targetDir: string) => {
        const file = await Filesystem.readFile({ path: zipPath, directory: DIR });
        const zipObj = await JSZip.loadAsync(file.data as string, { base64: true });
        const count = await extractZipEntry(zipObj, targetDir);
        return { extractedEntries: count };
      },

      downloadProject: async (projectDir: string, destZipPath: string) => {
        const zip = new JSZip();
        const projectName = projectDir.split("/").pop() || "project";
        const folder = zip.folder(projectName)!;
        await readDirRecursiveForZip(zip, projectDir, folder);
        const base64 = await zip.generateAsync({ type: "base64" });

        const cachePath = `${projectName}.zip`;
        await Filesystem.writeFile({ path: cachePath, directory: Directory.Cache, data: base64 });
        const uriResult = await Filesystem.getUri({ path: cachePath, directory: Directory.Cache });

        // Hand off to the native share sheet so the user can save to Files,
        // Drive, send via chat apps, etc. — this is the mobile equivalent
        // of a "Save As" dialog.
        await Share.share({
          title: `${projectName}.zip`,
          url: uriResult.uri
        });

        return { path: uriResult.uri, bytes: base64.length };
      },

      onProgress: () => () => {}
    },

    terminal: {
      create: async () => {
        throw new Error("No shell available on this platform.");
      },
      write: async () => true,
      resize: async () => true,
      kill: async () => true,
      onData: () => () => {},
      onExit: () => () => {}
    }
  };

  window.codex = api;
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1] || "");
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
