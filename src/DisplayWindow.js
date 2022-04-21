const { BrowserWindow, screen, ipcMain } = require("electron");

const Window = require("./Window");

class DisplayWindow extends Window {
  constructor(app) {
    super({ app });
    this.resize(400, 225);

    this.loadAppFile("pages/display-window.html");

    ipcMain.on("file:display", (_event, file) => {
      this.webContents.send("file:display", file);
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

    ipcMain.on("video:toggle-mute", () => {
      this.webContents.send("video:toggle-mute");
    });

    ipcMain.on("video:toggle-controls", () => {
      this.webContents.send("video:toggle-controls");
    });

    this.setMenuBarVisibility(false);
    this.setFullScreenable(true);
  }
}

module.exports = DisplayWindow;
