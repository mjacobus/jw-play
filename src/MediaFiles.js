const store = require("./store");
const MediaFile = require("./MediaFile");
const { uuid } = require("./utils");
const fs = require("fs");
const ffmpeg = require("./wrappers/ffmpeg");
const sizeOf = require("image-size");
const sharp = require("sharp");

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
    store.set(`mediaFiles.${file.getId()}`, file.toJson());
  }

  delete(file) {
    if (file.thumbnailExists()) {
      fs.unlinkSync(file.getThumbnailPath());
    }
    store.remove(`mediaFiles.${file.getId()}`);
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
    data.thumbnailPath = `${this.#filesPath}/thumbnails/${file.getId()}.png`;

    this.save(file);

    if (file.isVideo()) {
      this.#saveScreenshot(file);
    }

    if (file.isImage()) {
      const dimensions = sizeOf(file.getPath());
      data.width = dimensions.width;
      data.height = dimensions.height;
      this.#createThumbnail(file);
      data.thumbnailPath = file.getPath();
    }

    return file;
  }

  #saveScreenshot(file) {
    const size = "320x180";
    const folder = file.getThumbnailPath().split("/").slice(0, -1).join("/");
    const filename = file.getThumbnailPath().split("/").pop();

    fs.mkdirSync(folder, { recursive: true });

    ffmpeg(file.getPath()).screenshots({
      timestamps: [2],
      folder,
      filename,
      size,
    });
  }

  #createThumbnail(file) {
    sharp(file.getPath()).resize(320, 180).toFile(file.getThumbnailPath());
  }
}

module.exports = MediaFiles;
