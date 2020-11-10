function showAlert(type, message) {
    const container = document.querySelector('.alert-wrapper')

    let iconName
    switch (type) {
        case 'neutral':
            iconName = 'info-circle'
            break;
        case 'success':
            iconName = 'check2-circle'
            break;
        case 'warning':
            iconName = 'exclamation-triangle'
            break;
        case 'fail':
            iconName = 'exclamation-octagon'
            break;
        default:
            iconName = 'info-circle'
            break;
    }

    let alert = document.createElement('div')
    alert.className = 'alert'
    alert.innerHTML = `<sl-icon name="${iconName}"></sl-icon><p>${message}</p>`

    const closeBtn = document.createElement('sl-icon-button')
    closeBtn.name = 'x'

    // on close
    closeBtn.addEventListener('click', () => {
        if (alert) {
            container.removeChild(alert)
            alert = null
            currentHeight = getComputedStyle(container).height.replace('px', '')
            container.style.height = (parseInt(currentHeight, 10) - 51) + "px"
        }
    })

    alert.appendChild(closeBtn)

    
    currentHeight = getComputedStyle(container).height.replace('px', '')
    container.style.height = (parseInt(currentHeight, 10) + 51) + "px"

    setTimeout(() => {
        container.appendChild(alert)

        setTimeout(() => {
            if (alert) {
                container.removeChild(alert)
                alert = null
                currentHeight = getComputedStyle(container).height.replace('px', '')
                container.style.height = (parseInt(currentHeight, 10) - 51) + "px"
            }
        }, 5000);
    }, 300);
}