const { ipcRenderer, remote } = require('electron')
const Utils = remote.require('./js/utils')

ipcRenderer.on('notify', (event, started, duration, strictMode, postpone, postponePercent, settings) => {
    const progress = document.querySelector('#progress')
    const progressTime = document.querySelector('#progress-time')
    const postponeElement = document.querySelector('#postpone')
    const closeElement = document.querySelector('#close')
    const mainColor = settings.data.mainColor
    document.body.classList.add(mainColor.substring(1))
    // const notifyAfterTime = document.querySelector('.notification-text .time');




    document.querySelectorAll('.tiptext').forEach(tt => {
        const keyboardShortcut = settings.data.endBreakShortcut
        tt.innerHTML = Utils.formatKeyboardShortcut(keyboardShortcut)
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
    document.querySelector('.time-slider').classList.remove('hide')
});

document.querySelector('.close').addEventListener('click', function (event) {
    document.querySelector('.time-slider').classList.add('hide')
});
