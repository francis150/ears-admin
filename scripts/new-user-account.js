
const electron = require('electron')
const { remote, ipcRenderer } = electron

const firebase = require('../firebase')
firestorage = firebase.storage()

const currentWindow = remote.getCurrentWindow()
currentWindow.openDevTools()

const form = document.querySelector('form')

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
        if(!main.checked) {
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

// login credentials back btn
document.querySelector('form .login-credentials .buttons .negative-btn').addEventListener('click', () => {
    document.querySelector('form .login-credentials').style.display = 'none'
    document.querySelector('form .permissions').style.display = 'block'
    pageOn = 2
})

// next buttons and submit button handles
const newUserObject = {permissions: {}}
form.addEventListener('submit', (e) => {
    e.preventDefault()

    if (pageOn === 1) {

        // clear validity
        document.querySelectorAll('form .name-description .input-element').forEach(input => {
            input.dataset.invalid = false
        })
        
        document.querySelectorAll('form .name-description small').forEach(element => {
            element.innerHTML = ''
        })
        
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
            if (form.imgInput.files[0]) { newUserObject.imageFile = form.imgInput.files[0] }
            newUserObject.fname = form.firstName.value
            newUserObject.lname = form.lastName.value
            newUserObject.description = form.description.value

            //go page 2
            document.querySelector('form .name-description').style.display = 'none'
            document.querySelector('form .permissions').style.display = 'block'
            pageOn = 2
        }
        
    } else if (pageOn === 2) {

        //check page 2 validity
        if (document.querySelectorAll('form .permissions .permissions-container sl-switch.main[checked]').length < 1) {
            document.querySelector('form .permissions .buttons small').innerHTML = 'At least one(1) permission group must be allowed.'
        } else {
            //reset validity
            document.querySelector('form .permissions .buttons small').innerHTML = ''

            // set new user object properties
            document.querySelectorAll('form .permissions .permissions-container sl-switch').forEach(element => {
                newUserObject.permissions[element.name] = element.checked
            })

            //go page 3
            document.querySelector('form .permissions').style.display = 'none'
            document.querySelector('form .login-credentials').style.display = 'block'
            pageOn = 3
        }
        
    } else if (pageOn === 3) {

        // clear validity
        document.querySelectorAll('form .login-credentials .input-element').forEach(input => {
            input.dataset.invalid = false
        })

        document.querySelectorAll('form .login-credentials small').forEach(element => {
            element.innerHTML = ''
        })

        // check page 3 validity
        if (form.email.value === '') {
            form.email.select()
            form.email.parentElement.dataset.invalid = true
            form.email.nextElementSibling.innerHTML = 'This field cant be empty.'
        } else if (!validateEmail(form.email.value)) {
            form.email.select()
            form.email.parentElement.dataset.invalid = true
            form.email.nextElementSibling.innerHTML = 'Please enter a valid email.'
        } else if (ipcRenderer.sendSync('check-email-availability', form.email.value)) {
            form.email.select()
            form.email.parentElement.dataset.invalid = true
            form.email.nextElementSibling.innerHTML = 'Looks like this email is already taken.'
        } else if (form.username.value === '') {
            form.username.select()
            form.username.parentElement.dataset.invalid = true
            form.username.nextElementSibling.innerHTML = 'This field cant be empty.'
        } else if (ipcRenderer.sendSync('check-username-availability', form.username.value)) {
            form.username.select()
            form.username.parentElement.dataset.invalid = true
            form.username.nextElementSibling.innerHTML = 'Looks like this username is already taken.'
        } else if (form.password.value === '') {
            form.password.select()
            form.password.parentElement.dataset.invalid = true
            form.password.nextElementSibling.innerHTML = 'This field cant be empty.'
        } else if (form.retypePassword.value === '') {
            form.retypePassword.select()
            form.retypePassword.parentElement.dataset.invalid = true
            form.retypePassword.nextElementSibling.innerHTML = 'Please re-type your password here.'
        } else if (form.password.value !== form.retypePassword.value) {
            form.password.select()
            form.password.parentElement.dataset.invalid = true
            form.retypePassword.parentElement.dataset.invalid = true
            form.password.nextElementSibling.innerHTML = 'Passwords does not match.'
        } else {
            // set new user object properties
            newUserObject.email = form.email.value
            newUserObject.username = form.username.value
            newUserObject.password = form.password.value
            
            finalSubmit()


        }
    }

})

// final submit method
function finalSubmit() {
    document.querySelector('.loader').style.height = '100vh'

    const userObjectForSend = {
        fname: newUserObject.fname,
        lname: newUserObject.lname,
        description: newUserObject.description,
        permissions: newUserObject.permissions,
        email: newUserObject.email,
        username: newUserObject.username,
        password: newUserObject.password,
        is_active: false
    }

    ipcRenderer.send('add-new-user', userObjectForSend)
    
}

ipcRenderer.on('add-new-user-task', (evt, task) => {
    let mainTask = {}
    if (task.key) {

        mainTask.dbResult = 'User account created successfully.'
        mainTask.key = task.key

        if (newUserObject.imageFile) {

            //if an image file is set
            const uploadTask = firestorage.ref(`user-images/${task.key}`).put(newUserObject.imageFile)
            uploadTask.on('state_changed', (snapshot) => {
                let progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                document.querySelector('.loader h1').innerHTML = `Uploading Image (${Math.round(progress)}%)`
            }, (err) => {

                console.log(err.message)
                mainTask.storageError = 'Failed to upload user image.'
                ipcRenderer.send('add-new-user-result', mainTask)

            }, () => {
                uploadTask.snapshot.ref.getDownloadURL()
                .then((downloadURL) => {
                    mainTask.imageURL = downloadURL
                    ipcRenderer.send('add-new-user-result', mainTask)
                })
            })

        } else {
            ipcRenderer.send('add-new-user-result', mainTask)
        }

    } else {
        console.log(task.error)
        mainTask.dbError = 'Something went wrong while creating user accout.'
        ipcRenderer.send('add-new-user-result', mainTask)
    }
})

// validate email pattern
function validateEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}


setTimeout(() => {
    document.querySelector('.loader').style.height = '0'
}, 1000);