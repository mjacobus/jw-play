const {
  isImage
} = require("../src/utils");

describe("is image", () => {
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
