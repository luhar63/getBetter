const Scheduler = require('./scheduler')
const EventEmitter = require('events')
const NaturalBreaksManager = require('./naturalBreaksManager')
const DndManager = require('./dndManager')
const log = require('electron-log')

class BreaksPlanner extends EventEmitter {
    constructor(settings) {
        super()
        this.settings = settings
        this.onNotificationScreen = false;
        this.breakNumber = 0
        this.postponesNumber = 0
        this.scheduler = null
        this.isPaused = false
        this.naturalBreaksManager = new NaturalBreaksManager(settings)
        this.dndManager = new DndManager(settings)

        this.on('microbreakStarted', (shouldPlaySound) => {
            const interval = this.settings.get('microbreakDuration')
            this.scheduler = new Scheduler(() => this.emit('finishMicrobreak', shouldPlaySound), interval, 'finishMicrobreak')
            this.scheduler.plan()
        })

        this.on('breakStarted', (shouldPlaySound, duration) => {
            const interval = duration || this.settings.get('breakDuration')
            this.scheduler = new Scheduler(() => this.emit('finishBreak', shouldPlaySound), duration, 'finishBreak')
            this.scheduler.plan()
        })

        this.naturalBreaksManager.on('clearBreakScheduler', () => {
            // console.log(this.scheduler.reference, this.isPaused);
            if (!this.isPaused && this.scheduler.reference !== 'finishMicrobreak' && this.scheduler.reference !== 'finishBreak' && this.scheduler.reference !== null) {
                log.info('why god why?');
                this.clear()
                log.info('getBetter: pausing breaks because of idle time')
            }
        })

        this.naturalBreaksManager.on('naturalBreakFinished', () => {
            if (!this.isPaused && this.scheduler.reference !== 'finishMicrobreak' && this.scheduler.reference !== 'finishBreak' && !this.dndManager.isOnDnd) {
                this.reset()
                log.info('getBetter: resuming breaks after idle time')
                this.emit('updateToolTip')
            }
        })

        this.dndManager.on('dndStarted', () => {
            if (!this.isPaused && this.scheduler.reference !== 'finishMicrobreak' && this.scheduler.reference !== 'finishBreak' && this.scheduler.reference !== null) {
                this.clear()
                log.info('getBetter: pausing breaks for DND')
                this.emit('updateToolTip')
            } else {
                this.dndManager.isOnDnd = false
            }
        })

        this.dndManager.on('dndFinished', () => {
            if (!this.isPaused && this.scheduler.reference !== 'finishMicrobreak' && this.scheduler.reference !== 'finishBreak') {
                this.reset()
                log.info('getBetter: resuming breaks for DND')
                this.emit('updateToolTip')
            }
        })
    }

    nextBreak() {
        if (this.onNotificationScreen) {
            return;
        }
        // console.log("inside, nextbreak");
        this.postponesNumber = 0
        if (this.scheduler) this.scheduler.cancel()
        const shouldBreak = this.settings.get('break')
        const shouldMicrobreak = this.settings.get('microbreak')
        const interval = this.settings.get('microbreakInterval')
        const breakNotification = this.settings.get('breakNotification')
        const breakNotificationInterval = this.settings.get('breakNotificationInterval')
        const microbreakNotification = this.settings.get('microbreakNotification')
        const microbreakNotificationInterval = this.settings.get('microbreakNotificationInterval')
        if (shouldBreak) {
            if (breakNotification) {
                // console.log("call", "startBreakNotification");
                this.scheduler = new Scheduler(() => this.emit('startBreakNotification'), interval * (this.settings.get('breakInterval')) - breakNotificationInterval, 'startBreakNotification')
            } else {
                // console.log("call", "startBreakNotification");
                this.scheduler = new Scheduler(() => this.emit('startBreakNotification'), interval * (this.settings.get('breakInterval')), 'startBreakNotification')
            }
        }

        // if (!shouldBreak && shouldMicrobreak) {
        //     if (microbreakNotification) {
        //         this.scheduler = new Scheduler(() => this.emit('startMicrobreakNotification'), interval - microbreakNotificationInterval, 'startMicrobreakNotification')
        //     } else {
        //         this.scheduler = new Scheduler(() => this.emit('startMicrobreak'), interval, 'startMicrobreak')
        //     }
        // } else if (shouldBreak && !shouldMicrobreak) {
        //     if (breakNotification) {
        //         this.scheduler = new Scheduler(() => this.emit('startBreakNotification'), interval * (this.settings.get('breakInterval') + 1) - breakNotificationInterval, 'startBreakNotification')
        //     } else {
        //         this.scheduler = new Scheduler(() => this.emit('startBreak'), interval * (this.settings.get('breakInterval') + 1), 'startBreak')
        //     }
        // } else if (shouldBreak && shouldMicrobreak) {
        //     this.breakNumber = this.breakNumber + 1
        //     const breakInterval = this.settings.get('breakInterval') + 1
        //     if (this.breakNumber % breakInterval === 0) {
        //         if (breakNotification) {
        //             this.scheduler = new Scheduler(() => this.emit('startBreakNotification'), interval - breakNotificationInterval, 'startBreakNotification')
        //         } else {
        //             this.scheduler = new Scheduler(() => this.emit('startBreak'), interval, 'startBreak')
        //         }
        //     } else {
        //         if (microbreakNotification) {
        //             this.scheduler = new Scheduler(() => this.emit('startMicrobreakNotification'), interval - microbreakNotificationInterval, 'startMicrobreakNotification')
        //         } else {
        //             this.scheduler = new Scheduler(() => this.emit('startMicrobreak'), interval, 'startMicrobreak')
        //         }
        //     }
        // }
        // console.log(this.scheduler);
        this.scheduler.plan();
    }

