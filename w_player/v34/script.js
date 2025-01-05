
/////////////////////////////////////////////////////////////////////
//////// ピッチ外からピッチ内移動メニュー消えた v14 as baseline ////////////
//////////////////////////////////////////////////////////////////////

// DOM要素の取得
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
let targetSeat = null;
let dragStartSeat = null;
let isDragging = false;
let isProcessingMove = false;

// 状態確認用の関数
function checkMoveState() {
    console.log('Current state:', {
        isProcessingMove,
        currentDraggedPlayer,
        dragStartSeat,
        targetArea
    });
}

// 状態をリセットする関数
function clearMoveState() {
    console.log('Clearing move state');
    isProcessingMove = false;
    currentDraggedPlayer = null;
    dragStartSeat = null;
    targetArea = null;

    checkMoveState();  // リセット後の状態チェック
}

// 単独移動用のモーダル表示
function showReasonModal(player, target) {
    clearMoveState();
    currentDraggedPlayer = player;
    targetArea = target;
    reasonModal.style.display = "flex";
    moveReasonSelect.value = "YC";
}

// 選手交代用のモーダル表示
function showReasonModalForSwap2(player1, player2, target) {
    firstSelectedPlayer2 = player1;
    secondSelectedPlayer2 = player2;
    reasonModal2.style.display = "flex";
    moveReasonSelect2.value = "戦術";
}

function generatePlayers(playerNames) {
    // エリアの初期化（タイトル部分も含む）
    bench.innerHTML = '<div class="area-title">ベンチ</div>';
    field.innerHTML = '<div class="area-title">ピッチ</div>';
    tempOut.innerHTML = '<div class="area-title">ピッチ外</div>';

    // ピッチ用の席を15個作成（ピッチ内）
    for (let i = 0; i < 15; i++) {
        const seat = createSeatElement(i + 1);
        field.appendChild(seat);
    }

    // ピッチ外エリアにはシートを作成しない

    // プレイヤーの配置
    playerNames.forEach((name, index) => {
        const player = createPlayerElement(name);

        if (index < 15) {
            // ピッチ内の席に選手を配置
            const seat = field.querySelector(`.seat[data-position="${index + 1}"]`);
            if (seat) {
                seat.appendChild(player);
                markSeatOccupied(seat);
            }
        } else if (index < 23) {
            bench.appendChild(player);
        } else {
            // ピッチ外に選手を配置（直接エリアに追加）
            tempOut.appendChild(player);
        }
    });
    console.log(playerNames);
    updateAndSave();  // 状態の更新と保存処理
}

// 座席が占有された場合にスタイルを変更
function markSeatOccupied(seat) {
    seat.classList.add('occupied');
}

// 状態の更新と保存処理（ダミー）
function updateAndSave() {
    console.log("状態の更新と保存処理");
}


// 席の状態を占有済みに変更
function markSeatOccupied(seat) {
    seat.classList.remove('empty');
    seat.classList.add('occupied');

    // プレースホルダーがあれば削除
    const placeholder = seat.querySelector('.placeholder');
    if (placeholder) {
        placeholder.remove();
    }
}

// 選手が席を抜けた際に空席印を表示する
function markSeatEmpty(seat) {
    seat.classList.add("empty");     
    const placeholder = seat.querySelector(".placeholder");
    if (placeholder) {
        placeholder.style.display = "block";
        console.log('markseatempty block')
    } else {
        // プレースホルダーが存在しない場合は新規作成
        const newPlaceholder = document.createElement("div");
        newPlaceholder.className = "placeholder";
        newPlaceholder.textContent = "空席";
        seat.appendChild(newPlaceholder);
        console.log('newPlaceholder.textContent')
    }
}

// 選手が座る席の空席印を非表示にする
function markSeatOccupied(seat) {
    seat.classList.remove("empty");
    const placeholder = seat.querySelector(".placeholder");
    if (placeholder) {
        placeholder.style.display = "none";
    }
}


// プレイヤーのドラッグ開始時の処理
function dragPlayer(event) {
    currentDraggedPlayer = event.target;
    dragStartSeat = event.target.parentElement;
    isDragging = true;
    event.dataTransfer.setData("text/plain", event.target.dataset.name);
}
// ドラッグ終了時の処理
function handleDragEnd(event) {
    if (!isDragging) return;

    isDragging = false;
    //currentDraggedPlayer = null;
    dragStartSeat = null;
}

// ドロップ可能かどうかの判定
function allowDrop(event) {
    event.preventDefault();
    const targetSeat = event.currentTarget;

    // ドロップ先が同じ席の場合は処理しない
    if (dragStartSeat === targetSeat) {
        return false;
    }
}

// シート要素の作成関数を更新
function createSeatElement(position) {
    const seat = document.createElement("div");
    seat.className = "seat";
    seat.dataset.position = position;

    // 空席の印（常に存在するが表示/非表示が切り替わる）
    const placeholder = document.createElement("div");
    placeholder.className = "placeholder";
    placeholder.textContent = "空席";
    seat.appendChild(placeholder);

    seat.ondragover = allowDrop;
    seat.ondrop = dropPlayer;

    return seat;
}

// プレイヤー要素の作成関数を更新
function createPlayerElement(name) {
    const player = document.createElement("div");
    player.className = "player";
    player.textContent = name;
    player.draggable = true;
    player.dataset.name = name;
    player.ondragstart = dragPlayer;
    player.ondragend = handleDragEnd;
    return player;
}

// シートの状態チェック - 修正版
function isSeatEmpty(seat) {
    const player = seat.querySelector('.player');
    const placeholder = seat.querySelector('.placeholder');
    return !player && placeholder && placeholder.style.display !== 'none';
}

