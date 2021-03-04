const { app, BrowserWindow } = require('electron');
const path = require('path');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

let welcomeWindow = null;

// const createWindow = () => {
//   // Create the browser window.
//   const mainWindow = new BrowserWindow({
//     titleBarStyle: 'hidden',
//     width: 1281,
//     height: 800,
//     minWidth: 1281,
//     minHeight: 800,
//     backgroundColor: '#312450',
//     // icon: path.join(__dirname, 'images/logo.png'),
//     show: false
//   });

//   mainWindow.once('ready-to-show', () => {
//     mainWindow.show()
//   });

//   // and load the index.html of the app.
//   mainWindow.loadFile(path.join(__dirname, 'index.html'));

//   // Open the DevTools.
//   mainWindow.webContents.openDevTools();
// };

app.setAppUserModelId('gameOfMinds.getbetter')

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
// app.on('ready', createWindow);
app.on('ready', loadSettings);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWelcomeWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

function loadSettings() {

  createWelcomeWindow();
}

function createWelcomeWindow() {
  // if (settings.get('isFirstRun')) {
  const modalPath = path.join('file://', __dirname, '/screens/welcome.html')
  welcomeWindow = new BrowserWindow({
    x: displaysX(-1, 1000),
    y: displaysY(),
    width: 1024,
    height: 768,
    autoHideMenuBar: true,
    icon: windowIconPath(),
    backgroundColor: '#EDEDED',
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true
    }
  })
  welcomeWindow.loadURL(modalPath)
  if (welcomeWindow) {
    welcomeWindow.on('closed', () => {
      welcomeWindow = null
    })
  }
  welcomeWindow.webContents.openDevTools();
}
// }

function windowIconPath() {
  // const params = {
  //   paused: breakPlanner.isPaused,
  //   monochrome: settings.get('useMonochromeTrayIcon'),
  //   inverted: settings.get('useMonochromeInvertedTrayIcon'),
  //   darkMode: nativeTheme.shouldUseDarkColors,
  //   platform: process.platform
  // }
  // const windowIconFileName = new AppIcon(params).windowIconFileName
  return path.join(__dirname, '/images/logo.png');
}


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