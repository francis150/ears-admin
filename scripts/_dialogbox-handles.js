function showDialog(props) {
    // props = {title, message, posBtnText, posBtnFun, negBtnText, negBtnFun}
    const dialog = document.createElement('sl-dialog')
    dialog.label = props.title
    dialog.className = 'dialog-box'

    const body = document.createElement('p')
    body.innerHTML = props.message
    dialog.appendChild(body)

    const footer = document.createElement('div')
    footer.slot = 'footer'
    footer.className = 'buttons'
    dialog.appendChild(footer)

    const positiveBtn = document.createElement('button')
    positiveBtn.className = 'positive-btn'
    positiveBtn.innerHTML = props.posBtnText
    positiveBtn.addEventListener('click', () => {
        props.posBtnFun()
        dialog.hide()
    })
    footer.appendChild(positiveBtn)

    if (props.negBtnText) {

        const negativeBtn = document.createElement('button')
        negativeBtn.className = 'negative-btn'
        negativeBtn.innerHTML = props.negBtnText
        negativeBtn.addEventListener('click', () => {
            props.negBtnFun()
            dialog.hide()
        })
        footer.appendChild(negativeBtn)
        
    }

    dialog.addEventListener('slAfterHide', () => {dialog = null})

    document.body.appendChild(dialog)
    dialog.show()
}