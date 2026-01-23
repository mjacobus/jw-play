const { on } = require("delegated-events");
const { ipcRenderer } = require("electron");
const { mediaProgress } = require("../utils");
const MediaFiles = require("../MediaFiles");
const t = require("../translations");
const pdfjsLib = require("pdfjs-dist/legacy/build/pdf.js");
const fs = require("fs");
const path = require("path");

// Set up the worker for pdf.js
pdfjsLib.GlobalWorkerOptions.workerSrc = require.resolve(
  "pdfjs-dist/legacy/build/pdf.worker.js"
);

document.title = t("window.titles.controlWindow");

const files = new MediaFiles();

function select(selector, base = document) {
  return base.querySelector(selector);
}

function applyTranslations(container) {
  container.querySelectorAll("[data-i18n-title]").forEach((el) => {
    const key = el.getAttribute("data-i18n-title");
    try {
      el.title = t(key);
    } catch (e) {
      console.warn(`Missing translation for: ${key}`);
    }
  });
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

on("click", "[data-pdf-action]", (e) => {
  e.preventDefault();
  const action = e.target
    .closest("[data-pdf-action]")
    .getAttribute("data-pdf-action");
  ipcRenderer.send(action);
});

on("change", "#pdf-page-slider", (e) => {
  ipcRenderer.send("pdf:goto-page", parseInt(e.target.value));
});

on("click", "[data-media-action]", (e) => {
  e.preventDefault();
  const action = e.target
    .closest("[data-media-action]")
    .getAttribute("data-media-action");
  ipcRenderer.send(action);

  if (action === "display:clear") {
    document.querySelector("li.active")?.classList.remove("active");
    footer.innerHTML = "";
  }
});

const filesContainer = document.getElementById("filesContainer");

let draggedElement = null;

function handleDragStart(e) {
  draggedElement = this;
  this.classList.add("dragging");
  e.dataTransfer.effectAllowed = "move";
  e.dataTransfer.setData("text/plain", this.dataset.fileId);
}

function handleDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = "move";

  const target = e.target.closest("li.media-file");
  if (!target || target === draggedElement) return;

  const rect = target.getBoundingClientRect();
  const midpoint = rect.left + rect.width / 2;

  // Remove existing drop indicators
  document.querySelectorAll(".drop-before, .drop-after").forEach((el) => {
    el.classList.remove("drop-before", "drop-after");
  });

  if (e.clientX < midpoint) {
    target.classList.add("drop-before");
  } else {
    target.classList.add("drop-after");
  }
}

function handleDrop(e) {
  e.preventDefault();

  const target = e.target.closest("li.media-file");
  if (!target || target === draggedElement) return;

  const rect = target.getBoundingClientRect();
  const midpoint = rect.left + rect.width / 2;

  if (e.clientX < midpoint) {
    target.parentNode.insertBefore(draggedElement, target);
  } else {
    target.parentNode.insertBefore(draggedElement, target.nextSibling);
  }

  // Send new order to main process
  const newOrder = Array.from(
    filesContainer.querySelectorAll("li.media-file")
  ).map((li) => li.dataset.fileId);
  ipcRenderer.send("files:reorder", newOrder);
}

function handleDragEnd() {
  this.classList.remove("dragging");
  document.querySelectorAll(".drop-before, .drop-after").forEach((el) => {
    el.classList.remove("drop-before", "drop-after");
  });
  draggedElement = null;
}

const loadFileHandler = (file, li) => (e) => {
  e.preventDefault();
  document.querySelector("li.active")?.classList.remove("active");
  li.classList.add("active");
  ipcRenderer.send("file:display", file.getId());

  let templateId;
  let fileNameElementId;

  if (file.isVideo()) {
    templateId = "video-controls-template";
    fileNameElementId = "video-file-name";
  } else if (file.isPdf()) {
    templateId = "pdf-controls-template";
    fileNameElementId = "pdf-file-name";
  } else if (file.isImage()) {
    templateId = "image-controls-template";
    fileNameElementId = "image-file-name";
  }

  if (templateId) {
    footer.innerHTML = document.getElementById(templateId).innerHTML;
    applyTranslations(footer);
    const fileNameEl = document.getElementById(fileNameElementId);
    if (fileNameEl) {
      fileNameEl.textContent = file.getTitle();
      fileNameEl.title = file.getTitle();
    }
  } else {
    footer.innerHTML = "";
  }
};

