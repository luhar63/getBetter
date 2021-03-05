function displaysX(displayID = -1, width = 1024, fullscreen = false) {
    const electron = require('electron')
    let theScreen
    if (displayID === -1) {
        theScreen = electron.screen.getDisplayNearestPoint(electron.screen.getCursorScreenPoint())
    } else if (displayID >= numberOfDisplays() || displayID < 0) {
        // Graceful handling of invalid displayID
        log.warn('getBetter: invalid displayID to displaysX')
        theScreen = electron.screen.getDisplayNearestPoint(electron.screen.getCursorScreenPoint())
    } else {
        const screens = electron.screen.getAllDisplays()
        theScreen = screens[displayID]
    }
    const bounds = theScreen.bounds
    if (fullscreen) {
        return Math.ceil(bounds.x)
    } else {
        return Math.ceil(bounds.x + ((bounds.width - width) / 2))
    }
}

function displaysY(displayID = -1, height = 768, fullscreen = false) {
    const electron = require('electron')
    let theScreen
    if (displayID === -1) {
        theScreen = electron.screen.getDisplayNearestPoint(electron.screen.getCursorScreenPoint())
    } else if (displayID >= numberOfDisplays()) {
        // Graceful handling of invalid displayID
        log.warn('getBetter: invalid displayID to displaysY')
        theScreen = electron.screen.getDisplayNearestPoint(electron.screen.getCursorScreenPoint())
    } else {
        const screens = electron.screen.getAllDisplays()
        theScreen = screens[displayID]
    }
    const bounds = theScreen.bounds
    if (fullscreen) {
        return Math.ceil(bounds.y)
    } else {
        return Math.ceil(bounds.y + ((bounds.height - height) / 2))
    }
}

module.exports = { displaysX, displaysY };