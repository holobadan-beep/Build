import { ipcMain, BrowserWindow } from "electron";
import os from "os";
import { randomUUID } from "crypto";
// node-pty spawns a REAL OS shell process - this is not a simulated terminal.
import * as pty from "node-pty";

const sessions = new Map<string, pty.IPty>();

function defaultShell(): string {
  if (process.platform === "win32") {
    return process.env.COMSPEC || "powershell.exe";
  }
  return process.env.SHELL || "/bin/bash";
}

export function registerTerminalHandlers() {
  ipcMain.handle("terminal:create", (event, cwd: string, shell?: string) => {
    const id = randomUUID();
    const win = BrowserWindow.fromWebContents(event.sender);
    const shellPath = shell || defaultShell();

    const ptyProcess = pty.spawn(shellPath, [], {
      name: "xterm-256color",
      cols: 80,
      rows: 24,
      cwd: cwd || os.homedir(),
      env: process.env as { [key: string]: string }
    });

    ptyProcess.onData((data) => {
      win?.webContents.send("terminal:data", { id, data });
    });

    ptyProcess.onExit(({ exitCode }) => {
      win?.webContents.send("terminal:exit", { id, code: exitCode });
      sessions.delete(id);
    });

    sessions.set(id, ptyProcess);
    return { id, shell: shellPath };
  });

  ipcMain.handle("terminal:write", (_e, id: string, data: string) => {
    sessions.get(id)?.write(data);
    return true;
  });

  ipcMain.handle("terminal:resize", (_e, id: string, cols: number, rows: number) => {
    sessions.get(id)?.resize(cols, rows);
    return true;
  });

  ipcMain.handle("terminal:kill", (_e, id: string) => {
    sessions.get(id)?.kill();
    sessions.delete(id);
    return true;
  });
}
