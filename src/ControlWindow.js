const { createFilePayload, isFileSupported } = require("./utils");
const { ipcMain } = require("electron");
const fs = require("fs");

const Window = require("./Window");

class ControlWindow extends Window {
  constructor(app) {
    super({ app, x: 900, y: 0 });
    this.resize(600, 600);
    this.loadAppFile("pages/controls.html");
    this.onFinishLoad();

    ipcMain.on("video:time-updated", (_event, payload) => {
      this.webContents.send("video:time-updated", payload);
    });

    ipcMain.on("file:remove", (_event, payload) => {
      this.removeFile(payload);
    });
  }

  clearFiles() {
    this.store.clearCollection("app.files");
    this.webContents.send("clear-files");
  }

  removeFile(file) {
    console.log("file removed", file);
  }

  addFile(file) {
    if (!fs.existsSync(file)) {
      return;
    }

    if (isFileSupported(file)) {
      const message = createFilePayload(file);
      this.store.append("app.files", file, { unique: true });

      this.webContents.send("add-file", message);
    }
  }

  addFolder(folder) {
    fs.readdirSync(folder).forEach((file) => {
      this.addFile(`${folder}/${file}`);
    });
  }

  onFinishLoad() {
    this.webContents.on("did-finish-load", () => {
      this.store.get("app.files", []).forEach((file) => {
        this.addFile(file);
      });
    });
  }

  toggleDevTools() {
    this.webContents.toggleDevTools();
  }
}

module.exports = ControlWindow;
