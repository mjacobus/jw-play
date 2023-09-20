const MediaFile = require("../src/MediaFile");

const create = (filePath) =>
  new MediaFile({
    path: filePath,
  });

describe("MediaFile", () => {
  describe(".isImage()", () => {
    const isImage = (filePath) => create(filePath).isImage();

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

  describe(".isVideo()", () => {
    const isVideo = (filePath) => create(filePath).isVideo();

    it("returns true when file is video", () => {
      expect(isVideo("foo.mp4")).toBeTruthy();
      expect(isVideo("foo.mpeg")).toBeTruthy();
      expect(isVideo("foo.m4v")).toBeTruthy();
      expect(isVideo("foo.mov")).toBeTruthy();
    });

    it("returns false when file is not video", () => {
      expect(isVideo("foo.txt")).toBeFalsy();
    });
  });

  describe(".isSupported()", () => {
    const isSupported = (filePath) => create(filePath).isSupported();

    it("returns true when file is supported", () => {
      expect(isSupported("foo.png")).toBeTruthy();
      expect(isSupported("foo.jpg")).toBeTruthy();
      expect(isSupported("foo.jpeg")).toBeTruthy();
      expect(isSupported("foo.gif")).toBeTruthy();
      expect(isSupported("foo.mp4")).toBeTruthy();
      expect(isSupported("foo.mpeg")).toBeTruthy();
      expect(isSupported("foo.m4v")).toBeTruthy();
      expect(isSupported("foo.mov")).toBeTruthy();
    });

    it("returns false when file is not supported", () => {
      expect(isSupported("foo.txt")).toBeFalsy();
    });
  });
});