// ドロップ時の処理 - 修正版
function dropPlayer(event) {
    event.preventDefault();
    const targetSeat = event.currentTarget;

    // 同じ席へのドロップは無視
    if (dragStartSeat === targetSeat) return;

    // すでに処理中の場合は無視
    if (isProcessingMove) return;

    const targetPlayer = targetSeat.querySelector('.player');

    if (!targetPlayer) {
        // 移動の場合
        handlePlayerMove(currentDraggedPlayer, targetSeat);
    } else {
        // 交代の場合
        handlePlayerSwap(currentDraggedPlayer, targetPlayer, targetSeat);
    }

    updateAndSave();
}
/* この部分はマルチラインコメントです。 
// 選手の移動処理 - 修正版 修正02:30
function handlePlayerMove(player, target) {
    if (isProcessingMove) return;
    isProcessingMove = true;

    // 移動元の情報を取得
    const fromArea = dragStartSeat.closest('.area').id;

    // targetがシートかエリアかを判定
    const isTargetSeat = target.classList.contains('seat');
    const targetArea = isTargetSeat ? target.closest('.area') : target;
    const toArea = targetArea.id;

    console.log('Move details:', {
        isTargetSeat,
        fromArea,
        toArea,
        target
    });

    showReasonModal(player, target);

    confirmReasonBtn.onclick = () => {
        // 移動元の席を空席状態に
        if (dragStartSeat) {
            markSeatEmpty(dragStartSeat);
        }

        // 移動先の処理
        if (isTargetSeat) {
            // シートへの移動
            target.appendChild(player);
            markSeatOccupied(target);
        } else {
            // エリア（ベンチまたはピッチ外）への直接移動
            targetArea.appendChild(player);
        }

        // 履歴に記録
        addToHistory('move', {
            player: player.dataset.name,
            reason: moveReasonSelect.value,
            fromArea,
            toArea
        });

        reasonModal.style.display = "none";
        updateAndSave();

        // 処理完了後にフラグをリセット
        setTimeout(() => {
            isProcessingMove = false;
            currentDraggedPlayer = null;
        }, 100);
    };
}
複数行にわたるコメントを記述する場合に便利です。 */

// handlePlayerMove関数を修正
function handlePlayerMove(player, target) {
    console.log('handlePlayerMove started');
    checkMoveState();  // 開始時の状態チェック

    if (isProcessingMove) {
        console.log('Move is already processing');
        return;
    }
    isProcessingMove = true;

    const fromArea = dragStartSeat.closest('.area').id;
    const isTargetSeat = target.classList.contains('seat');
    const targetArea = isTargetSeat ? target.closest('.area') : target;
    const toArea = targetArea.id;

    showReasonModal(player, target);

    confirmReasonBtn.onclick = () => {
        try {
            console.log('Confirm button clicked');

            if (dragStartSeat) {
                markSeatEmpty(dragStartSeat);
            }

            if (isTargetSeat) {
                target.appendChild(player);
                markSeatOccupied(target);
            } else {
                targetArea.appendChild(player);
            }

            addToHistory('move', {
                player: player.dataset.name,
                reason: moveReasonSelect.value,
                fromArea,
                toArea
            });

            reasonModal.style.display = "none";
            updateAndSave();

        } catch (error) {
            console.error('Error during move:', error);
        } finally {
            // 必ず状態をリセット
            clearMoveState();
        }
    };

    // キャンセルボタンの処理も確実に状態をリセット
    cancelReasonBtn.onclick = () => {
        console.log('Move cancelled');
        clearMoveState();
        reasonModal.style.display = "none";
    };
}


// 選手交代の処理 - 修正版
function handlePlayerSwap(outgoingPlayer, incomingPlayer, targetSeat) {
    const fromArea = dragStartSeat.closest('.area').id; // 元のエリア
    const toArea = targetSeat.closest('.area').id;     // 目標エリア

    showReasonModalForSwap2(outgoingPlayer, incomingPlayer, targetSeat);

    confirmReasonBtn2.onclick = () => {
        // ベンチの場合の特別処理
        if (toArea === 'bench') {
            // 選手を直接ベンチエリアに追加
            document.getElementById('bench').appendChild(outgoingPlayer);
        } else {
            // 通常のエリアの場合は席に配置
            targetSeat.appendChild(outgoingPlayer);
            markSeatOccupied(targetSeat); // 席を占有状態に
        }

        if (fromArea === 'bench') {
            // ベンチから選手を取り出し、エリアに配置
            document.getElementById(toArea).appendChild(incomingPlayer);
        } else {
            // 通常のエリアの場合は席に配置
            dragStartSeat.appendChild(incomingPlayer);
            // markSeatOccupied(dragStartSeat); // 必要に応じて
        }

        // 履歴に記録
        addToHistory('swap', {
            player1: outgoingPlayer.dataset.name,
            player2: incomingPlayer.dataset.name,
            reason: moveReasonSelect2.value,
            fromArea,
            toArea
        });

        reasonModal2.style.display = "none";
        updateAndSave();
    };
}



