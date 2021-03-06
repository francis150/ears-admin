const electron = require('electron')
const { remote, ipcRenderer } = electron

const _moment = require('moment')
const qrcode = require('qrcode')

// request employees list when filters are all loaded
let filtersLoaded = 0
function filterLoaded() {
    filtersLoaded++
    if (filtersLoaded === 2) {
        ipcRenderer.send('request-employees')
    }
}

// load employees
ipcRenderer.on('respond-employees', (evt, arg) => {
    const container = document.querySelector('.list .employee-list')
    container.innerHTML = ''

    // counter
    const counter = document.querySelector('.list .header .counter-value')
    counter.innerHTML = 0

    Object.values(arg).forEach(employee => {

        // filtering
        const filters = document.querySelector(`.list .header .filter sl-menu .employee-type-filter sl-menu-item[value=${employee.employee_type}]`).checked &&
            document.querySelector(`.list .header .filter sl-menu .job-type-filter sl-menu-item[value=${employee.job_type}]`).checked &&
            (!employee.deactivated_by || (employee.deactivated_by && document.querySelector('.list .header .filter sl-menu .deactivated-filter').checked))

        if (filters) {

            // increment counter
            counter.innerHTML = `${parseInt(counter.innerHTML) + 1}`.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")

            const mainDiv = document.createElement('div')
            mainDiv.className = 'employee'

            mainDiv.addEventListener('click', () => {
                viewEmployee(employee)
            })

            const avatar = document.createElement('sl-avatar')
            avatar.image = employee.image_url
            mainDiv.appendChild(avatar)

            const textDiv = document.createElement('div')
            textDiv.className = 'texts-wrapper'
            mainDiv.appendChild(textDiv)

            const name = document.createElement('h2')
            name.innerHTML = `${employee.lname}, ${employee.fname}`
            textDiv.appendChild(name)

            const badgesDiv = document.createElement('div')
            badgesDiv.className = 'badges-wrapper'
            textDiv.appendChild(badgesDiv)

            // get employee type
            const employeeType = ipcRenderer.sendSync('get-employee-type', employee.employee_type)
            const employeeTypeBadge = document.createElement('span')
            employeeTypeBadge.innerHTML = employeeType.name
            employeeTypeBadge.style.background = employeeType.color
            badgesDiv.appendChild(employeeTypeBadge)

            // get job type
            const jobType = ipcRenderer.sendSync('get-job-type', employee.job_type)
            const jobTypeBadge = document.createElement('span')
            jobTypeBadge.innerHTML = jobType.name
            jobTypeBadge.style.background = jobType.color
            badgesDiv.appendChild(jobTypeBadge)

            if (employee.deactivated_by) {
                const deactivatedBadge = document.createElement('span')
                deactivatedBadge.innerHTML = 'Deactivated'
                deactivatedBadge.style.background = '#cc3448'
                badgesDiv.appendChild(deactivatedBadge)
            }

            container.appendChild(mainDiv)

        }
    })
})

// load employee type filter
ipcRenderer.send('request-employee-types')
ipcRenderer.on('respond-employee-types', (evt, arg) => {
    const container = document.querySelector('.list .header .filter sl-menu .employee-type-filter')
    container.innerHTML = ''

    Object.values(arg).forEach(type => {

        const item = document.createElement('sl-menu-item')
        item.checked = true
        item.innerHTML = type.name
        item.value = type.key
        item.addEventListener('click', () => {
            item.checked = !item.checked
            ipcRenderer.send('request-employees')
        })
        container.appendChild(item)
    })
    filterLoaded()
})

// load job type filter
ipcRenderer.send('request-job-types')
ipcRenderer.on('respond-job-types', (evt, arg) => {
    const container = document.querySelector('.list .header .filter sl-menu .job-type-filter')
    container.innerHTML = ''

    Object.values(arg).forEach(type => {
        const item = document.createElement('sl-menu-item')
        item.checked = true
        item.innerHTML = type.name
        item.value = type.key
        item.addEventListener('click', () => {
            item.checked = !item.checked
            ipcRenderer.send('request-employees')
        })
        container.appendChild(item)
    })
    filterLoaded()
})

// deactivated filter   
document.querySelector('.list .header .filter sl-menu .deactivated-filter').addEventListener('click', (e) => {
    e.target.checked = !e.target.checked
    ipcRenderer.send('request-employees')
})

