
const { ipcRenderer, remote } = require('electron')
var moods = ["How are you feeling today?", "How's your mood right now?"];
var currentMood = "";

document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("question").innerHTML = moods[Math.floor(Math.random() * moods.length)];
});


const elms = document.querySelectorAll('.mood');
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

function clickHandler(event) {
    // Don't follow the link
    event.preventDefault();
    // Log the clicked element in the console
    console.log(event.target);
    resetAllMoods();
    let li = event.target.closest('.mood');
    li.setAttribute("class", "mood selected");
    ipcRenderer.send('mood', li.dataset.mood);

}
// elm.addEventListener('click', function (event) {

//     // Don't follow the link
//     event.preventDefault();

//     // Log the clicked element in the console
//     console.log(event.target);

// }, true);