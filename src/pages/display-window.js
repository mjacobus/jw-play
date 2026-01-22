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

  if (file.isImage()) {
    return showImage(file, document, container);
  }

  if (file.isVideo()) {
    return showVideo(file, document, container);
  }

  if (file.isPdf()) {
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

const showPdf = async (file, doc, container) => {
  container.innerHTML = "";
  currentPdfFile = file;
  currentPdfPage = 1;

  const canvas = doc.createElement("canvas");
  canvas.id = "pdf-canvas";
  canvas.classList.add("vertical-center");
  container.appendChild(canvas);

  const loadingTask = pdfjsLib.getDocument(file.getPath());
  currentPdf = await loadingTask.promise;

  await renderPdfPage(currentPdfPage);

  ipcRenderer.send("pdf:page-updated", {
    currentPage: currentPdfPage,
    totalPages: currentPdf.numPages,
  });

  // Generate thumbnail if it doesn't exist
  generatePdfThumbnail(file, currentPdf);
};

const renderPdfPage = async (pageNumber) => {
  if (!currentPdf) return;

  const page = await currentPdf.getPage(pageNumber);
  const canvas = document.getElementById("pdf-canvas");
  const context = canvas.getContext("2d");

  // Calculate scale to fit the window while maintaining aspect ratio
  const viewport = page.getViewport({ scale: 1 });
  const scaleX = window.innerWidth / viewport.width;
  const scaleY = window.innerHeight / viewport.height;
  const scale = Math.min(scaleX, scaleY);

  const scaledViewport = page.getViewport({ scale });
  canvas.width = scaledViewport.width;
  canvas.height = scaledViewport.height;

  const renderContext = {
    canvasContext: context,
    viewport: scaledViewport,
  };

  await page.render(renderContext).promise;
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

  // Target thumbnail size: 320x180 (same as video thumbnails)
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

  currentPdfPage++;
  await renderPdfPage(currentPdfPage);

  ipcRenderer.send("pdf:page-updated", {
    currentPage: currentPdfPage,
    totalPages: currentPdf.numPages,
  });
});

ipcRenderer.on("pdf:previous-page", async () => {
  if (!currentPdf || currentPdfPage <= 1) return;

  currentPdfPage--;
  await renderPdfPage(currentPdfPage);

  ipcRenderer.send("pdf:page-updated", {
    currentPage: currentPdfPage,
    totalPages: currentPdf.numPages,
  });
});

ipcRenderer.on("pdf:goto-page", async (_sender, pageNumber) => {
  if (!currentPdf) return;

  const page = Math.max(1, Math.min(pageNumber, currentPdf.numPages));
  if (page === currentPdfPage) return;

  currentPdfPage = page;
  await renderPdfPage(currentPdfPage);

  ipcRenderer.send("pdf:page-updated", {
    currentPage: currentPdfPage,
    totalPages: currentPdf.numPages,
  });
});
