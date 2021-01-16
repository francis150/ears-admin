const electron = require('electron')
const {remote, ipcRenderer} = electron
const _moment = require('moment')

const currentWindow = remote.getCurrentWindow()
//currentWindow.openDevTools()

// load branches to dropdown
ipcRenderer.send('request-branches')
ipcRenderer.on('respond-branches', (evt, arg) => {
    const container = document.querySelector('main .list .header .input-element sl-menu .menu-items')
    container.innerHTML = ''

    Object.values(arg).forEach(branch => {
        const item = document.createElement('sl-menu-item')
        item.innerHTML = branch.name
        item.addEventListener('click', () => {
            document.querySelector('main .list .header .input-element input').value = branch.name

            // clean container
            document.querySelector('main .list .employee-list').innerHTML = ''

            // listen to that branch
            ipcRenderer.send('monitor-branch', branch.key)
        })

        container.appendChild(item)
    })
})

// when an employee times-in
ipcRenderer.on('add-employee-monitor', (evt, arg) => {
    const mainWrapper = document.createElement('div')
    mainWrapper.className = 'employee'
    mainWrapper.id = arg.employee_key

    const avatar = document.createElement('sl-avatar')
    avatar.image = arg.employee_img_url
    mainWrapper.appendChild(avatar)

    const textWrapper = document.createElement('div')
    textWrapper.className = 'texts-wrapper'
    mainWrapper.appendChild(textWrapper)

    const name = document.createElement('h2')
    name.innerHTML = `${arg.employee_fname} ${arg.employee_lname.charAt(0)}.`
    textWrapper.appendChild(name)

    const designation = document.createElement('p')
    designation.innerHTML = arg.employee_designation
    textWrapper.appendChild(designation)

    mainWrapper.addEventListener('click', (e) => {
        
        //clear profile
        document.querySelector('.profile .content').style.display = 'none'
        document.querySelector('.profile .content .top .badges').innerHTML = ''
        document.querySelector('.profile .content .top sl-avatar').image = ''
        document.querySelector('.profile .content .info h2').innerHTML = '...'
        document.querySelector('.profile .content .info p').innerHTML = '...'
        document.querySelector('.profile .content .info .more-info .contact-number').innerHTML = ''
        document.querySelector('.profile .content .info .more-info .tenure').innerHTML = ''

        ipcRenderer.send('request-employee', arg.employee_key)

    })

    document.querySelector('main .list .employee-list').appendChild(mainWrapper)

    // counter update
    const counter = document.querySelector('.list .header .counter-value');
    counter.innerHTML = parseInt(counter.innerHTML) + 1
})

// when an employee times-out
ipcRenderer.on('remove-employee-monitor', (evt, arg) => {
    const container = document.querySelector('main .list .employee-list')
    const subject = document.querySelector(`main .list .employee-list #${arg.employee_key}`)

    subject.style.animation = 'removeEmployee .2s ease'

    setTimeout(() => {
        container.removeChild(subject)

        // counter update
        const counter = document.querySelector('.list .header .counter-value');
        counter.innerHTML = parseInt(counter.innerHTML) - 1
    }, 200);
})

// view employee
let viewedEmployee
ipcRenderer.on('respond-employee', (evt, employee) => {
    viewedEmployee = employee
    document.querySelector('.profile .content').style.display = 'flex'

    const badgesDiv = document.querySelector('.profile .content .top .badges')
    badgesDiv.innerHTML = ''

    if (employee.deactivated_by) {
        const deactivatedBadge = document.createElement('p')
        deactivatedBadge.innerHTML = 'Deactivated'
        deactivatedBadge.style.background = '#cc3448'
        badgesDiv.appendChild(deactivatedBadge)

        //document.querySelector('.profile .content .top .options sl-menu .reactivate-btn').disabled = false
        //document.querySelector('.profile .content .top .options sl-menu .deactivate-btn').disabled = true

    } else {
        //document.querySelector('.profile .content .top .options sl-menu .reactivate-btn').disabled = true
        //document.querySelector('.profile .content .top .options sl-menu .deactivate-btn').disabled = false
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
})

// manage branches
document.querySelector('main .list .header .input-element sl-menu .manage-branches').addEventListener('click', () => {
    ipcRenderer.send('show-branch-manager')
})


setTimeout(() => {
    document.querySelector('.loader').style.height = '0'
}, 1000);