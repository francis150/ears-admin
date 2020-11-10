
const moment = require('moment')


/* footer -> time */
function updateTime() {

    const text = document.querySelector('footer .right .time-text')
    let format = 'hh:mm A'

    text.addEventListener('mouseenter', () => { format = 'hh:mm A | ddd MMM DD YYYY' })
    text.addEventListener('mouseleave', () => { format = 'hh:mm A' })

    setInterval(() => {
        text.innerHTML = moment().format(format)
    }, 1000);

}
updateTime()

/* listen to internet connection status */
function updateConnectionStatus() {

    const icon = document.createElement('sl-icon')
    const tooltip = document.createElement('sl-tooltip')
    icon.name = navigator.onLine ? 'wifi' : 'wifi-off'
    tooltip.content = navigator.onLine ? 'Internet Connected!' : 'Internet Disconnected.'
    document.querySelector('footer').style.background = navigator.onLine ? '#726eff' : '#f92d48'

    tooltip.appendChild(icon)
    document.querySelector('footer .right').appendChild(tooltip)

    window.addEventListener('online', () => {
        icon.name = navigator.onLine ? 'wifi' : 'wifi-off'
        tooltip.content = navigator.onLine ? 'Internet Connected!' : 'Internet Disconnected.'
        document.querySelector('footer').style.background = navigator.onLine ? '#726eff' : '#f92d48'
    })
    window.addEventListener('offline', () => {
        icon.name = navigator.onLine ? 'wifi' : 'wifi-off'
        tooltip.content = navigator.onLine ? 'Internet Connected!' : 'Internet Disconnected.'
        document.querySelector('footer').style.background = navigator.onLine ? '#726eff' : '#f92d48'
    })

}
updateConnectionStatus()