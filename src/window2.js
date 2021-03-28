const { ipcRenderer } = require('electron')

showName = document.getElementById('showName')
ipcRenderer.on('forWin2', function (event, arg){
  console.log(arg);
  showName.innerHTML = arg;
});
console.log("I'm Window2");
