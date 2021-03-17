const { app, BrowserWindow, nativeTheme, Menu, Tray, ipcMain, dialog, globalShortcut } = require('electron');
const log = require('electron-log');
const i18next = require('i18next')
const Backend = require('i18next-node-fs-backend')
// const { BrowserWindow } = require('electron').remote
const path = require('path');

const { createWelcomeWindow } = require('./js/windowManger')


const { initPowerMonitoring } = require('./js/powermanagement');

process.on('uncaughtException', (err, _) => {
  log.error(err)
  const dialogOpts = {
    type: 'error',
    title: 'getBetter',
    message: 'An error occured while running getBetter and it will now quit. To report the issue, click Report.',
    buttons: ['close']
  }
  dialog.showMessageBox(dialogOpts).then((returnValue) => {

    app.quit()
  })
})

function startI18next() {
  i18next
    .use(Backend)
    .init({
      lng: settings.get('language'),
      fallbackLng: 'en',
      debug: false,
      backend: {
        loadPath: path.join(__dirname, '/locales/{{lng}}.json'),
        jsonIndent: 2
      }
    }, function (err, t) {
      if (err) {
        console.log(err.stack)
      }
      if (appIcon) {
        updateTray()
      }
    })
}

i18next.on('languageChanged', function (lng) {
  if (appIcon) {
    updateTray()
  }
});

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

let breakWins;
let settings;
let breakIdeas;
let nextIdea = null;
let processWin = null;
let welcomeWin = null;
let appIcon = null;

app.setAppUserModelId('gameOfMinds.getbetter')

const AppSettings = require('./js/settings');
const Utils = require('./js/utils');
const BreaksPlanner = require('./js/breaksPlanner')
const IdeasLoader = require('./js/ideasLoader')
const AppIcon = require('./js/appIcon')
// const Command = require('./js/commands')

const gotTheLock = app.requestSingleInstanceLock()
console.log("got the lock", gotTheLock);
// if (!gotTheLock) {
//   console.log('Stretchly command instance: started\n')
//   // const args = process.argv.slice(app.isPackaged ? 1 : 2)
//   // const cmd = new Command(args, app.getVersion())
//   // cmd.runOrForward()
//   console.log("inside");
//   app.quit()
// }

nativeTheme.on('updated', function theThemeHasChanged() {
  appIcon.setImage(trayIconPath())
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
// app.on('ready', createWindow);
app.on('ready', startProcessWin);
app.on('ready', loadSettings);
app.on('ready', initPowerMonitoring);
app.on('ready', createTrayIcon);


// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  //Not quiting the app 
  // if (process.platform !== 'darwin') {
  //   app.quit();
  // }
});

// app.on('activate', () => {
//   // On OS X it's common to re-create a window in the app when the
//   // dock icon is clicked and there are no other windows open.
//   if (BrowserWindow.getAllWindows().length === 0) {
//     createWelcomeWindow();
//   }
// });

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

function loadSettings() {
  const dir = app.getPath('userData');
  const settingsFile = `${dir}/config.json`;
  settings = new AppSettings(settingsFile);
  startI18next()
  breakPlanner = new BreaksPlanner(settings)
  breakPlanner.nextBreak() // plan first break
  // breakPlanner.on('startMicrobreakNotification', () => { startMicrobreakNotification() })
  breakPlanner.on('startBreakNotification', () => { debugger; startBreakNotification() })
  // breakPlanner.on('startMicrobreak', () => { startMicrobreak() })
  // breakPlanner.on('finishMicrobreak', (shouldPlaySound) => { finishMicrobreak(shouldPlaySound) })
  breakPlanner.on('startBreak', () => { debugger; startBreak() })
  breakPlanner.on('finishBreak', (shouldPlaySound) => { finishBreak(shouldPlaySound) })
  breakPlanner.on('resumeBreaks', () => { resumeBreaks() })
  breakPlanner.on('updateToolTip', function () {
    // updateTray()
  })
  createWelcomeWindow();
}



// function createMoodsWindow() {
//   const modalPath = path.join('file://', __dirname, '../screens/moods.html')
//   if (window) {
//     window.loadURL(modalPath);
//   } else {
//     moodsWindow = createWindowPrototype(modalPath);
//   }
// }


function startProcessWin() {
  const modalPath = path.join('file://', __dirname, '/screens/process.html')
  processWin = new BrowserWindow({
    width: "300px",
    height: "200px",
    show: true,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true
    }
  })
  processWin.webContents.openDevTools();
  processWin.loadURL(modalPath)
  // processWin.once('ready-to-show', () => {
  //   planVersionCheck()
  // })
}

