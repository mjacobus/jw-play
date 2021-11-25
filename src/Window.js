const { app, BrowserWindow } = require("electron");
const { loadConfigFile } = require("./utils");
const store = require("./store")

const CONFIG_FILE = `${app.getPath("home")}/.config/jw-play/config.json`;
const CONFIG = loadConfigFile(CONFIG_FILE);

class BaseWindow extends BrowserWindow {
  constructor({ app, ...options }) {
    const default_options = {
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
        enableRemoteModule: true,
      },
    };
    options = Object.assign({}, default_options, options);
    super(options);
    this.app = app;
    this.store = store;

    this.on("close", (e) => {
      if (!app.isQuitting) {
        return e.preventDefault();
      }
      this.hide();
    });
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
