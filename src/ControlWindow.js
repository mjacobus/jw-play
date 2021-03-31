const { app, BrowserWindow, screen, ipcMain } = require("electron");
const { createFilePayload, isFileSupported, loadConfigFile } = require("./utils");
const fs = require("fs")

const fileUrl = (file) => `file://${__dirname}/${file}`;

class ControlWindow extends BrowserWindow {
  addFile(file) {
    if (isFileSupported(file)) {
      const message = createFilePayload(file)
      console.log("Adding file:", message)
      this.webContents.send("add-file", message);
    }
  }


  addDir(folder) {
    fs.readdirSync(folder).forEach((file) => {
      this.addFile(`${folder}/${file}`);
    });
  }
}

module.exports = ControlWindow
