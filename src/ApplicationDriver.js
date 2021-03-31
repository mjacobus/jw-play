const { screen, dialog } = require("electron");
const ControlWindow = require("./ControlWindow");
const MainWindow = require("./MainWindow");
const ApplicationMenu = require("./ApplicationMenu");

class ApplicationDriver {
  constructor(app) {
    this.app = app;
    this.menu = new ApplicationMenu(this);
    this.mainWindow = null;
    this.controlWindow = null;
  }

  quit() {
    this.app.quit();
  }

  addFolder() {
    const folders =
      dialog.showOpenDialogSync({ properties: ["openDirectory"] }) || [];
    folders.forEach((folder) => this.controlWindow.addFolder(folder));
  }

  addFiles() {
    const files =
      dialog.showOpenDialogSync({
        properties: ["openFile", "multiSelections"],
      }) || [];
    files.forEach((folder) => this.controlWindow.addFile(folder));
  }

  clearFiles() {
    this.controlWindow.clearFiles();
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

  start() {
    const app = this.app;
    app.whenReady().then(() => {
      let primaryDisplay = null;
      let externalDisplay = null;
      primaryDisplay = screen.getPrimaryDisplay();
      const displays = screen.getAllDisplays();

      externalDisplay = displays.find((display) => {
        return (
          display.bounds.x !== primaryDisplay.bounds.x ||
          display.bounds.y !== primaryDisplay.bounds.y
        );
      });

      externalDisplay = externalDisplay || primaryDisplay;

      this.controlWindow.moveToDisplay(primaryDisplay);
      this.mainWindow.moveToDisplay(externalDisplay);
    });

    const onReady = () => {
      this.menu.attach();
      this.mainWindow = new MainWindow(this);
      this.controlWindow = new ControlWindow(this);
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
