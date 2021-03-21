class AppIcon {
    constructor({ platform, paused, monochrome, inverted, darkMode }) {
        this.platform = platform
        this.paused = paused
        this.monochrome = monochrome
        this.inverted = inverted
        this.darkMode = darkMode
    }

    get trayIconFileName() {
        const pausedString = this.paused ? 'Paused' : ''
        const invertedMonochromeString = this.inverted ? 'Inverted' : ''
        const darkModeString = this.darkMode ? 'Dark' : ''
        if (this.monochrome) {
            if (this.darkMode) {
                return "icon_16x16.png"
            } else {
                return "icon_16x16_monochrome_blk.png"
            }
        }
        if (this.darkMode) {
            return "icon_16x16_active.png"
        } else {
            if (this.platform !== 'darwin') {
                return "icon_16x16_blk.png"
            } else {
                return "icon_16x16_active.png"
            }
        }
        // if (this.monochrome) {
        //     if (this.platform === 'darwin') {
        //         return `trayMacMonochrome${pausedString}Template.png`
        //     } else {
        //         return `trayMonochrome${invertedMonochromeString}${pausedString}.png`
        //     }
        // } else {
        //     if (this.platform === 'darwin') {
        //         return `trayMac${pausedString}${darkModeString}.png`
        //     } else {
        //         return `tray${pausedString}${darkModeString}.png`
        //     }
        // }
    }

    get windowIconFileName() {
        const invertedMonochromeString = this.inverted ? 'Inverted' : ''
        const darkModeString = this.darkMode ? 'Dark' : ''
        // return "icon_16x16_2.png";
        if (this.monochrome) {
            if (this.darkMode) {
                return "icon_16x16.png"
            } else {
                return "icon_16x16_monochrome_blk.png"
            }
        }
        if (this.darkMode) {
            return "icon_16x16_active.png"
        } else {
            if (this.platform !== 'darwin') {
                return "icon_16x16_blk.png"
            } else {
                return "icon_16x16_active.png"
            }
        }
    }
}

module.exports = AppIcon