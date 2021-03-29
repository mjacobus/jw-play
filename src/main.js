const { ipcRenderer } = require("electron");

ipcRenderer.on("show-file", (_sender, file) => {
  const container = document.getElementById("container");
  addImage(file, document, container);

  // if (isImage(file)) {
  //   return showImage(file);
  // }
  //
  // if (isVideo(file)) {
  //   return showImage(file);
  // }
});

const addImage = (file, doc, container) => {
  const img = doc.createElement("img");
  container.innerHTML = "";
  container.appendChild(img);
  img.src = file;
  img.requestFullscreen();
};
