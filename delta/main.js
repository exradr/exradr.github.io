var state = "start";
var tRunning = false;
var timer = 0;
var turn = 0;
var tInterval;
var bInterval;
var lastTimestamp;
var limit = 10;

var currentHoldDuration = 0;
const holdThreshold = 50;

var mainbtn = document.getElementById("main");
var timelimitctn = document.getElementById("timelimit-container");
var timelimitinpt = document.getElementById("timelimit");
var mainctn = document.getElementById("move-container");

function handleContextMenu() {
    console.log("context menu");
    return false;
};

mainbtn.addEventListener("touchstart", e => (state == 'start') ? mainTouchDown(e) : false);
mainbtn.addEventListener("touchend", e => (state == 'start') ? mainTouchUp(e) : false);
mainbtn.addEventListener("mousedown", e => (state == 'start') ? mainPressingDown(e) : false);
mainbtn.addEventListener("mouseup", e => (state == 'start') ? mainPressUp(e) : false);

window.addEventListener("touchstart", e => (state != 'start') ? mainTouchDown(e) : false);
window.addEventListener("touchend", e => (state != 'start') ? mainTouchUp(e) : false);
window.addEventListener("mousedown", e => (state != 'start') ? mainPressingDown(e) : false);
window.addEventListener("mouseup", e => (state != 'start') ? mainPressUp(e) : false);

mainbtn.addEventListener("push", changeTurn);
mainbtn.addEventListener("pressHold", stopGame);

window.addEventListener("resize", setMargins);


function setMargins() {
    if (state != 'start')
        updateBorder();
    mainctn.style.height = window.innerHeight + 'px';
}

function mainTouchDown(e) {
    e.preventDefault();
    if (state == 'start') {
        mainbtn.classList.add("go-touch");
    } else if (state == 'playing') {
        mainbtn.classList.add("play-touch");
    }
    mainPressingDown(e);
}
function mainTouchUp(e) {
    mainbtn.classList.remove("go-touch");
    mainbtn.classList.remove("play-touch");
    e.preventDefault();
    mainPressUp(e);
}

function updateBorder() {
    let ratio = Math.abs(timer) /1000 / limit;
    let borderH = (window.innerHeight - mainbtn.clientHeight)/2*1.01;
    let borderW = (window.innerWidth - mainbtn.clientWidth)/2*1.01;
    mainbtn.style.borderWidth = ratio*borderH + "px " + ratio*borderW + "px";

    if (timer > 0) {
        mainbtn.classList.remove('p2-winning');
        mainbtn.classList.add('p1-winning');
    } else if (timer < 0) {
        mainbtn.classList.remove('p1-winning');
        mainbtn.classList.add('p2-winning');
    }
}

function displayTimer() {
    let ms = Math.floor((Math.abs(timer) % 1000) / 10);
    let ms_str = (ms < 10) ? "0" + ms : ms;
    mainbtn.innerHTML = Math.floor(Math.abs(timer / 1000)) + "." + ms_str;
    
}

function updateTimer() {
    state = 'playing';
    let currentTimestamp = new Date().getTime();
    let difference = currentTimestamp - lastTimestamp;

    if (turn == 1) {
        timer += difference;
    } else {
        timer -= difference;
    }

    displayTimer();
    checkWin();
    lastTimestamp = currentTimestamp;
}

function checkWin() {
    if (Math.abs(timer/1000) >= limit) {
        mainbtn.classList.remove('p2-btn');
        mainbtn.classList.remove('p1-btn');
        if (timer > 0) {
            mainbtn.classList.add('p1-win');

        } else {
            mainbtn.classList.add('p2-win');
        }
        mainbtn.innerHTML = "game over";
        state = 'gameWon';
        stopTimer();
    }
}

function startTimer(){
    limit = parseInt(timelimitinpt.value);
    console.log(limit);
    fadeOut(timelimitctn);

    mainbtn.classList.remove('go-btn');
    mainctn.classList.add("border-blink");
    timer = 0;
    lastTimestamp = new Date().getTime();
    tInterval = setInterval(updateTimer, 10);
    bInterval = setInterval(updateBorder, 100);
    tRunning = true;
    state = 'playing';
}

function stopTimer() {
    if (tRunning) {
        clearInterval(tInterval);
        clearInterval(bInterval);
        mainctn.classList.remove("border-blink");
        tRunning = false;
    }
}

// https://gist.github.com/alirezas/c4f9f43e9fe1abba9a4824dd6fc60a55
function fadeOut(el){
    el.style.opacity = 1;

    (function fade() {
        if ((el.style.opacity -= .1) < 0) {
            el.style.display = "none";
        } else {
            requestAnimationFrame(fade);
        }
    })();
};

function fadeIn(el, display){
    el.style.opacity = 0;
    el.style.display = display || "block";

    (function fade() {
        var val = parseFloat(el.style.opacity);
        if (!((val += .1) > 1)) {
            el.style.opacity = val;
            requestAnimationFrame(fade);
        }
    }
    )();
};

function reset() {
    setMargins();
    stopTimer();
    mainbtn.classList.remove('p1-btn');
    mainbtn.classList.remove('p2-btn');
    mainbtn.classList.remove('p1-winning');
    mainbtn.classList.remove('p2-winning');
    mainbtn.classList.remove('p1-win');
    mainbtn.classList.remove('p2-win');
    mainbtn.style.borderWidth = "0px";
    turn = 2;
    mainbtn.classList.add('animate');
    mainctn.classList.add('animate');
    timelimitctn.classList.add("animate");
}

function stopGame() {
    reset();
    mainbtn.classList.add('stop-btn');
    mainbtn.innerHTML = "stopped";
    state = 'stopped';
}

function changeTurn() {
    console.log("change turn")
    if (turn == 1) {
        mainbtn.classList.remove('p2-btn');
        mainbtn.classList.add('p1-btn');
        turn = 2;
    } else {
        mainbtn.classList.remove('p1-btn');
        mainbtn.classList.add('p2-btn');
        turn = 1;
    }
}


function mainPressingDown(e){
    console.warn(state + " push down");
    e.preventDefault();
    if (state == 'playing'){
        currentHoldDuration = 0;
        requestAnimationFrame(holdTimer)
    }
}

function mainPressUp(e) {
    console.warn(state + " push up");
    e.preventDefault();
    cancelAnimationFrame(timerID);
    if (state == 'stopped') {
        startButton();
        return;
    } 
    if (state == 'gameWon') {
        reset();
        startButton();
        return;
    } 
    if (currentHoldDuration < holdThreshold) {
        mainbtn.dispatchEvent(new CustomEvent("push"));
    } 
    if (state == 'start') {
        startTimer();
    }
    currentHoldDuration = 0;
}

function startButton() {
    currentHoldDuration = 0;
    mainbtn.innerHTML = "start";
    mainbtn.classList.remove('stop-btn');
    mainbtn.classList.add('go-btn');
    state = 'start';
    fadeIn(timelimitctn);
}

var timerID;
function holdTimer() {
    if (currentHoldDuration < holdThreshold) {
        timerID = requestAnimationFrame(holdTimer);
        currentHoldDuration++;
    } else {
        // held enough!
        mainbtn.dispatchEvent(new CustomEvent("pressHold"));
    }
}

reset();
startButton();