function showNotification(text) {
  processWin.webContents.send('showNotification', {
    text: text,
    silent: settings.get('silentNotifications')
  })
}
ipcMain.on('play-sound', function (event, sound) {
  processWin.webContents.send('playSound', sound, settings.get('volume'))
})



ipcMain.on('postpone-break', function (event, shouldPlaySound) {
  postponeBreak()
})

function closeWindows(windowArray) {
  for (let i = windowArray.length - 1; i >= 0; i--) {
    windowArray[i].hide()
    windowArray[i].close()
  }
  return null
}


ipcMain.on('finish-break', function (event, shouldPlaySound) {
  finishBreak(shouldPlaySound)
})

function numberOfDisplays() {
  const electron = require('electron')
  return electron.screen.getAllDisplays().length
}

function loadIdeas() {
  let breakIdeasData;
  let microbreakIdeasData;
  if (settings.get('useIdeasFromSettings')) {
    breakIdeasData = settings.get('breakIdeas')
    // microbreakIdeasData = settings.get('microbreakIdeas')
  } else {
    breakIdeasData = require('./js/defaultBreakIdeas')
    // microbreakIdeasData = require('./utils/defaultMicrobreakIdeas')
  }
  breakIdeas = new IdeasLoader(breakIdeasData).ideas()
  // microbreakIdeas = new IdeasLoader(microbreakIdeasData).ideas()
}

function startBreakNotification() {
  showNotification(i18next.t('main.breakIn', { seconds: settings.get('breakNotificationInterval') / 1000 }));
  log.info('getBetter: showing Long Break notification')
  breakPlanner.nextBreakAfterNotification()
  // updateTray()
}

function startBreak() {
  if (!breakIdeas) {
    loadIdeas()
  }
  if (breakWins) {
    log.warn('getBetter: Long Break already running, not starting Long Break')
    return
  }

  const startTime = Date.now()
  const breakDuration = settings.get('breakDuration')
  const strictMode = settings.get('breakStrictMode')
  const postponesLimit = settings.get('breakPostponesLimit')
  const postponableDurationPercent = settings.get('breakPostponableDurationPercent')
  const postponable = settings.get('breakPostpone') &&
    breakPlanner.postponesNumber < postponesLimit && postponesLimit > 0

  if (!strictMode || postponable) {
    globalShortcut.register(settings.get('endBreakShortcut'), () => {
      const passedPercent = (Date.now() - startTime) / breakDuration * 100
      if (Utils.canPostpone(postponable, passedPercent, postponableDurationPercent)) {
        postponeBreak()
      } else if (Utils.canSkip(strictMode, postponable, passedPercent, postponableDurationPercent)) {
        finishBreak(false)
      }
    })
  }

  const modalPath = path.join('file://', __dirname, '/screens/break.html')
  breakWins = []

  const defaultNextIdea = settings.get('ideas') ? breakIdeas.randomElement : ['', '']
  const idea = nextIdea ? (nextIdea.map((val, index) => val || defaultNextIdea[index])) : defaultNextIdea
  nextIdea = null

  if (settings.get('breakStartSoundPlaying') && !settings.get('silentNotifications')) {
    processWin.webContents.send('playSound', settings.get('audio'), settings.get('volume'))
  }

  for (let localDisplayId = 0; localDisplayId < numberOfDisplays(); localDisplayId++) {
    const windowOptions = {
      width: Number.parseInt(Utils.displaysWidth(localDisplayId) * settings.get('breakWindowWidth')),
      height: Number.parseInt(Utils.displaysHeight(localDisplayId) * settings.get('breakWindowHeight')),
      autoHideMenuBar: true,
      icon: windowIconPath(),
      resizable: false,
      frame: false,
      show: false,
      transparent: settings.get('transparentMode'),
      backgroundColor: calculateBackgroundColor(),
      skipTaskbar: true,
      focusable: false,
      title: 'getBetter',
      alwaysOnTop: true,
      webPreferences: {
        nodeIntegration: true,
        enableRemoteModule: true
      }
    };


    if (settings.get('fullscreen') && process.platform !== 'darwin') {
      windowOptions.width = Utils.displaysWidth(localDisplayId)
      windowOptions.height = Utils.displaysHeight(localDisplayId)
      windowOptions.x = Utils.displaysX(localDisplayId, 0, true)
      windowOptions.y = Utils.displaysY(localDisplayId, 0, true)
    } else if (!(settings.get('fullscreen') && process.platform === 'win32')) {
      windowOptions.x = Utils.displaysX(localDisplayId, windowOptions.width, false)
      windowOptions.y = Utils.displaysY(localDisplayId, windowOptions.height, false)
    }

    let breakWinLocal = new BrowserWindow(windowOptions)
    // console.log(breakWinLocal);
    // breakWinLocal.webContents.openDevTools();
    // seems to help with multiple-displays problems
    breakWinLocal.setSize(windowOptions.width, windowOptions.height)
    // breakWinLocal.webContents.openDevTools()
    breakWinLocal.once('ready-to-show', () => {
      breakWinLocal.showInactive()
      log.info(`getBetter: showing window ${localDisplayId + 1} of ${numberOfDisplays()}`)
      if (process.platform === 'darwin') {
        breakWinLocal.setKiosk(settings.get('fullscreen'))
      }
      if (localDisplayId === 0) {
        breakPlanner.emit('breakStarted', true)
        log.info('getBetter: starting Mini Break')
      }
      breakWinLocal.webContents.send('breakIdea', idea)
      breakWinLocal.webContents.send('progress', startTime,
        breakDuration, strictMode, postponable, postponableDurationPercent, settings)
      if (!settings.get('fullscreen') && process.platform !== 'darwin') {
        setTimeout(() => {
          breakWinLocal.center()
        }, 0)
      }
    })
    breakWinLocal.loadURL(modalPath)
    breakWinLocal.setVisibleOnAllWorkspaces(true)
    breakWinLocal.setAlwaysOnTop(true, 'screen-saver')
    if (breakWinLocal) {
      breakWinLocal.on('closed', () => {
        breakWinLocal = null
      })
    }
    breakWins.push(breakWinLocal)

    if (!settings.get('allScreens')) {
      break
    }
  }
  if (process.platform === 'darwin') {
    app.dock.hide()
  }
  // updateTray()
}


