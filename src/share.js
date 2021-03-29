const { ipcRenderer } = require("electron");

showName = document.getElementById("video");
const files = document.getElementById("image");

ipcRenderer.on("show-file", (_sender, file) => {
  image.src = file
  image.requestFullscreen();

  // if (isImage(file)) {
  //   return showImage(file);
  // }
  //
  // if (isVideo(file)) {
  //   return showImage(file);
  // }
});
