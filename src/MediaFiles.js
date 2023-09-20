const store = require("./store");
const MediaFile = require("./MediaFile");
const { uuid } = require("./utils");

class MediaFiles {
  #filesPath = null;

  constructor() {}

  all() {
    return Object.values(store.get("mediaFiles") || {}).map((data) => {
      return new MediaFile(data);
    });
  }

  setFilesPath(path) {
    this.#filesPath = path;
    return this;
  }

  find(id) {
    const data = store.get(`mediaFiles.${id}`);

    if (data) {
      return new MediaFile(data);
    }

    return null;
  }

  save(file) {
    store.set(`mediaFiles.${file.id}`, file.toJson());
  }

  delete(file) {
    store.remove(`mediaFiles.${file.id}`);
  }

  deleteAll() {
    this.all().forEach((file) => {
      this.delete(file);
    });
  }

  createFromPath(path) {
    if (!this.#filesPath) {
      throw new Error("Files path not set");
    }

    const data = { id: uuid(), path };
    const file = new MediaFile(data);
    data.thumbnailPath = `${this.#filesPath}/thumbnails/${
      file.id
    }.${file.getExtension()}`;

    this.save(file);
    return file;
  }
}

module.exports = MediaFiles;
