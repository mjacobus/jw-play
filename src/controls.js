const { ipcRenderer } = require("electron");
const { isImage, isVideo } = require("./utils");

const controls = document.getElementById("video-controls");
const videoActions = document.querySelectorAll("[data-video-action]");

[].forEach.call(videoActions, (element) => {
  element.addEventListener("click", (e) => {
    e.preventDefault();
    const action = element.getAttribute("data-video-action");
    ipcRenderer.send(action);
  });
});

const files = document.getElementById("files");

const loadFileHandler = (file, li) => (e) => {
  e.preventDefault();
  document.querySelector("li.active")?.classList.remove("active");
  li.classList.add("active");
  ipcRenderer.send("show-file", file);
  controls.hidden = !isVideo(file);
};

ipcRenderer.on("add-file", (_, file) => {
  const text = file.split("/").pop();
  const li = document.createElement("li");
  const a = document.createElement("a");
  a.href = file;
  a.addEventListener("click", loadFileHandler(file, li));

  if (isImage(file)) {
    const img = document.createElement("img");
    img.src = file;
    img.title = text;
    img.alt = text;
    a.appendChild(img);
  } else {
    a.text = text;
  }

  li.appendChild(a);
  files.appendChild(li);
});

document.addEventListener("DOMContentLoaded", () => {});
