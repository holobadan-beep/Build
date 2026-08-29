import { ipcMain, dialog, BrowserWindow } from "electron";

export function registerDialogHandlers(getWindow: () => BrowserWindow | null) {
  ipcMain.handle("dialog:openFolder", async () => {
    const win = getWindow();
    if (!win) return null;
    const result = await dialog.showOpenDialog(win, {
      properties: ["openDirectory", "createDirectory"]
    });
    if (result.canceled || result.filePaths.length === 0) return null;
    return result.filePaths[0];
  });

  ipcMain.handle("dialog:openFiles", async () => {
    const win = getWindow();
    if (!win) return [];
    const result = await dialog.showOpenDialog(win, {
      properties: ["openFile", "multiSelections"]
    });
    if (result.canceled) return [];
    return result.filePaths;
  });

  ipcMain.handle("dialog:saveZip", async (_e, defaultName: string) => {
    const win = getWindow();
    if (!win) return null;
    const result = await dialog.showSaveDialog(win, {
      defaultPath: defaultName,
      filters: [{ name: "ZIP Archive", extensions: ["zip"] }]
    });
    if (result.canceled || !result.filePath) return null;
    return result.filePath;
  });
}
