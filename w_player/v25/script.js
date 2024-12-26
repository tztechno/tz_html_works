// DOM要素の取得
const playerList = document.getElementById("playerList");
const bench = document.getElementById("bench");
const field = document.getElementById("field");
const tempOut = document.getElementById("tempOut");
const historyList = document.getElementById("history-list");
const playerNamesInput = document.getElementById("playerNamesInput");
const registerButton = document.getElementById("registerButton");

// モーダル関連の要素取得
const reasonModal = document.getElementById("reasonModal");
const reasonModal2 = document.getElementById("reasonModal2");
const moveReasonSelect = reasonModal.querySelector("#moveReason");
const moveReasonSelect2 = reasonModal2.querySelector("#moveReason");
const confirmReasonBtn = reasonModal.querySelector("#confirmReasonBtn");
const confirmReasonBtn2 = reasonModal2.querySelector("#confirmReasonBtn");
const cancelReasonBtn = reasonModal.querySelector("#cancelReasonBtn");
const cancelReasonBtn2 = reasonModal2.querySelector("#cancelReasonBtn");

// ドラッグ状態管理用の変数
let currentDraggedPlayer = null;
let targetArea = null;
let firstSelectedPlayer2 = null;
let secondSelectedPlayer2 = null;

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


// プレイヤーの生成と初期配置
function generatePlayers(playerNames) {
    playerList.innerHTML = '';
    bench.innerHTML = '<div class="area-title">ベンチ</div>';
    field.innerHTML = '<div class="area-title">ピッチ</div>';
    tempOut.innerHTML = '<div class="area-title">ピッチ外</div>';

    playerNames.forEach((name, index) => {
        const player = createPlayerElement(name);
        playerList.appendChild(createPlayerListElement(name));
        if (index < 15) {
            field.appendChild(player);
        } else {
            bench.appendChild(player);
        }
    });
}

// 選手要素の作成
function createPlayerElement(name) {
    const player = document.createElement("div");
    player.className = "player";
    player.textContent = name;
    player.draggable = true;
    player.dataset.name = name;
    return player;
}

function createPlayerListElement(name) {
    const listItem = document.createElement("div");
    listItem.textContent = name;
    return listItem;
}

// 単独移動用のモーダル表示
function showReasonModal(player, target) {
    currentDraggedPlayer = player;
    targetArea = target;
    reasonModal.style.display = "flex";
    moveReasonSelect.value = "";
}

// 選手交代用のモーダル表示
function showReasonModalForSwap2(player1, player2, target) {
    firstSelectedPlayer2 = player1;
    secondSelectedPlayer2 = player2;
    reasonModal2.style.display = "flex";
    moveReasonSelect2.value = "";
}

// 単独移動の履歴記録
function recordHistory(playerName, targetArea, reason) {
    const timestamp = timeDisplay.textContent;
    const historyItem = document.createElement("div");
    historyItem.className = "history-item";

    const details = document.createElement("span");
    let actionText = "";
    switch (targetArea) {
        case "field":
            actionText = "ピッチに入りました";
            break;
        case "bench":
            actionText = "ベンチに移動しました";
            break;
        case "tempOut":
            actionText = "ピッチの外に移動しました";
            break;
    }
    details.textContent = `${timestamp}: ${playerName} が ${actionText} (${reason})`;

    const appendButton = document.createElement("button");
    appendButton.textContent = "追記";
    appendButton.className = "append-button";
    appendButton.addEventListener("click", () => openReasonWindow(playerName));

    historyItem.appendChild(details);
    historyItem.appendChild(appendButton);
    historyList.appendChild(historyItem);
    historyList.scrollTop = historyList.scrollHeight;
}

