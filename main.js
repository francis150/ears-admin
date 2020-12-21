'use-strict'
require('electron-reload')(__dirname)

const electron = require('electron')
const { app, BrowserWindow, Menu, ipcMain } = electron
const path = require('path')

const moment = require('moment')

const firebase = require('./firebase')
const firedb = firebase.database()
const fireauth = firebase.auth()

global.sharedObj = {
    user: null
}

let mainWindow
Menu.setApplicationMenu(null)

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

    loginForm.on('closed', () => {
        loginForm = null
    })
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
                            app.quit()
                        })

                        /* CHANGE USER is_active IN DB */
                        firedb.ref(`/users/${user.key}`).update({ is_active: true }).catch((err) => {
                            console.log(`ERROR: Changing active status ${err.message}`)
                        })

                    }).catch((err) => {
                        console.log(err.message)
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
let backURL = ''
ipcMain.on('nav-to-realtime-monitor', (evt, arg) => {
    console.log('nav-to-realtime-monitor')
})

ipcMain.on('nav-to-employees', (evt, arg) => {
    backURL = mainWindow.webContents.getURL()
    mainWindow.loadURL(path.join('file://', __dirname, 'views/employees.html'))
})

ipcMain.on('nav-to-new-employee', (evt, arg) => {
    backURL = mainWindow.webContents.getURL()
    mainWindow.loadURL(path.join('file://', __dirname, 'views/new-employee.html'))
})

ipcMain.on('nav-to-edit-employee', (evt, arg) => {
    backURL = mainWindow.webContents.getURL()
    mainWindow.loadURL(path.join('file://', __dirname, 'views/edit-employee.html'))
    mainWindow.webContents.once('did-finish-load', () => {
        mainWindow.webContents.send('load-subject-employee', arg)
    })
})

ipcMain.on('nav-to-employee-shifts', (evt, arg) => {
    backURL = mainWindow.webContents.getURL()
    mainWindow.loadURL(path.join('file://', __dirname, 'views/employee-shifts.html'))
    mainWindow.webContents.once('did-finish-load', () => {
        mainWindow.webContents.send('load-subject-employee', arg)
    })
})

ipcMain.on('nav-to-reports', (evt, arg) => {
    console.log('nav-to-reports')
})

ipcMain.on('nav-to-user-accounts', (evt, arg) => {
    backURL = mainWindow.webContents.getURL()
    mainWindow.loadURL(path.join('file://', __dirname, 'views/user-accounts.html'))
})

ipcMain.on('nav-to-new-user', (evt, arg) => {
    backURL = mainWindow.webContents.getURL()
    mainWindow.loadURL(path.join('file://', __dirname, 'views/new-user-account.html'))
})

ipcMain.on('nav-to-edit-user', (evt, subjectUser) => {
    backURL = mainWindow.webContents.getURL()
    mainWindow.loadURL(path.join('file://', __dirname, 'views/edit-user.html'))
    mainWindow.webContents.once('did-finish-load', () => {
        mainWindow.webContents.send('load-subject-user', subjectUser)
    })
})

ipcMain.on('nav-to-history-log', (evt, arg) => {
    console.log('nav-to-history-log')
})

ipcMain.on('nav-to-settings', (evt, arg) => {
    console.log('nav-to-settings')
})


ipcMain.on('nav-back', () => {
    mainWindow.loadURL(backURL)
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


/* NOTE NEW USER ACCOUNT */
ipcMain.on('check-username-availability', (evt, username) => {
    firedb.ref(`/users`).orderByChild('username').equalTo(username).once('value').then((snapshot) => {
        evt.returnValue = snapshot.exists()
    })
})

ipcMain.on('check-email-availability', (evt, email) => {
    firedb.ref(`/users`).orderByChild('email').equalTo(email).once('value').then((snapshot) => {
        evt.returnValue = snapshot.exists()
    })
})

ipcMain.on('add-new-user', (evt, newUserObject) => {
    
    fireauth.createUserWithEmailAndPassword(newUserObject.email, newUserObject.password)
    .then((res) => {
        newUserObject.key = res.user.uid

        newUserObject.password = null

        firedb.ref(`users/${newUserObject.key}`).set(newUserObject)
        .then(() => {
            evt.reply('add-new-user-task', { key: newUserObject.key})
            //evt.returnValue = { key: newUserObject.key }
        })
        .catch((err) => {
            evt.reply('add-new-user-task', { error: err.message }) 
            // evt.returnValue = { error: err.message }
        })
    })
    .catch((err) => {
        // evt.returnValue = { error: err.message }
        evt.reply('add-new-user-task', { error: err.message }) 
    })

})

ipcMain.on('add-new-user-result', (evt, mainTask) => {
    // navigate to users
    backURL = mainWindow.webContents.getURL()
    mainWindow.loadURL(path.join('file://', __dirname, 'views/user-accounts.html'))
    mainWindow.webContents.once('did-finish-load', () => {
        
        // if mainTask.imageURL is available
        if (mainTask.imageURL) {
            // update user in db
            firedb.ref(`/users/${mainTask.key}`).update({ image_url: mainTask.imageURL })
                .then(() => {
                    mainWindow.webContents.send('add-new-user-result', mainTask)
                })
                .catch((err) => {
                    console.log(err.message)
                    mainTask.storageError = 'Failed to set user image.'
                    mainWindow.webContents.send('add-new-user-result', mainTask)
                })
        } else {
            mainWindow.webContents.send('add-new-user-result', mainTask)
        }
    })
})


/* NOTE EDIT USER INFO */
ipcMain.on('edit-user', (evt, updatedUserObject) => {

    const updates = {
        fname: updatedUserObject.fname,
        lname: updatedUserObject.lname,
        description: updatedUserObject.description,
        permissions: updatedUserObject.permissions
    }

    firedb.ref(`users/${updatedUserObject.key}`).update(updates)
    .then(() => {
        evt.reply('add-new-user-task', { key: updatedUserObject.key })
    })
    .catch((err) => {
        evt.reply('add-new-user-task', { error: err.message }) 
    })
})

ipcMain.on('edit-user-result', (evt, mainTask) => {
    // navigate to users
    backURL = mainWindow.webContents.getURL()
    mainWindow.loadURL(path.join('file://', __dirname, 'views/user-accounts.html'))
    mainWindow.webContents.once('did-finish-load', () => {
        
        // if maintask.imageURL is available
        if (mainTask.imageURL) {
            
            // update user in db
            firedb.ref(`users/${mainTask.key}`).update({image_url: mainTask.imageURL})
            .then(() => {
                mainWindow.webContents.send('edit-user-result', mainTask)
            })
            .catch((err) => {
                console.log(err.message)
                mainTask.storageError = 'Failed to set user image.'
                mainWindow.webContents.send('edit-user-result', mainTask)
            })

        } else {
            mainWindow.webContents.send('edit-user-result', mainTask)
        }

    })
})


/* NOTE EMPLOYEES */
ipcMain.on('request-employees', (evt) => {
    const ref = firedb.ref('employees')

    ref.off('value')

    ref.on('value', (snapshot) => {
        evt.reply('respond-employees', snapshot.val())
    })
})

ipcMain.on('request-employee', (evt, arg) => {
    const ref = firedb.ref(`employees/${arg}`)
    ref.on('value', (snapshot) => {
        evt.reply('respond-employee', snapshot.val())

        mainWindow.webContents.once('did-navigate-in-page', () => {
            ref.off('value')
        })
    })
})

ipcMain.on('request-employees-search-suggestions', (evt, arg) => {
    let searchText = arg.toLowerCase().split(' ')

    firedb.ref(`/employees`).once('value')
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
                    evt.reply('respond-employees-search-suggestions', { result: result })
                }
            })

        }).catch((err) => {
            evt.reply('respond-employees-search-suggestions', { error: err })
            console.log(err.message)
        })
})

