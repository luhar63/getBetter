
document.querySelectorAll('button').forEach(button => {
    if (!eventsAttached) {
        button.onclick = () => {
            ipcRenderer.send('save-setting', 'isFirstRun', false)
            switch (button.getAttribute('data-location')) {
                case 'tutorial':
                    shell.openExternal('https://hovancik.net/stretchly/features')
                    break
                case 'preferences':
                    ipcRenderer.send('open-preferences')
                    break
                default:
                    break
            }
            remote.getCurrentWindow().close()
        }
    }
})