const { app, BrowserWindow, screen, ipcMain } = require("electron");
const { createFilePayload, isFileSupported } = require("./utils");
const fs = require("fs");

const fileUrl = (file) => `file://${__dirname}/${file}`;

class ControlWindow extends BrowserWindow {
  constructor() {
    super({
      width: 600,
      // it will not be higher then the display
      height: 1600,
      x: 900,
      y: 0,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        enableRemoteModule: true,
      },
    });

    this.loadURL(fileUrl("controls.html"));
  }

  addFile(file) {
    if (isFileSupported(file)) {
      const message = createFilePayload(file);
      console.log("Adding file:", message);
      this.webContents.send("add-file", message);
    }
  }

  addDir(folder) {
    fs.readdirSync(folder).forEach((file) => {
      this.addFile(`${folder}/${file}`);
    });
  }
}

module.exports = ControlWindow;
