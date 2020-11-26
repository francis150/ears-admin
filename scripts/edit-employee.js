
const electron = require('electron')
const { remote, ipcRenderer } = electron

const firebase = require('../firebase')
firestorage = firebase.storage()

const currentWindow = remote.getCurrentWindow()
currentWindow.openDevTools()

const form = document.querySelector('main form')
const updatedEmployee = {}

// main back button 
document.querySelector('header .back-btn').addEventListener('click', () => {
    document.querySelector('.loader').style.height = '100vh'
    setTimeout(() => {

        ipcRenderer.send('nav-back')

    }, 1000);
})

// receive & load subject employee
ipcRenderer.once('load-subject-employee', (evt, employee) => {

    updatedEmployee.key = employee.key

    document.querySelector('form .name-contact .image-wrapper sl-avatar').image = employee.image_url
    document.querySelector('form .name-contact .image-wrapper input').value = ''

    form.firstName.value = employee.fname
    form.lastName.value = employee.lname
    form.contactNumber.value = employee.contact_number

    const designation = ipcRenderer.sendSync('get-employee-designation', employee.designation)
    form.designation.dataset.value = designation.key
    form.designation.value = designation.name

    const employeeType = ipcRenderer.sendSync('get-employee-type', employee.employee_type)
    form.employeeType.dataset.value = employeeType.key
    form.employeeType.value = employeeType.name

    const jobType = ipcRenderer.sendSync('get-job-type', employee.job_type)
    form.jobType.dataset.value = jobType.key
    form.jobType.value = jobType.name
})

// Choose image diloag
document.querySelector('form .name-contact .image-wrapper button').addEventListener('click', () => {
    document.querySelector('form .name-contact .image-wrapper input').click()
})

// Preview chosen image
document.querySelector('form .name-contact .image-wrapper input').addEventListener('change', () => {
    document.querySelector('form .name-contact .image-wrapper sl-avatar').image = document.querySelector('form .name-contact .image-wrapper input').files[0].path
})

// request designations
ipcRenderer.send('request-employee-designations')
ipcRenderer.on('respond-employee-designations', (evt, arg) => {
    const container = document.querySelector('form .job-info sl-menu[data-for=designation] .menu-items')
    container.innerHTML = ''

    Object.values(arg).forEach(designation => {
        const item = document.createElement('sl-menu-item')
        item.innerHTML = designation.name
        item.addEventListener('click', () => {
            document.querySelector(`form input[name=${container.parentElement.dataset.for}]`).value = designation.name
            document.querySelector(`form input[name=${container.parentElement.dataset.for}]`).dataset.value = designation.key
        })

        container.appendChild(item)
    })
})

// manage designations
document.querySelector('form sl-menu-item.manage-designations').addEventListener('click', () => {
    ipcRenderer.send('show-designation-manager')
})

// request job types
ipcRenderer.send('request-job-types')
ipcRenderer.on('respond-job-types', (evt, arg) => {
    const container = document.querySelector('form .job-info sl-menu[data-for=jobType] .menu-items')
    container.innerHTML = ''

    Object.values(arg).forEach(type => {
        const item = document.createElement('sl-menu-item')
        item.innerHTML = type.name
        item.addEventListener('click', () => {
            document.querySelector(`form input[name=${container.parentElement.dataset.for}]`).value = type.name
            document.querySelector(`form input[name=${container.parentElement.dataset.for}]`).dataset.value = type.key
        })

        container.appendChild(item)
    })
})

// manage job types
document.querySelector('form sl-menu-item.manage-job-types').addEventListener('click', () => {
    ipcRenderer.send('show-job-type-manager')
})

// request employee types
ipcRenderer.send('request-employee-types')
ipcRenderer.on('respond-employee-types', (evt, arg) => {
    const container = document.querySelector('form .job-info sl-menu[data-for=employeeType] .menu-items')
    container.innerHTML = ''

    Object.values(arg).forEach(type => {
        const item = document.createElement('sl-menu-item')
        item.innerHTML = type.name
        item.addEventListener('click', () => {
            document.querySelector(`form input[name=${container.parentElement.dataset.for}]`).value = type.name
            document.querySelector(`form input[name=${container.parentElement.dataset.for}]`).dataset.value = type.key
        })

        container.appendChild(item)
    })
})

// manage employee types
document.querySelector('form sl-menu-item.manage-employee-types').addEventListener('click', () => {
    ipcRenderer.send('show-employee-type-manager')
})

// page tracker
let pageOn = 1

// job info back btn
document.querySelector('form .job-info .buttons .negative-btn').addEventListener('click', () => {
    pageOn = 1
    document.querySelector('form .job-info').style.display = 'none'
    document.querySelector('form .name-contact').style.display = 'block'
})

