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

module.exports = {
  isImage,
  isVideo,
  isFileSupported,
};
