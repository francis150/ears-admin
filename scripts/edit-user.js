
const electron = require('electron')
const { remote, ipcRenderer } = electron

const firebase = require('../firebase')
firestorage = firebase.storage()

const currentWindow = remote.getCurrentWindow()
//currentWindow.openDevTools()

const form = document.querySelector('form')

const updatedUserObject = { permissions: {} }

// load subj user information
ipcRenderer.on('load-subject-user', (evt, user) => {
    updatedUserObject.key = user.key

    document.querySelector('form .name-description sl-avatar').image = user.image_url
    form.firstName.value = user.fname
    form.lastName.value = user.lname
    form.description.value = user.description

    document.querySelector('form .permissions sl-switch[name=realtime_monitor]').checked = user.permissions.realtime_monitor
    document.querySelector('form .permissions sl-switch[name=employee_records]').checked = user.permissions.employee_records
    document.querySelector('form .permissions sl-switch[name=add_new_employees]').checked = user.permissions.add_new_employees
    document.querySelector('form .permissions sl-switch[name=modify_employees]').checked = user.permissions.modify_employees
    document.querySelector('form .permissions sl-switch[name=modify_employee_shifts]').checked = user.permissions.modify_employee_shifts
    document.querySelector('form .permissions sl-switch[name=deactivate_reactivate_employees]').checked = user.permissions.deactivate_reactivate_employees
    document.querySelector('form .permissions sl-switch[name=reports]').checked = user.permissions.reports
    document.querySelector('form .permissions sl-switch[name=print_report_documents]').checked = user.permissions.print_report_documents
    document.querySelector('form .permissions sl-switch[name=user_accounts]').checked = user.permissions.user_accounts
    document.querySelector('form .permissions sl-switch[name=create_new_user_accounts]').checked = user.permissions.create_new_user_accounts
    document.querySelector('form .permissions sl-switch[name=modify_user_info]').checked = user.permissions.modify_user_info
    document.querySelector('form .permissions sl-switch[name=deactivate_reactivate_users]').checked = user.permissions.deactivate_reactivate_users
    document.querySelector('form .permissions sl-switch[name=history_log]').checked = user.permissions.history_log
    document.querySelector('form .permissions sl-switch[name=settings]').checked = user.permissions.settings
    document.querySelector('form .permissions sl-switch[name=attendance_app]').checked = user.permissions.attendance_app
    
    if(user.permissions.attendance_app) {
        document.querySelector('form .permissions .input-element sl-dropdown input').value = '...'
        ipcRenderer.send('request-branch', user.permissions.attendance_app_branch)
        ipcRenderer.on('respond-branch', (evt, arg) => {
            document.querySelector('form .permissions .input-element sl-dropdown input').value = arg.name
            document.querySelector('form .permissions .input-element sl-dropdown input').dataset.value = arg.key
        })
    }
})

// load branches
ipcRenderer.send('request-branches')
ipcRenderer.on('respond-branches', (evt, arg) => {
    const container = document.querySelector('form .permissions .permissions-container .input-element sl-dropdown sl-menu .menu-items')
    container.innerHTML = ''

    Object.values(arg).forEach(branch => {
        const item = document.createElement('sl-menu-item')
        item.value = branch.key
        item.innerHTML = branch.name
        item.addEventListener('click', (e) => {

            document.querySelector('form .permissions .permissions-container sl-switch[name=attendance_app]').checked = true

            document.querySelector('form .permissions .permissions-container .input-element sl-dropdown input').value = branch.name
            document.querySelector('form .permissions .permissions-container .input-element sl-dropdown input').dataset.value = branch.key
        })

        container.appendChild(item)
    })
})

// manage branches
document.querySelector('form .permissions .permissions-container .input-element sl-dropdown sl-menu .manage-branches-btn').addEventListener('click', () => {
    ipcRenderer.send('show-branch-manager')
})

// main back button 
document.querySelector('header .back-btn').addEventListener('click', () => {
    document.querySelector('.loader').style.height = '100vh'
    setTimeout(() => {

        ipcRenderer.send('nav-back')

    }, 1000);
})

// Choose image diloag
document.querySelector('form .name-description .user-image-wrapper button').addEventListener('click', () => {
    document.querySelector('form .name-description .user-image-wrapper input').click()
})

// Preview chosen image
document.querySelector('form .name-description .user-image-wrapper input').addEventListener('change', () => {
    document.querySelector('form .name-description .user-image-wrapper sl-avatar').image = document.querySelector('form .name-description .user-image-wrapper input').files[0].path
})

// uncheck all sub-switch when main-switch is unchecked
document.querySelectorAll('form .permissions .permissions-container .permission-group .main').forEach(main => {
    const siblings = main.parentElement.childNodes
    main.addEventListener('sl-change', () => {
        if (!main.checked) {
            siblings.forEach(sibling => {
                sibling.checked = false
            })
        }
    })
});

// check main-switch when a sub-switch is checked
document.querySelectorAll('form .permissions .permissions-container .permission-group sl-switch').forEach(element => {
    const siblings = element.parentElement.childNodes
    element.addEventListener('sl-change', () => {
        if (element.checked) {
            siblings.forEach(sibling => {
                if (sibling.className === 'main hydrated') {
                    sibling.checked = true
                }
            })
        }
    })
})


