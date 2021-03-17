const { app, BrowserWindow } = require('electron');
const path = require('path');
const { displaysX, displaysY } = require('./utils')

const env = process.env.NODE_ENV || 'development';
console.log("env", env);
let window = null;

let welcomeWindow;

let moodsWindow;


function createWindowPrototype(modalPath) {
    window = new BrowserWindow({
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
        },
        title: 'getBetter',
        skipTaskbar: true,
        focusable: false,
        frame: true,
    });
    window.loadURL(modalPath)
    if (window) {
        window.on('closed', () => {
            window = null
        })
    }
    if (env === 'development') {
        window.webContents.openDevTools();
    }
    return window;
}

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


function createWelcomeWindow() {
    // if (settings.get('isFirstRun')) {
    const modalPath = path.join('file://', __dirname, '../screens/welcome.html')
    if (!window) {
        welcomeWindow = createWindowPrototype(modalPath);
    }
}

function createMoodsWindow() {
    const modalPath = path.join('file://', __dirname, '../screens/moods.html')
    if (window) {
        window.loadURL(modalPath);
    } else {
        moodsWindow = createWindowPrototype(modalPath);
    }
}


module.exports = { createWelcomeWindow, createMoodsWindow }