const { on } = require("delegated-events");
const { ipcRenderer } = require("electron");
const { mediaProgress } = require("../utils");
const MediaFiles = require("../MediaFiles");

const files = new MediaFiles();

function select(selector, base = document) {
  return base.querySelector(selector);
}

const footer = document.getElementById("footer");

on("click", "#video-progress-bar", (e) => {
  ipcRenderer.send("video:set_time", e.target.value);
});

on("click", "[data-video-action]", (e) => {
  e.preventDefault();
  const action = e.target
    .closest("[data-video-action]")
    .getAttribute("data-video-action");
  ipcRenderer.send(action);
});

on("click", "[data-video-action='video:unmute']", (e) => {
  e.target.closest("[data-video-action]").hidden = true;
  document.querySelector("[data-video-action='video:mute']").hidden = false;
});

on("click", "[data-video-action='video:mute']", (e) => {
  e.target.closest("[data-video-action]").hidden = true;
  document.querySelector("[data-video-action='video:unmute']").hidden = false;
});

on("click", "[data-video-action='video:toggle-controls']", (e) => {
  const el = e.target.closest("[data-video-action]");
  el.classList.toggle("option-off");
});

on("click", "[data-video-action='video:toggle-mute']", (e) => {
  const el = e.target.closest("[data-video-action]");
  el.classList.toggle("option-off");
});

const filesContainer = document.getElementById("filesContainer");

const loadFileHandler = (file, li) => (e) => {
  e.preventDefault();
  document.querySelector("li.active")?.classList.remove("active");
  li.classList.add("active");
  ipcRenderer.send("file:display", file.getId());
  footer.innerHTML = file.isVideo()
    ? document.getElementById("video-controls-template").innerHTML
    : "";
};

ipcRenderer.on("add-file", (_, fileId) => {
  const file = files.find(fileId);
  const li = document.createElement("li");
  li.classList.add("media-file");
  const a = document.createElement("a");
  a.href = file.getUrl();
  a.addEventListener("click", loadFileHandler(file, li));

  const img = document.createElement("img");
  img.src = file.getThumbnailUrl();
  img.title = file.getFilename();
  img.alt = file.getFilename();
  a.appendChild(img);
  checkImage(img);

  const removeButton = document.createElement("a");
  removeButton.href = "#";
  removeButton.innerHTML = '<i class="m-1 bi bi-x-circle-fill">';
  removeButton.classList.add("remove-button");
  removeButton.onclick = (e) => {
    e.preventDefault();
    if (confirm("Are you sure?")) {
      filesContainer.removeChild(li);
      console.log("Removing file: ", file);
      ipcRenderer.send("file:remove", file.getId());
    }
  };
  li.appendChild(removeButton);
  li.appendChild(a);
  filesContainer.appendChild(li);
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
  filesContainer.innerHTML = "";
});

ipcRenderer.on("video:time-updated", (_sender, payload) => {
  const result = mediaProgress(payload);
  const controls = select("#video-controls");
  const currentTime = select("#video-progress-current-time", controls);
  const duration = select("#video-progress-duration", controls);
  const bar = select("#video-progress-bar", controls);

  // debugger
  bar.max = result.duration;
  bar.value = result.currentTime;
  currentTime.innerText = result.timeString.current;
  duration.innerText = result.timeString.duration;
});

document.addEventListener("DOMContentLoaded", () => {});