// 選手交代の履歴記録
function recordSubstitutionHistory(inPlayer, outPlayer, reason) {
    const timestamp = timeDisplay.textContent;

    // OUT選手の履歴
    const outHistoryItem = document.createElement("div");
    outHistoryItem.className = "history-item";
    const outDetails = document.createElement("span");
    outDetails.textContent = `${timestamp}: ${outPlayer} が ピッチから退きました (${reason} OUT)`;

    const outAppendButton = document.createElement("button");
    outAppendButton.textContent = "追記";
    outAppendButton.className = "append-button";
    outAppendButton.addEventListener("click", () => openReasonWindow(outPlayer));

    outHistoryItem.appendChild(outDetails);
    outHistoryItem.appendChild(outAppendButton);

    // IN選手の履歴
    const inHistoryItem = document.createElement("div");
    inHistoryItem.className = "history-item";
    const inDetails = document.createElement("span");
    inDetails.textContent = `${timestamp}: ${inPlayer} が ピッチに入りました (${reason} IN)`;

    const inAppendButton = document.createElement("button");
    inAppendButton.textContent = "追記";
    inAppendButton.className = "append-button";
    inAppendButton.addEventListener("click", () => openReasonWindow(inPlayer));

    inHistoryItem.appendChild(inDetails);
    inHistoryItem.appendChild(inAppendButton);

    // 履歴に追加（OUT→INの順）
    historyList.appendChild(outHistoryItem);
    historyList.appendChild(inHistoryItem);
    historyList.scrollTop = historyList.scrollHeight;
}

// ドラッグ&ドロップイベントの設定
document.addEventListener("dragstart", event => {
    if (event.target.classList.contains("player")) {
        event.target.classList.add("dragging");
        event.dataTransfer.setData("text/plain", event.target.dataset.name);
    }
});

document.addEventListener("dragend", event => {
    if (event.target.classList.contains("player")) {
        event.target.classList.remove("dragging");
    }
});

[bench, field, tempOut].forEach(area => {
    area.addEventListener("dragover", event => {
        event.preventDefault();
    });

    area.addEventListener("drop", event => {
        event.preventDefault();
        const playerName = event.dataTransfer.getData("text/plain");
        const player = document.querySelector(`[data-name="${playerName}"]`);

        const dropTarget = event.target.closest('.player');

        if (dropTarget && dropTarget !== player) {
            // 選手交代の場合
            showReasonModalForSwap2(player, dropTarget, event.currentTarget);
        } else if (player && event.currentTarget !== player.parentElement) {
            // 単独移動の場合
            showReasonModal(player, event.currentTarget);
        }
    });
});

// モーダルの確定ボタン処理を更新（単独移動の場合）
confirmReasonBtn.addEventListener("click", () => {
    const reason = moveReasonSelect.value;
    if (!reason) {
        alert("理由を選択してください");
        return;
    }

    // 移動可能かチェック
    if (!canEnterField(currentDraggedPlayer.dataset.name, targetArea)) {
        reasonModal.style.display = "none";
        currentDraggedPlayer = null;
        targetArea = null;
        return;
    }

    // RCまたは負傷でOUTした場合、forbiddenPlayersに追加
    if (reason.includes('RC') || (reason.includes('負傷') && reason.includes('OUT'))) {
        forbiddenPlayers.add(currentDraggedPlayer.dataset.name);
    }

    targetArea.appendChild(currentDraggedPlayer);
    recordHistory(currentDraggedPlayer.dataset.name, targetArea.id, reason);

    reasonModal.style.display = "none";
    currentDraggedPlayer = null;
    targetArea = null;
});


// 選手交代モーダルの確定ボタン処理を更新
confirmReasonBtn2.addEventListener("click", () => {
    const reason = moveReasonSelect2.value;
    if (!reason) {
        alert("理由を選択してください");
        return;
    }

    // 入場する選手のチェック（交代する選手の情報も渡す）
    if (!canEnterField(firstSelectedPlayer2.dataset.name,
        secondSelectedPlayer2.parentElement,
        secondSelectedPlayer2)) {
        reasonModal2.style.display = "none";
        firstSelectedPlayer2 = null;
        secondSelectedPlayer2 = null;
        return;
    }

    // RCまたは負傷でOUTした場合、forbiddenPlayersに追加
    if (reason.includes('RC') || (reason.includes('負傷') && reason.includes('OUT'))) {
        forbiddenPlayers.add(secondSelectedPlayer2.dataset.name);
    }

    recordSubstitutionHistory(
        firstSelectedPlayer2.dataset.name,
        secondSelectedPlayer2.dataset.name,
        reason
    );

    // 位置の交換
    const tempParent = firstSelectedPlayer2.parentElement;
    secondSelectedPlayer2.parentElement.appendChild(firstSelectedPlayer2);
    tempParent.appendChild(secondSelectedPlayer2);

    reasonModal2.style.display = "none";
    firstSelectedPlayer2 = null;
    secondSelectedPlayer2 = null;
});

