const { app, BrowserWindow, screen, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");
const { createFilePayload, isFileSupported, loadConfigFile } = require("./utils");

const CONFIG_FILE = `${app.getPath("home")}/.config/jw-play/config.json`;
const CONFIG = loadConfigFile(CONFIG_FILE);
const ControlWindow = require('./ControlWindow')
const MainWindow = require('./MainWindow')

const fileUrl = (file) => `file://${__dirname}/${file}`;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  // eslint-disable-line global-require
  app.quit();
}

let mainWindow = null;
let controlWindow = null;
let primaryDisplay = null;
let externalDisplay = null;

app.whenReady().then(() => {
  primaryDisplay = screen.getPrimaryDisplay();
  const displays = screen.getAllDisplays();

  externalDisplay = displays.find((display) => {
    return (
      display.bounds.x !== primaryDisplay.bounds.x ||
      display.bounds.y !== primaryDisplay.bounds.y
    );
  });

  externalDisplay = externalDisplay || primaryDisplay;
  controlWindow.setPosition(primaryDisplay.bounds.x, primaryDisplay.bounds.y);
  mainWindow.setPosition(externalDisplay.bounds.x, externalDisplay.bounds.y);
});

const createMain = () => {
  mainWindow = new MainWindow();
};

const createControls = () => {
  controlWindow = new ControlWindow({
    width: 600,
    height: 1600,
    x: 900,
    y: 0,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    },
  });
  controlWindow.loadURL(fileUrl("controls.html"));
};

const onReady = () => {
  createMain();
  createControls();

  controlWindow.webContents.on("did-finish-load", () => {
    // controlWindow.webContents.openDevTools()
    // mainWindow.webContents.openDevTools()
    CONFIG.directories.forEach((dir) => {
      controlWindow.addDir(dir)
    });
  });

  ipcMain.on("show-file", (_event, file) => {
    mainWindow.webContents.send("show-file", file);
  });

  ipcMain.on("video:play", () => {
    mainWindow.webContents.send("video:play");
  });

  ipcMain.on("video:pause", () => {
    mainWindow.webContents.send("video:pause");
  });

  ipcMain.on("video:rewind", () => {
    mainWindow.webContents.send("video:rewind");
  });

  ipcMain.on("video:forward", () => {
    mainWindow.webContents.send("video:forward");
  });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", onReady);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    onReady();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