// page tracker
let pageOn = 1

// permissions back btn 
document.querySelector('form .permissions .buttons .negative-btn').addEventListener('click', () => {
    document.querySelector('form .permissions').style.display = 'none'
    document.querySelector('form .name-description').style.display = 'block'
    pageOn = 1
})

form.addEventListener('submit', (e) => {
    e.preventDefault()

    if (pageOn === 1) {

        // clear validity
        document.querySelectorAll('form .name-description .input-element').forEach(input => {
            input.dataset.invalid = false
        })
        document.querySelectorAll('form .name-description small').forEach(element => {
            element.innerHTML = ''
        });
        document.querySelector('form .description-help-text').innerHTML = 'Put in the job title or designation.'

        //check page 1 validity
        if (form.firstName.value === '') {
            form.firstName.select()
            form.firstName.parentElement.dataset.invalid = true
            form.firstName.nextElementSibling.innerHTML = 'This field cant be empty.'
        } else if (form.lastName.value === '') {
            form.lastName.select()
            form.lastName.parentElement.dataset.invalid = true
            form.lastName.nextElementSibling.innerHTML = 'This field cant be empty.'
        } else if (form.description.value === '') {
            form.description.select()
            form.description.parentElement.dataset.invalid = true
            form.description.nextElementSibling.innerHTML = 'This field cant be empty.'
        } else {
            // set new user object properties
            if (form.imgInput.files[0]) { updatedUserObject.imageFile = form.imgInput.files[0] }
            updatedUserObject.fname = form.firstName.value
            updatedUserObject.lname = form.lastName.value
            updatedUserObject.description = form.description.value

            //go page 2
            document.querySelector('form .name-description').style.display = 'none'
            document.querySelector('form .permissions').style.display = 'block'
            pageOn = 2
        }
    } else if (pageOn === 2) {
        //check page 2 validity
        if (document.querySelectorAll('form .permissions .permissions-container sl-switch.main[checked]').length < 1) {
            document.querySelector('form .permissions .buttons small').innerHTML = 'At least one(1) permission group must be allowed.'
        } else if (document.querySelector('form .permissions .permissions-container sl-switch[name=attendance_app]').checked && document.querySelector('form .permissions .permissions-container .input-element sl-dropdown input').value === '') {

            document.querySelector('form .permissions .permissions-container .input-element sl-dropdown input').select()
            document.querySelector('form .permissions .permissions-container .input-element sl-dropdown input').parentElement.parentElement.dataset.invalid = true
            document.querySelector('form .permissions .permissions-container .input-element sl-dropdown input').parentElement.nextElementSibling.innerHTML = 'This field cant be empty.'

        } else {
            //reset validity
            document.querySelector('form .permissions .buttons small').innerHTML = ''
            document.querySelector('form .permissions .permissions-container .input-element sl-dropdown input').parentElement.parentElement.dataset.invalid = false
            document.querySelector('form .permissions .permissions-container .input-element sl-dropdown input').parentElement.nextElementSibling.innerHTML = ''

            // set new user object properties
            document.querySelectorAll('form .permissions .permissions-container sl-switch').forEach(element => {
                updatedUserObject.permissions[element.name] = element.checked
            })
            updatedUserObject.permissions['attendance_app_branch'] = document.querySelector('form .permissions .permissions-container .input-element sl-dropdown input').dataset.value

            // final submit
            finalSubmit()
        }
    }
})

function finalSubmit() {
    //document.querySelector('.loader').style.height = '100vh'

    const userObjectForSend = {
        key: updatedUserObject.key,
        fname: updatedUserObject.fname,
        lname: updatedUserObject.lname,
        description: updatedUserObject.description,
        permissions: updatedUserObject.permissions
    }

    ipcRenderer.send('edit-user', userObjectForSend)
}

ipcRenderer.on('add-new-user-task', (evt, task) => {

    let mainTask = {}
    if (task.key) {
        
        mainTask.dbResult = 'User account updated successfully.'
        mainTask.key = task.key

        if (updatedUserObject.imageFile) {
            
            // if image is set
            const uploadTask = firestorage.ref(`user-images/${task.key}`).put(updatedUserObject.imageFile)
            uploadTask.on('state_changed', (snapshot) => {
                let progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                document.querySelector('.loader h1').innerHTML = `Uploading Image (${Math.round(progress)}%)`
            },(err) => {

                console.log(err.message)
                mainTask.storageError = 'Failed to upload user image.'
                ipcRenderer.send('edit-user-result', mainTask)

            }, () => {

                uploadTask.snapshot.ref.getDownloadURL()
                .then((downloadURL) => {
                    mainTask.imageURL = downloadURL
                    ipcRenderer.send('edit-user-result', mainTask)
                })

            })

        } else {
            ipcRenderer.send('edit-user-result', mainTask)
        }

    } else {
        console.log(task.error)
        mainTask.dbError = 'Something went wrong while creating user accout.'
        ipcRenderer.send('edit-user-result', mainTask)
    }

})




setTimeout(() => {
    document.querySelector('.loader').style.height = '0'
}, 1000);