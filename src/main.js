const { ipcRenderer } = require("electron");
const { isImage, isVideo } = require("./utils");

ipcRenderer.on("show-file", (_sender, file) => {
  const container = document.getElementById("container");

  if (isImage(file)) {
    return showImage(file, document, container);
  }

  if (isVideo(file)) {
    return showVideo(file, document, container);
  }
});

ipcRenderer.on("video:play", () => {
  console.log("play");
  document.querySelector("video")?.play();
});

ipcRenderer.on("video:pause", () => {
  document.querySelector("video")?.pause();
});

ipcRenderer.on("video:forward", (_sender, file) => {
  const video = document.querySelector("video");

  if (video) {
    video.currentTime += 5;
  }
});

ipcRenderer.on("video:rewind", (_sender, file) => {
  const video = document.querySelector("video");

  if (video) {
    video.currentTime -= 5;
  }
});

const showImage = (file, doc, container) => {
  const img = doc.createElement("img");
  container.innerHTML = "";
  container.appendChild(img);
  img.src = file;
  img.requestFullscreen();
};

const showVideo = (file, doc, container) => {
  container.innerHTML = "";
  const video = doc.createElement("video");
  const source = doc.createElement("source");
  video.appendChild(source);

  video.width = window.innerWidth;
  video.controls = true;
  source.type = "video/mp4";
  source.src = file;
  container.appendChild(video);
};
