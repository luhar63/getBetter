
const log = require('electron-log');
const { createMoodsWindow } = require('./windowManger')

let moodsWindow;
function onSuspendOrLock() {
    log.info('System: suspend or lock')
    // if (!breakPlanner.isPaused) {
    //     pausedForSuspendOrLock = true
    //     pauseBreaks(1)
    //     updateTray()
    // }
}

function onResumeOrUnlock() {
    log.info('System: resume or unlock')
    // if (pausedForSuspendOrLock) {
    //     pausedForSuspendOrLock = false
    //     resumeBreaks(false)
    // } else if (breakPlanner.isPaused) {
    //     // corrrect the planner for the time spent in suspend
    //     breakPlanner.correctScheduler()
    // }
    // updateTray()
    createMoodsWindow();
}


function initPowerMonitoring() {
    const electron = require('electron')
    electron.powerMonitor.on('suspend', onSuspendOrLock)
    electron.powerMonitor.on('lock-screen', onSuspendOrLock)
    electron.powerMonitor.on('resume', onResumeOrUnlock)
    electron.powerMonitor.on('unlock-screen', onResumeOrUnlock)
}

module.exports = { initPowerMonitoring, moodsWindow };