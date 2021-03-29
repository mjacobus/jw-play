const fs = require("fs");
const path = require("path");

const DEFAULT_CONFIG = {
  directories: [],
};

const hasExtension = (file, extensions) => {
  const parts = file.split(".");
  const extension = parts[parts.length - 1].toLowerCase();
  return extensions.includes(extension);
};

const isImage = (file) => {
  return hasExtension(file, ["png", "jpeg", "jpg", "gif"]);
};

const isVideo = (file) => {
  return hasExtension(file, ["mp4", "mpeg", ""]);
};

const isFileSupported = (file) => {
  return isImage(file) || isVideo(file);
};

const loadConfigFile = (configFile) => {
  if (!fs.existsSync(configFile)) {
    fs.mkdirSync(path.dirname(configFile), { recursive: true });
    fs.writeFileSync(configFile, JSON.stringify(DEFAULT_CONFIG));
  }

  const fileConfig = JSON.parse(fs.readFileSync(configFile));

  return Object.assign(DEFAULT_CONFIG, fileConfig);
};

const maximizeImage = (image, window) => {
  if (!image.width || !!image.height) {
    return;
  }

  const xRatio = window.innerWidth / image.width;
  const yRatio = window.innerHeight / image.height;
  const ratio = Math.min(xRatio, yRatio);

  console.log(image.with, image.height)
  image.width *= ratio;
  image.height *= ratio;
  console.log(image.with, image.height)
};

module.exports = {
  isImage,
  isVideo,
  isFileSupported,
  loadConfigFile,
  maximizeImage,
};
