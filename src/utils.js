const { v4: uuidv4 } = require("uuid");

const uuid = () => uuidv4();

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
  maximizeImage,
  mediaProgress,
  secondsToTime,
  uuid,
};
