const electron = require('electron')
const { remote, ipcRenderer } = electron

const currentWindow = remote.getCurrentWindow()
currentWindow.openDevTools()


setTimeout(() => {
    document.querySelector('.loader').style.height = '0'
}, 1000);