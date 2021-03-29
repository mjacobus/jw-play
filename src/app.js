const { app, BrowserWindow, screen, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");
const { isFileSupported } = require("./utils");

const fileUrl = (file) => `file://${__dirname}/${file}`


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
  controlWindow.setPosition(externalDisplay.bounds.x, externalDisplay.bounds.y);
  // mainWindow.setPosition(primaryDisplay.bounds.x, primaryDisplay.bounds.y);
});


const addDir = (folder) => {
  fs.readdirSync(folder).forEach(file => {
    console.log(file)
    if (isFileSupported(file)) {
      controlWindow.webContents.send('add-file', `file://${folder}/${file}`)
    }
  });
}

const createMain = () => {
  mainWindow = new BrowserWindow({
    fullscreen: true,
    // width: 800,
    // height: 600,
    x: 0,
    y: 0,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    },
  })
  mainWindow.loadURL(fileUrl("main.html"));
};

const createControls = () => {
  controlWindow = new BrowserWindow({
    width: 800,
    height: 600,
    x: 900,
    y: 0,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    },
  })
  controlWindow.loadURL(fileUrl("controls.html"));
};

const onReady = () => {
  createMain();
  createControls();

  controlWindow.webContents.on('did-finish-load', () => {
    controlWindow.webContents.openDevTools()
    // mainWindow.webContents.openDevTools()
    addDir("/Users/mjacobus/Projects/reunioes/_arquivos/")
  })

  ipcMain.on("show-file", (_event, file) => {
    mainWindow.webContents.send("show-file", file)
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
