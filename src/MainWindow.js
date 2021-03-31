const { app, BrowserWindow, screen, ipcMain } = require("electron");

const fileUrl = (file) => `file://${__dirname}/${file}`;

class MainWindow extends BrowserWindow {
  constructor() {
    super({
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        enableRemoteModule: true,
      },
    });

    this.loadURL(fileUrl("main.html"));
  }
}

module.exports = MainWindow;