ipcMain.on('deactivate-employee', (evt, arg) => {

    firedb.ref(`/employees/${arg}`).update({ deactivated_by: sharedObj.user.key })
    .then(() => {
        evt.returnValue = { result: true }
    })
    .catch(err => {
        evt.returnValue = { error: err.message }
    })

})

ipcMain.on('reactivate-employee', (evt, arg) => {

    firedb.ref(`/employees/${arg}/deactivated_by`).remove()
    .then(() => {
        evt.returnValue = { result: true }
    })
    .catch(err => {
        evt.returnValue = { error: err.message }
    })

})


/* NOTE ADD NEW EMPLOYEE */
ipcMain.on('add-new-employee', (evt, arg) => {
    const pushKey = firedb.ref('employees').push().key
    arg.key = pushKey
    arg.hired_on = moment().format('YYYY-MM-DD')

    firedb.ref(`employees/${arg.key}`).set(arg)
    .then(() => {
        evt.reply('add-new-employee-task', {key: arg.key})
    })
    .catch((err) => {
        console.log(err.message)
        evt.reply('add-new-employee-task', {error: err.message})
    })
})

ipcMain.on('add-new-employee-result', (evt, mainTask) => {
    // navigate to users
    backURL = mainWindow.webContents.getURL()
    mainWindow.loadURL(path.join('file://', __dirname, 'views/employees.html'))
    mainWindow.webContents.once('did-finish-load', () => {

        // if mainTask.imageURL is available
        if (mainTask.imageURL) {
            firedb.ref(`employees/${mainTask.key}`).update({ image_url: mainTask.imageURL })
            .then(() => {
                mainWindow.webContents.send('add-new-employee-result', mainTask)
            })
            .catch((err) => {
                console.log(err.message)
                mainTask.storageError = 'Failed to set employee image.'
                mainWindow.webContents.send('add-new-employee-result', mainTask)
            })
        } else {
            mainWindow.webContents.send('add-new-employee-result', mainTask)
        }
    })
})


