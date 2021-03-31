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
    return [
      {
        label: driver.appName(),
        submenu: [
          {
            label: "Add folder",
            click: () => driver.addFolder(),
          },
          {
            label: "Add Files",
            click: () => driver.addFiles(),
          },
          {
            label: "ClearFiles",
            click: () => driver.clearFiles(),
          },
          {
            label: "Quit",
            click: () => {
              driver.isQuiting = true;
              driver.quit();
            },
          },
        ],
      },
    ];
  }
}

module.exports = ApplicationMenu;