// キャンセルボタンの処理
cancelReasonBtn.addEventListener("click", () => {
    reasonModal.style.display = "none";
    currentDraggedPlayer = null;
    targetArea = null;
});

cancelReasonBtn2.addEventListener("click", () => {
    reasonModal2.style.display = "none";
    firstSelectedPlayer2 = null;
    secondSelectedPlayer2 = null;
});

// 登録ボタンのイベントリスナー
registerButton.addEventListener("click", () => {
    const inputNames = playerNamesInput.value.trim();
    if (inputNames) {
        const playerNames = inputNames.split(',').map(name => name.trim()).filter(name => name);
        generatePlayers(playerNames);
        playerNamesInput.value = '';
    }
});


function saveHTML() {
    const contentElement = document.getElementById('history-list');
    const bench = document.getElementById('bench');
    const field = document.getElementById('field');
    const tempOut = document.getElementById('tempOut');

    // 各要素のテキストを取得
    const contentText = contentElement ? contentElement.innerText : ''; // history-list のテキスト
    const benchText = bench ? bench.innerText : ''; // bench のテキスト
    const fieldText = field ? field.innerText : ''; // field のテキスト
    const tempOutText = tempOut ? tempOut.innerText : ''; // tempOut のテキスト

    // 現在日時を取得してフォーマット
    const now = new Date();
    const timestamp = now.toISOString().replace(/[-T:\.Z]/g, '').slice(0, 14); // 例: 20241221123045
    const formattedDate = now.toLocaleString(); // ローカル日時形式

    // 保存するテキストを作成
    const finalText = `タイム:\n${formattedDate}\n\n` +
        `履歴:\n${contentText.split('\n').filter(line => line.trim() !== '追記').join('\n')}\n\n` +
        `ベンチ:\n${benchText.split('\n').filter(line => line.trim() !== 'ベンチ').join('\n')}\n\n` +
        `ピッチ:\n${fieldText.split('\n').filter(line => line.trim() !== 'ピッチ').join('\n')}\n\n` +
        `ピッチ外:\n${tempOutText.split('\n').filter(line => line.trim() !== 'ピッチ外').join('\n')}\n\n`;

    // テキストを保存
    const blob = new Blob([finalText], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `content_${timestamp}.txt`; // ファイル名にタイムスタンプを使用
    link.click();
    URL.revokeObjectURL(link.href);
}


// リセットボタンの処理
function resetContent() {
    const contentElement = document.getElementById('history-list');
    contentElement.innerHTML = ''; // 指定した要素の中身をクリア
}

// 移動履歴を記録
function recordHistory(playerName, targetArea, reason) {
    const timestamp = timeDisplay.textContent; // ストップウォッチの値を使う

    // 履歴項目のリストアイテム作成
    const historyItem = document.createElement("div");
    historyItem.className = "history-item";

    // 詳細テキスト
    const details = document.createElement("span");
    let actionText = "";
    if (targetArea === "field") {
        actionText = "ピッチに入りました";
    } else if (targetArea === "bench") {
        actionText = "ピッチから退きました";
    } else if (targetArea === "tempOut") {
        actionText = "ピッチから退きました";
    } else if (targetArea === "append") {
        actionText = "追記されました";
    }
    details.textContent = `${timestamp}: ${playerName} が ${actionText} (${reason})`;

    // 追記ボタン
    const appendButton = document.createElement("button");
    appendButton.textContent = "追記";
    appendButton.className = "append-button";
    appendButton.addEventListener("click", () => openReasonWindow(playerName));

    // リストアイテムに子要素を追加
    historyItem.appendChild(details);
    historyItem.appendChild(appendButton);

    // 履歴リストに追加
    historyList.appendChild(historyItem);
    historyList.scrollTop = historyList.scrollHeight;
}



// 理由選択ウィンドウを開く
function openReasonWindow(playerName) {
    // 理由選択用ウィンドウの作成
    const reasonWindow = document.createElement("div");
    reasonWindow.className = "reason-window";

    // タイトル
    const title = document.createElement("p");
    title.textContent = "追記理由を選択";
    reasonWindow.appendChild(title);

    // 理由リストをプルダウンメニューに変更
    const select = document.createElement("select");
    const reasons = [
        "HIA IN>>戦術IN", "HIA OUT>>戦術OUT", "HIA IN>>負傷IN", "HIA OUT>>負傷OUT",
        "出血IN>>戦術IN", "出血OUT>>戦術OUT", "出血IN>>負傷IN", "出血OUT>>負傷OUT", "---"
    ];
    reasons.forEach(reason => {
        const option = document.createElement("option");
        option.value = reason;
        option.textContent = reason;
        select.appendChild(option);
    });
    reasonWindow.appendChild(select);

    // OKボタン
    const okButton = document.createElement("button");
    okButton.textContent = "OK";
    okButton.addEventListener("click", () => {
        const selectedReason = select.value;
        if (selectedReason) {
            recordHistory(playerName, "append", selectedReason); // 新たな履歴を追加
        }
        document.body.removeChild(reasonWindow); // ウィンドウを閉じる
    });
    reasonWindow.appendChild(okButton);

    // キャンセルボタン
    const cancelButton = document.createElement("button");
    cancelButton.textContent = "キャンセル";
    cancelButton.addEventListener("click", () => {
        document.body.removeChild(reasonWindow); // ウィンドウを閉じる
    });
    reasonWindow.appendChild(cancelButton);

    // ウィンドウを画面に追加
    document.body.appendChild(reasonWindow);
}

// 登録ボタンがクリックされたときの処理
registerButton.addEventListener("click", () => {
    const inputNames = playerNamesInput.value.trim();
    if (inputNames) {
        const playerNames = inputNames.split(',').map(name => name.trim()).filter(name => name);
        generatePlayers(playerNames);
        playerNamesInput.value = ''; // 入力ボックスをリセット
    }
});


// 登録ボタンがクリックされたときの処理
registerButton.addEventListener("click", () => {
    const inputNames = playerNamesInput.value.trim();
    if (inputNames) {
        const playerNames = inputNames.split(',').map(name => name.trim()).filter(name => name);
        generatePlayers(playerNames);
        playerNamesInput.value = ''; // 入力ボックスをリセット
    }
});


// 12-22 ///////////////////////////////////////////

// 既存の変数宣言の後に追加
let forbiddenPlayers = new Set(); // RCまたは負傷でOUTした選手を記録

// 選手名の最後の文字がBまたはCの数をカウントする関数
function countBCPlayers(area) {
    const players = Array.from(area.getElementsByClassName('player'));
    return players.filter(player => {
        const name = player.dataset.name;
        const lastChar = name[name.length - 1].toUpperCase();
        return lastChar === 'B' || lastChar === 'C';
    }).length;
}

// 選手がピッチに入ることができるかチェックする関数
function canEnterField(playerName, targetArea) {
    // RCまたは負傷でOUTした選手のチェック
    if (forbiddenPlayers.has(playerName)) {
        alert('この選手は再びピッチに入ることはできません');
        return false;
    }

    // B/C制限のチェック（ピッチに入る場合のみ）
    if (targetArea.id === 'field') {
        const lastChar = playerName[playerName.length - 1].toUpperCase();
        if (lastChar === 'B' || lastChar === 'C') {
            const currentCount = countBCPlayers(field);
            if (currentCount >= 4) {
                alert('ピッチ上のB/C選手が4人を超えるため、この操作はできません');
                return false;
            }
        }
    }
    return true;
}


// B/C選手の交代をチェックする関数
function isBCorC(name) {
    const lastChar = name[name.length - 1].toUpperCase();
    return lastChar === 'B' || lastChar === 'C';
}

// 選手がピッチに入ることができるかチェックする関数を更新
function canEnterField(playerName, targetArea, replacingPlayer = null) {
    // RCまたは負傷でOUTした選手のチェック
    if (forbiddenPlayers.has(playerName)) {
        alert('この選手は再びピッチに入ることはできません');
        return false;
    }

    // B/C制限のチェック（ピッチに入る場合のみ）
    if (targetArea.id === 'field') {
        const isIncomingBC = isBCorC(playerName);

        if (isIncomingBC) {
            // 交代の場合
            if (replacingPlayer) {
                const isReplacingBC = isBCorC(replacingPlayer.dataset.name);
                // B/C選手同士の交代の場合は許可
                if (isReplacingBC) {
                    return true;
                }
            }
            const currentCount = countBCPlayers(field);
            if (currentCount >= 4) {
                alert('ピッチ上のB/C選手が4人を超えるため、この操作はできません');
                return false;
            }
        }
    }
    return true;
}


