const fs = require('fs')
const defaultSettings = require('./defaultsettings')
const log = require('electron-log')

class Settings {
    constructor(configLocation) {
        console.log(configLocation);
        this.settingsFile = configLocation
        this.data = null
        this.lastSync = 0

        if (fs.existsSync(this.settingsFile)) {
            this._load()
            log.info('getBetter: loading settings')
            if (Object.keys(this.data).length !== Object.keys(defaultSettings).length) {
                this._loadMissing()
            }
        } else {
            this.data = Object.assign({}, defaultSettings)
            this._save(true)
            log.info('getBetter: creating settings file')
        }
    }

    get(key) {
        if (typeof this.data[key] === 'undefined' || this.data[key] === null) {
            this.set(key, defaultSettings[key])
            log.info(`getBetter: setting default value for ${key}`)
        }
        return this.data[key]
    }

    set(key, value) {
        this.data[key] = value
        log.info(`getBetter: setting ${key} to ${value}`)
        this._save()
    }

    restoreDefaults() {
        this.data = Object.assign({}, defaultSettings)
        this.data.isFirstRun = false
        this._save(true)
        log.info('getBetter: restoring default settings')
    }

    restoreRemote(remoteSettings) {
        this.data = Object.assign({}, remoteSettings)
        this._save(true)
        log.info('getBetter: restoring remote settings')
    }

    _load(retryCount = 5) {
        try {
            this.data = JSON.parse(fs.readFileSync(this.settingsFile, 'utf8'))
        } catch (e) {
            if (retryCount > 0) {
                setTimeout(this._load.bind(this, retryCount - 1), 10)
                log.warn('getBetter: failed to load settings JSON file, retrying in 10 milliseconds')
                return
            }
            this.data = Object.assign({}, defaultSettings)
            // TODO maybe I should `this._save(true)` here?
            log.warn('getBetter: failed to load settings JSON file, giving up and resetting')
        }
    }

    _loadMissing() {
        for (const prop in defaultSettings) {
            this.get(prop)
        }
    }

    _save(force) {
        const now = (new Date()).getTime()
        // don't blast the disk
        if ((now - this.lastSync > 250 || force)) {
            if (this.data) {
                try {
                    fs.writeFileSync(this.settingsFile, JSON.stringify(this.data, null, 4))
                } catch (e) {
                    if (this.saving) clearTimeout(this.saving)
                    this.saving = setTimeout(this._save.bind(this), 275)
                }
            }
            if (this.saving) clearTimeout(this.saving)
        } else {
            if (this.saving) clearTimeout(this.saving)
            this.saving = setTimeout(this._save.bind(this), 275)
        }
        log.info('getBetter: saving settings file')
        this.lastSync = now
    }

    destroy() {
        this.data = null
        fs.unlinkSync(this.settingsFile)
    }
}

module.exports = Settings