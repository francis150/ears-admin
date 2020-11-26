
const electron = require('electron')
const { remote, ipcRenderer } = electron

const currentWindow = remote.getCurrentWindow()
currentWindow.openDevTools()

// add form on submit
const form = document.querySelector('form')
form.addEventListener('submit', (e) => {
    e.preventDefault()

    form.name.parentElement.dataset.invalid = false
    form.name.nextElementSibling.innerHTML = ''
    form.description.parentElement.dataset.invalid = false
    form.description.nextElementSibling.innerHTML = 'You can use location, owner info, or description.'

    if (form.name.value === '') {
        form.name.select()
        form.name.parentElement.dataset.invalid = true
        form.name.nextElementSibling.innerHTML = 'This field cant be empty.'
    } else if (ipcRenderer.sendSync('branch-name-exists', form.name.value)) {
        form.name.select()
        form.name.parentElement.dataset.invalid = true
        form.name.nextElementSibling.innerHTML = 'Looks like this branch name already exists.'
    } else if (form.description.value === '') {
        form.description.select()
        form.description.parentElement.dataset.invalid = true
        form.description.nextElementSibling.innerHTML = 'This field cant be empty.'
    } else {
        if (ipcRenderer.sendSync('new-branch', {name: form.name.value, description: form.description.value})) {
            form.reset()
        } else {
            form.name.parentElement.dataset.invalid = true
            form.name.nextElementSibling.innerHTML = 'Something went wrong.'
            form.description.parentElement.dataset.invalid = true
            form.description.nextElementSibling.innerHTML = 'Something went wrong.'
        }
    }
})

// request branches list
ipcRenderer.send('request-branches')
ipcRenderer.on('respond-branches', (evt, arg) => {
    const container = document.querySelector('.list')
    container.innerHTML = ''

    Object.values(arg).forEach(branch => {
        
        const mainDiv = document.createElement('div')
        mainDiv.className = 'branch'

        const infoDiv = document.createElement('div')
        infoDiv.className = 'info'
        mainDiv.appendChild(infoDiv)

        const name = document.createElement('h2')
        name.innerHTML = branch.name
        infoDiv.appendChild(name)

        const description = document.createElement('p')
        description.innerHTML = branch.description
        infoDiv.appendChild(description)

        const removeTooltip = document.createElement('sl-tooltip')
        removeTooltip.content = 'Remove'
        mainDiv.appendChild(removeTooltip)

        const removeBtn = document.createElement('sl-icon-button')
        removeBtn.name = 'trash'
        removeBtn.addEventListener('click', () => {
            const shiftsAssigned = ipcRenderer.sendSync('branch-shifts-listed', branch.key)

            if (shiftsAssigned > 0) {
                showDialog({
                    title: `${shiftsAssigned} Shift(s) Assigned`,
                    message: `There are still ${shiftsAssigned} employee shift(s) assigned in this branch. If you proceed all of those shifts will be <b>deleted</b>.`,
                    posBtnText: 'Delete Shifts',
                    posBtnFun: function () {

                        ipcRenderer.send('remove-shifts-under-branch', branch.key)

                        showDialog({
                            title: 'Confirm Delete',
                            message: `Are you sure you want to delete the ${branch.name}?`,
                            posBtnText: 'Delete',
                            posBtnFun: function () {
                                ipcRenderer.send('remove-branch', branch.key)
                            },
                            negBtnText: 'Cancel',
                            negBtnFun: function () {

                            }
                        })

                    },
                    negBtnText: 'Cancel',
                    negBtnFun: function () {

                    }
                })
            } else {
                showDialog({
                    title: 'Confirm Delete',
                    message: `Are you sure you want to delete the ${branch.name}?`,
                    posBtnText: 'Delete',
                    posBtnFun: function () {
                        ipcRenderer.send('remove-branch', branch.key)
                    },
                    negBtnText: 'Cancel',
                    negBtnFun: function () {
                        
                    }
                })
            }
        })
        removeTooltip.appendChild(removeBtn)

        container.appendChild(mainDiv)

    })
})