// 選手交代の履歴記録を1つにまとめる
function recordSubstitutionHistory(inPlayer, outPlayer, reason) {
    const timestamp = timeDisplay.textContent;
    const historyItem = document.createElement("div");
    historyItem.className = "history-item";

    // 一つの履歴項目として記録
    const details = document.createElement("span");
    details.textContent = `${reason} ${timestamp} ${inPlayer} → ${outPlayer}`;

    const appendButton = document.createElement("button");
    appendButton.textContent = "追記";
    appendButton.className = "append-button";
    appendButton.addEventListener("click", () => openReasonWindow(`${inPlayer} → ${outPlayer}`));

    historyItem.appendChild(details);
    historyItem.appendChild(appendButton);
    historyList.appendChild(historyItem);
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


// 修正4: イベントリスナーの更新
[bench, field, tempOut].forEach(area => {
    area.addEventListener("dragover", event => {
        event.preventDefault();
    });

    area.addEventListener("drop", event => {
        if (isProcessingMove) {
            event.preventDefault();
            return;
        }

        event.preventDefault();
        const playerName = event.dataTransfer.getData("text/plain");
        const player = document.querySelector(`[data-name="${playerName}"]`);
        const dropTarget = event.target.closest('.player');

        if (dropTarget && dropTarget !== player) {
            showReasonModalForSwap2(player, dropTarget, event.currentTarget);
        } else if (player && event.currentTarget !== player.parentElement) {
            showReasonModal(player, event.currentTarget);
        }
    });
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

    // 禁止プレイヤーリストを作成 (履歴情報に基づく)
    const forbiddenPlayer = [];
    const historyLines = contentText.split('\n');
    historyLines.forEach(line => {
        if (line.includes('RC') || line.includes('負傷OUT')) {
            const playerName = line.split(' ')[2]; // プレイヤー名を抽出
            if (playerName && !forbiddenPlayer.includes(playerName)) {
                forbiddenPlayer.push(playerName);
            }
        }
    });

    // 保留中の選手交代をフォーマット
    const pendingSubstitutionsText = pendingSubstitutions.map(sub => {
        return `${sub.player1Name} → ${sub.player2Name} (${sub.reason})`;
    }).join('\n');

    // 保留中の選手移動をフォーマット
    const pendingMovesText = pendingMoves.map(move => {
        return `${move.playerName} → ${getAreaName(move.targetArea)} (${move.reason})`;
    }).join('\n');

    // 現在日時を取得してフォーマット
    const now = new Date();
    const timestamp = now.toISOString().replace(/[-T:\.Z]/g, '').slice(0, 14); // 例: 20241221123045
    const formattedDate = now.toLocaleString(); // ローカル日時形式

    // 保存するテキストを作成
    const finalText = `日時:\n${formattedDate}\n\n` +
        `タイム:\n${stopWatchTime}\n\n` +
        `履歴:\n${historyLines.filter(line => !['追記', '削除'].includes(line.trim())).join('\n')}\n\n` +
        `ベンチ:\n${benchText.split('\n').filter(line => !['空席', 'ベンチ'].includes(line.trim())).join('\n')}\n\n` +
        `ピッチ:\n${fieldText.split('\n').filter(line => !['空席', 'ピッチ'].includes(line.trim())).join('\n')}\n\n` +
        `ピッチ外:\n${tempOutText.split('\n').filter(line => !['空席', 'ピッチ外'].includes(line.trim())).join('\n')}\n\n` +
        `禁止プレイヤー:\n${forbiddenPlayer.join(', ')}\n\n` +
        `保留中の選手交代:\n${pendingSubstitutionsText}\n\n` +
        `保留中の選手移動:\n${pendingMovesText}\n\n`;

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
    // 入力フォームのリセット
    playerNamesInput.value = '';

    // 表示エリアのリセット
    bench.innerHTML = '<div class="area-title">ベンチ</div>';
    field.innerHTML = '<div class="area-title">ピッチ</div>';
    tempOut.innerHTML = '<div class="area-title">ピッチ外</div>';
    historyList.innerHTML = '';

    // モーダル関連のリセット
    moveReasonSelect.value = 'YC';
    moveReasonSelect2.value = '戦術';
    reasonModal.style.display = 'none';
    reasonModal2.style.display = 'none';

    // 保留中の内容のリセット
    pendingSubstitutions = []; // 選手交代の保留をクリア
    pendingMoves = []; // 単独移動の保留をクリア

    // 保留エリアの表示をリセット
    const pendingSubstitutionsArea = document.getElementById('pendingSubstitutions');
    const pendingMovesArea = document.getElementById('pendingMoves');
    if (pendingSubstitutionsArea) pendingSubstitutionsArea.innerHTML = '';
    if (pendingMovesArea) pendingMovesArea.innerHTML = '';

    // 禁止プレイヤーリストのリセット
    forbiddenPlayers.clear();

    // ボタンのリセット
    registerButton.disabled = false;

    console.log('全ての記録と表示、保留中の内容がリセットされました。');
}


// 理由選択ウィンドウを開く
// 理由選択ウィンドウを開く関数を修正
function openReasonWindow(playerName) {
    const reasonWindow = document.createElement("div");
    reasonWindow.className = "reason-window";

    const title = document.createElement("p");
    title.textContent = "追記理由を選択";
    reasonWindow.appendChild(title);

    const select = document.createElement("select");
    const reasons = [
        "HIA_IN >> 戦術IN", "HIA_OUT >> 戦術OUT", "HIA_IN >> 負傷IN", "HIA_OUT >> 負傷OUT",
        "出血IN >> 戦術IN", "出血OUT >> 戦術OUT", "出血IN >> 負傷IN", "出血OUT >> 負傷OUT",
    ];
    reasons.forEach(reason => {
        const option = document.createElement("option");
        option.value = reason;
        option.textContent = reason;
        select.appendChild(option);
    });
    reasonWindow.appendChild(select);

    const okButton = document.createElement("button");
    okButton.textContent = "OK";
    okButton.addEventListener("click", () => {
        const selectedReason = select.value;
        if (selectedReason) {
            // 理由、時刻、選手名の順で記録
            const timestamp = timeDisplay.textContent;
            recordHistory(playerName, "append", `${selectedReason} ${timestamp} ${playerName}`);
        }
        document.body.removeChild(reasonWindow);
    });
    reasonWindow.appendChild(okButton);

    const cancelButton = document.createElement("button");
    cancelButton.textContent = "キャンセル";
    cancelButton.addEventListener("click", () => {
        document.body.removeChild(reasonWindow);
    });
    reasonWindow.appendChild(cancelButton);

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

// 保留中の操作を保存する配列
let pendingSubstitutions = [];
let pendingMoves = [];

// HTML要素の追加
function addPendingAreas() {
    const container = document.createElement('div');
    container.className = 'pending-container';
    container.innerHTML = `
        <div class="pending-area">
            <h3>保留中の選手交代</h3>
            <div id="pendingSubstitutions"></div>
        </div>
        <div class="pending-area">
            <h3>保留中の選手移動</h3>
            <div id="pendingMoves"></div>
        </div>
    `;
    document.querySelector('.container').after(container);
}

// モーダルに保留ボタンを追加
function addHoldButtons() {
    // 選手交代モーダルに保留ボタンを追加
    const modal2Buttons = reasonModal2.querySelector('.button-group');
    const holdButton2 = document.createElement('button');
    holdButton2.textContent = '保留';
    holdButton2.id = 'holdReasonBtn2';
    modal2Buttons.appendChild(holdButton2);

    // 単独移動モーダルに保留ボタンを追加
    const modalButtons = reasonModal.querySelector('.modal-content');
    const holdButton = document.createElement('button');
    holdButton.textContent = '保留';
    holdButton.id = 'holdReasonBtn';
    modalButtons.appendChild(holdButton);
}


// 保留中の選手交代の表示を更新
function displayPendingOperations() {
    // 選手交代の保留表示
    const subsArea = document.getElementById('pendingSubstitutions');
    subsArea.innerHTML = pendingSubstitutions.map((sub, index) => `
        <div class="pending-item">
            <span>${sub.player1Name} → ${sub.player2Name} (${sub.reason})</span>
            <div class="pending-buttons">
                <button onclick="executePendingSub(${index})">実行</button>
                <button onclick="deletePendingSub(${index})">削除</button>
            </div>
        </div>
    `).join('');

    // 選手移動の保留表示（変更なし）
    const movesArea = document.getElementById('pendingMoves');
    movesArea.innerHTML = pendingMoves.map((move, index) => `
        <div class="pending-item">
            <span>${move.playerName} → ${getAreaName(move.targetArea)} (${move.reason})</span>
            <div class="pending-buttons">
                <button onclick="executePendingMove(${index})">実行</button>
                <button onclick="deletePendingMove(${index})">削除</button>
            </div>
        </div>
    `).join('');
}


// エリア名を取得する補助関数
function getAreaName(areaId) {
    switch (areaId) {
        case 'field': return 'ピッチ';
        case 'bench': return 'ベンチ';
        case 'tempOut': return 'ピッチ外';
        default: return areaId;
    }
}

// 保留ボタンのイベントハンドラー
function initializeHoldButtons() {
    // 選手交代の保留
    document.getElementById('holdReasonBtn2').addEventListener('click', () => {
        const reason = moveReasonSelect2.value;
        if (!reason) {
            alert("理由を選択してください");
            return;
        }

        pendingSubstitutions.push({
            player1: firstSelectedPlayer2,
            player2: secondSelectedPlayer2,
            player1Name: firstSelectedPlayer2.dataset.name,
            player2Name: secondSelectedPlayer2.dataset.name,
            reason: reason
        });
        //console.log('wow pendingSubstitutions after push:', pendingSubstitutions);

        reasonModal2.style.display = "none";
        firstSelectedPlayer2 = null;
        secondSelectedPlayer2 = null;
        displayPendingOperations();

        // 状態保存
        updateAndSave();
    });


    // 単独移動の保留
    document.getElementById('holdReasonBtn').addEventListener('click', () => {
        const reason = moveReasonSelect.value;
        if (!reason) {
            alert("理由を選択してください");
            return;
        }
        pendingMoves.push({
            player: currentDraggedPlayer,
            playerName: currentDraggedPlayer.dataset.name,  ///errorerror
            targetArea: targetArea.id,
            targetSeat: targetSeat,    ///added
            reason: reason
        });

        reasonModal.style.display = "none";
        //currentDraggedPlayer = null;
        targetArea = null;
        displayPendingOperations();

        // 状態保存
        updateAndSave();
    });
}

// 保留中の選手交代を削除
function deletePendingSub(index) {
    // 配列から該当の要素を削除
    pendingSubstitutions.splice(index, 1);

    // localStorageを更新
    const serializedSubs = pendingSubstitutions.map(sub => ({
        player1Name: sub.player1Name,
        player2Name: sub.player2Name,
        reason: sub.reason
    }));
    localStorage.setItem(STORAGE_KEYS.PENDING_SUBS, JSON.stringify(serializedSubs));

    // 表示の更新
    displayPendingOperations();

    // 状態保存
    updateAndSave();
}

// 保留中の選手移動を削除
function deletePendingMove(index) {
    // 配列から該当の要素を削除
    pendingMoves.splice(index, 1);

    // localStorageを更新
    const serializedMoves = pendingMoves.map(move => ({
        playerName: move.playerName,
        targetArea: move.targetArea,
        reason: move.reason
    }));
    localStorage.setItem(STORAGE_KEYS.PENDING_MOVES, JSON.stringify(serializedMoves));

    // 表示の更新
    displayPendingOperations();

    // 状態保存
    updateAndSave();
}

// ページ読み込み時に初期化
document.addEventListener('DOMContentLoaded', () => {
    addPendingAreas();
    addHoldButtons();
    initializeHoldButtons();
});

///////////////////////////////////////////////////////////////


// アニメーション用のヘルパー関数
function getElementPosition(element) {
    const rect = element.getBoundingClientRect();
    return {
        x: rect.left + window.scrollX,
        y: rect.top + window.scrollY
    };
}

function animatePlayerSwap(player1, player2) {
    // 両プレイヤーの初期位置を取得
    const pos1 = getElementPosition(player1);
    const pos2 = getElementPosition(player2);

    // プレイヤー要素のクローンを作成
    const clone1 = player1.cloneNode(true);
    const clone2 = player2.cloneNode(true);

    // クローンの絶対位置を設定
    Object.assign(clone1.style, {
        position: 'fixed',
        left: `${pos1.x}px`,
        top: `${pos1.y}px`,
        zIndex: 1000,
        transition: 'all 0.5s ease'
    });

    Object.assign(clone2.style, {
        position: 'fixed',
        left: `${pos2.x}px`,
        top: `${pos2.y}px`,
        zIndex: 1000,
        transition: 'all 0.5s ease'
    });

    // クローンを body に追加
    document.body.appendChild(clone1);
    document.body.appendChild(clone2);

    // 元のプレイヤー要素を一時的に非表示
    player1.style.opacity = '0';
    player2.style.opacity = '0';

    // アニメーションを開始
    requestAnimationFrame(() => {
        clone1.style.left = `${pos2.x}px`;
        clone1.style.top = `${pos2.y}px`;
        clone2.style.left = `${pos1.x}px`;
        clone2.style.top = `${pos1.y}px`;
    });

    // アニメーション完了後のクリーンアップ
    setTimeout(() => {
        player1.style.opacity = '1';
        player2.style.opacity = '1';
        clone1.remove();
        clone2.remove();
    }, 500);
}


// 要素の位置を保持するための関数
function getGridPosition(element) {
    const parent = element.parentElement;
    const children = Array.from(parent.children);
    // area-title を除外して位置を取得
    const playerElements = children.filter(child => child.classList.contains('player'));
    return playerElements.indexOf(element);
}


// 選手交代モーダルの確定ボタン処理を更新（即時実行用）
confirmReasonBtn2.addEventListener("click", () => {
    const reason = moveReasonSelect2.value;

    if (!reason) {
        alert("理由を選択してください");
        return;
    }

    if (!canEnterField(firstSelectedPlayer2.dataset.name, secondSelectedPlayer2.parentElement, secondSelectedPlayer2)) {
        reasonModal2.style.display = "none";
        firstSelectedPlayer2 = null;
        secondSelectedPlayer2 = null;
        return;
    }

    if (reason.includes('戦術') || reason.includes('負傷')) {
        forbiddenPlayers.add(secondSelectedPlayer2.dataset.name);
    }

    // 交代前の位置と親要素を記録
    const pos1 = getGridPosition(firstSelectedPlayer2);
    const pos2 = getGridPosition(secondSelectedPlayer2);
    const parent1 = firstSelectedPlayer2.parentElement;
    const parent2 = secondSelectedPlayer2.parentElement;

    // 履歴を記録
    recordSubstitutionHistory(firstSelectedPlayer2.dataset.name, secondSelectedPlayer2.dataset.name, reason);

    // アニメーション付きの選手交代を実行
    animatePlayerSwap(firstSelectedPlayer2, secondSelectedPlayer2);

    // アニメーション完了後に DOM の位置を更新
    setTimeout(() => {
        // 元の要素を削除する前にクローンを作成
        const clone1 = firstSelectedPlayer2.cloneNode(true);
        const clone2 = secondSelectedPlayer2.cloneNode(true);

        // ドラッグ&ドロップのイベントリスナーを再設定
        setupDragAndDrop(clone1);
        setupDragAndDrop(clone2);

        // 元の要素を削除
        firstSelectedPlayer2.remove();
        secondSelectedPlayer2.remove();

        // 新しい要素を挿入
        insertAtPosition(parent2, clone1, pos2);
        insertAtPosition(parent1, clone2, pos1);

        // 状態リセット
        reasonModal2.style.display = "none";
        firstSelectedPlayer2 = null;
        secondSelectedPlayer2 = null;
    }, 500); // アニメーション時間に同期
});


// ドラッグ&ドロップイベントの再設定のためのヘルパー関数
function setupDragAndDrop(element) {
    element.addEventListener("dragstart", event => {
        event.target.classList.add("dragging");
        event.dataTransfer.setData("text/plain", event.target.dataset.name);
    });

    element.addEventListener("dragend", event => {
        event.target.classList.remove("dragging");
    });
}

// insertAtPosition 関数を更新して、ドラッグ&ドロップの再設定を含める
function insertAtPosition(parent, element, position) {
    const children = Array.from(parent.children);
    const playerElements = children.filter(child => child.classList.contains('player'));
    const titleElement = parent.querySelector('.area-title');

    // ドラッグ&ドロップの設定を追加
    element.draggable = true;
    setupDragAndDrop(element);

    if (position >= 0 && position < playerElements.length) {
        const targetElement = playerElements[position];
        parent.insertBefore(element, targetElement);
    } else {
        if (titleElement && titleElement.nextSibling) {
            parent.insertBefore(element, titleElement.nextSibling);
        } else {
            parent.appendChild(element);
        }
    }
}

////////////////////////////////////////////////////////////

// 位置情報を保持するための関数を更新
function getGridPosition(element) {
    const parent = element.parentElement;
    const children = Array.from(parent.children);
    // area-title を除外して位置を取得
    const playerElements = children.filter(child => child.classList.contains('player'));
    return playerElements.indexOf(element);
}

// 指定した位置に要素を挿入する関数を更新
function insertAtPosition(parent, element, position) {
    const children = Array.from(parent.children);
    const playerElements = children.filter(child => child.classList.contains('player'));
    const titleElement = parent.querySelector('.area-title');

    // ドラッグ&ドロップの設定を追加
    element.draggable = true;
    setupDragAndDrop(element);

    if (position >= 0 && position < playerElements.length) {
        const targetElement = playerElements[position];
        parent.insertBefore(element, targetElement);
    } else {
        if (titleElement && titleElement.nextSibling) {
            parent.insertBefore(element, titleElement.nextSibling);
        } else {
            parent.appendChild(element);
        }
    }
}

// 保留中の選手交代を実行する関数を更新
function executePendingSub(index) {
    const sub = pendingSubstitutions[index];

    // forbidden playersのチェックを追加
    if (forbiddenPlayers.has(sub.player1.dataset.name) && sub.player2.parentElement.id === 'field') {
        alert('この選手は再びピッチに入ることはできません');
        return;
    }

    if (!canEnterField(sub.player1.dataset.name, sub.player2.parentElement, sub.player2)) {
        return;
    }

    // 交代前の位置と親要素を記録
    const pos1 = getGridPosition(sub.player1);
    const pos2 = getGridPosition(sub.player2);
    const parent1 = sub.player1.parentElement;
    const parent2 = sub.player2.parentElement;

    // アニメーション付きの選手交代を実行
    animatePlayerSwap(sub.player1, sub.player2);

    // 実際の位置交換を遅延実行
    setTimeout(() => {
        const temp1 = sub.player1.cloneNode(true);
        const temp2 = sub.player2.cloneNode(true);

        // 元の要素を削除
        sub.player1.remove();
        sub.player2.remove();

        // 新しい要素を指定位置に挿入
        insertAtPosition(parent2, temp1, pos2);
        insertAtPosition(parent1, temp2, pos1);

        // 履歴を記録
        recordSubstitutionHistory(sub.player1Name, sub.player2Name, sub.reason);

        // 保留リストから削除
        pendingSubstitutions.splice(index, 1);
        displayPendingOperations();
    }, 500); // アニメーション時間に同期

    updateAndSave();
}

////////////////////////////////////////////////////
////////////////////////////////////////////////////

// ローカルストレージのキー
const STORAGE_KEYS = {
    HISTORY: 'matchHistory',
    BENCH: 'benchPlayers',
    FIELD: 'fieldPlayers',
    TEMP_OUT: 'tempOutPlayers',
    FORBIDDEN: 'forbiddenPlayers',
    PENDING_SUBS: 'pendingSubstitutions',
    PENDING_MOVES: 'pendingMoves',
};

// 状態を復元する関数
function loadState() {
    // 履歴の復元
    const savedHistory = JSON.parse(localStorage.getItem(STORAGE_KEYS.HISTORY) || '[]');
    historyList.innerHTML = '';
    savedHistory.forEach(item => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';

        const details = document.createElement('span');
        details.textContent = item.text;

        const appendButton = document.createElement('button');
        appendButton.textContent = '追記';
        appendButton.className = 'append-button';
        appendButton.addEventListener('click', () =>
            openReasonWindow(item.text.split(' ')[1])
        );

        historyItem.appendChild(details);
        historyItem.appendChild(appendButton);
        historyList.appendChild(historyItem);
    });

    // エリアごとの選手の復元
    ['bench', 'field', 'tempOut'].forEach(areaId => {
        const area = document.getElementById(areaId);
        const savedPlayers = JSON.parse(localStorage.getItem(STORAGE_KEYS[areaId.toUpperCase()]) || '[]');

        // エリアタイトルの保持
        const areaTitle = area.querySelector('.area-title');
        area.innerHTML = '';
        area.appendChild(areaTitle);

        // 選手の復元
        savedPlayers.sort((a, b) => a.position - b.position).forEach(playerData => {
            const player = createPlayerElement(playerData.name);
            area.appendChild(player);
        });
    });

    // 禁止プレイヤーの復元
    const savedForbidden = JSON.parse(localStorage.getItem(STORAGE_KEYS.FORBIDDEN) || '[]');
    forbiddenPlayers = new Set(savedForbidden);

    // 保留中の選手交代の復元
    const savedSubs = JSON.parse(localStorage.getItem(STORAGE_KEYS.PENDING_SUBS) || '[]');
    //console.log('Saved pendingSubs:', savedSubs);


    pendingSubstitutions = savedSubs.map(sub => {
        const player1 = document.querySelector(`[data-name="${sub.player1Name}"]`);
        const player2 = document.querySelector(`[data-name="${sub.player2Name}"]`);
        return {
            player1,
            player2,
            player1Name: sub.player1Name,
            player2Name: sub.player2Name,
            reason: sub.reason
        };
    });


    // 保留中の選手移動の復元
    const savedMoves = JSON.parse(localStorage.getItem(STORAGE_KEYS.PENDING_MOVES) || '[]');

    pendingMoves = savedMoves.map(move => {
        const player = document.querySelector(`[data-name="${move.playerName}"]`);
        return {
            player,
            playerName: move.playerName,
            targetArea: move.targetArea,
            reason: move.reason
        };
    });


    // 保留中の操作の表示を更新
    displayPendingOperations();
}

///////////////////////////////////////////////////////

// 状態変更時に保存を実行する関数
function updateAndSave() {
    console.log('State is being saved');
    saveState();
    console.log('State saved successfully');
}

// イベントリスナーの追加
document.addEventListener('DOMContentLoaded', () => {
    loadState();

    // 既存のイベントリスナーに状態保存を追加
    ['drop', 'dragend'].forEach(eventName => {
        [bench, field, tempOut].forEach(area => {
            area.addEventListener(eventName, () => {
                setTimeout(updateAndSave, 600); // アニメーション完了後に保存
            });
        });
    });
});

// 履歴記録関数の更新
const originalRecordHistory = recordHistory;
recordHistory = function (...args) {
    originalRecordHistory.apply(this, args);
    updateAndSave();
};

// 選手交代履歴記録関数の更新
const originalRecordSubstitutionHistory = recordSubstitutionHistory;
recordSubstitutionHistory = function (...args) {
    originalRecordSubstitutionHistory.apply(this, args);
    updateAndSave();
};

// リセットボタンの処理を更新
const originalResetContent = resetContent;
resetContent = function () {
    originalResetContent();
    localStorage.clear(); // ローカルストレージをクリア
};


// 理由選択ウィンドウを開く関数を更新
function openReasonWindow(playerInfo) {
    const reasonWindow = document.createElement("div");
    reasonWindow.className = "reason-window";

    const title = document.createElement("p");
    title.textContent = "追記理由を選択";
    reasonWindow.appendChild(title);

    const select = document.createElement("select");
    const reasons = [
        "出血>>戦術",
        "出血>>負傷",
        "HIA>>戦術",
        "HIA>>負傷"
    ];
    reasons.forEach(reason => {
        const option = document.createElement("option");
        option.value = reason;
        option.textContent = reason;
        select.appendChild(option);
    });
    reasonWindow.appendChild(select);

    const okButton = document.createElement("button");
    okButton.textContent = "OK";
    okButton.addEventListener("click", () => {
        const selectedReason = select.value;
        if (selectedReason) {
            const timestamp = timeDisplay.textContent;
            recordHistory(playerInfo, "append", `${selectedReason} ${timestamp} ${playerInfo}`);
        }
        document.body.removeChild(reasonWindow);
    });
    reasonWindow.appendChild(okButton);

    const cancelButton = document.createElement("button");
    cancelButton.textContent = "キャンセル";
    cancelButton.addEventListener("click", () => {
        document.body.removeChild(reasonWindow);
    });
    reasonWindow.appendChild(cancelButton);

    document.body.appendChild(reasonWindow);
}

// 移動履歴の削除機能を追加した記録関数
function recordHistory(playerName, targetArea, reason) {
    const historyItem = document.createElement("div");
    historyItem.className = "history-item";

    const details = document.createElement("span");
    if (targetArea === "append") {
        details.textContent = reason;
    } else {
        const timestamp = timeDisplay.textContent;
        details.textContent = `${reason} ${timestamp} ${playerName}`;
    }

    // ボタンを格納するコンテナ
    const buttonContainer = document.createElement("div");
    buttonContainer.className = "history-button-container";

    // 追記ボタン
    const appendButton = document.createElement("button");
    appendButton.textContent = "追記";
    appendButton.className = "append-button";
    appendButton.addEventListener("click", () =>
        openReasonWindow(playerName)
    );

    // 削除ボタン
    const deleteButton = document.createElement("button");
    deleteButton.textContent = "削除";
    deleteButton.className = "delete-button";

    deleteButton.addEventListener("click", () => {
        historyItem.remove();
        updateAndSave(); // 状態を保存
    });

    buttonContainer.appendChild(appendButton);
    buttonContainer.appendChild(deleteButton);
    historyItem.appendChild(details);
    historyItem.appendChild(buttonContainer);
    historyList.appendChild(historyItem);
    historyList.scrollTop = historyList.scrollHeight;
}

// 選手交代の履歴記録関数も更新
function recordSubstitutionHistory(inPlayer, outPlayer, reason) {
    const timestamp = timeDisplay.textContent;
    const historyItem = document.createElement("div");
    historyItem.className = "history-item";

    const details = document.createElement("span");
    details.textContent = `${reason} ${timestamp} ${inPlayer} → ${outPlayer}`;

    // ボタンを格納するコンテナ
    const buttonContainer = document.createElement("div");
    buttonContainer.className = "history-button-container";

    // 追記ボタン
    const appendButton = document.createElement("button");
    appendButton.textContent = "追記";
    appendButton.className = "append-button";
    appendButton.addEventListener("click", () =>
        openReasonWindow(`${inPlayer} → ${outPlayer}`)
    );

    // 削除ボタン
    const deleteButton = document.createElement("button");
    deleteButton.textContent = "削除";
    deleteButton.className = "delete-button";

    deleteButton.addEventListener("click", () => {
            historyItem.remove();
            updateAndSave(); // 状態を保存
        });

    buttonContainer.appendChild(appendButton);
    buttonContainer.appendChild(deleteButton);
    historyItem.appendChild(details);
    historyItem.appendChild(buttonContainer);
    historyList.appendChild(historyItem);
    historyList.scrollTop = historyList.scrollHeight;
}

// 状態保存関数を更新して削除された履歴を反映
function saveState() {
    // 履歴の保存（削除された項目は自動的に除外される）
    const historyItems = Array.from(historyList.children).map(item => ({
        text: item.querySelector('span').textContent,
        timestamp: item.querySelector('span').textContent.split(' ')[1]
    }));
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(historyItems));

    // 他の状態保存処理は変更なし
    ['bench', 'field', 'tempOut'].forEach(areaId => {
        const area = document.getElementById(areaId);
        const players = Array.from(area.getElementsByClassName('player')).map(player => ({
            name: player.dataset.name,
            position: getGridPosition(player)
        }));
        localStorage.setItem(STORAGE_KEYS[areaId.toUpperCase()], JSON.stringify(players));
    });

    localStorage.setItem(STORAGE_KEYS.FORBIDDEN, JSON.stringify(Array.from(forbiddenPlayers)));

    const serializedSubs = pendingSubstitutions.map(sub => ({
        player1Name: sub.player1Name,
        player2Name: sub.player2Name,
        reason: sub.reason
    }));
    localStorage.setItem(STORAGE_KEYS.PENDING_SUBS, JSON.stringify(serializedSubs));

    const serializedMoves = pendingMoves.map(move => ({
        playerName: move.playerName,
        targetArea: move.targetArea,
        reason: move.reason
    }));
    localStorage.setItem(STORAGE_KEYS.PENDING_MOVES, JSON.stringify(serializedMoves));
}

// 履歴の読み込み処理も更新
function loadState() {
    const savedHistory = JSON.parse(localStorage.getItem(STORAGE_KEYS.HISTORY) || '[]');
    historyList.innerHTML = '';
    savedHistory.forEach(item => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';

        const details = document.createElement('span');
        details.textContent = item.text;

        // ボタンを格納するコンテナ
        const buttonContainer = document.createElement("div");
        buttonContainer.className = "history-button-container";

        // 追記ボタン
        const appendButton = document.createElement('button');
        appendButton.textContent = '追記';
        appendButton.className = 'append-button';
        appendButton.addEventListener('click', () => {
            // 選手交代の場合と単独移動の場合で処理を分ける
            const text = item.text;
            if (text.includes('→')) {
                const players = text.split(' ').slice(-3).join(' ');
                openReasonWindow(players);
            } else {
                const playerName = text.split(' ').slice(-1)[0];
                openReasonWindow(playerName);
            }
        });

        // 削除ボタン
        const deleteButton = document.createElement('button');
        deleteButton.textContent = '削除';
        deleteButton.className = 'delete-button';
        deleteButton.addEventListener('click', () => {
                historyItem.remove();
                updateAndSave();
            });

        buttonContainer.appendChild(appendButton);
        buttonContainer.appendChild(deleteButton);
        historyItem.appendChild(details);
        historyItem.appendChild(buttonContainer);
        historyList.appendChild(historyItem);
    });

}