/* NOTE EDIT EMPLOYEE */
ipcMain.on('edit-employee', (evt, arg) => {
    firedb.ref(`employees/${arg.key}`).update(arg.updates)
    .then(() => {
        evt.reply('edit-employee-task', { key: arg.key })
    })
    .catch((err) => {
        evt.reply('edit-employee-task', { error: err.message })
    })
})

ipcMain.on('edit-employee-result', (evt, mainTask) => {
    backURL = mainWindow.webContents.getURL()
    mainWindow.loadURL(path.join('file://', __dirname, 'views/employees.html'))
    mainWindow.webContents.once('did-finish-load', () => {

        // if maintask.imageURL is available
        if (mainTask.imageURL) {
            firedb.ref(`employees/${mainTask.key}`).update({ image_url: mainTask.imageURL })
            .then(() => {
                mainWindow.webContents.send('edit-employee-result', mainTask)
            })
            .catch((err) => {
                console.log(err.message)
                mainTask.storageError = 'Failed to update employee image.'
                mainWindow.webContents.send('edit-employee-result', mainTask)
            })
        } else {
            mainWindow.webContents.send('edit-employee-result', mainTask)
        }

    })
})


/* NOTE EMPLOYEE SHIFTS */
ipcMain.on('add-shift', (evt, arg) => {
    const pushKey = firedb.ref(`employees/${arg.employeeKEY}/shifts/${arg.shift.day}`).push().key
    arg.shift.key = pushKey

    firedb.ref(`employees/${arg.employeeKEY}/shifts/${arg.shift.day}/${arg.shift.key}`).set(arg.shift)
    .then(() => {
        evt.reply('add-shift-result', true)
    })
    .catch((err) => {
        console.log(err.message)
        evt.reply('add-shift-result', false)
    })
})

ipcMain.on('remove-shift', (evt, arg) => {
    firedb.ref(`employees`).child(arg).set(null)
    .then(() => {
        evt.reply('remove-shift-result', true)
    })
    .catch((err) => {
        console.log(err.message)
        evt.reply('remove-shift-result', false)
    })
})

ipcMain.on('edit-shift', (evt, arg) => {
    firedb.ref('employees').child(arg.path).update(arg.updates)
    .then(() => {
        evt.reply('edit-shift-result', true)
    })
    .catch((err) => {
        console.log(err.message)
        evt.reply('edit-shift-result', false)
    })
})


/* NOTE MANAGE DESIGNATIONS */
ipcMain.on('show-designation-manager', () => {
    let modalWindow = new BrowserWindow({
        width: 400,
        height: 600,
        parent: mainWindow,
        modal: true,
        resizable: false,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true
        }
    })

    modalWindow.on('closed', () => {
        modalWindow = null
    })

    modalWindow.loadURL(path.join('file://', __dirname, 'views/manage-designations.html'))
})

ipcMain.on('designation-color-exists', (evt, arg) => {
    firedb.ref('employee_designations').orderByChild('color').equalTo(arg).once('value')
    .then((snapshot) => {
        evt.returnValue = snapshot.exists()
    })
})

ipcMain.on('designation-name-exists', (evt, arg) => {
    firedb.ref('employee_designations').orderByChild('name').equalTo(arg).once('value')
    .then((snapshot) => {
        evt.returnValue = snapshot.exists()
    })
})

