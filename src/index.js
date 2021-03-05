const { app, BrowserWindow } = require('electron');
// const { BrowserWindow } = require('electron').remote
const path = require('path');

const { createWelcomeWindow } = require('./js/windowManger')


const { initPowerMonitoring } = require('./js/powermanagement');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

let window = null;

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
app.on('ready', initPowerMonitoring);

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

// function createWindowPrototype(modalPath) {
//   window = new BrowserWindow({
//     x: displaysX(-1, 1000),
//     y: displaysY(),
//     width: 1024,
//     height: 768,
//     autoHideMenuBar: true,
//     icon: windowIconPath(),
//     backgroundColor: '#EDEDED',
//     webPreferences: {
//       nodeIntegration: true,
//       enableRemoteModule: true
//     }
//   });
//   window.loadURL(modalPath)
//   if (window) {
//     window.on('closed', () => {
//       window = null
//     })
//   }
//   window.webContents.openDevTools();
//   return window;
// }

// function createWelcomeWindow() {
//   // if (settings.get('isFirstRun')) {
//   const modalPath = path.join('file://', __dirname, '/screens/welcome.html')
//   if (!window) {
//     welcomeWindow = createWindowPrototype(modalPath);
//   }
// }
// // }

// function windowIconPath() {
//   // const params = {
//   //   paused: breakPlanner.isPaused,
//   //   monochrome: settings.get('useMonochromeTrayIcon'),
//   //   inverted: settings.get('useMonochromeInvertedTrayIcon'),
//   //   darkMode: nativeTheme.shouldUseDarkColors,
//   //   platform: process.platform
//   // }
//   // const windowIconFileName = new AppIcon(params).windowIconFileName
//   return path.join(__dirname, '/images/logo.png');
// }

// function createMoodsWindow() {
//   const modalPath = path.join('file://', __dirname, '../screens/moods.html')
//   if (window) {
//     window.loadURL(modalPath);
//   } else {
//     moodsWindow = createWindowPrototype(modalPath);
//   }
// }