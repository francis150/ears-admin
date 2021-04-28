const electron = require('electron')
const {remote, ipcRenderer} = electron
const _moment = require('moment')

const currentWindow = remote.getCurrentWindow()
//currentWindow.openDevTools()

let 
totalHours = _moment.duration(),
totalLate = _moment.duration(),
totalAbsences = _moment.duration(),
totalEarlyOut = _moment.duration()

// search
document.querySelector('main .filters .employee-filter-wrapper .search input').addEventListener('keyup', () => {
    const searchText = document.querySelector('main .filters .employee-filter-wrapper .search input').value

    if (searchText) {
        ipcRenderer.send('request-employees-search-suggestions', searchText.toLowerCase())
    } else {
        const suggestions = document.querySelectorAll('main .filters .employee-filter-wrapper .search .search-suggestion')

        suggestions.forEach(element => {
            document.querySelector('main .filters .employee-filter-wrapper .search').removeChild(element)
        })
    }
})
ipcRenderer.on('respond-employees-search-suggestions', (evt, arg) => {
    if (arg.error) {
        console.log(arg.error.message)
    } else {

        const oldSuggestions = document.querySelectorAll('main .filters .employee-filter-wrapper .search .search-suggestion')

        oldSuggestions.forEach(element => {
            document.querySelector('main .filters .employee-filter-wrapper .search').removeChild(element)
        })

        const suggestions = Object.values(arg.result)
        suggestions.length = 5
        suggestions.forEach(employee => {

            const suggestion = document.createElement('a')
            suggestion.href = '#'
            suggestion.className = 'search-suggestion'
            suggestion.innerHTML = `${employee.lname}, ${employee.fname}`
            suggestion.addEventListener('click', () => {
                
                //clean ui
                document.querySelector('main .data .data-list .attendance-data').innerHTML = ''
                document.querySelector('main .data .summary .total-hours').innerHTML = '...'
                document.querySelector('main .data .summary .total-late').innerHTML = '...'
                document.querySelector('main .data .summary .total-absences').innerHTML = '...'
                document.querySelector('main .data .summary .total-early-out').innerHTML = '...'

                //reset variables
                totalHours = _moment.duration()
                totalLate = _moment.duration()
                totalAbsences = _moment.duration()
                totalEarlyOut = _moment.duration()

                document.querySelector('main .filters .employee-filter-wrapper .search input').value = `${employee.lname}, ${employee.fname}`

                ipcRenderer.send('request-employee-attendance-data', employee.key)

                const suggestions = document.querySelectorAll('main .filters .employee-filter-wrapper .search .search-suggestion')
                suggestions.forEach(element => {
                    element.hidden = true
                })

            })

            document.querySelector('main .filters .employee-filter-wrapper .search').appendChild(suggestion)
        })

    }
})

// search navigate through the search suggestions
document.querySelector('main .filters .employee-filter-wrapper .search').addEventListener('keydown', (e) => {
    if (e.code === 'ArrowUp' && document.activeElement.previousElementSibling) {
        document.activeElement.previousElementSibling.focus()
    } else if (e.code === 'ArrowDown' && document.activeElement.nextElementSibling) {
        document.activeElement.nextElementSibling.focus()
    }
})

// show suggestions when search is focused
document.querySelector('main .filters .employee-filter-wrapper .search').addEventListener('focusin', (e) => {
    const suggestions = document.querySelectorAll('main .filters .employee-filter-wrapper .search .search-suggestion')
    suggestions.forEach(element => {
        element.hidden = false
    })
})

// hide suggestions when search is blured
document.addEventListener('click', (e) => {
    if (!document.querySelector('main .filters .employee-filter-wrapper .search').contains(e.target)) {
        const suggestions = document.querySelectorAll('main .filters .employee-filter-wrapper .search .search-suggestion')
        suggestions.forEach(element => {
            element.hidden = true
        })
    }
})

