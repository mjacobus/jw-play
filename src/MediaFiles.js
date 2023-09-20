const store = require("./store");
const MediaFile = require("./MediaFile");

class MediaFiles {
  all() {
    return Object.values(store.get("mediaFiles") || {}).map((data) => {
      return new MediaFile(data);
    });
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
}

module.exports = MediaFiles;