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
              driver.isQuitting = true;
              driver.quit();
            },
          },
        ],
      },
      {
        label: "Main Window",
        submenu: [
          {
            label: "Resize",
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
                click: () => driver.mainWindow.resize(item.width, item.height),
              };
            }),
          },
        ],
      },
      {
        label: "DevTools",
        submenu: [
          {
            label: "Main Window",
            click: () => driver.mainWindow.toggleDevTools(),
          },
          {
            label: "Control Window",
            click: () => driver.controlWindow.toggleDevTools(),
          },
        ],
      },
    ];
  }
}

module.exports = ApplicationMenu;