ipcRenderer.on("add-file", (_, fileId) => {
  const file = files.find(fileId);
  const li = document.createElement("li");
  li.classList.add("media-file");
  li.draggable = true;
  li.dataset.fileId = fileId;

  // Drag and drop event listeners
  li.addEventListener("dragstart", handleDragStart);
  li.addEventListener("dragover", handleDragOver);
  li.addEventListener("drop", handleDrop);
  li.addEventListener("dragend", handleDragEnd);

  const a = document.createElement("a");
  a.href = file.getUrl();
  a.addEventListener("click", loadFileHandler(file, li));

  const img = document.createElement("img");
  img.src = file.getThumbnailUrl();
  img.title = file.getTitle();
  img.alt = file.getTitle();
  a.appendChild(img);

  if (file.isPdf()) {
    generatePdfThumbnail(file, img);
  } else {
    checkImage(img);
  }

  const removeButton = document.createElement("a");
  removeButton.href = "#";
  removeButton.innerHTML = '<i class="m-1 bi bi-x-circle-fill">';
  removeButton.classList.add("remove-button");
  removeButton.onclick = (e) => {
    e.preventDefault();
    if (
      confirm(t("messages.confirmFileRemoval", { file: file.getTitle() }))
    ) {
      filesContainer.removeChild(li);
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

async function generatePdfThumbnail(file, img) {
  const thumbnailPath = file.getThumbnailPath();

  // Skip if thumbnail already exists or is same as original
  if (thumbnailPath === file.getPath() || fs.existsSync(thumbnailPath)) {
    return;
  }

  // Create thumbnails directory if needed
  const folder = path.dirname(thumbnailPath);
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder, { recursive: true });
  }

  try {
    const loadingTask = pdfjsLib.getDocument(file.getPath());
    const pdf = await loadingTask.promise;
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: 1 });

    // Target thumbnail: 320px wide, height scaled proportionally
    const targetWidth = 320;
    const scale = targetWidth / viewport.width;
    const scaledViewport = page.getViewport({ scale });

    const canvas = document.createElement("canvas");
    canvas.width = scaledViewport.width;
    canvas.height = scaledViewport.height;
    const context = canvas.getContext("2d");

    await page.render({
      canvasContext: context,
      viewport: scaledViewport,
    }).promise;

    // Convert canvas to PNG and save
    const dataUrl = canvas.toDataURL("image/png");
    const base64Data = dataUrl.replace(/^data:image\/png;base64,/, "");
    fs.writeFileSync(thumbnailPath, base64Data, "base64");

    // Update the img element with the new thumbnail
    img.src = file.getThumbnailUrl();
  } catch (err) {
    console.error("Failed to generate PDF thumbnail:", err);
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

ipcRenderer.on("pdf:page-updated", (_sender, payload) => {
  const controls = select("#pdf-controls");
  if (!controls) return;

  const currentPage = select("#pdf-current-page", controls);
  const totalPages = select("#pdf-total-pages", controls);
  const slider = select("#pdf-page-slider", controls);

  currentPage.innerText = payload.currentPage;
  totalPages.innerText = payload.totalPages;
  slider.max = payload.totalPages;
  slider.value = payload.currentPage;
});

ipcRenderer.on("media:zoom-updated", (_sender, payload) => {
  const imageZoomLevel = document.getElementById("image-zoom-level");
  const pdfZoomLevel = document.getElementById("pdf-zoom-level");

  if (imageZoomLevel) {
    imageZoomLevel.textContent = payload.zoomLevel + "%";
  }
  if (pdfZoomLevel) {
    pdfZoomLevel.textContent = payload.zoomLevel + "%";
  }
});

// Keyboard shortcuts for panning and zooming
document.addEventListener("keydown", (e) => {
  // Skip if typing in an input field
  if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") {
    return;
  }

  switch (e.key) {
    // Pan: hjkl (vim-style) and arrow keys
    case "h":
    case "ArrowLeft":
      ipcRenderer.send("media:pan-left");
      break;
    case "j":
    case "ArrowDown":
      ipcRenderer.send("media:pan-down");
      break;
    case "k":
    case "ArrowUp":
      ipcRenderer.send("media:pan-up");
      break;
    case "l":
    case "ArrowRight":
      ipcRenderer.send("media:pan-right");
      break;
    // Zoom: u/i
    case "u":
      ipcRenderer.send("media:zoom-out");
      break;
    case "i":
      ipcRenderer.send("media:zoom-in");
      break;
  }
});

// Drag and drop files to add them
document.addEventListener("dragover", (e) => {
  e.preventDefault();
  e.stopPropagation();
});

document.addEventListener("drop", (e) => {
  e.preventDefault();
  e.stopPropagation();

  const filePaths = [];
  for (const file of e.dataTransfer.files) {
    filePaths.push(file.path);
  }

  if (filePaths.length > 0) {
    ipcRenderer.send("files:drop", filePaths);
  }
});

document.addEventListener("DOMContentLoaded", () => {});
