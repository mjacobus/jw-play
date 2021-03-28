const { ipcRenderer } = require("electron");

showName = document.getElementById("showName");
const files = document.getElementById("files");

const clickHandler = (e) => {
  e.preventDefault();
  ipcRenderer.send("show-file", e.target.href)
};

ipcRenderer.on("add-file", (_, filePath) => {
  const li = document.createElement("li")
  const a = document.createElement("a");
  a.href = filePath;
  a.text = filePath;
  a.addEventListener("click", clickHandler);

  li.appendChild(a)
  files.appendChild(li);
});

const pageLoaded = () => ipcRenderer.send("controls:ready");

document.addEventListener("DOMContentLoaded", pageLoaded);
