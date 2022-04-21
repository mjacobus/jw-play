const { Menu, screen, app } = require("electron");

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
        label: "Display Window",
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
                click: () => driver.display.resize(item.width, item.height),
              };
            }),
          },
          {
            label: "Move to",
            submenu: this.getMoveToItems(),
          },
          {
            label: "Toggle Fullscreen",
            accelerator: "F",
            click: () => driver.display.toggleFullScreen(),
          },
        ],
      },
      {
        label: "DevTools",
        submenu: [
          {
            label: "Display Window",
            click: () => driver.display.toggleDevTools(),
          },
          {
            label: "Control Window",
            click: () => driver.controls.toggleDevTools(),
          },
          {
            label: `Version ${app.getVersion()}`,
          },
        ],
      },
    ];
  }

  getMoveToItems() {
    return screen.getAllDisplays().map((display, index) => {
      return {
        label: `Screen ${index + 1}`,
        accelerator: `${index + 1}`,
        click: () => {
          this.driver.display.moveToDisplay(display);
        },
      };
    });
  }
}

module.exports = ApplicationMenu;
