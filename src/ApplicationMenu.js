const { app, Menu } = require("electron");

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
    const isMac = process.platform === "darwin";
    return [
      {
        label: driver.appName(),
        submenu: [
          {
            label: "Add folder",
            click: () => driver.addFolder(),
          },
          {
            label: "ClearFiles",
            click: () => driver.clearFiles(),
          },
        ],
      },
    ];
  }
}

module.exports = ApplicationMenu;
