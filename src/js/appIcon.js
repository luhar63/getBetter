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
            if (this.platform === 'darwin') {
                return `icon_16x16_active.png`;
            } else {
                return "icon_16x16.png";
            }
        } else {
            if (this.platform === 'darwin') {
                return `icon_16x16_active.png`;
            } else {
                return `icon_16x16_active.png`;
            }
        }
    }

    get windowIconFileName() {
        const invertedMonochromeString = this.inverted ? 'Inverted' : ''
        const darkModeString = this.darkMode ? 'Dark' : '';
        if (this.monochrome) {
            return `icon_16x16_active.png`;
        } else {
            return "icon_16x16.png";
        }
    }
}

module.exports = AppIcon