ipcMain.on('new-employee-designation', (evt, arg) => {
    const pushKey = firedb.ref('employee_designations').push().key
    arg.key = pushKey

    firedb.ref(`employee_designations/${pushKey}`).set(arg)
    .then(() => {
        evt.returnValue = true
    })
    .catch((err) => {
        console.log(err.message)
        evt.returnValue = false
    })
})

ipcMain.on('request-employee-designations', (evt, arg) => {
    firedb.ref('employee_designations').on('value', (snapshot) => {
        evt.reply('respond-employee-designations', snapshot.val())
    })
})

ipcMain.on('get-employee-designation', (evt, arg) => {
    firedb.ref(`employee_designations/${arg}`).once('value')
    .then((snapshot) => {
        evt.returnValue = snapshot.val()
    })
})

ipcMain.on('request-employee-designation', (evt, arg) => {
    firedb.ref(`employee_designations/${arg}`).once('value')
        .then((snapshot) => {
            evt.reply('respond-employee-designation', snapshot.val())
        })
})

ipcMain.on('designation-employees-listed', (evt, arg) => {
    firedb.ref('employees').orderByChild('designation').equalTo(arg).once('value')
    .then((snapshot) => {
        evt.returnValue = snapshot.numChildren()
    })
})

ipcMain.on('remove-employee-designation', (evt, arg) => {
    firedb.ref(`employee_designations/${arg}`).set(null)
    .catch((err) => {
        console.log(err.message)
    })
})


/* NOTE MANAGE EMPLOYEE TYPE */
ipcMain.on('show-employee-type-manager', () => {
    let modalWindow = new BrowserWindow({
        width: 400,
        height: 600,
        parent: mainWindow,
        modal: true,
        resizable: false,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true
        }
    })

    modalWindow.on('closed', () => {
        modalWindow = null
    })

    modalWindow.loadURL(path.join('file://', __dirname, 'views/manage-employee-types.html'))
})

ipcMain.on('employee-type-color-exists', (evt, arg) => {
    firedb.ref('employee_types').orderByChild('color').equalTo(arg).once('value')
    .then((snapshot) => {
        evt.returnValue = snapshot.exists()
    })
})

ipcMain.on('employee-type-name-exists', (evt, arg) => {
    firedb.ref('employee_types').orderByChild('name').equalTo(arg).once('value')
    .then((snapshot) => {
        evt.returnValue = snapshot.exists()
    })
})

ipcMain.on('new-employee-type', (evt, arg) => {
    const pushKey = firedb.ref('employee_types').push().key
    arg.key = pushKey

    firedb.ref(`employee_types/${pushKey}`).set(arg)
    .then(() => {
        evt.returnValue = true
    })
    .catch((err) => {
        console.log(err.message)
        evt.returnValue = false
    })
})

ipcMain.on('request-employee-types', (evt, arg) => {
    firedb.ref('employee_types').on('value', (snapshot) => {
        evt.reply('respond-employee-types', snapshot.val())
    })
})

ipcMain.on('get-employee-type', (evt, arg) => {
    firedb.ref(`employee_types/${arg}`).once('value')
    .then((snapshot) => {
        evt.returnValue = snapshot.val()
    })
})

ipcMain.on('request-employee-type', (evt, arg) => {
    firedb.ref(`employee_types/${arg}`).once('value')
        .then((snapshot) => {
            evt.reply('respond-employee-type', snapshot.val())
        })
})

ipcMain.on('employee-type-employees-listed', (evt, arg) => {
    firedb.ref('employees').orderByChild('employee_type').equalTo(arg).once('value')
    .then((snapshot) => {
        evt.returnValue = snapshot.numChildren()
    })
})

ipcMain.on('remove-employee-type', (evt, arg) => {
    firedb.ref(`employee_types/${arg}`).set(null)
    .catch((err) => {
        console.log(err.message)
    })
})


/* NOTE MANAGE JOB TYPE */
ipcMain.on('show-job-type-manager', () => {
    let modalWindow = new BrowserWindow({
        width: 400,
        height: 600,
        parent: mainWindow,
        modal: true,
        resizable: false,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true
        }
    })

    modalWindow.on('closed', () => {
        modalWindow = null
    })

    modalWindow.loadURL(path.join('file://', __dirname, 'views/manage-job-types.html'))
})

