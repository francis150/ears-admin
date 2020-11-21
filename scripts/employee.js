const electron = require('electron')
const { remote, ipcRenderer } = electron

const currentWindow = remote.getCurrentWindow()
currentWindow.openDevTools()


ipcRenderer.on('add-new-employee-result', (evt, arg) => {
    console.log(arg)
})

setTimeout(() => {
    document.querySelector('.loader').style.height = '0'
}, 1000);