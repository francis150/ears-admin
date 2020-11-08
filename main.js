'use-strict'
require('electron-reload')(__dirname)

const electron = require('electron')
const { app, BrowserWindow, Menu, ipcMain } = electron
const path = require('path')

const firebase = require('./firebase')
const firedb = firebase.database()
const fireauth = firebase.auth()



app.on('ready', () => {

    let loginForm = new BrowserWindow({
        width: 424,
        height: 623,
        resizable: false,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true
        }
    })

    loginForm.loadURL(path.join('file://', __dirname, 'views/login-form.html'))

    Menu.setApplicationMenu(null)

    loginForm.on('closed', () => {
        loginForm = null
    })

})

app.on('window-all-closed', () => {
    app.quit()
})




/* NOTE LOGIN FORM */
ipcMain.on('user-login', (evt, login) => {

    firedb.ref('/users').orderByChild('username').equalTo(login.username).limitToFirst(1).once('value').then((snapshot) => {

        if (snapshot.numChildren() > 0) {
            snapshot.forEach(user => {

                if (!user.val().deactivated_by) {

                    const email = user.val().email
                    const password = login.password

                    fireauth.signInWithEmailAndPassword(email, password).then(() => {

                        sharedObj.user = user.val()
                        evt.reply('access-granted', true)

                        let firstWindow = new BrowserWindow({
                            width: 1200,
                            height: 720,
                            resizable: false,
                            webPreferences: {
                                nodeIntegration: true,
                                enableRemoteModule: true
                            }
                        })

                        firstWindow.loadURL(path.join('file://', __dirname, 'views/users.html'))

                        firstWindow.on('closed', () => {
                            firstWindow = null
                        })

                        /* CHANGE USER is_active IN DB */
                        firedb.ref(`/users/${user.key}`).update({ is_active: true }).catch((err) => {
                            console.log(`ERROR: Changing active status ${err.message}`)
                        })

                    }).catch((err) => {
                        evt.reply('access-denied', 'Your username or password is incorrect.')
                    })

                } else {
                    evt.reply('access-denied', 'Looks like this user has been deactivated.')
                }

            })
        } else {
            evt.reply('access-denied', 'Your username or password is incorrect.')
        }
    })

})
