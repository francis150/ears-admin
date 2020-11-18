const electron = require('electron')
const {remote, ipcRenderer} = electron

const currentWindow = remote.getCurrentWindow()
currentWindow.openDevTools()



/* NOTE USERS */
/* load all users */
ipcRenderer.send('user-accounts-get-all-users')
ipcRenderer.on('users-value-changed', (evt, usersObj) => {
    document.getElementById('users-list-contents').innerHTML = ''
    const users = Object.values(usersObj)

    users.forEach(user => {

        const userDiv = document.createElement('div')
        userDiv.className = 'user'

        const userImage = document.createElement('sl-avatar')
        userImage.className = 'users-list-user-image'
        userImage.image = user.image_url
        //userImage.style.border = user.deactivated_by ? 'solid 2px #f92d48' : user.is_active === 1 ? 'solid 2px #726eff' : 'none'
        userDiv.appendChild(userImage)

        const textsDiv = document.createElement('div')
        textsDiv.className = 'texts'
        userDiv.appendChild(textsDiv)

        const userName = document.createElement('p')
        userName.className = 'name'
        userName.innerHTML = user.lname + ', ' + user.fname
        textsDiv.appendChild(userName)

        const lowerText = document.createElement('div')
        lowerText.className = 'lower-text'
        textsDiv.appendChild(lowerText)

        const userDescription = document.createElement('p')
        userDescription.className = 'description'
        userDescription.innerHTML = user.description
        lowerText.appendChild(userDescription)

        const badges = document.createElement('div')
        badges.className = 'badges'
        lowerText.appendChild(badges)

        if (user.deactivated_by) {
            const badge = document.createElement('sl-badge')
            badge.className = 'badge-danger'
            badge.innerHTML = 'Deactivated'
            badges.appendChild(badge)
        }

        if (user.is_active) {
            const badge = document.createElement('sl-badge')
            badge.className = 'badge-primary'
            badge.innerHTML = 'Active'
            badges.appendChild(badge)
        }

        userDiv.addEventListener('click', () => {
            viewUser(user)
        })

        document.getElementById('users-list-contents').appendChild(userDiv)

    })
})

/* search -> navigate through the search suggestions */
document.querySelector('.search').addEventListener('keydown', (e) => {
    if (e.code === 'ArrowUp' && document.activeElement.previousElementSibling) {
        document.activeElement.previousElementSibling.focus()
    } else if (e.code === 'ArrowDown' && document.activeElement.nextElementSibling) {
        document.activeElement.nextElementSibling.focus()
    }
})

/* search -> on keyup */
document.getElementById('users-search').addEventListener('keyup', (e) => {
    const searchText = document.getElementById('users-search').value

    if (searchText) {
        ipcRenderer.send('users-search-get-suggestions', searchText.toLowerCase())
    } else {
        const suggestions = document.querySelectorAll('.search-suggestion')

        suggestions.forEach(element => {
            document.querySelector('.search').removeChild(element)
        })
    }

})
ipcRenderer.on('users-search-get-suggestions-result', (evt, arg) => {
    if (arg.error) {
        console.log(arg.error.message)
    } else {

        const oldSuggestions = document.querySelectorAll('.search-suggestion')

        oldSuggestions.forEach(element => {
            document.querySelector('.search').removeChild(element)
        })

        const suggestions = Object.values(arg.result)
        suggestions.length = 5
        suggestions.forEach(user => {

            const suggestion = document.createElement('a')
            suggestion.href = '#'
            suggestion.className = 'search-suggestion'
            suggestion.innerHTML = user.lname + ', ' + user.fname

            suggestion.addEventListener('click', () => {
                viewUser(user)
            })

            document.querySelector('.search').appendChild(suggestion)

        })

    }
})

/* search -> show suggestions when search is focused */
document.querySelector('.search').addEventListener('focusin', (e) => {

    const suggestions = document.querySelectorAll('.search-suggestion')
    suggestions.forEach(element => {
        element.hidden = false
    })

})

