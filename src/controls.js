const { on } = require("delegated-events");
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

on("click", "[data-video-action='video:unmute']", (e) => {
  let el = e.target;
  if (el.tagName === "I") {
    el = el.parentElement;
  }
  el.hidden = true;
  document.querySelector("[data-video-action='video:mute']").hidden = false;
});

on("click", "[data-video-action='video:mute']", (e) => {
  let el = e.target;
  if (el.tagName === "I") {
    el = el.parentElement;
  }
  el.hidden = true;
  document.querySelector("[data-video-action='video:unmute']").hidden = false;
});

const files = document.getElementById("files");

const loadFileHandler = (file, li) => (e) => {
  e.preventDefault();
  document.querySelector("li.active")?.classList.remove("active");
  li.classList.add("active");
  ipcRenderer.send("show-file", file);
  controls.hidden = !isVideo(file.url);
};

ipcRenderer.on("add-file", (_, file) => {
  const text = file.url.split("/").pop();
  const li = document.createElement("li");
  const a = document.createElement("a");
  a.href = file.url;
  a.addEventListener("click", loadFileHandler(file, li));

  if (isImage(file.url) || file.thumbnail) {
    const img = document.createElement("img");
    img.src = file.thumbnail || file.url;
    img.title = text;
    img.alt = text;
    a.appendChild(img);
    checkImage(img);
  } else {
    a.text = text;
  }

  li.appendChild(a);
  files.appendChild(li);
});

function checkImage(img, attempt = 1) {
  if (attempt > 10) {
    return;
  }

  if (!img.complete || img.naturalHeight === 0) {
    setTimeout(() => {
      img.src = img.src;
      checkImage(img, attempt + 1);
    }, 1000);
  }
}

ipcRenderer.on("clear-files", () => {
  files.innerHTML = "";
});

document.addEventListener("DOMContentLoaded", () => {});
