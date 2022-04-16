const { BrowserWindow, screen, ipcMain } = require("electron");

const Window = require("./Window");

class MainWindow extends Window {
  constructor(app) {
    super({ app });
    this.resize(400, 225);

    this.loadAppFile("main.html");

    ipcMain.on("show-file", (_event, file) => {
      this.webContents.send("show-file", file);
    });

    ipcMain.on("video:play", () => {
      this.webContents.send("video:play");
    });

    ipcMain.on("video:pause", () => {
      this.webContents.send("video:pause");
    });

    ipcMain.on("video:rewind", () => {
      this.webContents.send("video:rewind");
    });

    ipcMain.on("video:forward", () => {
      this.webContents.send("video:forward");
    });

    ipcMain.on("video:mute", () => {
      this.webContents.send("video:mute");
    });

    ipcMain.on("video:unmute", () => {
      this.webContents.send("video:unmute");
    });

    this.setMenuBarVisibility(false);
    this.setFullScreenable(true);
  }

  fullScreen() {
    this.keepOnTop();
    this.setFullScreen(true);
  }

  unFullScreen() {
    this.notOnAlwaysOnTop();
    this.setFullScreen(false);
  }

  keepOnTop() {
    this.setAlwaysOnTop(true, "screen-saver");
  }

  notOnAlwaysOnTop() {
    this.setAlwaysOnTop(false);
  }
}

module.exports = MainWindow;
