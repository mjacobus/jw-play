const { ipcRenderer } = require("electron");

showName = document.getElementById("showName");

ipcRenderer.on("add-file", (event, filename) => {
  console.log(filename);
});

const pageLoaded = () => ipcRenderer.send("controls:ready");

document.addEventListener("DOMContentLoaded", pageLoaded);
