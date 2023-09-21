const { screen, dialog, BrowserWindow } = require("electron");
const ControlWindow = require("./ControlWindow");
const DisplayWindow = require("./DisplayWindow");
const ApplicationMenu = require("./ApplicationMenu");
const { clearThumbnails } = require("./utils");

class ApplicationDriver {
  constructor(app) {
    this.app = app;
    this.menu = new ApplicationMenu(this);
    this.display = null;
    this.controls = null;
  }

  quit() {
    clearThumbnails();
    this.app.quit();
  }

  addFolder() {
    const folders =
      dialog.showOpenDialogSync({ properties: ["openDirectory"] }) || [];
    folders.forEach((folder) => this.controls.addFolder(folder));
  }

  addFiles() {
    const files =
      dialog.showOpenDialogSync({
        properties: ["openFile", "multiSelections"],
      }) || [];
    files.forEach((file) => this.controls.addFile(file));
  }

  clearFiles() {
    this.controls.clearFiles();
  }

  appName() {
    return "JW Play";
  }

  ifMac(trueValue, falseValue) {
    if (this.isMac()) {
      return trueValue;
    }

    return falseValue;
  }

  isMac() {
    return process.platform === "darwin";
  }

  getPath(name) {
    return this.app.getPath(name);
  }

  start() {
    const app = this.app;

    app.whenReady().then(() => {
      const primaryDisplay = screen.getPrimaryDisplay();
      const [mainWidth, _] = this.controls.getSize();

      this.controls.moveToDisplay(primaryDisplay);
      this.display.moveToDisplay(primaryDisplay);
      this.display.setPosition(mainWidth + 1, 0);
    });

    const onReady = () => {
      this.menu.attach();
      this.display = new DisplayWindow(this);
      this.controls = new ControlWindow(this);
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
  }
}

module.exports = ApplicationDriver;