// employee filter control
document.querySelector('main .filters .employee-filter-wrapper sl-checkbox').addEventListener('sl-change', (e) => {
    if (e.target.checked) {
        document.querySelector('main .data .summary').style.height = '200px'
        document.querySelector('main .filters .employee-filter-wrapper input').disabled = false
    } else {
        document.querySelector('main .data .summary').style.height = '0'
        document.querySelector('main .filters .employee-filter-wrapper input').disabled = true

        //clean ui
        document.querySelector('main .data .data-list .attendance-data').innerHTML = ''
        document.querySelector('main .data .summary .total-hours').innerHTML = '...'
        document.querySelector('main .data .summary .total-late').innerHTML = '...'
        document.querySelector('main .data .summary .total-absences').innerHTML = '...'
        document.querySelector('main .data .summary .total-early-out').innerHTML = '...'

        //reset variables
        totalHours = _moment.duration(),
        totalLate = _moment.duration(),
        totalAbsences = _moment.duration(),
        totalEarlyOut = _moment.duration()

        document.querySelector('main .filters .employee-filter-wrapper .search input').value = ''
    }
})

function showDetails(attendance) {
    document.querySelector('.attendance-details-dialog .date').innerHTML = `${_moment(attendance.date, 'DD-MM-YYYY').format('MMM DD, YYYY ddd')}`
    document.querySelector('.attendance-details-dialog .employee-image').image = attendance.employee_img_url
    document.querySelector('.attendance-details-dialog .employee-name').innerHTML = `${attendance.employee_lname}, ${attendance.employee_fname}`
    document.querySelector('.attendance-details-dialog .employee-designation').innerHTML = attendance.employee_designation
    document.querySelector('.attendance-details-dialog .branch-name').innerHTML = attendance.branch_name
    document.querySelector('.attendance-details-dialog .branch-description').innerHTML = attendance.branch_description
    document.querySelector('.attendance-details-dialog .designated-timein').innerHTML = _moment(attendance.shift.from, 'HH:mm').format('hh:mm a')
    document.querySelector('.attendance-details-dialog .designated-timeout').innerHTML = _moment(attendance.shift.to, 'HH:mm').format('hh:mm a')
    document.querySelector('.attendance-details-dialog .timein').innerHTML = _moment(attendance.timed_in, 'HH:mm').format('hh:mm a')
    document.querySelector('.attendance-details-dialog .timeout').innerHTML = _moment(attendance.timed_out, 'HH:mm').format('hh:mm a')
    
    if (_moment(attendance.timed_in, 'HH:mm').isAfter(_moment(attendance.shift.from, 'HH:mm'))) {
        //late 
        const late = _moment.duration(Math.abs(_moment(attendance.timed_in, 'HH:mm').diff(_moment(attendance.shift.from, 'HH:mm'))))
        document.querySelector('.attendance-details-dialog .late').innerHTML = `${late.hours()}h ${late.minutes()}m`
    } else {
        document.querySelector('.attendance-details-dialog .late').innerHTML = '0m'
    }

    if (_moment(attendance.timed_out, 'HH:mm').isBefore(_moment(attendance.shift.to, 'HH:mm'))) {
        //early out
        const earlyout = _moment.duration(Math.abs(_moment(attendance.timed_out, 'HH:mm').diff(_moment(attendance.shift.to, 'HH:mm'))))
        document.querySelector('.attendance-details-dialog .earlyout').innerHTML = `${earlyout.hours()}h ${earlyout.minutes()}m`
    } else {
        document.querySelector('.attendance-details-dialog .earlyout').innerHTML = '0m'
    }
    
    const a = _moment.duration(Math.abs(_moment(attendance.timed_in, 'HH:mm').diff(_moment(attendance.timed_out, 'HH:mm'))))
    document.querySelector('.attendance-details-dialog .total-hours').innerHTML = `${a.hours()}h ${a.minutes()}m`


    document.querySelector('.attendance-details-dialog').show()
}