// 選手の元の位置を保存するためのグローバルマップ
let playerPositions = new Map();

// ローカルストレージのキーを追加
STORAGE_KEYS.PLAYER_POSITIONS = 'playerPositions';

// 選手の位置を保存する関数
function savePlayerPosition(player, areaId) {
    if (areaId === 'field') {
        const position = getGridPosition(player);
        const siblings = Array.from(player.parentElement.children)
            .filter(child => child.classList.contains('player'));

        playerPositions.set(player.dataset.name, {
            position: position,
            totalPlayers: siblings.length
        });
    }
}

// 指定した位置に要素を挿入する関数を更新
function insertAtPosition(parent, element, position, isReturn = false) {
    const children = Array.from(parent.children);
    const playerElements = children.filter(child => child.classList.contains('player'));
    const titleElement = parent.querySelector('.area-title');

    element.draggable = true;
    setupDragAndDrop(element);

    // ピッチに戻る場合で、保存された位置がある場合
    if (isReturn && parent.id === 'field' && playerPositions.has(element.dataset.name)) {
        const savedData = playerPositions.get(element.dataset.name);
        const currentPlayers = playerElements.length;

        // 保存された位置が現在のプレイヤー数よりも小さい場合のみ使用
        if (savedData.position < currentPlayers) {
            if (playerElements[savedData.position]) {
                parent.insertBefore(element, playerElements[savedData.position]);
            } else {
                parent.appendChild(element);
            }
            // 位置情報を使用したので削除
            playerPositions.delete(element.dataset.name);
            return;
        }
    }

    // 通常の挿入ロジック
    if (position >= 0 && position < playerElements.length) {
        const targetElement = playerElements[position];
        parent.insertBefore(element, targetElement);
    } else {
        if (titleElement && titleElement.nextSibling) {
            parent.insertBefore(element, titleElement.nextSibling);
        } else {
            parent.appendChild(element);
        }
    }
}

