// 修正 2024-12-29 09:33

let timer;
let isRunning = false;
let seconds = 0;
let minutes = 0;
let hours = 0;

// DOM要素の取得
const startStopButton = document.getElementById("startStopButton");
const resetButton = document.getElementById("resetButton");
const adjustButton = document.getElementById("adjustButton");
const timeDisplay = document.getElementById("timeDisplay");

// ストップウォッチの動作
function startStopwatch() {
    if (isRunning) {
        clearInterval(timer);
        startStopButton.textContent = "スタート";
    } else {
        timer = setInterval(() => {
            seconds++;
            if (seconds === 60) {
                seconds = 0;
                minutes++;
            }
            if (minutes === 60) {
                minutes = 0;
                hours++;
            }
            updateDisplay();
        }, 1000);
        startStopButton.textContent = "ストップ";
    }
    isRunning = !isRunning;
}

function resetStopwatch() {
    clearInterval(timer);
    isRunning = false;
    seconds = 0;
    minutes = 0;
    hours = 0;
    updateDisplay();
    startStopButton.textContent = "スタート";
}

function adjustTime() {
    const input = parseInt(document.getElementById("adjustSeconds").value, 10); // 入力値を取得
    if (!isNaN(input)) {
        let totalSeconds = hours * 3600 + minutes * 60 + seconds + input; // 秒に変換して加算
        if (totalSeconds < 0) totalSeconds = 0; // 負の時間は許容しない
        hours = Math.floor(totalSeconds / 3600); // 時間に再計算
        totalSeconds %= 3600;
        minutes = Math.floor(totalSeconds / 60); // 分に再計算
        seconds = totalSeconds % 60; // 秒に再計算
        updateDisplay(); // 時間を更新
    }
}

function updateDisplay() {
    if (timeDisplay) {
        timeDisplay.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        stopWatchTime = timeDisplay.textContent;
    }
}

// ボタンにイベントを追加
if (startStopButton) startStopButton.addEventListener("click", startStopwatch);
if (resetButton) resetButton.addEventListener("click", resetStopwatch);
if (adjustButton) adjustButton.addEventListener("click", adjustTime);
