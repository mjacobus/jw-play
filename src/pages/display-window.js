const { ipcRenderer } = require("electron");
const { maximizeImage } = require("../utils");
const MediaFiles = require("../MediaFiles");
const t = require("../translations");
const pdfjsLib = require("pdfjs-dist/legacy/build/pdf.js");
const fs = require("fs");
const path = require("path");

// Set up the worker for pdf.js (legacy build for Electron compatibility)
pdfjsLib.GlobalWorkerOptions.workerSrc = require.resolve(
  "pdfjs-dist/legacy/build/pdf.worker.js"
);

document.title = t("window.titles.displayWindow");

const files = new MediaFiles();

// PDF state
let currentPdf = null;
let currentPdfPage = 1;
let currentPdfFile = null;

// Media state for zoom and resize
let currentMediaType = null; // 'image', 'video', or 'pdf'
let currentFile = null;
let currentZoomLevel = 100;
const ZOOM_STEPS = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 175, 200, 250, 300];
const DEFAULT_ZOOM = 100;

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

  // Clear PDF state when switching files
  currentPdf = null;
  currentPdfPage = 1;
  currentPdfFile = null;

  // Reset zoom level for new file
  currentZoomLevel = DEFAULT_ZOOM;
  currentFile = file;

  if (file.isImage()) {
    currentMediaType = "image";
    return showImage(file, document, container);
  }

  if (file.isVideo()) {
    currentMediaType = "video";
    return showVideo(file, document, container);
  }

  if (file.isPdf()) {
    currentMediaType = "pdf";
    return showPdf(file, document, container);
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
  container.classList.remove("scrollable");
  container.appendChild(img);
  img.src = file.getUrl();
  img.width = file.getWidth();
  img.height = file.getHeight();
  maximizeImage(img, window);
};

