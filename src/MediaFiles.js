const store = require("./store");
const MediaFile = require("./MediaFile");
const { uuid } = require("./utils");
const fs = require("fs");
const ffmpeg = require("./wrappers/ffmpeg");
const sizeOf = require("image-size");
// const sharp = require("sharp"); // TODO: Install in ci

class MediaFiles {
  #filesPath = null;

  constructor() {}

  all() {
    const mediaFiles = store.get("mediaFiles") || {};
    const order = this.getOrder();

    // Return files in order, filtering out any that no longer exist
    const orderedFiles = order
      .filter((id) => mediaFiles[id])
      .map((id) => new MediaFile(mediaFiles[id]));

    // Add any files that exist but aren't in the order array (legacy data)
    const orderedIds = new Set(order);
    Object.values(mediaFiles).forEach((data) => {
      if (!orderedIds.has(data.id)) {
        orderedFiles.push(new MediaFile(data));
      }
    });

    return orderedFiles;
  }

  getOrder() {
    return store.get("mediaFilesOrder") || [];
  }

  setOrder(order) {
    store.set("mediaFilesOrder", order);
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
    store.remove(`mediaFiles.${file.getId()}`);

    // Remove from order array
    const order = this.getOrder();
    const index = order.indexOf(file.getId());
    if (index > -1) {
      order.splice(index, 1);
      this.setOrder(order);
    }

    if (!file.thumbnailExists()) {
      return;
    }

    // do not delete if thumbnail is the original file
    if (file.getThumbnailPath() == file.getPath()) {
      return;
    }

    fs.unlinkSync(file.getThumbnailPath());
  }

  deleteAll() {
    this.all().forEach((file) => {
      this.delete(file);
    });
    this.setOrder([]);
  }

  createFromPath(path, options = {}) {
    if (!this.#filesPath) {
      throw new Error("Files path not set");
    }

    const data = { id: uuid(), path };

    if (options.title) {
      data.title = options.title;
    }

    const file = new MediaFile(data);

    data.thumbnailPath = file.getPath();

    if (file.isVideo() || file.isPdf()) {
      // Thumbnail will be generated lazily (for videos by ffmpeg, for PDFs by renderer)
      data.thumbnailPath = `${this.#filesPath}/thumbnails/${file.getId()}.png`;
    }

    if (file.isVideo()) {
      this.#saveScreenshot(file);
    }

    if (file.isImage()) {
      const dimensions = sizeOf(file.getPath());
      data.width = dimensions.width;
      data.height = dimensions.height;
      this.#createThumbnail(file);
    }

    this.save(file);

    // Add to order array
    const order = this.getOrder();
    order.push(file.getId());
    this.setOrder(order);

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

  #createThumbnail(_file) {
    // TODO: Fix this - cannot install sharp in CI
    // sharp(file.getPath()).resize(320, 180).toFile(file.getThumbnailPath());
  }
}

module.exports = MediaFiles;
