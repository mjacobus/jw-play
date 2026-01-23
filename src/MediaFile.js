const fs = require("fs");
const path = require("path");
const IMAGE_EXTENSIONS = ["png", "jpeg", "jpg", "gif"];
const VIDEO_EXTENSIONS = ["mp4", "mpeg", "m4v", "mov"];
const PDF_EXTENSIONS = ["pdf"];

class MediaFile {
  #data = {};

  constructor(data) {
    this.#data = data;
  }

  getId() {
    return this.#data.id;
  }

  getPath() {
    return this.#data.path;
  }

  exists() {
    return fs.existsSync(this.getPath());
  }

  toJson() {
    return this.#data;
  }

  isImage() {
    return IMAGE_EXTENSIONS.includes(this.getExtension());
  }

  isVideo() {
    return VIDEO_EXTENSIONS.includes(this.getExtension());
  }

  isPdf() {
    return PDF_EXTENSIONS.includes(this.getExtension());
  }

  isSupported() {
    return this.isImage() || this.isVideo() || this.isPdf();
  }

  getExtension() {
    return this.getPath().split(".").pop();
  }

  getThumbnailPath() {
    return this.#data.thumbnailPath;
  }

  thumbnailExists() {
    return fs.existsSync(this.getThumbnailPath());
  }

  getUrl() {
    return `file://${this.getPath()}`;
  }

  getFilename() {
    return path.basename(this.getPath());
  }

  getTitle() {
    return this.#data.title || this.getFilename();
  }

  setTitle(title) {
    this.#data.title = title;
  }

  getThumbnailUrl() {
    return `file://${this.getThumbnailPath()}`;
  }

  getWidth() {
    return this.#data.width;
  }

  getHeight() {
    return this.#data.height;
  }
}

module.exports = MediaFile;
