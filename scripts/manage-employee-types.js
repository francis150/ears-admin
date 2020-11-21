const electron = require('electron')
const { remote, ipcRenderer } = electron

// const currentWindow = remote.getCurrentWindow()
// currentWindow.openDevTools()

// add form on submit
document.querySelector('form').addEventListener('submit', (e) => {
    e.preventDefault()
    const color = document.querySelector('form sl-color-picker')
    const name = document.querySelector('form input')
    const helpText = document.querySelector('form small')
    helpText.innerHTML = ''

    if (color.value === '#ffffffff') {
        document.querySelector('form sl-tooltip.for-color-picker').open = true
        helpText.innerHTML = 'Please choose a color for the new employee type.'
    } else if (ipcRenderer.sendSync('employee-type-color-exists', color.value)) {
        document.querySelector('form sl-tooltip.for-color-picker').open = true
        helpText.innerHTML = 'Looks like this color is already used.'
    } else if (name.value === '') {
        document.querySelector('form sl-tooltip.for-name').open = true
        helpText.innerHTML = 'Please enter an Employee Type Name.'
    } else if (ipcRenderer.sendSync('employee-type-name-exists', name.value)) {
        document.querySelector('form sl-tooltip.for-name').open = true
        helpText.innerHTML = 'Looks like this employee type already exists.'
    } else {
        if (ipcRenderer.sendSync('new-employee-type', { color: color.value, name: name.value })) {
            document.querySelector('form').reset()
            color.value = '#ffffffff'
        } else {
            helpText.innerHTML = 'Something went wrong.'
        }
    }
})

// request employee types list
ipcRenderer.send('request-employee-types')
ipcRenderer.on('respond-employee-types', (evt, arg) => {
    const container = document.querySelector('.list')
    container.innerHTML = ''

    Object.values(arg).forEach(type => {
        const wrapper = document.createElement('div')
        wrapper.className = 'item'

        const color = document.createElement('div')
        color.className = 'color'
        color.style.background = type.color
        wrapper.appendChild(color)

        const name = document.createElement('h2')
        name.innerHTML = type.name
        wrapper.appendChild(name)

        const tooltip = document.createElement('sl-tooltip')
        tooltip.content = 'Remove'
        wrapper.appendChild(tooltip)

        const removeBtn = document.createElement('sl-icon-button')
        removeBtn.name = 'trash'
        removeBtn.addEventListener('click', () => {

            document.querySelector('form small').innerHTML = ''
            const employeesListed = ipcRenderer.sendSync('employee-type-employees-listed', type.key)

            if (employeesListed > 0) {
                document.querySelector('form small').innerHTML = `There are currently ${employeesListed} employee record(s) with this employee type. Please modify those records and try again.`
            } else {
                ipcRenderer.send('remove-employee-type', type.key)
            }

        })
        tooltip.appendChild(removeBtn)

        container.appendChild(wrapper)
    })
})