// form submited
form.addEventListener('submit', (e) => {
    e.preventDefault()

    if (pageOn === 1) {

        // clear validity
        document.querySelectorAll('form .name-contact .input-element').forEach(input => {
            input.dataset.invalid = false
        })
        document.querySelectorAll('form .name-contact small').forEach(element => {
            element.innerHTML = ''
        })

        // check validity
        if (form.firstName.value === '') {
            form.firstName.select()
            form.firstName.parentElement.dataset.invalid = true
            form.firstName.nextElementSibling.innerHTML = 'This field cant be empty.'
        } else if (form.lastName.value === '') {
            form.lastName.select()
            form.lastName.parentElement.dataset.invalid = true
            form.lastName.nextElementSibling.innerHTML = 'This field cant be empty.'
        } else if (form.contactNumber.value === '') {
            form.contactNumber.select()
            form.contactNumber.parentElement.dataset.invalid = true
            form.contactNumber.nextElementSibling.innerHTML = 'This field cant be empty.'
        } else if (isNaN(form.contactNumber.value)) {
            form.contactNumber.select()
            form.contactNumber.parentElement.dataset.invalid = true
            form.contactNumber.nextElementSibling.innerHTML = 'Please enter a valid phone number.'
        } else {
            // collect data
            if (form.imgInput.files[0]) { updatedEmployee.imageFile = form.imgInput.files[0] }
            updatedEmployee.fname = form.firstName.value
            updatedEmployee.lname = form.lastName.value
            updatedEmployee.contact_number = form.contactNumber.value

            // go to page 2
            document.querySelector('form .name-contact').style.display = 'none'
            document.querySelector('form .job-info').style.display = 'block'
            pageOn = 2
        }

    } else if (pageOn === 2) {
        // clear validity
        document.querySelectorAll('form .job-info .input-element').forEach(input => {
            input.dataset.invalid = false
        })
        document.querySelectorAll('form .job-info small').forEach(element => {
            element.innerHTML = ''
        })

        // check validity
        if (form.designation.value === '') {
            form.designation.select()
            form.designation.parentElement.dataset.invalid = true
            form.designation.nextElementSibling.innerHTML = 'This field cant be empty.'
        } else if (form.jobType.value === '') {
            form.jobType.select()
            form.jobType.parentElement.dataset.invalid = true
            form.jobType.nextElementSibling.innerHTML = 'This field cant be empty.'
        } else if (form.employeeType.value === '') {
            form.employeeType.select()
            form.employeeType.parentElement.dataset.invalid = true
            form.employeeType.nextElementSibling.innerHTML = 'This field cant be empty.'
        } else {
            // collect data
            updatedEmployee.designation = form.designation.dataset.value
            updatedEmployee.job_type = form.jobType.dataset.value
            updatedEmployee.employee_type = form.employeeType.dataset.value

            finalSubmit()
        }
    }
})

function finalSubmit() {
    document.querySelector('.loader').style.height = '100vh'

    const forSend = {
        fname: updatedEmployee.fname,
        lname: updatedEmployee.lname,
        contact_number: updatedEmployee.contact_number,
        designation: updatedEmployee.designation,
        employee_type: updatedEmployee.employee_type,
        job_type: updatedEmployee.job_type
    }

    ipcRenderer.send('edit-employee', {
        updates: forSend,
        key: updatedEmployee.key
    })
}

ipcRenderer.on('edit-employee-task', (evt, task) => {
    let mainTask = {}
    if (task.key) {
        
        mainTask.dbResult = 'Employee updated successfully.'
        mainTask.key = task.key

        if (updatedEmployee.imageFile) {
            
            // if image is set
            const uploadTask = firestorage.ref(`employee-images/${task.key}`).put(updatedEmployee.imageFile)
            uploadTask.on('state_changed', (snapshot) => {
                let progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                document.querySelector('.loader h1').innerHTML = `Uploading Image (${Math.round(progress)}%)`
            }, (err) => {
                console.log(err.message)
                mainTask.storageError = 'Failed to update employee image.'
                ipcRenderer.send('edit-employee-result', mainTask)
            }, () => {
                uploadTask.snapshot.ref.getDownloadURL()
                .then((downloadURL) => {
                    mainTask.imageURL = downloadURL
                    ipcRenderer.send('edit-employee-result', mainTask)
                })
            })

        } else {
            ipcRenderer.send('edit-employee-result', mainTask)
        }

    } else {
        mainTask.dbError = 'Something went wrong while updating employee.'
        ipcRenderer.send('edit-employee-result', mainTask)
    }
})

setTimeout(() => {
    document.querySelector('.loader').style.height = '0'
}, 1000);