function finishBreak(shouldPlaySound = true) {
  breakWins = breakComplete(shouldPlaySound, breakWins)
  log.info('getBetter: finishing Long Break')
  breakPlanner.nextBreak()
  // updateTray()
}

function breakComplete(shouldPlaySound, windows) {
  globalShortcut.unregister(settings.get('endBreakShortcut'))
  if (shouldPlaySound && !settings.get('silentNotifications')) {
    processWin.webContents.send('playSound', settings.get('audio'), settings.get('volume'))
  }
  // if (process.platform === 'darwin') {
  //   // get focus on the last app
  //   Menu.sendActionToFirstResponder('hide:')
  // }
  return closeWindows(windows)
}

function resumeBreaks(notify = true) {
  if (breakPlanner.dndManager.isOnDnd) {
    log.info('getBetter: not resuming breaks because in DND')
  } else {
    breakPlanner.resume()
    log.info('getBetter: resuming breaks')
    if (notify) {
      showNotification("Resuming breaks")
    }
  }
  // updateTray()
}

function calculateBackgroundColor() {
  const themeColor = settings.get('mainColor')
  const opacity = settings.get('opacity')
  console.log("color", themeColor);
  return '#' + Math.round(opacity * 255).toString(16) + themeColor.substr(1)
}


function postponeBreak(shouldPlaySound = false) {
  breakWins = breakComplete(shouldPlaySound, breakWins)
  breakPlanner.postponeCurrentBreak()
  log.info('getBetter: postponing Long Break')
  // updateTray()
}

function skipToBreak() {
  if (microbreakWins) {
    microbreakWins = breakComplete(false, microbreakWins)
  }
  if (breakWins) {
    breakWins = breakComplete(false, breakWins)
  }
  breakPlanner.skipToBreak()
  log.info('Stretchly: skipping to Long Break')
  updateTray()
}

function resetBreaks() {
  if (microbreakWins) {
    microbreakWins = breakComplete(false, microbreakWins)
  }
  if (breakWins) {
    breakWins = breakComplete(false, breakWins)
  }
  breakPlanner.reset()
  log.info('Stretchly: reseting breaks')
  updateTray()
}

function createTrayIcon() {
  if (process.platform === 'darwin') {
    app.dock.hide()
  }
  appIcon = new Tray(trayIconPath())
  updateTray();
  setInterval(updateTray, 10000)
}

function trayIconPath() {
  const params = {
    paused: breakPlanner.isPaused || breakPlanner.dndManager.isOnDnd || breakPlanner.naturalBreaksManager.isSchedulerCleared,
    monochrome: settings.get('useMonochromeTrayIcon'),
    inverted: settings.get('useMonochromeInvertedTrayIcon'),
    darkMode: nativeTheme.shouldUseDarkColors,
    platform: process.platform
  }
  const trayIconFileName = new AppIcon(params).trayIconFileName
  return path.join(__dirname, './images/app-icons/', trayIconFileName)
}

