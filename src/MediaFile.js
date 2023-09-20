const hasExtension = (file, extensions) => {
  const parts = file.split(".");
  const extension = parts[parts.length - 1].toLowerCase();
  return extensions.includes(extension);
};

const IMAGE_EXTENSIONS = ["png", "jpeg", "jpg", "gif"];
const VIDEO_EXTENSIONS = ["mp4", "mpeg", "m4v", "mov"];

class MediaFile {
  #data = {};

  constructor(data) {
    this.#data = data;
  }

  get id() {
    return this.#data.id;
  }

  get path() {
    return this.#data.path;
  }

  toJson() {
    return this.#data;
  }

  isImage() {
    return hasExtension(this.path, IMAGE_EXTENSIONS);
  }

  isVideo() {
    return hasExtension(this.path, VIDEO_EXTENSIONS);
  }

  isSupported() {
    return this.isImage() || this.isVideo();
  }
}

module.exports = MediaFile;
