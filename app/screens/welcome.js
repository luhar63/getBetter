const { remote, ipcRenderer, shell } = require('electron')

let event
document.ondragover = event =>
    event.preventDefault()

document.ondrop = event =>
    event.preventDefault()

ipcRenderer.on('renderSettings', (event, settings) => {
    // document.querySelectorAll('input[type="radio"]').forEach(radio => {
    //     let value
    //     switch (radio.value) {
    //         case 'true':
    //             value = true
    //             break
    //         case 'false':
    //             value = false
    //             break
    //         default:
    //             value = radio.value
    //     }
    //     radio.checked = settings[radio.name] === value
    //     if (!eventsAttached) {
    //         radio.onchange = (event) => {
    //             ipcRenderer.send('save-setting', radio.name, value)
    //             htmlTranslate.translate()
    //             setSameWidths()
    //         }
    //     }
    // })
    // setSameWidths()
})

document.querySelectorAll('button').forEach(button => {
    button.onclick = () => {
        ipcRenderer.send('save-setting', 'isFirstRun', false);
        // switch (button.getAttribute('data-location')) {
        //     case 'tutorial':
        //         shell.openExternal('https://hovancik.net/stretchly/features')
        //         break
        //     case 'preferences':

        //         break
        //     default:
        //         break
        // }
        ipcRenderer.send('open-preferences')
        remote.getCurrentWindow().close()
    }

})


var slideIndex = 1;
showSlides(slideIndex);

// Next/previous controls
function plusSlides(n) {
    showSlides(slideIndex += n);
}

// Thumbnail image controls
function currentSlide(n) {
    showSlides(slideIndex = n);
}

function showSlides(n) {
    var i;
    var slides = document.getElementsByClassName("mySlides");
    var dots = document.getElementsByClassName("dot");
    if (n > slides.length) { slideIndex = 1 }
    if (n < 1) { slideIndex = slides.length }
    for (i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
    }
    for (i = 0; i < dots.length; i++) {
        dots[i].className = dots[i].className.replace(" active", "");
    }
    slides[slideIndex - 1].style.display = "block";
    dots[slideIndex - 1].className += " active";
}