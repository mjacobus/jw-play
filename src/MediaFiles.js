const store = require("./store");
const MediaFile = require("./MediaFile");

class MediaFiles {
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
}

module.exports = MediaFiles;
