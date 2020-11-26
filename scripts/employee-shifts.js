
const electron = require('electron')
const { remote, ipcRenderer } = electron

const _moment = require('moment')

const currentWindow = remote.getCurrentWindow()
currentWindow.openDevTools()

// receive & load subject employee key
ipcRenderer.once('load-subject-employee', (evt, key) => {
    ipcRenderer.send('request-employee', key)
})

// receive employee 
ipcRenderer.on('respond-employee', (evt, employee) => {

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


    const mondayContainer = document.querySelector('.shifts .monday .shifts-wrapper')
    mondayContainer.innerHTML = ''
    let mondayH = 0, mondayM = 0
    Object.values(employee.shifts.monday).forEach(shift => {
        const item = document.createElement('div')
        item.className = 'shift'
        item.innerHTML = `<h6>${shift.branch_name}</h6><p>${_moment(shift.from, 'HH:mm').format('hh:mm a')} - ${_moment(shift.to, 'HH:mm').format('hh:mm a')}</p>`
        mondayContainer.appendChild(item)

        const tenure = _moment.duration(_moment(shift.to, 'HH:mm').diff(_moment(shift.from, 'HH:mm')))
        mondayH += tenure.hours()
        mondayM += tenure.minutes()
        document.querySelector('.shifts .monday .head label span').innerHTML = `${mondayH}h ${mondayM}m`
    })

    const tuesdayContainer = document.querySelector('.shifts .tuesday .shifts-wrapper')
    tuesdayContainer.innerHTML = ''
    let tuesdayH = 0, tuesdayM = 0
    Object.values(employee.shifts.tuesday).forEach(shift => {
        const item = document.createElement('div')
        item.className = 'shift'
        item.innerHTML = `<h6>${shift.branch_name}</h6><p>${_moment(shift.from, 'HH:mm').format('hh:mm a')} - ${_moment(shift.to, 'HH:mm').format('hh:mm a')}</p>`
        tuesdayContainer.appendChild(item)

        const tenure = _moment.duration(_moment(shift.to, 'HH:mm').diff(_moment(shift.from, 'HH:mm')))
        tuesdayH += tenure.hours()
        tuesdayM += tenure.minutes()
        document.querySelector('.shifts .tuesday .head label span').innerHTML = `${tuesdayH}h ${tuesdayM}m`
    })

    const wednesdayContainer = document.querySelector('.shifts .wednesday .shifts-wrapper')
    wednesdayContainer.innerHTML = ''
    let wednesdayH = 0, wednesdayM = 0
    Object.values(employee.shifts.wednesday).forEach(shift => {
        const item = document.createElement('div')
        item.className = 'shift'
        item.innerHTML = `<h6>${shift.branch_name}</h6><p>${_moment(shift.from, 'HH:mm').format('hh:mm a')} - ${_moment(shift.to, 'HH:mm').format('hh:mm a')}</p>`
        wednesdayContainer.appendChild(item)

        const tenure = _moment.duration(_moment(shift.to, 'HH:mm').diff(_moment(shift.from, 'HH:mm')))
        wednesdayH += tenure.hours()
        wednesdayM += tenure.minutes()
        document.querySelector('.shifts .wednesday .head label span').innerHTML = `${wednesdayH}h ${wednesdayM}m`
    })

    const thursdayContainer = document.querySelector('.shifts .thursday .shifts-wrapper')
    thursdayContainer.innerHTML = ''
    let thursdayH = 0, thursdayM = 0
    Object.values(employee.shifts.thursday).forEach(shift => {
        const item = document.createElement('div')
        item.className = 'shift'
        item.innerHTML = `<h6>${shift.branch_name}</h6><p>${_moment(shift.from, 'HH:mm').format('hh:mm a')} - ${_moment(shift.to, 'HH:mm').format('hh:mm a')}</p>`
        thursdayContainer.appendChild(item)

        const tenure = _moment.duration(_moment(shift.to, 'HH:mm').diff(_moment(shift.from, 'HH:mm')))
        thursdayH += tenure.hours()
        thursdayM += tenure.minutes()
        document.querySelector('.shifts .thursday .head label span').innerHTML = `${thursdayH}h ${thursdayM}m`
    })

    const fridayContainer = document.querySelector('.shifts .friday .shifts-wrapper')
    fridayContainer.innerHTML = ''
    let fridayH = 0, fridayM = 0
    Object.values(employee.shifts.friday).forEach(shift => {
        const item = document.createElement('div')
        item.className = 'shift'
        item.innerHTML = `<h6>${shift.branch_name}</h6><p>${_moment(shift.from, 'HH:mm').format('hh:mm a')} - ${_moment(shift.to, 'HH:mm').format('hh:mm a')}</p>`
        fridayContainer.appendChild(item)

        const tenure = _moment.duration(_moment(shift.to, 'HH:mm').diff(_moment(shift.from, 'HH:mm')))
        fridayH += tenure.hours()
        fridayM += tenure.minutes()
        document.querySelector('.shifts .friday .head label span').innerHTML = `${fridayH}h ${fridayM}m`
    })

    const saturdayContainer = document.querySelector('.shifts .saturday .shifts-wrapper')
    saturdayContainer.innerHTML = ''
    let saturdayH = 0, saturdayM = 0
    Object.values(employee.shifts.saturday).forEach(shift => {
        const item = document.createElement('div')
        item.className = 'shift'
        item.innerHTML = `<h6>${shift.branch_name}</h6><p>${_moment(shift.from, 'HH:mm').format('hh:mm a')} - ${_moment(shift.to, 'HH:mm').format('hh:mm a')}</p>`
        saturdayContainer.appendChild(item)

        const tenure = _moment.duration(_moment(shift.to, 'HH:mm').diff(_moment(shift.from, 'HH:mm')))
        saturdayH += tenure.hours()
        saturdayM += tenure.minutes()
        document.querySelector('.shifts .saturday .head label span').innerHTML = `${saturdayH}h ${saturdayM}m`
    })

    const sundayContainer = document.querySelector('.shifts .sunday .shifts-wrapper')
    sundayContainer.innerHTML = ''
    let sundayH = 0, sundayM = 0
    Object.values(employee.shifts.sunday).forEach(shift => {
        const item = document.createElement('div')
        item.className = 'shift'
        item.innerHTML = `<h6>${shift.branch_name}</h6><p>${_moment(shift.from, 'HH:mm').format('hh:mm a')} - ${_moment(shift.to, 'HH:mm').format('hh:mm a')}</p>`
        sundayContainer.appendChild(item)

        const tenure = _moment.duration(_moment(shift.to, 'HH:mm').diff(_moment(shift.from, 'HH:mm')))
        sundayH += tenure.hours()
        sundayM += tenure.minutes()
        document.querySelector('.shifts .sunday .head label span').innerHTML = `${sundayH}h ${sundayM}m`
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
document.querySelector('sl-dialog.add-shift form').addEventListener('submit', (e) => {
    e.preventDefault()
    
    
})

// manage branches
document.querySelector('sl-dialog.add-shift form .manage-branches-btn').addEventListener('click', () => {
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