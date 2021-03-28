const { app, BrowserWindow, ipcMain } = require('electron');
function createWindow1 () {
  window1 = new BrowserWindow({width: 800, height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    }
  })
  window1.loadURL(`file://${__dirname}/window1.html`)
  window1.webContents.openDevTools()
  window1.on('closed', function () {
    window1 = null
  })
  return window1
}
function createWindow2 () {
  window2 = new BrowserWindow({width: 1000, height: 600, 
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    }
  })
  window2.loadURL(`file://${__dirname}/window2.html`)
  window2.webContents.openDevTools()
  window2.on('closed', function () {
    window2 = null
  })
  return window2
}

app.on('ready', () => {
  window1 = createWindow1();
  window2 = createWindow2();

  ipcMain.on('nameMsg', (event, arg) => {
    console.log("name inside main process is: ", arg); // this comes form within window 1 -> and into the mainProcess
    event.sender.send('nameReply', { not_right: false }) // sends back/replies to window 1 - "event" is a reference to this chanel.
    window2.webContents.send( 'forWin2', arg ); // sends the stuff from Window1 to Window2.
  });
})
