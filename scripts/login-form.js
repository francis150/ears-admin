const electron = require('electron')
const { ipcRenderer, remote } = electron

const currentWindow = remote.getCurrentWindow()
currentWindow.openDevTools()

/* elements */
const loginForm = document.getElementById('form')
const errorText = document.getElementById('message-txt')

/* on login form submit */
loginForm.addEventListener('submit', (e) => {
    e.preventDefault()

    const login = {
        username: loginForm.username.value,
        password: loginForm.password.value
    }

    ipcRenderer.send('user-login', login)
})

/* access-granted */
ipcRenderer.on('access-granted', (evt, arg) => {
    errorText.innerHTML = ''
    currentWindow.close()
})

/* access-denied */
ipcRenderer.on('access-denied', (evt, errorMessage) => {
    loginForm.username.select()
    errorText.innerHTML = errorMessage
})