    nextBreakAfterNotification() {
        console.log("nextBreakAfterNotification");
        this.scheduler.cancel()
        const scheduledBreakType = this._scheduledBreakType
        const breakNotificationInterval = this.settings.get(`${scheduledBreakType}NotificationInterval`)
        const eventName = `start${scheduledBreakType.charAt(0).toUpperCase() + scheduledBreakType.slice(1)}`
        console.log("Scheduler");
        this.scheduler = new Scheduler(() => this.emit(eventName), breakNotificationInterval, eventName)
        this.scheduler.plan()
        this.onNotificationScreen = false;
    }

    postponeCurrentBreak() {
        this.scheduler.cancel()
        this.postponesNumber += 1
        let postponeTime, eventName
        const scheduledBreakType = this._scheduledBreakType
        const notification = this.settings.get(`${scheduledBreakType}Notification`)
        // if (notification && this.settings.get(`${scheduledBreakType}PostponeTime`) > this.settings.get(`${scheduledBreakType}NotificationInterval`)) {
        //     postponeTime = this.settings.get(`${scheduledBreakType}PostponeTime`) - this.settings.get(`${scheduledBreakType}NotificationInterval`)
        //     eventName = `start${scheduledBreakType.charAt(0).toUpperCase() + scheduledBreakType.slice(1)}Notification`
        // } else {
        //     postponeTime = this.settings.get(`${scheduledBreakType}PostponeTime`)
        //     eventName = `start${scheduledBreakType.charAt(0).toUpperCase() + scheduledBreakType.slice(1)}`
        // }
        postponeTime = this.settings.get(`${scheduledBreakType}PostponeTime`)
        eventName = `start${scheduledBreakType.charAt(0).toUpperCase() + scheduledBreakType.slice(1)}Notification`
        console.log("postponeCurrentBreak", notification, postponeTime, eventName);
        this.scheduler = new Scheduler(() => this.emit(eventName), postponeTime, eventName)
        this.scheduler.plan()
    }

    skipToMicrobreak() {
        this.scheduler.cancel()
        const shouldBreak = this.settings.get('break')
        const shouldMicrobreak = this.settings.get('microbreak')
        const breakInterval = this.settings.get('breakInterval') + 1
        if (shouldBreak && shouldMicrobreak) {
            if (this.breakNumber % breakInterval === 0) {
                this.breakNumber = 1
            }
        }
        this.scheduler = new Scheduler(() => this.emit('startMicrobreak'), 100, 'startMicrobreak')
        this.scheduler.plan()
    }

    skipToBreak() {
        this.scheduler.cancel()
        const shouldBreak = this.settings.get('break')
        // const shouldMicrobreak = this.settings.get('microbreak')
        if (shouldBreak) {
            const breakInterval = this.settings.get('breakInterval')
            this.breakNumber = breakInterval
        }
        this.scheduler = new Scheduler(() => this.emit('startBreakNotification'), 100, 'startBreakNotification')
        this.scheduler.plan()
    }

    clear() {
        this.scheduler.cancel()
        this.breakNumber = 0
        this.postponesNumber = 0
    }

    pause(milliseconds) {
        this.clear()
        this.isPaused = true
        if (milliseconds !== 1) {
            this.scheduler = new Scheduler(() => this.emit('resumeBreaks'), milliseconds, 'resumeBreaks')
            this.scheduler.plan()
        }
    }

    resume() {
        this.scheduler.cancel()
        this.isPaused = false
        this.nextBreak()
    }

    correctScheduler() {
        if (this.scheduler) this.scheduler.correct()
    }

    reset() {
        this.clear()
        this.resume()
    }

    get _scheduledBreakType() {
        const shouldBreak = this.settings.get('break')
        const shouldMicrobreak = this.settings.get('microbreak')
        const breakInterval = this.settings.get('breakInterval') + 1
        let scheduledBreakType
        if (shouldBreak && shouldMicrobreak) {
            scheduledBreakType = this.breakNumber % breakInterval !== 0 ? 'microbreak' : 'break'
        } else if (!shouldBreak) {
            scheduledBreakType = 'microbreak'
        } else if (!shouldMicrobreak) {
            scheduledBreakType = 'break'
        }
        return scheduledBreakType
    }

    naturalBreaks(shouldUse) {
        if (shouldUse) {
            this.naturalBreaksManager.start()
        } else {
            this.naturalBreaksManager.stop()
        }
    }

    onNotificationWindow() {
        this.onNotificationScreen = true;
    }

    offNotificationWindow() {
        this.onNotificationScreen = false;
    }

    // setDND(time) {
    //     time = 1
    //     this.doNotDisturb(true);
    //     log.info(`getBetter: starting DND for ${time} mins`)
    //     this.scheduler = new Scheduler(() => this.doNotDisturb(false), time * 60 * 1000, 'stopDND');
    //     this.scheduler.plan();
    // }

    doNotDisturb(shouldUse) {
        if (shouldUse) {
            this.dndManager.start()
        } else {
            this.dndManager.stop()
            if (!this.isPaused && this.scheduler.reference === null) {
                this.reset()
            }
        }
    }
}

module.exports = BreaksPlanner