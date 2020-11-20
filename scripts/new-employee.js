

const electron = require('electron')
const { remote, ipcRenderer } = electron

const currentWindow = remote.getCurrentWindow()
currentWindow.openDevTools()

const form = document.querySelector('main form')

// dropdown input handles
document.querySelectorAll('sl-dropdown[type=input] sl-menu sl-menu-item[type=normal]').forEach(element => {
    element.addEventListener('click', () => {
        document.querySelector(`main form input[name=${element.parentElement.parentElement.dataset.for}]`).value = element.innerHTML
        document.querySelector(`main form input[name=${element.parentElement.parentElement.dataset.for}]`).dataset.value = element.value
    })
})

// main back button 
document.querySelector('header .back-btn').addEventListener('click', () => {
    document.querySelector('.loader').style.height = '100vh'
    setTimeout(() => {

        ipcRenderer.send('nav-back')

    }, 1000);
})

// Choose image diloag
document.querySelector('form .name-contact .user-image-wrapper button').addEventListener('click', () => {
    document.querySelector('form .name-contact .user-image-wrapper input').click()
})

// Preview chosen image
document.querySelector('form .name-contact .user-image-wrapper input').addEventListener('change', () => {
    document.querySelector('form .name-contact .user-image-wrapper sl-avatar').image = document.querySelector('form .name-contact .user-image-wrapper input').files[0].path
})

// manage designations
document.querySelector('form sl-menu-item.manage-designations').addEventListener('click', () => {
    ipcRenderer.send('show-designation-manager')
})


// page tracker
let pageOn = 1

// job info back btn
document.querySelector('form .job-info .buttons .negative-btn').addEventListener('click', () => {
    pageOn = 1
    document.querySelector('form .job-info').style.display = 'none'
    document.querySelector('form .name-contact').style.display = 'block'
})

// next / submit buttons handles
const newEmployee = {}
form.addEventListener('submit', (e) => {
    e.preventDefault()

    if(pageOn === 1) {

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
            if (form.imgInput.files[0]) { newEmployee.imageFile = form.imgInput.files[0] }
            newEmployee.fname = form.firstName.value
            newEmployee.lname = form.lastName.value
            newEmployee.contact_number = form.contactNumber.value

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
            newEmployee.designation = form.designation.dataset.value
            newEmployee.job_type = form.jobType.dataset.value
            newEmployee.employee_type = form.employeeType.dataset.value

            finalSubmit()
        }
    }
})

function finalSubmit() {
    console.log(newEmployee)
}

setTimeout(() => {
    document.querySelector('.loader').style.height = '0'
}, 1000);