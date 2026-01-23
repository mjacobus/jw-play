const { ipcMain } = require("electron");
const fs = require("fs");
const path = require("path");
const MediaFiles = require("./MediaFiles");
const PlaylistImporter = require("./PlaylistImporter");

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

    ipcMain.on("pdf:page-updated", (_event, payload) => {
      this.webContents.send("pdf:page-updated", payload);
    });

    ipcMain.on("media:zoom-updated", (_event, payload) => {
      this.webContents.send("media:zoom-updated", payload);
    });

    ipcMain.on("file:remove", (_event, fileId) => {
      this.removeFile(fileId);
    });

    ipcMain.on("files:reorder", (_event, order) => {
      this.medias.setOrder(order);
    });

    ipcMain.on("files:drop", (_event, filePaths) => {
      filePaths.forEach((filePath) => this.addFile(filePath));
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
  }

  addFile(filePath) {
    // Handle .jwlplaylist files
    if (filePath.endsWith(".jwlplaylist")) {
      this.#importPlaylist(filePath).catch((error) => {
        console.error("Failed to import playlist:", error);
      });
      return;
    }

    const file = this.medias.createFromPath(filePath);

    if (!file.exists() || !file.isSupported()) {
      return;
    }

    this.webContents.send("add-file", file.getId());
  }

  async #importPlaylist(filePath) {
    const filesDir = path.join(this.app.getPath("appData"), "JWPlay", "files");
    const importer = new PlaylistImporter(filePath, filesDir);

    try {
      const importedFiles = await importer.import(this.medias);
      importedFiles.forEach((file) => {
        this.webContents.send("add-file", file.getId());
      });
    } catch (error) {
      console.error("Failed to import playlist:", error);
    }
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
