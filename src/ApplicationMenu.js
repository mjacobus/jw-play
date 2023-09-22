const { Menu, screen, app } = require("electron");
const t = require("./translations");
const store = require("./store");

class ApplicationMenu {
  constructor(driver) {
    this.driver = driver;
  }

  attach() {
    const menu = Menu.buildFromTemplate(this.getTemplate());
    Menu.setApplicationMenu(menu);
  }

  getTemplate() {
    const driver = this.driver;
    return [
      {
        label: driver.appName(),
        submenu: [
          {
            label: t("menu.addFolder"),
            click: () => driver.addFolder(),
          },
          {
            label: t("menu.addFiles"),
            click: () => driver.addFiles(),
          },
          {
            label: t("menu.removeAllFiles"),
            click: () => driver.clearFiles(),
          },
          {
            label: t("menu.quit"),
            accelerator: process.platform === "darwin" ? `Cmd+Q` : `Ctrl+Q`,
            click: () => {
              driver.isQuitting = true;
              driver.quit();
            },
          },
        ],
      },
      {
        label: t("menu.displayWindow"),
        submenu: [
          {
            label: t("menu.displayWindow.resize"),
            submenu: [
              { ratio: "16x9", width: 640, height: 360 },
              { ratio: "16x9", width: 800, height: 450 },
              { ratio: "16x9", width: 1200, height: 675 },
              { ratio: "9x16", width: 360, height: 640 },
              { ratio: "9x16", width: 450, height: 800 },
              { ratio: "9x16", width: 675, height: 1200 },
            ].map((item) => {
              return {
                label: `${item.width}x${item.height} (${item.ratio})`,
                click: () => driver.display.resize(item.width, item.height),
              };
            }),
          },
          {
            label: t("menu.displayWindow.moveTo"),
            submenu: this.getMoveToItems(),
          },
          {
            label: t("menu.displayWindow.toggleFullScreen"),
            accelerator: process.platform === "darwin" ? "Cmd+F" : "Ctrl+F",
            click: () => driver.display.toggleFullScreen(),
          },
        ],
      },
      {
        label: t("menu.languages"),
        submenu: [
          {
            label: t("menu.languages.en"),
            click: () => this.setLanguage("en"),
          },
          {
            label: t("menu.languages.pt-BR"),
            click: () => this.setLanguage("pt-BR"),
          },
        ],
      },
      {
        label: t("menu.devTools"),
        submenu: [
          {
            label: t("menu.devTools.displayWindow"),
            click: () => driver.display.toggleDevTools(),
          },
          {
            label: t("menu.devTools.controlWindow"),
            click: () => driver.controls.toggleDevTools(),
          },
          {
            label: t("menu.devTools.version", { version: app.getVersion() }),
          },
        ],
      },
    ];
  }

  getMoveToItems() {
    return screen.getAllDisplays().map((display, index) => {
      return {
        label: t(`menu.displayWindow.moveTo.${index + 1}`),
        accelerator:
          process.platform === "darwin"
            ? `Cmd+${index + 1}`
            : `Ctrl+${index + 1}`,
        click: () => {
          this.driver.display.moveToDisplay(display);
        },
      };
    });
  }

  setLanguage(language) {
    store.set("settings.language", language);
    this.driver.showAlertMessage(t("messages.languageChangedRestartRequired"));
  }
}

module.exports = ApplicationMenu;
