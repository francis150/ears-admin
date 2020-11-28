
const electron = require('electron')
const { remote, ipcRenderer } = electron

const _moment = require('moment')

const currentWindow = remote.getCurrentWindow()
currentWindow.openDevTools()

// receive & load subject employee key
ipcRenderer.once('load-subject-employee', (evt, key) => {
    ipcRenderer.send('request-employee', key)
})

let employeeKey

// receive employee 
ipcRenderer.on('respond-employee', (evt, employee) => {
    employeeKey = employee.key

    const badgesDiv = document.querySelector('.profile .top .badges')
    badgesDiv.innerHTML = ''

    if (employee.deactivated_by) {
        const deactivatedBadge = document.createElement('p')
        deactivatedBadge.innerHTML = 'Deactivated'
        deactivatedBadge.style.background = '#cc3448'
        badgesDiv.appendChild(deactivatedBadge)
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

    document.querySelector('.profile .top sl-avatar').image = employee.image_url

    document.querySelector('.profile .info h2').innerHTML = `${employee.lname}, ${employee.fname}`
    ipcRenderer.send('request-employee-designation', employee.designation)
    ipcRenderer.once('respond-employee-designation', (evt, arg) => {
        document.querySelector('.profile .info p').innerHTML = arg.name
    })

    
    if (employee.shifts) {

        document.querySelectorAll('.shifts .day .head span').forEach(element => {
            element.innerHTML = '0h 0m'
        })
        
        const mondayContainer = document.querySelector('.shifts .monday .shifts-wrapper')
        mondayContainer.innerHTML = ''
        if (employee.shifts.monday) {
            
            let mondayH = 0, mondayM = 0
            Object.values(employee.shifts.monday).forEach(shift => {
                const item = document.createElement('div')
                item.className = 'shift'
                item.innerHTML = `<h6>${shift.branch_name}</h6><p>${_moment(shift.from, 'HH:mm').format('hh:mm a')} - ${_moment(shift.to, 'HH:mm').format('hh:mm a')}</p>`

                item.addEventListener('click', () => { viewShift(shift) })

                mondayContainer.appendChild(item)

                const tenure = _moment.duration(_moment(shift.to, 'HH:mm').diff(_moment(shift.from, 'HH:mm')))
                mondayH += tenure.hours()
                mondayM += tenure.minutes()
                document.querySelector('.shifts .monday .head label span').innerHTML = `${mondayH}h ${mondayM}m`
            })
        }
        
        const tuesdayContainer = document.querySelector('.shifts .tuesday .shifts-wrapper')
        tuesdayContainer.innerHTML = ''
        if (employee.shifts.tuesday) {
            
            let tuesdayH = 0, tuesdayM = 0
            Object.values(employee.shifts.tuesday).forEach(shift => {
                const item = document.createElement('div')
                item.className = 'shift'
                item.innerHTML = `<h6>${shift.branch_name}</h6><p>${_moment(shift.from, 'HH:mm').format('hh:mm a')} - ${_moment(shift.to, 'HH:mm').format('hh:mm a')}</p>`
                item.addEventListener('click', () => { viewShift(shift) })
                tuesdayContainer.appendChild(item)

                const tenure = _moment.duration(_moment(shift.to, 'HH:mm').diff(_moment(shift.from, 'HH:mm')))
                tuesdayH += tenure.hours()
                tuesdayM += tenure.minutes()
                document.querySelector('.shifts .tuesday .head label span').innerHTML = `${tuesdayH}h ${tuesdayM}m`
            })
        }

        const wednesdayContainer = document.querySelector('.shifts .wednesday .shifts-wrapper')
        wednesdayContainer.innerHTML = ''
        if (employee.shifts.wednesday) {
            
            let wednesdayH = 0, wednesdayM = 0
            Object.values(employee.shifts.wednesday).forEach(shift => {
                const item = document.createElement('div')
                item.className = 'shift'
                item.innerHTML = `<h6>${shift.branch_name}</h6><p>${_moment(shift.from, 'HH:mm').format('hh:mm a')} - ${_moment(shift.to, 'HH:mm').format('hh:mm a')}</p>`
                item.addEventListener('click', () => { viewShift(shift) })
                wednesdayContainer.appendChild(item)

                const tenure = _moment.duration(_moment(shift.to, 'HH:mm').diff(_moment(shift.from, 'HH:mm')))
                wednesdayH += tenure.hours()
                wednesdayM += tenure.minutes()
                document.querySelector('.shifts .wednesday .head label span').innerHTML = `${wednesdayH}h ${wednesdayM}m`
            })
        }

        const thursdayContainer = document.querySelector('.shifts .thursday .shifts-wrapper')
        thursdayContainer.innerHTML = ''
        if (employee.shifts.thursday) {
            
            let thursdayH = 0, thursdayM = 0
            Object.values(employee.shifts.thursday).forEach(shift => {
                const item = document.createElement('div')
                item.className = 'shift'
                item.innerHTML = `<h6>${shift.branch_name}</h6><p>${_moment(shift.from, 'HH:mm').format('hh:mm a')} - ${_moment(shift.to, 'HH:mm').format('hh:mm a')}</p>`
                item.addEventListener('click', () => { viewShift(shift) })
                thursdayContainer.appendChild(item)

                const tenure = _moment.duration(_moment(shift.to, 'HH:mm').diff(_moment(shift.from, 'HH:mm')))
                thursdayH += tenure.hours()
                thursdayM += tenure.minutes()
                document.querySelector('.shifts .thursday .head label span').innerHTML = `${thursdayH}h ${thursdayM}m`
            })
        }

        const fridayContainer = document.querySelector('.shifts .friday .shifts-wrapper')
        fridayContainer.innerHTML = ''
        if (employee.shifts.friday) {
            
            let fridayH = 0, fridayM = 0
            Object.values(employee.shifts.friday).forEach(shift => {
                const item = document.createElement('div')
                item.className = 'shift'
                item.innerHTML = `<h6>${shift.branch_name}</h6><p>${_moment(shift.from, 'HH:mm').format('hh:mm a')} - ${_moment(shift.to, 'HH:mm').format('hh:mm a')}</p>`
                item.addEventListener('click', () => { viewShift(shift) })
                fridayContainer.appendChild(item)

                const tenure = _moment.duration(_moment(shift.to, 'HH:mm').diff(_moment(shift.from, 'HH:mm')))
                fridayH += tenure.hours()
                fridayM += tenure.minutes()
                document.querySelector('.shifts .friday .head label span').innerHTML = `${fridayH}h ${fridayM}m`
            })
        }

        const saturdayContainer = document.querySelector('.shifts .saturday .shifts-wrapper')
        saturdayContainer.innerHTML = ''
        if (employee.shifts.saturday) {
            
            let saturdayH = 0, saturdayM = 0
            Object.values(employee.shifts.saturday).forEach(shift => {
                const item = document.createElement('div')
                item.className = 'shift'
                item.innerHTML = `<h6>${shift.branch_name}</h6><p>${_moment(shift.from, 'HH:mm').format('hh:mm a')} - ${_moment(shift.to, 'HH:mm').format('hh:mm a')}</p>`
                item.addEventListener('click', () => { viewShift(shift) })
                saturdayContainer.appendChild(item)

                const tenure = _moment.duration(_moment(shift.to, 'HH:mm').diff(_moment(shift.from, 'HH:mm')))
                saturdayH += tenure.hours()
                saturdayM += tenure.minutes()
                document.querySelector('.shifts .saturday .head label span').innerHTML = `${saturdayH}h ${saturdayM}m`
            })
        }

        const sundayContainer = document.querySelector('.shifts .sunday .shifts-wrapper')
        sundayContainer.innerHTML = ''
        if (employee.shifts.sunday) {
            
            let sundayH = 0, sundayM = 0
            Object.values(employee.shifts.sunday).forEach(shift => {
                const item = document.createElement('div')
                item.className = 'shift'
                item.innerHTML = `<h6>${shift.branch_name}</h6><p>${_moment(shift.from, 'HH:mm').format('hh:mm a')} - ${_moment(shift.to, 'HH:mm').format('hh:mm a')}</p>`
                item.addEventListener('click', () => { viewShift(shift) })
                sundayContainer.appendChild(item)

                const tenure = _moment.duration(_moment(shift.to, 'HH:mm').diff(_moment(shift.from, 'HH:mm')))
                sundayH += tenure.hours()
                sundayM += tenure.minutes()
                document.querySelector('.shifts .sunday .head label span').innerHTML = `${sundayH}h ${sundayM}m`
            })
        }
    }
})

// view shift details
let viewedShift
function viewShift(shift) {
    viewedShift = shift

    const form = document.querySelector('sl-dialog.shift-detail form')
    const dialog = document.querySelector('sl-dialog.shift-detail')

    form.branch.value = shift.branch_name
    form.branch.dataset.value = shift.branch_key
    form.from.value = shift.from
    form.to.value = shift.to

    dialog.show()
}

// load branches to add-shift form dropdown
ipcRenderer.send('request-branches')
ipcRenderer.on('respond-branches', (evt, arg) => {
    const addShiftContainer = document.querySelector('sl-dialog.add-shift form sl-menu[data-for=branch] .menu-items')
    addShiftContainer.innerHTML = ''

    Object.values(arg).forEach(branch => {
        
        const item = document.createElement('sl-menu-item')
        item.value = branch.key
        item.innerHTML = branch.name
        item.addEventListener('click', () => {
            document.querySelector(`sl-dialog.add-shift form input[name=${item.parentElement.parentElement.dataset.for}]`).value = branch.name
            document.querySelector(`sl-dialog.add-shift form input[name=${item.parentElement.parentElement.dataset.for}]`).dataset.value = branch.key
        })
        addShiftContainer.appendChild(item)

    })

    const shiftDetailContainer = document.querySelector('sl-dialog.shift-detail form sl-menu[data-for=branch] .menu-items')
    shiftDetailContainer.innerHTML = ''

    Object.values(arg).forEach(branch => {

        const item = document.createElement('sl-menu-item')
        item.value = branch.key
        item.innerHTML = branch.name
        item.addEventListener('click', () => {
            document.querySelector(`sl-dialog.shift-detail form input[name=${item.parentElement.parentElement.dataset.for}]`).value = branch.name
            document.querySelector(`sl-dialog.shift-detail form input[name=${item.parentElement.parentElement.dataset.for}]`).dataset.value = branch.key
        })
        shiftDetailContainer.appendChild(item)

    })
})

// add a shift
document.querySelectorAll('.shifts .day .head sl-icon-button').forEach(element => {
    element.addEventListener('click', () => {
        document.querySelector('sl-dialog.add-shift').show()
        document.querySelector('sl-dialog.add-shift').dataset.for = element.dataset.for
    })
})

// add shift form submit
const addForm = document.querySelector('sl-dialog.add-shift form')
addForm.addEventListener('submit', (e) => {
    e.preventDefault()

    addForm.branch.parentElement.parentElement.dataset.invalid = false
    addForm.branch.parentElement.nextElementSibling.innerHTML = ''
    addForm.from.parentElement.dataset.invalid = false
    addForm.from.nextElementSibling.innerHTML = ''
    addForm.to.parentElement.dataset.invalid = false
    addForm.to.nextElementSibling.innerHTML = ''

    if (addForm.branch.value === '') {
        addForm.branch.select()
        addForm.branch.parentElement.parentElement.dataset.invalid = true
        addForm.branch.parentElement.nextElementSibling.innerHTML = 'This field cant be empty.'
    } else if (addForm.from.value === '') {
        addForm.from.select()
        addForm.from.parentElement.dataset.invalid = true
        addForm.from.nextElementSibling.innerHTML = 'This field cant be empty.'
    } else if (addForm.to.value === '') {
        addForm.to.select()
        addForm.to.parentElement.dataset.invalid = true
        addForm.to.nextElementSibling.innerHTML = 'This field cant be empty.'
    } else if (_moment(addForm.to.value, 'HH:mm').isSameOrBefore(_moment(addForm.from.value, 'HH:mm'))) {
        addForm.from.select()
        addForm.from.parentElement.dataset.invalid = true
        addForm.to.parentElement.dataset.invalid = true
        addForm.from.nextElementSibling.innerHTML = 'The "to" time is the same or before the "from" time.'
    } else {
        
        const forPush = {
            employeeKEY: employeeKey,
            shift : {
                day: e.target.parentElement.dataset.for,
                branch_key: addForm.branch.dataset.value,
                branch_name: addForm.branch.value,
                from: addForm.from.value,
                to: addForm.to.value
            }
        }

        ipcRenderer.send('add-shift', forPush)
        addForm.reset()
        addForm.parentElement.hide()
        
    }
})
ipcRenderer.on('add-shift-result', (evt, arg) => {
    if (arg) {
        showAlert('success','A shift was added.')
    } else {
        showAlert('fail', 'Something went wrong while adding shift.')
    }
})

// add shift form reset
addForm.addEventListener('reset', () => {
    addForm.branch.dataset.value = ''
})

// delete shift detail
document.querySelector('sl-dialog.shift-detail form .buttons .delete-btn').addEventListener('click', () => {
    document.querySelector('sl-dialog.shift-detail').hide()
    showDialog({
        title: 'Confirm Delete',
        message: `Are you sure you want to delete this shift?`,
        posBtnText: 'Delete',
        posBtnFun: function () {
            ipcRenderer.send('remove-shift', `${employeeKey}/shifts/${viewedShift.day}/${viewedShift.key}`)
        },
        negBtnText: 'Cancel',
        negBtnFun: function () {

        }
    })
})
ipcRenderer.on('remove-shift-result', (evt, arg) => {
    if (arg) {
        showAlert('success', 'A shift was deleted.')
    } else {
        showAlert('fail', 'Something went wrong while deleting shift.')
    }
})

// save shift detail
document.querySelector('sl-dialog.shift-detail form').addEventListener('submit', (e) => {
    e.preventDefault()

    const form = e.target

    document.querySelector('sl-dialog.shift-detail').hide()
    showDialog({
        title: 'Confirm Changes',
        message: `Are you sure you want to commit changes to this shift?`,
        posBtnText: 'Confirm',
        posBtnFun: function () {
            const arg = {
                path: `${employeeKey}/shifts/${viewedShift.day}/${viewedShift.key}`,
                updates: {
                    branch_key: form.branch.dataset.value,
                    branch_name: form.branch.value,
                    from: form.from.value,
                    to: form.to.value
                }
            }
            ipcRenderer.send('edit-shift', arg)
        },
        negBtnText: 'Cancel',
        negBtnFun: function () {

        }
    })
})
ipcRenderer.on('edit-shift-result', (evt, arg) => {
    if (arg) {
        showAlert('success', 'A shift was edited.')
    } else {
        showAlert('fail', 'Something went wrong while editing shift.')
    }
})

// reset shift detail
document.querySelector('sl-dialog.shift-detail form .buttons .reset-btn').addEventListener('click', () => {
    viewShift(viewedShift)
})

// clear shift detail dialog on hide
document.querySelector('sl-dialog.shift-detail').addEventListener('sl-after-hide', (e) => {
    if (e.target.tagName === 'sl-dialog') {
        document.querySelector('sl-dialog.shift-detail form').reset()
        document.querySelector('sl-dialog.shift-detail').dataset.for = ''
    }
})

// add shift dialog manage branches
document.querySelector('sl-dialog.add-shift form .manage-branches-btn').addEventListener('click', () => {
    ipcRenderer.send('show-branch-manager')
})

// shift detail dialog manage branhes
document.querySelector('sl-dialog.shift-detail form .manage-branches-btn').addEventListener('click', () => {
    ipcRenderer.send('show-branch-manager')
})

// main back button 
document.querySelector('header .back-btn').addEventListener('click', () => {
    document.querySelector('.loader').style.height = '100vh'
    setTimeout(() => {

        ipcRenderer.send('nav-back')

    }, 1000);
})


setTimeout(() => {
    document.querySelector('.loader').style.height = '0'
}, 1000);