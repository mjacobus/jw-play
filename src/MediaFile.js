const IMAGE_EXTENSIONS = ["png", "jpeg", "jpg", "gif"];
const VIDEO_EXTENSIONS = ["mp4", "mpeg", "m4v", "mov"];

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

  toJson() {
    return this.#data;
  }

  isImage() {
    return IMAGE_EXTENSIONS.includes(this.getExtension());
  }

  isVideo() {
    return VIDEO_EXTENSIONS.includes(this.getExtension());
  }

  isSupported() {
    return this.isImage() || this.isVideo();
  }

  getExtension() {
    return this.getPath().split(".").pop();
  }

  getThumbnailPath() {
    return this.#data.thumbnailPath;
  }
}

module.exports = MediaFile;