// 単独移動の実行関数を更新
function executePendingMove(index) {
    const move = pendingMoves[index];
    const player = move.player;
    const sourceArea = player.parentElement.id;
    const targetArea = document.getElementById(move.targetArea);

    if (!canEnterField(move.playerName, targetArea)) {
        return;
    }

    // ピッチから出る場合は位置を保存
    if (sourceArea === 'field' && move.targetArea !== 'field') {
        savePlayerPosition(player, sourceArea);
    }

    // 要素を移動（ピッチに戻る場合は isReturn フラグを true に）
    player.remove();
    insertAtPosition(
        targetArea,
        player,
        0,
        sourceArea !== 'field' && move.targetArea === 'field'
    );

    recordHistory(move.playerName, move.targetArea, move.reason);
    pendingMoves.splice(index, 1);
    displayPendingOperations();
    updateAndSave();
}

// 状態保存関数を更新
const originalSaveState = saveState;
saveState = function () {
    originalSaveState();
    // 位置情報をJSON形式で保存
    const positionsObj = Object.fromEntries(playerPositions);
    localStorage.setItem(STORAGE_KEYS.PLAYER_POSITIONS, JSON.stringify(positionsObj));
};

// 状態読み込み関数を更新
const originalLoadState = loadState;
loadState = function () {
    originalLoadState();
    // 位置情報を復元
    const savedPositions = JSON.parse(localStorage.getItem(STORAGE_KEYS.PLAYER_POSITIONS) || '{}');
    playerPositions = new Map(Object.entries(savedPositions));
};



