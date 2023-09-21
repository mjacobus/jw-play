const { ipcMain } = require("electron");
const fs = require("fs");
const path = require("path");
const MediaFiles = require("./MediaFiles");

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

    ipcMain.on("file:remove", (_event, fileId) => {
      this.removeFile(fileId);
    });

    this.medias = new MediaFiles().setFilesPath(
      path.join(app.getPath("appData"), "JWPlay", "files")
    );
  }

  clearFiles() {
    this.medias.deleteAll();
    this.webContents.send("clear-files");
  }

  removeFile(fileId) {
    const file = this.medias.find(fileId);
    this.medias.delete(file);
    console.log("file removed", file.getId(), file.getPath());
  }

  addFile(filePath) {
    const file = this.medias.createFromPath(filePath);

    if (!file.exists() || !file.isSupported()) {
      return;
    }

    this.webContents.send("add-file", file.getId());
  }

  addFolder(folder) {
    fs.readdirSync(folder).forEach((file) => {
      this.addFile(`${folder}/${file}`);
    });
  }

  onFinishLoad() {
    this.webContents.on("did-finish-load", () => {
      this.medias.all().forEach((file) => {
        this.webContents.send("add-file", file.getId());
      });
    });
  }

  toggleDevTools() {
    this.webContents.toggleDevTools();
  }
}

module.exports = ControlWindow;
