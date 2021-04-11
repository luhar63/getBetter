const semver = require('semver');

function numberOfDisplays() {
    const electron = require('electron')
    return electron.screen.getAllDisplays().length
}

function displaysX(displayID = -1, width = 1024, fullscreen = false, last = false) {
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
    if (last) {
        if (fullscreen) {
            return Math.ceil(bounds.x + (bounds.width - width))
        } else {
            return Math.ceil(bounds.x + ((bounds.width - width)))
        }
    }
    if (fullscreen) {
        return Math.ceil(bounds.x)
    } else {
        return Math.ceil(bounds.x + ((bounds.width - width) / 2))
    }
}

function displaysY(displayID = -1, height = 768, fullscreen = false, last = false) {
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

    if (last) {
        if (fullscreen) {
            return Math.ceil(bounds.y + (bounds.height - height));
        } else {
            return Math.ceil(bounds.y + ((bounds.height - height)));
        }
    }
    if (fullscreen) {
        return Math.ceil(bounds.y)
    } else {
        return Math.ceil(bounds.y + ((bounds.height - height) / 2))
    }
}

const formatTimeRemaining = function (milliseconds, i18next = require('i18next')) {
    const seconds = Math.ceil(milliseconds / 1000.0)
    const minutes = Math.ceil(seconds / 60.0)
    const hours = Math.ceil(minutes / 60.0)

    if (seconds < 60) {
        return i18next.t('utils.secondsRemaining', { seconds: seconds })
    }

    if (seconds >= 60 && minutes < 60) {
        if (seconds === 60) {
            return i18next.t('utils.aboutMinutesRemaining', { minutes: 2 })
        }
        return i18next.t('utils.aboutMinutesRemaining', { minutes: minutes })
    }

    if (minutes >= 60) {
        if (minutes % 60 === 0) {
            return i18next.t('utils.aboutHoursRemaining', { hours: hours })
        }
        return i18next.t('utils.aboutHoursMinutesRemaining',
            { minutes: minutes - (hours - 1) * 60, hours: hours - 1 })
    }
    return 'Unknown time remaining'
}

const formatTimeIn = function (milliseconds, i18next = require('i18next')) {
    const seconds = Math.ceil(milliseconds / 1000.0)
    const minutes = Math.ceil(seconds / 60.0)
    const hours = Math.ceil(minutes / 60.0)

    if (seconds < 60) {
        return i18next.t('utils.inSeconds', { seconds: seconds })
    }

    if (seconds >= 60 && minutes < 60) {
        if (seconds === 60) {
            return i18next.t('utils.inAboutMinutes', { minutes: 1 })
        }
        return i18next.t('utils.inAboutMinutes', { minutes: minutes })
    }

    if (minutes >= 60) {
        if (minutes % 60 === 0) {
            return i18next.t('utils.inAboutHours', { hours: hours })
        } else {
            return i18next.t('utils.inAboutHoursMinutes',
                { minutes: minutes - (hours - 1) * 60, hours: hours - 1 })
        }
    }
    return 'in unknown time'
}

// does not consider `postponesLimit`
function canPostpone(postpone, passedPercent, postponePercent) {
    return postpone && passedPercent <= postponePercent
}

// does not consider `postponesLimit`
function canSkip(strictMode, postpone, passedPercent, postponePercent) {
    return !((postpone && passedPercent <= postponePercent) || strictMode)
}

function formatKeyboardShortcut(keyboardShortcut) {
    return keyboardShortcut.replace('Or', '/').replace('+', ' + ')
}

function shouldShowNotificationTitle(platform, systemVersion) {
    if (platform === 'win32' && semver.gte(semver.coerce(systemVersion), '10.0.19042')) {
        return false
    }
    if (platform === 'darwin' && semver.gte(semver.coerce(systemVersion), '10.16.0')) {
        return false
    }
    return true
}


function displaysWidth(displayID = -1) {
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
    return Math.ceil(bounds.width)
}

function displaysHeight(displayID = -1) {
    const electron = require('electron')
    let theScreen
    if (displayID === -1) {
        theScreen = electron.screen.getDisplayNearestPoint(electron.screen.getCursorScreenPoint())
    } else if (displayID >= numberOfDisplays()) {
        // Graceful handling of invalid displayID
        log.warn('Stretchly: invalid displayID to displaysY')
        theScreen = electron.screen.getDisplayNearestPoint(electron.screen.getCursorScreenPoint())
    } else {
        const screens = electron.screen.getAllDisplays()
        theScreen = screens[displayID]
    }
    const bounds = theScreen.bounds
    return Math.ceil(bounds.height)
}


module.exports = {
    formatTimeRemaining,
    formatTimeIn,
    canPostpone,
    canSkip,
    formatKeyboardShortcut,
    shouldShowNotificationTitle,
    displaysX, displaysY,
    displaysWidth,
    displaysHeight
}