// モーダル選択肢を動的に更新する関数
function updateMoveReasonOptions(isMovingToField) {
    const moveReasonSelect = reasonModal.querySelector("#moveReason");
    moveReasonSelect.innerHTML = ''; // 既存の選択肢をクリア

    if (isMovingToField) {
        // ピッチへの移動理由
        const toFieldReasons = [
            { value: "YC復帰", label: "YC復帰" },
            { value: "RC復帰", label: "RC復帰" },
            { value: "FPRO復帰", label: "FPRO復帰" },
        ];

        toFieldReasons.forEach(reason => {
            const option = document.createElement("option");
            option.value = reason.value;
            option.textContent = reason.label;
            moveReasonSelect.appendChild(option);
        });
    } else {
        // ピッチ外への移動理由
        const fromFieldReasons = [
            { value: "YC", label: "YC" },
            { value: "RC", label: "RC" },
            { value: "FPRO", label: "FPRO" },
        ];

        fromFieldReasons.forEach(reason => {
            const option = document.createElement("option");
            option.value = reason.value;
            option.textContent = reason.label;
            moveReasonSelect.appendChild(option);
        });
    }
}



/* この部分はマルチラインコメントです。
// モーダル選択肢を動的に更新する関数
function updateMoveReasonOptions(isMovingToField) {
    const moveReasonSelect = reasonModal.querySelector("#moveReason");
    moveReasonSelect.innerHTML = ''; // 既存の選択肢をクリア

    if (isMovingToField) {
        // ピッチへの移動理由
        const toFieldReasons = [
            { value: "YC復帰", label: "YC復帰" },
            { value: "RC復帰", label: "RC復帰" },
            { value: "FPRO復帰", label: "FPRO復帰" },
        ];

        toFieldReasons.forEach(reason => {
            const option = document.createElement("option");
            option.value = reason.value;
            option.textContent = reason.label;
            moveReasonSelect.appendChild(option);
        });
    } else {
        // ピッチ外への移動理由
        const fromFieldReasons = [
            { value: "YC", label: "YC" },
            { value: "RC", label: "RC" },
            { value: "FPRO", label: "FPRO" },
        ];

        fromFieldReasons.forEach(reason => {
            const option = document.createElement("option");
            option.value = reason.value;
            option.textContent = reason.label;
            moveReasonSelect.appendChild(option);
        });
    }
}
 複数行にわたるコメントを記述する場合に便利です。 */

