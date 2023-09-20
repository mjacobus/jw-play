const fs = require("fs");
const path = require("path");
const sizeOf = require("image-size");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static").replace(
  "app.asar",
  "app.asar.unpacked"
);
const { app } = require("electron");
const { v4: uuidv4 } = require("uuid");
const MediaFile = require("./MediaFile");

ffmpeg.setFfmpegPath(ffmpegPath);

const uuid = () => uuidv4();
const isImage = (file) => new MediaFile({ path: file }).isImage();
const isVideo = (file) => new MediaFile({ path: file }).isVideo();
const isFileSupported = (file) => new MediaFile({ path: file }).isSupported();

const maximizeImage = (image, window) => {
  if (!image.width || !image.height) {
    return;
  }

  const xRatio = window.innerWidth / image.width;
  const yRatio = window.innerHeight / image.height;
  const ratio = Math.min(xRatio, yRatio);

  image.width *= ratio;
  image.height *= ratio;
  image.width = Math.floor(image.width);
  image.height = Math.floor(image.height);
  image.style["margin-top"] = `${Math.floor(
    (window.innerHeight - image.height) / 2
  )}px`;
  image.style["margin-left"] = `${Math.floor(
    (window.innerWidth - image.width) / 2
  )}px`;
};

const createFilePayload = (filePath) => {
  const file = { url: `file://${filePath}` };
  if (isImage(filePath)) {
    const dimensions = sizeOf(filePath);
    file.width = dimensions.width;
    file.height = dimensions.height;
  }

  if (isVideo(filePath)) {
    const thumbnail = createVideoThumbnail(filePath);
    file.thumbnail = new URL(`file://${thumbnail}`).toString();
  }

  return file;
};

const clearThumbnails = () => {
  const folder = path.join(app.getPath("appData"), "JW Play", "thumbnails");
  try {
    fs.rmSync(folder, { recursive: true });
  } catch (e) {}
};

const createVideoThumbnail = (file) => {
  try {
    const size = "320x180";
    const folder = path.join(app.getPath("appData"), "JW Play", "thumbnails");
    const filename = uuid() + `-${size}.png`;
    fs.mkdirSync(folder, { recursive: true });
    ffmpeg(file).screenshots({
      timestamps: [2],
      folder,
      filename,
      size,
    });
    const screenshot = path.join(folder, filename);
    return screenshot;
  } catch (error) {
    console.log(error);
  }
};

function secondsToTime(totalSeconds) {
  totalSeconds = Math.floor(totalSeconds);
  let hours = Math.floor(totalSeconds / 3600);
  let minutes = Math.floor((totalSeconds - hours * 3600) / 60);
  let seconds = totalSeconds - hours * 3600 - minutes * 60;

  if (seconds < 10) {
    seconds = `0${seconds}`;
  }

  if (hours > 0 && minutes < 10) {
    minutes = `0${minutes}`;
  }

  const parts = [minutes, seconds];

  if (hours > 0) {
    parts.unshift(hours);
  }

  return parts.join(":");
}

function mediaProgress({ duration, currentTime }) {
  const timeString = {
    current: secondsToTime(currentTime),
    duration: secondsToTime(duration),
  };

  return {
    duration,
    currentTime,
    timeString,
  };
}

module.exports = {
  isImage,
  isVideo,
  isFileSupported,
  maximizeImage,
  clearThumbnails,
  createFilePayload,
  mediaProgress,
  secondsToTime,
  uuid,
};
