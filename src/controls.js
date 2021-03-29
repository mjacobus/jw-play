const { ipcRenderer } = require("electron");
const { isImage } = require('./utils')


const files = document.getElementById("files");

const loadFileHandler = (file, li) => (e) => {
  e.preventDefault();
  document.querySelector('li.active')?.classList.remove('active')
  li.classList.add('active')
  ipcRenderer.send("show-file", file)
};

ipcRenderer.on("add-file", (_, file) => {
  const li = document.createElement("li")
  const a = document.createElement("a");
  a.href = file;
  a.addEventListener("click", loadFileHandler(file, li));

  if (isImage(file)) {
    const img = document.createElement("img");
    img.src = file;
    img.title = file;
    img.alt = file;
    a.appendChild(img)
  } else {
    a.text = file
  }

  li.appendChild(a)
  files.appendChild(li);
});

const pageLoaded = () => ipcRenderer.send("controls:ready");

document.addEventListener("DOMContentLoaded", pageLoaded);
