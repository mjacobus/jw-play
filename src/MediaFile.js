class MediaFile {
  #data = {};

  constructor(data) {
    this.#data = data;
  }

  get id() {
    return this.#data.id;
  }

  toJson() {
    return this.#data;
  }
}

module.exports = MediaFile;
