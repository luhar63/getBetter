
const { ipcRenderer, remote } = require('electron')
const Utils = remote.require('./js/utils');

var moods = ["How are you feeling today?", "How's your mood right now?"];
var currentMood = "";

document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("question").innerHTML = moods[Math.floor(Math.random() * moods.length)];
});

ipcRenderer.on('mooddata', (event, timeLeft) => {
    debugger;
    console.log(timeLeft);
    const time = Utils.formatTimeIn(timeLeft);
    if (timeLeft < 120000) {
        nextBreak.style.display = 'none';
    }
    document.querySelector('.timeleft').innerHTML = time;

});

const elms = document.querySelectorAll('.mood');
const container = document.querySelector('.main-content');
const recorded = document.querySelector('.recorded-content');
const timeElm = document.querySelector('.time');
const nextBreak = document.querySelector('.next-break');
let timeLeft;
// console.log(elms);
elms.forEach(elm => {
    // const elm = document.querySelector(selector);
    elm.addEventListener('click', clickHandler);
});

function resetAllMoods() {
    elms.forEach(elm => {
        elm.setAttribute("class", "mood");
    });
}

function runTimer(time) {
    let maxTime = time;
    let timeout = setInterval(() => {
        timeElm.innerHTML = maxTime;
        maxTime -= 1;
        if (maxTime == -1) {
            clearInterval(timeout);
            ipcRenderer.send('close-mood');
        }
    }, 1000)
}

function clickHandler(event) {
    // Don't follow the link
    event.preventDefault();
    // Log the clicked element in the console
    resetAllMoods();
    let li = event.target.closest('.mood');
    li.setAttribute("class", "mood selected");
    ipcRenderer.send('mood', li.dataset.mood);
    container.style.display = 'none';
    recorded.style.display = "flex";
    runTimer(4);
}



document.querySelector('.close').addEventListener('click', function (event) {
    ipcRenderer.send('close-mood');
});
// elm.addEventListener('click', function (event) {

//     // Don't follow the link
//     event.preventDefault();

//     // Log the clicked element in the console
//     console.log(event.target);

// }, true);

