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
    repository.deleteAll();
    store.remove("mediaFiles.the-id");
  });

  describe("all", () => {
    it("returns all files", () => {
      store.set("something-else", createFile("the-id"));
      store.set("mediaFiles.one", createFile("one"));
      store.set("mediaFiles.two", createFile("two"));

      const files = repository.all();

      expect(files).toHaveLength(2);
      expect(files[0].id).toEqual("one");
      expect(files[1].id).toEqual("two");
    });

    it("returns empty array when there are no files", () => {
      const files = repository.all();

      expect(files).toEqual([]);
    });
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