// view employee profile
let viewedEmployee
function viewEmployee(employee) {
    viewedEmployee = employee
    document.querySelector('.profile .content').style.display = 'flex'

    const badgesDiv = document.querySelector('.profile .content .top .badges')
    badgesDiv.innerHTML = ''

    if (employee.deactivated_by) {
        const deactivatedBadge = document.createElement('p')
        deactivatedBadge.innerHTML = 'Deactivated'
        deactivatedBadge.style.background = '#cc3448'
        badgesDiv.appendChild(deactivatedBadge)

        document.querySelector('.profile .content .top .options sl-menu .reactivate-btn').disabled = false
        document.querySelector('.profile .content .top .options sl-menu .deactivate-btn').disabled = true

    } else {
        document.querySelector('.profile .content .top .options sl-menu .reactivate-btn').disabled = true
        document.querySelector('.profile .content .top .options sl-menu .deactivate-btn').disabled = false
    }

    ipcRenderer.send('request-employee-type', employee.employee_type)
    ipcRenderer.once('respond-employee-type', (evt, arg) => {
        const badge = document.createElement('p')
        badge.innerHTML = arg.name
        badge.style.background = arg.color
        badgesDiv.appendChild(badge)
    })

    ipcRenderer.send('request-job-type', employee.job_type)
    ipcRenderer.once('respond-job-type', (evt, arg) => {
        const badge = document.createElement('p')
        badge.innerHTML = arg.name
        badge.style.background = arg.color
        badgesDiv.appendChild(badge)
    })

    document.querySelector('.profile .content .top sl-avatar').image = employee.image_url
    document.querySelector('.profile .content .info h2').innerHTML = `${employee.lname}, ${employee.fname}`

    document.querySelector('.profile .content .info p ').innerHTML = '...'
    ipcRenderer.send('request-employee-designation', employee.designation)
    ipcRenderer.once('respond-employee-designation', (evt, arg) => {
        document.querySelector('.profile .content .info p ').innerHTML = arg.name
    })

    document.querySelector('.profile .content .info .more-info .contact-number').innerHTML = `<sl-icon name="telephone"></sl-icon>${employee.contact_number}`

    const tenure = moment.duration(_moment().diff(moment(employee.hired_on)))
    document.querySelector('.profile .content .info .more-info .tenure').innerHTML = `<sl-icon name="clock"></sl-icon>${tenure.years()}y ${tenure.months()}m ${tenure.days()}d`
}

// search
document.querySelector('.list .header .search input').addEventListener('keyup', () => {
    const searchText = document.querySelector('.list .header .search input').value

    if (searchText) {
        ipcRenderer.send('request-employees-search-suggestions', searchText.toLowerCase())
    } else {
        const suggestions = document.querySelectorAll('.list .header .search .search-suggestion')

        suggestions.forEach(element => {
            document.querySelector('.list .header .search').removeChild(element)
        })
    }
})
ipcRenderer.on('respond-employees-search-suggestions', (evt, arg) => {
    if (arg.error) {
        console.log(arg.error.message)
    } else {

        const oldSuggestions = document.querySelectorAll('.list .header .search .search-suggestion')

        oldSuggestions.forEach(element => {
            document.querySelector('.list .header .search').removeChild(element)
        })

        const suggestions = Object.values(arg.result)
        suggestions.length = 5
        suggestions.forEach(employee => {
            
            const suggestion = document.createElement('a')
            suggestion.href = '#'
            suggestion.className = 'search-suggestion'
            suggestion.innerHTML = `${employee.lname}, ${employee.fname}`
            suggestion.addEventListener('click', () => {
                viewEmployee(employee)
            })

            document.querySelector('.list .header .search').appendChild(suggestion)
        })

    }
})

// search navigate through the search suggestions
document.querySelector('.list .header .search').addEventListener('keydown', (e) => {
    if (e.code === 'ArrowUp' && document.activeElement.previousElementSibling) {
        document.activeElement.previousElementSibling.focus()
    } else if (e.code === 'ArrowDown' && document.activeElement.nextElementSibling) {
        document.activeElement.nextElementSibling.focus()
    }
})

// show suggestions when search is focused
document.querySelector('.list .header .search').addEventListener('focusin', (e) => {
    const suggestions = document.querySelectorAll('.list .header .search .search-suggestion')
    suggestions.forEach(element => {
        element.hidden = false
    })
})

// hide suggestions when search is blured
document.addEventListener('click', (e) => {
    if (!document.querySelector('.list .header .search').contains(e.target)) {
        const suggestions = document.querySelectorAll('.list .header .search .search-suggestion')
        suggestions.forEach(element => {
            element.hidden = true
        })
    }
})

// add new employee
document.getElementById('new-employee-btn').addEventListener('click', () => {
    if (remote.getGlobal('sharedObj').user.permissions.add_new_employees) {

        document.querySelector('.loader').style.height = '100vh'
        setTimeout(() => {

            ipcRenderer.send('nav-to-new-employee')

        }, 1000);

    } else {
        showDialog({
            title: 'Restricted Access',
            message: 'Seems like you dont have the permission for this option.',
            posBtnText: 'Okay',
            posBtnFun: function () {
                /* none */
            }
        })
    }
})

// edit employee
document.querySelector('.profile .content .top .options sl-menu .edit-btn').addEventListener('click', (evt, arg) => {
    if (remote.getGlobal('sharedObj').user.permissions.modify_employees) {

        document.querySelector('.loader').style.height = '100vh'
        setTimeout(() => {

            ipcRenderer.send('nav-to-edit-employee', viewedEmployee)

        }, 1000);

    } else {
        showDialog({
            title: 'Restricted Access',
            message: 'Seems like you dont have the permission for this option.',
            posBtnText: 'Okay',
            posBtnFun: function () {
                /* none */
            }
        })
    }
})

