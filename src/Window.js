const { app, BrowserWindow } = require("electron");

const { loadConfigFile } = require("./utils");

const CONFIG_FILE = `${app.getPath("home")}/.config/jw-play/config.json`;
const CONFIG = loadConfigFile(CONFIG_FILE);

class BaseWindow extends BrowserWindow {
  constructor(options = {}) {
    const default_options = {
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        enableRemoteModule: true,
      },
    };
    options = Object.assign({}, default_options, options);
    super(options);
  }

  loadAppFile(file) {
    const url = `file://${__dirname}/${file}`;
    this.loadURL(url);
  }

  toggleDevTools() {
    this.webContents.toggleDevTools();
  }

  moveToDisplay(display) {
    this.setPosition(display.bounds.x, display.bounds.y);
  }

  getConfig() {
    return CONFIG;
  }
}

module.exports = BaseWindow;