function windowIconPath() {
  const params = {
    paused: breakPlanner.isPaused,
    monochrome: settings.get('useMonochromeTrayIcon'),
    inverted: settings.get('useMonochromeInvertedTrayIcon'),
    darkMode: nativeTheme.shouldUseDarkColors,
    platform: process.platform
  }
  const windowIconFileName = new AppIcon(params).windowIconFileName
  return path.join(__dirname, './images/app-icons/', windowIconFileName);
}

function updateTray() {
  updateToolTip()
  appIcon.setImage(trayIconPath())
  appIcon.setContextMenu(getTrayMenu())
}

function updateToolTip() {
  const StatusMessages = require('./js/statusMessages')
  let trayMessage = i18next.t('main.toolTipHeader')
  const message = new StatusMessages({
    breakPlanner: breakPlanner,
    settings: settings
  }).trayMessage
  if (message !== '') {
    trayMessage += '\n\n' + message
  }
  appIcon.setToolTip(trayMessage)
}

function getTrayMenu() {
  const trayMenu = []
  const doNotDisturb = breakPlanner.dndManager.isOnDnd

  // if (global.shared.isNewVersion) {
  //   trayMenu.push({
  //     label: i18next.t('main.downloadLatestVersion'),
  //     click: function () {
  //       shell.openExternal('https://hovancik.net/stretchly/downloads')
  //     }
  //   }, {
  //     type: 'separator'
  //   })
  // }

  const StatusMessages = require('./js/statusMessages')
  const statusMessage = new StatusMessages({
    breakPlanner: breakPlanner,
    settings: settings
  }).trayMessage

  if (statusMessage !== '') {
    const messages = statusMessage.split('\n')
    for (const index in messages) {
      trayMenu.push({
        label: messages[index],
        enabled: false
      })
    }

    trayMenu.push({
      type: 'separator'
    })
  }

  if (!(breakPlanner.isPaused || breakPlanner.dndManager.isOnDnd)) {
    let submenu = []
    if (settings.get('microbreak')) {
      submenu = submenu.concat([{
        label: i18next.t('main.toMicrobreak'),
        click: skipToMicrobreak
      }])
    }
    if (settings.get('break')) {
      submenu = submenu.concat([{
        label: i18next.t('main.toBreak'),
        click: skipToBreak
      }])
    }
    if (settings.get('break') || settings.get('microbreak')) {
      trayMenu.push({
        label: i18next.t('main.skipToTheNext'),
        submenu: submenu
      })
    }
  }

  if (breakPlanner.isPaused) {
    trayMenu.push({
      label: i18next.t('main.resume'),
      click: function () {
        resumeBreaks(false)
        updateTray()
      }
    })
  } else if (!doNotDisturb) {
    trayMenu.push({
      label: i18next.t('main.pause'),
      submenu: [
        {
          label: i18next.t('main.forHour'),
          click: function () {
            pauseBreaks(3600 * 1000)
          }
        }, {
          label: i18next.t('main.for2Hours'),
          click: function () {
            pauseBreaks(3600 * 2 * 1000)
          }
        }, {
          label: i18next.t('main.for5Hours'),
          click: function () {
            pauseBreaks(3600 * 5 * 1000)
          }
        }, {
          label: i18next.t('main.untilMorning'),
          click: function () {
            const untilMorning = new UntilMorning(settings).msToSunrise()
            pauseBreaks(untilMorning)
          }
        }, {
          type: 'separator'
        }, {
          label: i18next.t('main.indefinitely'),
          click: function () {
            pauseBreaks(1)
          }
        }
      ]
    })
  }

  if (breakPlanner.scheduler.reference === 'finishMicrobreak' && settings.get('microbreakStrictMode')) {
    // nothing
  } else if (breakPlanner.scheduler.reference === 'finishBreak' && settings.get('breakStrictMode')) {
    // nothing
  } else {
    trayMenu.push({
      label: i18next.t('main.resetBreaks'),
      click: resetBreaks
    })
  }

  trayMenu.push({
    type: 'separator'
  }, {
    label: i18next.t('main.preferences'),
    click: function () {
      createPreferencesWindow()
    }
  })

  // if (global.shared.isContributor) {
  //   trayMenu.push({
  //     label: i18next.t('main.contributorPreferences'),
  //     click: function () {
  //       createContributorSettingsWindow()
  //     }
  //   }, {
  //     label: i18next.t('main.syncPreferences'),
  //     click: function () {
  //       createSyncPreferencesWindow()
  //     }
  //   })
  // }

  trayMenu.push({
    type: 'separator'
  }, {
    label: i18next.t('main.quitStretchly'),
    role: 'quit',
    click: function () {
      app.quit()
    }
  })

  return Menu.buildFromTemplate(trayMenu)
}
ipcMain.on('update-tray', function (event) {
  updateTray()
})