document.querySelector('.attendance-details-dialog button').addEventListener('click', () => {
    document.querySelector('.attendance-details-dialog').hide()
})

document.querySelector('.attendance-details-dialog').addEventListener('sl-after-hide', () => {
    document.querySelector('.attendance-details-dialog .date').innerHTML = '...'
    document.querySelector('.attendance-details-dialog .employee-image').image = ''
    document.querySelector('.attendance-details-dialog .employee-name').innerHTML = '...'
    document.querySelector('.attendance-details-dialog .employee-designation').innerHTML = '...'
    document.querySelector('.attendance-details-dialog .branch-name').innerHTML = '...'
    document.querySelector('.attendance-details-dialog .branch-description').innerHTML = '...'
    document.querySelector('.attendance-details-dialog .designated-timein').innerHTML = '...'
    document.querySelector('.attendance-details-dialog .designated-timeout').innerHTML = '...'
    document.querySelector('.attendance-details-dialog .timein').innerHTML = '...'
    document.querySelector('.attendance-details-dialog .timeout').innerHTML = '...'
    document.querySelector('.attendance-details-dialog .late').innerHTML = '...'
    document.querySelector('.attendance-details-dialog .earlyout').innerHTML = '...'
    document.querySelector('.attendance-details-dialog .total-hours').innerHTML = '...'
})

// add data to list
ipcRenderer.on('add-employee-attendance-data', (evt, arg) => {
    const item = document.createElement('div')

    item.addEventListener('click', () => {
        showDetails(arg)
    })

    item.className = 'attendance'
    item.innerHTML = `<p class="date">${_moment(arg.date, 'DD-MM-YYYY').format('MMM DD, YYYY ddd')}</p>
                        <p class="name">${arg.employee_lname}, ${arg.employee_fname}</p>
                        <p class="branch">${arg.branch_name}</p>
                        <p class="time-in">${_moment(arg.timed_in, 'HH:mm').format('hh:mm a')}</p>
                        <p class="time-out">${_moment(arg.timed_out, 'HH:mm').format('hh:mm a')}</p>`

    document.querySelector('main .data .data-list .attendance-data').appendChild(item)


    totalHours = totalHours.add(_moment.duration(_moment(arg.timed_out, 'HH:mm').diff(_moment(arg.timed_in, 'HH:mm'))))
    document.querySelector('main .data .summary .total-hours').innerHTML = `${totalHours.hours()}<span>hrs</span> ${totalHours.minutes()}<span>mins</span>`


    if (_moment(arg.timed_in, 'HH:mm').isAfter(_moment(arg.shift.from, 'HH:mm'))) {
        // late
        const duration = _moment.duration(Math.abs(_moment(arg.shift.from, 'HH:mm').diff(_moment(arg.timed_in, 'HH:mm'))))
        totalLate = totalLate.add(duration)
        document.querySelector('main .data .summary .total-late').innerHTML = `${totalLate.asMinutes()}<span>mins</span>`
    } else {
        document.querySelector('main .data .summary .total-late').innerHTML = `0<span>hrs</span> 0<span>mins</span>`
    }

    if (_moment(arg.timed_out, 'HH:mm').isBefore(_moment(arg.shift.to, 'HH:mm'))) {
        totalEarlyOut = totalEarlyOut.add(_moment.duration(Math.abs(_moment(arg.shift.to, 'HH:mm').diff(_moment(arg.timed_out, 'HH:mm')))))
        document.querySelector('main .data .summary .total-early-out').innerHTML = `${totalEarlyOut.asMinutes()}<span>mins</span>`
    } else {
        document.querySelector('main .data .summary .total-early-out').innerHTML = `0<span>mins</span>`
    }

    document.querySelector('main .data .summary .total-absences').innerHTML = '0days'
})



setTimeout(() => {
    document.querySelector('.loader').style.height = '0'
}, 1000);