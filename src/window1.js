const ipcRenderer = require('electron').ipcRenderer

let name = document.getElementById('name');

ButtonSendName = document.getElementById('sendName');
ButtonSendName.addEventListener('click', (event) => {
  ipcRenderer.send('nameMsg', name.value);
})

ipcRenderer.on('nameReply', (event, arg) => {
  console.log(arg) // why/what is not right..
});