//この関数が要
// 単独移動用のモーダル表示関数を更新
/* この部分はマルチラインコメントです。 
function showReasonModal(player, target) {
    currentDraggedPlayer = player;
    targetArea = target;

    // プレイヤーがピッチに移動するかどうかを判定
    const isMovingToField = target.id === 'field';

    // ピッチからの移動とピッチへの移動で選択肢を変更
    updateMoveReasonOptions(isMovingToField);

    // モーダルのタイトルを更新
    const modalTitle = reasonModal.querySelector(".modal-title");
    if (modalTitle) {
        modalTitle.textContent = isMovingToField ?
            "ピッチへの移動理由を選択" :
            "ピッチ外への移動理由を選択";
    }

    reasonModal.style.display = "flex";
}
複数行にわたるコメントを記述する場合に便利です。 */

function showReasonModal(player, target) {
    currentDraggedPlayer = player;
    targetArea = target;

    // target がシートかどうかをチェック
    const targetSeat = target.classList.contains('seat') ? target : null;

    // シートの場合、その親要素が field かどうかをチェック
    const isMovingToField = targetSeat ?
        targetSeat.closest('#field') !== null :
        target.id === 'field';

    console.log('Move details:', {
        targetIsField: target.id === 'field',
        targetIsSeat: targetSeat !== null,
        isMovingToField: isMovingToField
    });

    // ピッチからの移動とピッチへの移動で選択肢を変更
    updateMoveReasonOptions(isMovingToField);

    // モーダルのタイトルを更新
    const modalTitle = reasonModal.querySelector(".modal-title");
    if (modalTitle) {
        modalTitle.textContent = isMovingToField ?
            "ピッチへの移動理由を選択" :
            "ピッチ外への移動理由を選択";
    }

    // targetSeat が存在する場合は保存しておく
    if (targetSeat) {
        currentTargetSeat = targetSeat;
    }

    reasonModal.style.display = "flex";
}