/* search -> hide suggestions when search is blured */
document.addEventListener('click', (e) => {
    if (!document.querySelector('.search').contains(e.target)) {
        const suggestions = document.querySelectorAll('.search-suggestion')
        suggestions.forEach(element => {
            element.hidden = true
        })
    }
})

/* user profile -> load */
function viewUser(user) {
    viewedUser = user

    document.querySelector('.profile-badges').innerHTML = ''

    if (user.deactivated_by) {
        const badge = document.createElement('sl-badge')
        badge.type = 'danger'
        badge.className = 'danger-badge'
        badge.innerHTML = 'Deactivated'
        document.querySelector('.profile-badges').appendChild(badge)
    }

    if (user.is_active) {
        const badge = document.createElement('sl-badge')
        badge.type = 'primary'
        badge.className = 'primary-badge'
        badge.innerHTML = 'Active'
        document.querySelector('.profile-badges').appendChild(badge)
    }



    document.getElementById('deactivate-viewed-user-btn').disabled = remote.getGlobal('sharedObj').user.key === user.key || user.deactivated_by ? true : false
    document.getElementById('reactivate-viewed-user-btn').disabled = user.deactivated_by ? false : true

    document.getElementById('user-profile-content').style.display = 'flex'
    document.getElementById('viewed-user-image').image = user.image_url
    document.getElementById('viewed-user-name').innerHTML = user.lname + ', ' + user.fname
    document.getElementById('viewed-user-description').innerHTML = user.description

    document.querySelector('#profile-realtime-monitor-per').style.textDecoration = user.permissions.realtime_monitor ? 'none' : 'line-through'
    document.querySelector('#profile-realtime-monitor-per sl-icon').name = user.permissions.realtime_monitor ? 'check' : 'x'

    document.querySelector('#profile-employees-per').style.textDecoration = user.permissions.employee_records ? 'none' : 'line-through'
    document.querySelector('#profile-employees-per sl-icon').name = user.permissions.employee_records ? 'check' : 'x'

    document.querySelector('#profile-add-new-employee-per').style.textDecoration = user.permissions.add_new_employees ? 'none' : 'line-through'
    document.querySelector('#profile-add-new-employee-per sl-icon').name = user.permissions.add_new_employees ? 'check' : 'x'

    document.querySelector('#profile-modify-employee-record-per').style.textDecoration = user.permissions.modify_employees ? 'none' : 'line-through'
    document.querySelector('#profile-modify-employee-record-per sl-icon').name = user.permissions.modify_employees ? 'check' : 'x'

    document.querySelector('#profile-modify-employee-shift-schedule-per').style.textDecoration = user.permissions.modify_employee_shifts ? 'none' : 'line-through'
    document.querySelector('#profile-modify-employee-shift-schedule-per sl-icon').name = user.permissions.modify_employee_shifts ? 'check' : 'x'

    document.querySelector('#profile-deactivate-reactivate-employees-per').style.textDecoration = user.permissions.deactivate_reactivate_employees ? 'none' : 'line-through'
    document.querySelector('#profile-deactivate-reactivate-employees-per sl-icon').name = user.permissions.deactivate_reactivate_employees ? 'check' : 'x'
    
    document.querySelector('#profile-reports-per').style.textDecoration = user.permissions.reports ? 'none' : 'line-through'
    document.querySelector('#profile-reports-per sl-icon').name = user.permissions.reports ? 'check' : 'x'

    document.querySelector('#profile-print-report-documents-per').style.textDecoration = user.permissions.print_report_documents ? 'none' : 'line-through'
    document.querySelector('#profile-print-report-documents-per sl-icon').name = user.permissions.print_report_documents ? 'check' : 'x'

    document.querySelector('#profile-user-accounts-per').style.textDecoration = user.permissions.user_accounts ? 'none' : 'line-through'
    document.querySelector('#profile-user-accounts-per sl-icon').name = user.permissions.user_accounts ? 'check' : 'x'

    document.querySelector('#profile-create-new-user-per').style.textDecoration = user.permissions.create_new_user_accounts ? 'none' : 'line-through'
    document.querySelector('#profile-create-new-user-per sl-icon').name = user.permissions.create_new_user_accounts ? 'check' : 'x'

    document.querySelector('#profile-modify-user-information-per').style.textDecoration = user.permissions.modify_user_info ? 'none' : 'line-through'
    document.querySelector('#profile-modify-user-information-per sl-icon').name = user.permissions.modify_user_info ? 'check' : 'x'

    document.querySelector('#profile-deactivate-reactivate-user-per').style.textDecoration = user.permissions.deactivate_reactivate_users ? 'none' : 'line-through'
    document.querySelector('#profile-deactivate-reactivate-user-per sl-icon').name = user.permissions.deactivate_reactivate_users ? 'check' : 'x'

    document.querySelector('#profile-history-log-per').style.textDecoration = user.permissions.history_log ? 'none' : 'line-through'
    document.querySelector('#profile-history-log-per sl-icon').name = user.permissions.history_log ? 'check' : 'x'

    document.querySelector('#profile-settings-per').style.textDecoration = user.permissions.settings ? 'none' : 'line-through'
    document.querySelector('#profile-settings-per sl-icon').name = user.permissions.settings ? 'check' : 'x'



}

