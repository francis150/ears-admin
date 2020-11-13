
/* load user details permision */
function loadUserInfo() {
    const currentUser = remote.getGlobal('sharedObj').user

    /* img, name, and description */
    document.getElementById('current-user-image').image = currentUser.image_url
    document.getElementById('current-user-name').innerHTML = currentUser.fname + ' ' + currentUser.lname
    document.getElementById('current-user-title').innerHTML = currentUser.description

    /* menu items permision */
    document.getElementById('nav-realtime-monitor').dataset.disabled = !currentUser.permissions.realtime_monitor
    document.getElementById('nav-employees').dataset.disabled = !currentUser.permissions.employee_records
    document.getElementById('nav-add-new-employee').dataset.disabled = !currentUser.permissions.add_new_employees
    document.getElementById('nav-reports').dataset.disabled = !currentUser.permissions.reports
    document.getElementById('nav-user-accounts').dataset.disabled = !currentUser.permissions.user_accounts
    document.getElementById('nav-create-new-user-account').dataset.disabled = !currentUser.permissions.create_new_user_accounts
    document.getElementById('nav-history-log').dataset.disabled = !currentUser.permissions.history_log
    document.getElementById('nav-settings').dataset.disabled = !currentUser.permissions.settings

    /* NAVS HERE */
    document.getElementById('nav-realtime-monitor').addEventListener('click', () => {
        ipcRenderer.send('nav-to-realtime-monitor')
    })

    document.getElementById('nav-employees').addEventListener('click', () => {
        ipcRenderer.send('nav-to-employees')
    })

    document.getElementById('nav-add-new-employee').addEventListener('click', () => {   
        ipcRenderer.send('nav-to-new-employee')
    })

    document.getElementById('nav-reports').addEventListener('click', () => {
        ipcRenderer.send('nav-to-reports')
    })

    document.getElementById('nav-user-accounts').addEventListener('click', () => {
        ipcRenderer.send('nav-to-user-accounts')
    })

    document.getElementById('nav-create-new-user-account').addEventListener('click', () => {
        
        ipcRenderer.send('nav-to-new-user')
        
    })

    document.getElementById('nav-history-log').addEventListener('click', () => {
        ipcRenderer.send('nav-to-history-log')
    })

    document.getElementById('nav-settings').addEventListener('click', () => {
        ipcRenderer.send('nav-to-settings')
    })

}
loadUserInfo()

/* show menu */
document.getElementById('menu-btn').addEventListener('click', () => {
    const menu = document.querySelector('.nav-menu')
    if (menu.open) { menu.hide() }
    else { menu.show() }
})
