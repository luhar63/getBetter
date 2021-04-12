const { ipcRenderer, remote } = require('electron')
const Utils = remote.require('./js/utils')

const defaultText = "You have been on the screen for a long time now. You should take a break.";

ipcRenderer.on('notify', (event, idea, started, settings) => {
    document.querySelector('.action-buttons .skip').style.display =
        Utils.canSkip(settings.data.breakStrictMode) ? 'block' : 'none';
    const progress = document.querySelector('.progress-bar')
    const progressTime = document.querySelector('.progress-container');
    const widthMax = progressTime.clientWidth;
    const postponeElement = document.querySelector('#postpone')
    const closeElement = document.querySelector('#close')
    document.querySelectorAll('.notification-text').forEach(tt => {
        // const keyboardShortcut = settings.data.endBreakShortcut
        tt.innerHTML = idea[3] || defaultText;
    });

    const mainColor = settings.data.mainColor;
    document.body.classList.add(mainColor.substring(1));

    const interval = 100;
    let pause = false;
    const duration = settings.data.notificationDuration;

    let diff = 0
    window.setInterval(() => {
        if (!pause) {
            if (diff < duration) {
                // const passedPercent = (Date.now() - started) / duration * 100
                const size = (duration - diff) / duration * widthMax;
                console.log(size, widthMax, duration, diff);
                progress.style.width = size + "px";
                diff += interval;
            } else {
                ipcRenderer.send('skip-break');
            }
        }

    }, interval);

    document.querySelector('.notification-page').addEventListener('mouseover', function (event) {
        pause = true;
    });
    document.querySelector('.notification-page').addEventListener('mouseout', function (event) {
        pause = false;
    });


    //     // window.setInterval(() => {
    //     //     if (Date.now() - started < duration) {
    //     //         const passedPercent = (Date.now() - started) / duration * 100
    //     //         Utils.canSkip(strictMode, postpone, passedPercent, postponePercent)
    //     //         postponeElement.style.display =
    //     //             Utils.canPostpone(postpone, passedPercent, postponePercent) ? 'flex' : 'none'
    //     //         closeElement.style.display =
    //     //             Utils.canSkip(strictMode, postpone, passedPercent, postponePercent) ? 'flex' : 'none'
    //     //         progress.value = (100 - passedPercent) * progress.max / 100
    //     //         progressTime.innerHTML = Utils.formatTimeRemaining(Math.trunc(duration - Date.now() + started))
    //     //     }
    //     // }, 100)
    // notifyMe();
})

var rangeSlider = document.getElementById("rs-range-line");
var rangeBullet = document.getElementById("rs-bullet");

rangeSlider.addEventListener("input", showSliderValue, false);

function showSliderValue() {
    // console.log(rangeSlider.clientWidth)
    let hr = Math.floor(rangeSlider.value / 60);
    let min = rangeSlider.value % 60;
    rangeBullet.innerHTML = (hr < 10 ? "0" + hr : hr) + ":" + (min < 10 ? "0" + min : min);
    var bulletPosition = ((rangeSlider.value - 30) / rangeSlider.max);
    console.log(bulletPosition, bulletPosition * 100);
    rangeBullet.style.left = (bulletPosition * 100) + "%";
}

document.querySelector('.gobreak').addEventListener('click', function (event) {
    ipcRenderer.send('start-break', false);
});

document.querySelector('.skip').addEventListener('click', function (event) {
    ipcRenderer.send('skip-break', false);
});

document.querySelector('.dnd-select').addEventListener('click', function (event) {

    ipcRenderer.send('dnd-time-break', rangeSlider.value);
});

document.querySelector('.dnd').addEventListener('click', function (event) {
    document.querySelector('.notification-text').classList.add('hide');
    document.querySelector('.action-buttons').classList.add('hide');
    document.querySelector('.time-slider').classList.remove('hide');
});

document.querySelector('.close').addEventListener('click', function (event) {
    document.querySelector('.time-slider').classList.add('hide');
    document.querySelector('.notification-text').classList.remove('hide');
    document.querySelector('.action-buttons').classList.remove('hide');
});




