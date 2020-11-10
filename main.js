'use-strict'
require('electron-reload')(__dirname)

const electron = require('electron')
const { app, BrowserWindow, Menu, ipcMain } = electron
const path = require('path')

const firebase = require('./firebase')
const firedb = firebase.database()
const fireauth = firebase.auth()

global.sharedObj = {
    user: null
}

let mainWindow

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

app.on('will-quit', () => {
    firedb.ref(`/users/${fireauth.currentUser.uid}`).update({ is_active: false }).then(() => {
        app.quit()
    }).catch((err) => {
        console.log(`ERROR: Changing active status ${err.message}`)
    })
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

                        mainWindow = new BrowserWindow({
                            width: 1200,
                            height: 720,
                            resizable: false,
                            webPreferences: {
                                nodeIntegration: true,
                                enableRemoteModule: true
                            }
                        })

                        mainWindow.loadURL(path.join('file://', __dirname, 'views/user-accounts.html'))

                        mainWindow.on('closed', () => {
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


/* NOTE NAVIGATION */
ipcMain.on('nav-to-new-user', () => {
    mainWindow.loadURL(path.join('file://', __dirname, 'views/new-user-account.html'))
})

ipcMain.on('nav-to-edit-user', (evt, arg) => {
    console.log(arg)
})



/* NOTE USER ACCOUNTS */
ipcMain.on('user-accounts-get-all-users', (evt) => {
    firedb.ref('/users').on('value', (snapshot) => {
        evt.reply('users-value-changed', snapshot.val())
    })
})

ipcMain.on('users-search-get-suggestions', (evt, args) => {
    let searchText = args.toLowerCase().split(' ')

    firedb.ref(`/users`).once('value')
        .then((snapshot) => {


            let index = 0
            let result = {}

            snapshot.forEach(user => {

                const fulltext = `${user.val().fname.toLowerCase()} ${user.val().lname.toLowerCase()}`

                let a = true
                searchText.forEach(word => {
                    if (word !== '') {
                        if (!fulltext.includes(word)) {
                            a = false
                        }
                    } else {
                        return
                    }
                });

                if (a) {
                    result[user.key] = user.val()
                }


                index++
                if (index === snapshot.numChildren()) {
                    evt.reply('users-search-get-suggestions-result', { result: result })
                }
            })

        }).catch((err) => {
            evt.reply('users-search-get-suggestions-result', { error: err })
            console.log(err.message)
        })
})

ipcMain.on('deactivate-user', (evt, arg) => {

    firedb.ref(`/users/${arg}`).update({ deactivated_by: sharedObj.user.key })
        .then(() => {
            evt.returnValue = { result: true }
        })
        .catch(err => {
            evt.returnValue = { error: err.message }
        })

})

ipcMain.on('reactivate-user', (evt, arg) => {

    firedb.ref(`/users/${arg}/deactivated_by`).remove()
        .then(() => {
            evt.returnValue = { result: true }
        })
        .catch(err => {
            evt.returnValue = { error: err.message }
        })

})