const { ipcMain } = require("electron");

const Window = require("./Window");

class DisplayWindow extends Window {
  constructor(app) {
    super({ app });
    this.resize(400, 225);

    this.loadAppFile("pages/display-window.html");

    ipcMain.on("file:display", (_event, fileId) => {
      this.webContents.send("file:display", fileId);
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

    ipcMain.on("video:set_time", (_sender, time) => {
      this.webContents.send("video:forward", time);
    });

    ipcMain.on("video:toggle-mute", () => {
      this.webContents.send("video:toggle-mute");
    });

    ipcMain.on("video:toggle-controls", () => {
      this.webContents.send("video:toggle-controls");
    });

    ipcMain.on("pdf:next-page", () => {
      this.webContents.send("pdf:next-page");
    });

    ipcMain.on("pdf:previous-page", () => {
      this.webContents.send("pdf:previous-page");
    });

    ipcMain.on("pdf:goto-page", (_event, pageNumber) => {
      this.webContents.send("pdf:goto-page", pageNumber);
    });

    ipcMain.on("display:clear", () => {
      this.webContents.send("display:clear");
    });

    ipcMain.on("media:zoom-in", () => {
      this.webContents.send("media:zoom-in");
    });

    ipcMain.on("media:zoom-out", () => {
      this.webContents.send("media:zoom-out");
    });

    ipcMain.on("media:zoom-fit", () => {
      this.webContents.send("media:zoom-fit");
    });

    this.setMenuBarVisibility(false);
    this.setFullScreenable(true);
  }
}

module.exports = DisplayWindow;