/* add new user btn */
document.getElementById('new-user-btn').addEventListener('click', () => {
    if (remote.getGlobal('sharedObj').user.permissions.create_new_user_accounts) {
        
        document.querySelector('.loader').style.height = '100vh'
        setTimeout(() => {

            ipcRenderer.send('nav-to-new-user')

        }, 1000);

    } else {
        showDialog({
            title: 'Restricted Access',
            message: 'Seems like you dont have the permission for this option.',
            posBtnText: 'Okay',
            posBtnFun: function() {
                /* none */
            }
        })
    }
})

/* edit viewed user */
document.getElementById('edit-viewed-user-btn').addEventListener('click', () => {
    document.querySelector('.loader').style.height = '100vh'
    setTimeout(() => {

        ipcRenderer.send('nav-to-edit-user', viewedUser)

    }, 1000);
})

/* deactivate user */
document.getElementById('deactivate-viewed-user-btn').addEventListener('click', (e) => {

    if (remote.getGlobal('sharedObj').user.permissions.deactivate_reactivate_users) {

        if (!e.target.disabled) {
            showDialog({
                title: 'Confirm User Deactivation',
                message: 'Are you sure you want to deactivate this user?',
                posBtnText: 'Confirm',
                posBtnFun: function () {

                    const task = ipcRenderer.sendSync('deactivate-user', viewedUser.key)

                    if (task.result) {
                        showAlert('warning', 'User Deactivated.')
                    } else {
                        showAlert('fail', 'Something went wrong while Deactivating User.')
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

/* re-activate user */
document.getElementById('reactivate-viewed-user-btn').addEventListener('click', (e) => {

    if(remote.getGlobal('sharedObj').user.permissions.deactivate_reactivate_users) {

        if (!e.target.disabled) {

            showDialog({
                title: 'Confirm User Reactivation',
                message: 'Are you sure you want to reactivate this user?',
                posBtnText: 'Confirm',
                posBtnFun: function () {

                    const task = ipcRenderer.sendSync('reactivate-user', viewedUser.key)

                    if (task.result) {
                        showAlert('warning', 'User Reactivated.')
                    } else {
                        showAlert('fail', 'Something went wrong while Reactivating User.')
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

ipcRenderer.on('add-new-user-result', (evt, arg) => {
    if (arg.dbResult) { showAlert('success', arg.dbResult) }
    if (arg.dbError) { showAlert('fail', arg.dbError) }
    if (arg.storageError) { showAlert('fail', arg.storageError) }
})

ipcRenderer.on('edit-user-result', (evt, arg) => {
    if (arg.dbResult) { showAlert('success', arg.dbResult) }
    if (arg.dbError) { showAlert('fail', arg.dbError) }
    if (arg.storageError) { showAlert('fail', arg.storageError) }
})



setTimeout(() => {
    document.querySelector('.loader').style.height = '0'
}, 1000);