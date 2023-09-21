const { ipcRenderer } = require("electron");
const { maximizeImage } = require("../utils");
const MediaFiles = require("../MediaFiles");

const files = new MediaFiles();

function video() {
  return (
    document.querySelector("video") || {
      play: () => {},
      pause: () => {},
      currentTime: 0,
    }
  );
}

ipcRenderer.on("file:display", (_sender, fileId) => {
  const file = files.find(fileId);
  const container = document.getElementById("container");

  if (file.isImage()) {
    return showImage(file, document, container);
  }

  if (file.isVideo()) {
    return showVideo(file, document, container);
  }
});

ipcRenderer.on("video:play", () => {
  video().play();
});

ipcRenderer.on("video:pause", () => {
  video().pause();
});

ipcRenderer.on("video:toggle-mute", () => {
  let v = video();
  v.volume = v.volume == 0 ? 1 : 0;
});

ipcRenderer.on("video:toggle-controls", () => {
  let v = video();
  v.controls = !v.controls;
});

ipcRenderer.on("video:forward", (_sender) => {
  video().currentTime += 5;
});

ipcRenderer.on("video:rewind", (_sender) => {
  video().currentTime -= 5;
});

ipcRenderer.on("video:forward", (_sender, time) => {
  video().currentTime = parseInt(time);
});

const showImage = (file, doc, container) => {
  const img = doc.createElement("img");
  container.innerHTML = "";
  container.appendChild(img);
  img.src = file.getUrl();
  img.width = file.getWidth();
  img.height = file.getHeight();
  maximizeImage(img, window);
};

const showVideo = (file, doc, container) => {
  container.innerHTML = "";
  const video = doc.createElement("video");
  const source = doc.createElement("source");
  video.appendChild(source);

  video.width = window.innerWidth;
  video.classList.add("vertical-center");
  source.type = "video/mp4";
  source.src = file.getUrl();
  container.appendChild(video);

  video.addEventListener("loadeddata", () => {
    ipcRenderer.send("video:time-updated", {
      currentTime: 0,
      duration: video.duration,
    });
  });

  video.ontimeupdate = (_event) => {
    ipcRenderer.send("video:time-updated", {
      currentTime: video.currentTime,
      duration: video.duration,
    });
  };
};