const showVideo = (file, doc, container) => {
  container.innerHTML = "";
  container.classList.remove("scrollable");
  const video = doc.createElement("video");
  const source = doc.createElement("source");
  video.appendChild(source);

  video.width = window.innerWidth;
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

const showPdf = async (file, doc, container) => {
  container.innerHTML = "";
  container.classList.remove("scrollable");
  currentPdfFile = file;
  currentPdfPage = 1;

  const canvas = doc.createElement("canvas");
  canvas.id = "pdf-canvas";
  container.appendChild(canvas);

  try {
    const loadingTask = pdfjsLib.getDocument(file.getPath());
    currentPdf = await loadingTask.promise;

    await renderPdfPage(currentPdfPage);

    ipcRenderer.send("pdf:page-updated", {
      currentPage: currentPdfPage,
      totalPages: currentPdf.numPages,
    });

    // Generate thumbnail if it doesn't exist
    generatePdfThumbnail(file, currentPdf);
  } catch (error) {
    console.error("Failed to load PDF:", error);
    currentPdf = null;
  }
};

const renderPdfPage = async (pageNumber) => {
  if (!currentPdf) return;

  try {
    const page = await currentPdf.getPage(pageNumber);
    const canvas = document.getElementById("pdf-canvas");
    const context = canvas.getContext("2d");

    // Calculate scale based on zoom level
    const viewport = page.getViewport({ scale: 1 });
    let scale;

    if (currentZoomLevel === DEFAULT_ZOOM) {
      // Fit to window mode
      const scaleX = window.innerWidth / viewport.width;
      const scaleY = window.innerHeight / viewport.height;
      scale = Math.min(scaleX, scaleY);
      canvas.classList.add("vertical-center");
    } else {
      // Custom zoom level
      scale = currentZoomLevel / 100;
      canvas.classList.remove("vertical-center");
    }

    const scaledViewport = page.getViewport({ scale });
    canvas.width = scaledViewport.width;
    canvas.height = scaledViewport.height;

    const renderContext = {
      canvasContext: context,
      viewport: scaledViewport,
    };

    await page.render(renderContext).promise;
  } catch (error) {
    console.error("Failed to render PDF page:", error);
  }
};

const generatePdfThumbnail = async (file, pdf) => {
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

  // Render first page to a small canvas for thumbnail
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
};

ipcRenderer.on("pdf:next-page", async () => {
  if (!currentPdf || currentPdfPage >= currentPdf.numPages) return;

  try {
    currentPdfPage++;
    await renderPdfPage(currentPdfPage);

    ipcRenderer.send("pdf:page-updated", {
      currentPage: currentPdfPage,
      totalPages: currentPdf.numPages,
    });
  } catch (error) {
    console.error("Failed to navigate to next PDF page:", error);
  }
});

ipcRenderer.on("pdf:previous-page", async () => {
  if (!currentPdf || currentPdfPage <= 1) return;

  try {
    currentPdfPage--;
    await renderPdfPage(currentPdfPage);

    ipcRenderer.send("pdf:page-updated", {
      currentPage: currentPdfPage,
      totalPages: currentPdf.numPages,
    });
  } catch (error) {
    console.error("Failed to navigate to previous PDF page:", error);
  }
});

ipcRenderer.on("pdf:goto-page", async (_sender, pageNumber) => {
  if (!currentPdf) return;

  try {
    const page = Math.max(1, Math.min(pageNumber, currentPdf.numPages));
    if (page === currentPdfPage) return;

    currentPdfPage = page;
    await renderPdfPage(currentPdfPage);

    ipcRenderer.send("pdf:page-updated", {
      currentPage: currentPdfPage,
      totalPages: currentPdf.numPages,
    });
  } catch (error) {
    console.error("Failed to navigate to PDF page:", error);
  }
});

// Clear display handler
ipcRenderer.on("display:clear", () => {
  const container = document.getElementById("container");
  container.innerHTML = "";
  currentMediaType = null;
  currentFile = null;
  currentPdf = null;
  currentPdfPage = 1;
  currentPdfFile = null;
  currentZoomLevel = DEFAULT_ZOOM;
});

// Zoom handlers
function getNextZoomLevel(direction) {
  const currentIndex = ZOOM_STEPS.indexOf(currentZoomLevel);
  if (currentIndex === -1) {
    // Find closest zoom step
    const closest = ZOOM_STEPS.reduce((prev, curr) =>
      Math.abs(curr - currentZoomLevel) < Math.abs(prev - currentZoomLevel)
        ? curr
        : prev
    );
    const closestIndex = ZOOM_STEPS.indexOf(closest);
    if (direction > 0) {
      return ZOOM_STEPS[Math.min(closestIndex + 1, ZOOM_STEPS.length - 1)];
    } else {
      return ZOOM_STEPS[Math.max(closestIndex - 1, 0)];
    }
  }

  if (direction > 0) {
    return ZOOM_STEPS[Math.min(currentIndex + 1, ZOOM_STEPS.length - 1)];
  } else {
    return ZOOM_STEPS[Math.max(currentIndex - 1, 0)];
  }
}

function applyImageZoom() {
  const img = document.querySelector("#container img");
  if (!img || !currentFile) return;

  const container = document.getElementById("container");

  if (currentZoomLevel === DEFAULT_ZOOM) {
    // Fit to window mode
    container.classList.remove("scrollable");
    img.style.transform = "";
    img.style.transformOrigin = "";
    img.style.width = "";
    img.style.height = "";
    maximizeImage(img, window);
  } else {
    // Zoomed mode - enable scrolling
    container.classList.add("scrollable");
    const scale = currentZoomLevel / 100;
    img.style.width = currentFile.getWidth() * scale + "px";
    img.style.height = currentFile.getHeight() * scale + "px";
    img.classList.remove("vertical-center");
  }

  // Send zoom level update to controls window
  ipcRenderer.send("media:zoom-updated", { zoomLevel: currentZoomLevel });
}

async function applyPdfZoom() {
  if (!currentPdf) return;

  const container = document.getElementById("container");

  if (currentZoomLevel === DEFAULT_ZOOM) {
    container.classList.remove("scrollable");
  } else {
    container.classList.add("scrollable");
  }

  await renderPdfPage(currentPdfPage);

  // Send zoom level update to controls window
  ipcRenderer.send("media:zoom-updated", { zoomLevel: currentZoomLevel });
}

ipcRenderer.on("media:zoom-in", () => {
  currentZoomLevel = getNextZoomLevel(1);

  if (currentMediaType === "image") {
    applyImageZoom();
  } else if (currentMediaType === "pdf") {
    applyPdfZoom();
  }
});

ipcRenderer.on("media:zoom-out", () => {
  currentZoomLevel = getNextZoomLevel(-1);

  if (currentMediaType === "image") {
    applyImageZoom();
  } else if (currentMediaType === "pdf") {
    applyPdfZoom();
  }
});

ipcRenderer.on("media:zoom-fit", () => {
  currentZoomLevel = DEFAULT_ZOOM;

  if (currentMediaType === "image") {
    applyImageZoom();
  } else if (currentMediaType === "pdf") {
    applyPdfZoom();
  }
});

// Window resize handler
window.addEventListener("resize", () => {
  if (!currentFile) return;

  const container = document.getElementById("container");

  if (currentMediaType === "image" && currentZoomLevel === DEFAULT_ZOOM) {
    const img = document.querySelector("#container img");
    if (img) {
      maximizeImage(img, window);
    }
  } else if (currentMediaType === "video") {
    const video = document.querySelector("#container video");
    if (video) {
      video.width = window.innerWidth;
    }
  } else if (currentMediaType === "pdf" && currentZoomLevel === DEFAULT_ZOOM) {
    renderPdfPage(currentPdfPage);
  }
});

// Pan handlers
const PAN_STEP = 100;

function panUp() {
  const container = document.getElementById("container");
  if (container.classList.contains("scrollable")) {
    container.scrollBy({ top: -PAN_STEP, behavior: "smooth" });
  }
}

function panDown() {
  const container = document.getElementById("container");
  if (container.classList.contains("scrollable")) {
    container.scrollBy({ top: PAN_STEP, behavior: "smooth" });
  }
}

function panLeft() {
  const container = document.getElementById("container");
  if (container.classList.contains("scrollable")) {
    container.scrollBy({ left: -PAN_STEP, behavior: "smooth" });
  }
}

function panRight() {
  const container = document.getElementById("container");
  if (container.classList.contains("scrollable")) {
    container.scrollBy({ left: PAN_STEP, behavior: "smooth" });
  }
}

ipcRenderer.on("media:pan-up", panUp);
ipcRenderer.on("media:pan-down", panDown);
ipcRenderer.on("media:pan-left", panLeft);
ipcRenderer.on("media:pan-right", panRight);

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
      panLeft();
      break;
    case "j":
    case "ArrowDown":
      panDown();
      break;
    case "k":
    case "ArrowUp":
      panUp();
      break;
    case "l":
    case "ArrowRight":
      panRight();
      break;
    // Zoom: u/i
    case "u":
      currentZoomLevel = getNextZoomLevel(-1);
      if (currentMediaType === "image") applyImageZoom();
      else if (currentMediaType === "pdf") applyPdfZoom();
      break;
    case "i":
      currentZoomLevel = getNextZoomLevel(1);
      if (currentMediaType === "image") applyImageZoom();
      else if (currentMediaType === "pdf") applyPdfZoom();
      break;
  }
});
