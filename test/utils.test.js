const {
  isImage,
  maximizeImage,
  mediaProgress,
  secondsToTime,
} = require("../src/utils");

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

describe("maximizeImage()", () => {
  const window = {};
  const image = { style: {} };

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

  it("adds marging top", () => {
    image.width = 800;
    image.height = 500;

    maximizeImage(image, window);

    expect(image.style["margin-top"]).toEqual("50px");
    expect(image.style["margin-left"]).toEqual("0px");
  });

  describe("mediaProgress()", () => {
    it("resolves media progress", () => {
      const data = mediaProgress({ duration: 90, currentTime: 32 });

      expect(data.duration).toEqual(90);
      expect(data.currentTime).toEqual(32);
      expect(data.timeString.current).toEqual("0:32");
      expect(data.timeString.duration).toEqual("1:30");
    });
  });

  describe("secondsToTime()", () => {
    it("resolves start time", () => {
      expect(secondsToTime(90)).toEqual("1:30");
      expect(secondsToTime(30)).toEqual("0:30");
      expect(secondsToTime(9)).toEqual("0:09");
      expect(secondsToTime(60 * 60 * 2 + 97)).toEqual("2:01:37");
    });
  });
});
