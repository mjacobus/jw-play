// jest.mock("../src/utils", () => ({
//   ...jest.requireActual("../src/utils"),
//   uuid: jest.fn(() => "the-uuid"),
// }));

const store = require("../src/store");
const MediaFiles = require("../src/MediaFiles");
const MediaFile = require("../src/MediaFile");

const createFile = (id) => ({ id });

describe("MediaFiles", () => {
  let repository = null;

  beforeEach(() => {
    repository = new MediaFiles();
    store.remove("mediaFiles.the-id");
  });

  describe("find", () => {
    it("finds file by id", () => {
      store.set("mediaFiles.the-id", createFile("the-id"));

      const file = repository.find("the-id");

      expect(file.id).toEqual("the-id");
    });

    it("returns null when file cannot be found", () => {
      const file = repository.find("the-id");

      expect(file).toBeNull();
    });
  });

  describe("save", () => {
    it("saves file", () => {
      const file = new MediaFile(createFile("the-id"));

      repository.save(file);

      expect(store.get("mediaFiles.the-id")).toEqual({
        id: "the-id",
      });
    });
  });

  describe("delete", () => {
    it("deletes file", () => {
      store.set("mediaFiles.the-id", createFile("the-id"));
      const file = repository.find("the-id");

      repository.delete(file);

      expect(store.get("mediaFiles.the-id")).toBeUndefined();
    });
  });
});
