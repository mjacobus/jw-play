const { createFilePayload, isFileSupported } = require("./utils");
const fs = require("fs");

const Window = require("./Window");

class ControlWindow extends Window {
  constructor(app) {
    super({
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

  addFile(file) {
    if (isFileSupported(file)) {
      const message = createFilePayload(file);
      this.webContents.send("add-file", message);
    }
  }

  addDir(folder) {
    fs.readdirSync(folder).forEach((file) => {
      this.addFile(`${folder}/${file}`);
    });
  }

  onFinishLoad() {
    this.webContents.on("did-finish-load", () => {
      this.getConfig().directories.forEach((dir) => {
        this.addDir(dir);
      });
    });
  }

  toggleDevTools() {
    this.webContents.toggleDevTools();
  }
}

module.exports = ControlWindow;