// モーダルの確定ボタン処理を更新（単独移動の場合）
confirmReasonBtn.addEventListener("click", () => {
    const reason = moveReasonSelect.value;
    if (!reason) {
        alert("理由を選択してください");
        return;
    }
    // 移動可能かチェック
    if (!canEnterField(currentDraggedPlayer.dataset.name, targetArea)) {  ///errorerror
        reasonModal.style.display = "none";
        //currentDraggedPlayer = null;
        targetArea = null;
        return;
    }

    // 戦術または負傷でOUTした場合、forbiddenPlayersに追加、機能していない
    if (reason.includes('戦術') || reason.includes('負傷')) {
        forbiddenPlayers.add(currentDraggedPlayer.dataset.name);
    }

    targetArea.appendChild(currentDraggedPlayer);
    recordHistory(currentDraggedPlayer.dataset.name, targetArea.id, reason);
    reasonModal.style.display = "none";
});

function getLocalStorageUsage() {
    let total = 0;
    for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
            let value = localStorage[key];
            // キーと値の長さを計算
            total += key.length + value.length;
        }
    }
    // バイトをKBに変換して表示
    console.log(`使用容量: ${(total / 1024).toFixed(2)} KB`);
    console.log(`最大容量: 約5 MB`);
}

getLocalStorageUsage();

////////////////////////////////////////////