// modify shift schedule
document.querySelector('.profile .content .top .options sl-menu .shift-schedule-btn').addEventListener('click', () => {
    if (remote.getGlobal('sharedObj').user.permissions.modify_employee_shifts) {

        document.querySelector('.loader').style.height = '100vh'
        setTimeout(() => {

            ipcRenderer.send('nav-to-employee-shifts', viewedEmployee.key)

        }, 1000);

    } else {
        showDialog({
            title: 'Restricted Access',
            message: 'Seems like you dont have the permission for this option.',
            posBtnText: 'Okay',
            posBtnFun: function () {
                /* none */
            }
        })
    }
})

// deactivate employee
document.querySelector('.profile .content .top .options sl-menu .deactivate-btn').addEventListener('click', (e) => {
    if (remote.getGlobal('sharedObj').user.permissions.deactivate_reactivate_employees) {
        
        if (!e.target.disabled) {
            
            showDialog({
                title: 'Confirm Employee Deactivation',
                message: 'Are you sure you want to deactivate this employee?',
                posBtnText: 'Confirm',
                posBtnFun: function () {

                    const task = ipcRenderer.sendSync('deactivate-employee', viewedEmployee.key)

                    if (task.result) {
                        showAlert('warning', 'Employee Deactivated')
                    } else {
                        showAlert('fail', 'Something went wrong while Deactivating Employee.')
                        console.log(task.error)
                    }

                },
                negBtnText: 'Cancel',
                negBtnFun: function () {

                }
            })

        }

    } else {
        showDialog({
            title: 'Restricted Access',
            message: 'Seems like you dont have the permission for this option.',
            posBtnText: 'Okay',
            posBtnFun: function () {
                /* none */
            }
        })
    }
})

// reactivate employee
document.querySelector('.profile .content .top .options sl-menu .reactivate-btn').addEventListener('click', (e) => {
    if (remote.getGlobal('sharedObj').user.permissions.deactivate_reactivate_employees) {

        if (!e.target.disabled) {

            showDialog({
                title: 'Confirm Employee Reactivation',
                message: 'Are you sure you want to reactivate this employee?',
                posBtnText: 'Confirm',
                posBtnFun: function () {

                    const task = ipcRenderer.sendSync('reactivate-employee', viewedEmployee.key)

                    if (task.result) {
                        showAlert('success', 'Employee Reactivated')
                    } else {
                        showAlert('fail', 'Something went wrong while Reactivating Employee.')
                        console.log(task.error)
                    }

                },
                negBtnText: 'Cancel',
                negBtnFun: function () {

                }
            })

        }

    } else {
        showDialog({
            title: 'Restricted Access',
            message: 'Seems like you dont have the permission for this option.',
            posBtnText: 'Okay',
            posBtnFun: function () {
                /* none */
            }
        })
    }
})

// view id dialog
document.querySelector('.profile .top .options sl-menu .view-id-btn').addEventListener('click', () => {
    document.querySelector('sl-dialog.id-dialog .front sl-avatar').image = viewedEmployee.image_url
    document.querySelector('sl-dialog.id-dialog .front h2').innerHTML = `${viewedEmployee.lname}, ${viewedEmployee.fname}`
    ipcRenderer.send('request-employee-designation', viewedEmployee.designation)
    ipcRenderer.once('respond-employee-designation', (evt, arg) => {
        document.querySelector('sl-dialog.id-dialog .front p').innerHTML = arg.name
    })
    
    qrcode.toCanvas(document.querySelector('sl-dialog.id-dialog .back .qr-code'), `employees/${viewedEmployee.key}`, (err) => {
        if (err) {
            console.log(err.message)
        }
    })
    document.querySelector('sl-dialog.id-dialog .back p').innerHTML = `<b>Phone</b> ${viewedEmployee.contact_number}`

    document.querySelector('sl-dialog.id-dialog').show()
})

// clear id dialog on hide
document.querySelector('sl-dialog.id-dialog').addEventListener('sl-after-hide', () => {
    document.querySelector('sl-dialog.id-dialog .front sl-avatar').image = ''
    document.querySelector('sl-dialog.id-dialog .front h2').innerHTML = ''
    document.querySelector('sl-dialog.id-dialog .front p').innerHTML = '...'

    const canvas = document.querySelector('sl-dialog.id-dialog .back .qr-code')
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
    document.querySelector('sl-dialog.id-dialog .back p').innerHTML = ''
})

// when employee is added
ipcRenderer.on('add-new-employee-result', (evt, arg) => {
    if (arg.dbResult) { showAlert('success', arg.dbResult) }
    if (arg.dbError) { showAlert('fail', arg.dbError) }
    if (arg.storageError) { showAlert('fail', arg.storageError) }
})

// when employee is updated
ipcRenderer.on('edit-employee-result', (evt, arg) => {
    if (arg.dbResult) { showAlert('success', arg.dbResult) }
    if (arg.dbError) { showAlert('fail', arg.dbError) }
    if (arg.storageError) { showAlert('fail', arg.storageError) }
})

setTimeout(() => {
    document.querySelector('.loader').style.height = '0'
}, 1000);