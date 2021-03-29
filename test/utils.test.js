const { isImage, loadConfigFile } = require("../src/utils");
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
        directories: []
      })
    });
  });
});
