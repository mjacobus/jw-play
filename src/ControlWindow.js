const { createFilePayload, isFileSupported } = require("./utils");
const fs = require("fs");

const Window = require("./Window");

class ControlWindow extends Window {
  constructor(app) {
    super({
      app: app,
      width: 600,
      // it will not be higher then the display
      height: 1600,
      x: 900,
      y: 0,
    });

    this.app = app;
    this.loadAppFile("controls.html");
    this.onFinishLoad();
  }

  clearFiles() {
    this.store.clearCollection("app.files");
    this.webContents.send("clear-files");
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
