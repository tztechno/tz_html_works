
let timer;
let isRunning = false;
let seconds = 0;
let minutes = 0;
let hours = 0;

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
    const input = parseInt(adjustSeconds.value, 10); // 入力値を取得
    if (!isNaN(input)) { // 有効な数値か確認
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
    // 時間、分、秒をフォーマットして表示
    timeDisplay.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// ストップウォッチのボタンにイベントを追加
startStopButton.addEventListener("click", startStopwatch);
resetButton.addEventListener("click", resetStopwatch);
adjustButton.addEventListener("click", adjustTime);

