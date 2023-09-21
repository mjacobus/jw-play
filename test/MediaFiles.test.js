const store = require("../src/store");
const MediaFiles = require("../src/MediaFiles");
const MediaFile = require("../src/MediaFile");

function fixturePath(filename) {
  const testFilePath = __filename;
  const dir = testFilePath.split("/").slice(0, -1).join("/");
  return `${dir}/fixtures/${filename}`;
}

function tmpPath(file) {
  const testFilePath = __filename;
  const dir = testFilePath.split("/").slice(0, -1).join("/");
  return `${dir}/tmp/${file}`;
}

const createFile = (id) => ({ id });

describe("MediaFiles", () => {
  let repository = null;

  beforeEach(() => {
    repository = new MediaFiles().setFilesPath(tmpPath("appData/JWPlay"));
    repository.deleteAll();
  });

  describe("all", () => {
    it("returns all files", () => {
      store.set("something-else", createFile("the-id"));
      store.set("mediaFiles.one", createFile("one"));
      store.set("mediaFiles.two", createFile("two"));

      const files = repository.all();

      expect(files).toHaveLength(2);
      expect(files[0].getId()).toEqual("one");
      expect(files[1].getId()).toEqual("two");
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

      expect(file.getId()).toEqual("the-id");
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

  describe(".createFromPath", () => {
    let file = null;

    describe("with a video", () => {
      beforeEach(() => {
        file = repository.createFromPath(fixturePath("video.mp4"));
      });

      it("creates a new MediaFile", () => {
        expect(file.getPath()).toEqual(fixturePath("video.mp4"));
        expect(file.getId().length).toEqual(36);
      });

      it("persists the file", () => {
        const ids = repository.all().map((file) => file.getId());

        expect(ids).toEqual([file.getId()]);
      });

      it("sets the path for the thumbnail", () => {
        expect(file.getThumbnailPath()).toEqual(
          tmpPath(`appData/JWPlay/thumbnails/${file.getId()}.png`)
        );
      });

      it("creates a the thumbnail", async (done) => {
        setTimeout(() => {
          expect(file.thumbnailExists()).toEqual(true);
          done();
        }, 200);
      });
    });

    describe("with an image", () => {
      beforeEach(() => {
        file = repository.createFromPath(fixturePath("picture.jpeg"));
      });

      it("creates a new MediaFile", () => {
        expect(file.getPath()).toEqual(fixturePath("picture.jpeg"));
        expect(file.getId().length).toEqual(36);
      });

      it("persists the file", () => {
        const ids = repository.all().map((file) => file.getId());

        expect(ids).toEqual([file.getId()]);
      });

      it("sets the path for the thumbnail", () => {
        expect(file.getThumbnailPath()).toEqual(
          tmpPath(`appData/JWPlay/thumbnails/${file.getId()}.png`)
        );
      });

      it("creates a the thumbnail", async (done) => {
        setTimeout(() => {
          expect(file.thumbnailExists()).toEqual(true);
          done();
        }, 200);
      });
    });
  });
});