ipcMain.on('job-type-color-exists', (evt, arg) => {
    firedb.ref('job_types').orderByChild('color').equalTo(arg).once('value')
    .then((snapshot) => {
        evt.returnValue = snapshot.exists()
    })
})

ipcMain.on('job-type-name-exists', (evt, arg) => {
    firedb.ref('job_types').orderByChild('name').equalTo(arg).once('value')
    .then((snapshot) => {
        evt.returnValue = snapshot.exists()
    })
})

ipcMain.on('new-job-type', (evt, arg) => {
    const pushKey = firedb.ref('job_types').push().key
    arg.key = pushKey

    firedb.ref(`job_types/${pushKey}`).set(arg)
    .then(() => {
        evt.returnValue = true
    })
    .catch((err) => {
        console.log(err.message)
        evt.returnValue = false
    })
})

ipcMain.on('request-job-types', (evt, arg) => {
    firedb.ref('job_types').on('value', (snapshot) => {
        evt.reply('respond-job-types', snapshot.val())
    })
})

ipcMain.on('get-job-type', (evt, arg) => {
    firedb.ref(`job_types/${arg}`).once('value')
    .then((snapshot) => {
        evt.returnValue = snapshot.val()
    })
})

ipcMain.on('request-job-type', (evt, arg) => {
    firedb.ref(`job_types/${arg}`).once('value')
        .then((snapshot) => {
            evt.reply('respond-job-type', snapshot.val())
        })
})

ipcMain.on('job-type-employees-listed', (evt, arg) => {
    firedb.ref('employees').orderByChild('job_type').equalTo(arg).once('value')
    .then((snapshot) => {
        evt.returnValue = snapshot.numChildren()
    })
})

ipcMain.on('remove-job-type', (evt, arg) => {
    firedb.ref(`job_types/${arg}`).set(null)
    .catch((err) => {
        console.log(err.message)
    })
})


/* NOTE MANAGE BRANCHES */
ipcMain.on('show-branch-manager', (evt, arg) => {
    let modalWindow = new BrowserWindow({
        width: 400,
        height: 700,
        parent: mainWindow,
        modal: true,
        resizable: false,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true
        }
    })

    modalWindow.on('closed', () => {
        modalWindow = null
    })

    modalWindow.loadURL(path.join('file://', __dirname, 'views/manage-branches.html'))
})

ipcMain.on('branch-name-exists', (evt, arg) => {
    firedb.ref('branches').orderByChild('name').equalTo(arg).once('value')
    .then((snapshot) => {
        evt.returnValue = snapshot.exists()
    })
})

ipcMain.on('new-branch', (evt, arg) => {
    const pushKey = firedb.ref('branches').push().key
    arg.key = pushKey

    firedb.ref(`branches/${pushKey}`).set(arg)
    .then(() => {
        evt.returnValue = true
    })
    .catch((err) => {
        console.log(err.message)
        evt.returnValue = false
    })
})

ipcMain.on('request-branches', (evt) => {
    firedb.ref('branches').on('value', (snapshot) => {
        evt.reply('respond-branches', snapshot.val())
    })
})

ipcMain.on('request-branch', (evt, arg) => {
    firedb.ref(`branches/${arg}`).once('value')
    .then((snapshot) => {
        evt.reply('respond-branch', snapshot.val())
    })
})

ipcMain.on('branch-shifts-listed', (evt, key) => {
    let count = 0
    firedb.ref('employees').once('value')
    .then((snapshot) => {
        snapshot.forEach(employee => {
            employee.child('shifts').forEach(day => {
                Object.values(day.val()).forEach(shift => {
                    if (shift.branch_key === key) { count++ }
                })
            })
        })
        evt.returnValue = count
    })
})

ipcMain.on('remove-shifts-under-branch', (evt, arg) => {
    firedb.ref('employees').once('value')
    .then((snapshot) => {
        snapshot.forEach(employee => {
            employee.child('shifts').forEach(day => {
                day.ref.orderByChild('branch_key').equalTo(arg).once('value').then((snapshot) => {
                    snapshot.forEach(shift => {
                        shift.ref.set(null)
                        .catch((err) => {
                            console.log(err.message)
                        })
                    })
                })
            })
        })
    })
})

ipcMain.on('remove-branch', (evt, arg) => {
    firedb.ref(`branches/${arg}`).set(null)
    .catch((err) => {
        console.log(err.message)
    })
})
