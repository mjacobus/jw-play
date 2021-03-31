const { ipcRenderer } = require("electron");
const { isImage, isVideo, maximizeImage } = require("./utils");

ipcRenderer.on("show-file", (_sender, file) => {
  const container = document.getElementById("container");

  if (isImage(file.url)) {
    return showImage(file, document, container);
  }

  if (isVideo(file.url)) {
    return showVideo(file, document, container);
  }
});

ipcRenderer.on("video:play", () => {
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
  img.src = file.url;
  img.width = file.width;
  img.height = file.height;
  maximizeImage(img, window);
};

const showVideo = (file, doc, container) => {
  container.innerHTML = "";
  const video = doc.createElement("video");
  const source = doc.createElement("source");
  video.appendChild(source);

  video.width = window.innerWidth;
  video.controls = true;
  source.type = "video/mp4";
  source.src = file.url;
  container.appendChild(video);
};
