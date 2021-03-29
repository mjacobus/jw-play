const { isImage, loadConfigFile, maximizeImage } = require("../src/utils");
const fs = require("fs");

describe("isImage()", () => {
  it("returns true when file is image", () => {
    expect(isImage("foo.png")).toBeTruthy();
    expect(isImage("foo.jpg")).toBeTruthy();
    expect(isImage("foo.jpeg")).toBeTruthy();
    expect(isImage("foo.gif")).toBeTruthy();
  });

  it("returns false when file is not image", () => {
    expect(isImage("foo.mov")).toBeFalsy();
  });
});

describe("loadConfigFile()", () => {
  const configFile = "/tmp/jw-play/unit-tests";

  describe("when file does not exist", () => {
    it("creates a new file", () => {
      loadConfigFile(configFile);

      const value = fs.existsSync(configFile);

      expect(value).toBeTruthy();
    });

    it("returns the configuratioh", () => {
      const config = loadConfigFile(configFile);

      expect(config).toEqual({
        directories: [],
      });
    });
  });
});

describe("maximizeImage()", () => {
  const window = {};
  const image = {};

  beforeEach(() => {
    window.innerWidth = 800;
    window.innerHeight = 600;
  });

  it("sets max for a square", () => {
    image.width = 500;
    image.height = 500;

    maximizeImage(image, window);

    expect(image.width).toBe(600);
    expect(image.height).toBe(600);
  });

  it("sets the ratio for an image bigger than the window", () => {
    image.width = 1600;
    image.height = 1200;

    maximizeImage(image, window);

    expect(image.width).toBe(800);
    expect(image.height).toBe(600);
  });

  it("sets the ratio for an image smaller than the canvas", () => {
    image.width = 200;
    image.height = 300;

    maximizeImage(image, window);

    expect(image.width).toBe(400);
    expect(image.height).toBe(600);
  });
});
