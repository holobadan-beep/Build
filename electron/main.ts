import { app, BrowserWindow, Menu, dialog, ipcMain } from "electron";
import path from "path";
import { registerFsHandlers } from "./ipc/fs";
import { registerTerminalHandlers } from "./ipc/terminal";
import { registerZipHandlers } from "./ipc/zip";
import { registerDialogHandlers } from "./ipc/dialogs";

const isDev = !app.isPackaged;

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 900,
    minHeight: 560,
    title: "Code X",
    backgroundColor: "#1e1e1e",
    icon: path.join(__dirname, "../public/icon.png"),
    webPreferences: {
      // SECURITY: renderer never gets raw Node.js access.
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false, // preload needs to require node-pty via contextBridge wrapper
      preload: path.join(__dirname, "preload.js")
    }
  });

  Menu.setApplicationMenu(null); // Code X ships its own in-app menu bar (React), not the native OS menu

  if (isDev) {
    mainWindow.loadURL("http://localhost:5173");
    mainWindow.webContents.openDevTools({ mode: "detach" });
  } else {
    mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  registerFsHandlers();
  registerTerminalHandlers();
  registerZipHandlers();
  registerDialogHandlers(() => mainWindow);
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

ipcMain.handle("app:getVersion", () => app.getVersion());
ipcMain.handle("app:platform", () => process.platform);
