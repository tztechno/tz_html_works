
/////////////////////////////////////////////////////////////////////
//////// v37_Final /////////////////////////////////////////
//////// 2024-01-12 20:14 ///////////////////
/////////////////////////////////////////////////////////////////////


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
            const fieldState = playerNames.slice(0, 15).map((name, index) => ({
                position: index + 1,
                player: name
            }));
            localStorage.setItem(STORAGE_KEYS.FIELD, JSON.stringify(fieldState));
            //console.log('初期seat',seat)//一人ずつ

        } else if (index < 23) {
            bench.appendChild(player);
        } else {
            // ピッチ外に選手を配置（直接エリアに追加）
            tempOut.appendChild(player);
        }
    });

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
        newPlaceholder.textContent = "  ";
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
    updateAndSave();
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
    placeholder.textContent = "  ";
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


/* この部分はマルチラインコメントです。 複数行にわたるコメントを記述する場合に便利です。 */
/* この部分はマルチラインコメントです。 複数行にわたるコメントを記述する場合に便利です。 */
/// 修正版

function handlePlayerMove(player, target) {
    checkMoveState(); // 開始時の状態チェック

    if (isProcessingMove) {
        console.log('Move is already processing');
        return;
    }
    isProcessingMove = true;

    const isTargetSeat = target.classList.contains('seat');

    if (isTargetSeat) {
        // 移動ではターゲットシートが空である必要がある
        if (target.querySelector('.player')) {
            alert('The target seat is already occupied. Please choose an empty seat.');
            clearMoveState();
            return;
        }

        /* この部分はマルチラインコメントです。 複数行にわたるコメントを記述する場合に便利です。 */        
    }

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
                target.closest('.area').appendChild(player);
            }

            reasonModal.style.display = "none";

            updateAndSave();
        } catch (error) {
            console.error('Error during move:', error);
        } finally {
            clearMoveState(); // 必ず状態をリセット
        }
    };

    cancelReasonBtn.onclick = () => {
        console.log('Move cancelled');
        clearMoveState();
        reasonModal.style.display = "none";
    };
}


/////修正版
function handlePlayerSwap(outgoingPlayer, incomingPlayer, targetSeat) {
    const fromAreaElement = dragStartSeat.closest('.area');
    const toAreaElement = targetSeat.closest('.area');
    const fromArea = fromAreaElement ? fromAreaElement.id : 'bench';
    const toArea = toAreaElement ? toAreaElement.id : 'field';

    if (!targetSeat.querySelector('.player')) {
        console.error('Invalid state: target seat is empty');
        return;
    }

    // 追加: チェック機能を呼び出す
    const playerName = incomingPlayer.getAttribute('data-name'); // プレイヤー名の取得例

    // targetAreaはシートの実際のDOM要素であるべき
    const targetArea = targetSeat; // ここで実際のDOM要素を代入

    if (toArea === 'field' && !canEnterField(playerName, targetArea, outgoingPlayer)) {
        console.warn('The player cannot enter the field under current rules.');
        alert('この選手はフィールドに入れません。');
        return;
    }

    showReasonModalForSwap2(outgoingPlayer, incomingPlayer, targetSeat);

    confirmReasonBtn2.onclick = () => {
        try {
            // 1. まず、入れ替え元と入れ替え先の選手を取得
            const outgoingParent = outgoingPlayer.parentElement;
            //const incomingParent = incomingPlayer.parentElement;

            // 2. 両方の選手を同時に入れ替え
            if (fromArea === 'bench' && toArea === 'field') {
                // ベンチの選手とフィールドの選手を交換
                outgoingParent.appendChild(incomingPlayer);
                targetSeat.appendChild(outgoingPlayer);

            } else if (fromArea === 'tempOut' && toArea === 'field') {
                // 一時退場エリアの選手とフィールドの選手を交換
                outgoingParent.appendChild(incomingPlayer);
                targetSeat.appendChild(outgoingPlayer);
            }

            // シート状態を更新
            if (toArea === 'field') {
                markSeatOccupied(targetSeat);
            }

            reasonModal2.style.display = "none";
            updateAndSave();

        } catch (error) {
            console.error('Error during swap:', error);
            // エラー時は元の状態に戻す
            handleSwapError(outgoingPlayer, incomingPlayer, error);
        }
    };
}

/* この部分はマルチラインコメントです。 複数行にわたるコメントを記述する場合に便利です。*/
/* この部分はマルチラインコメントです。 複数行にわたるコメントを記述する場合に便利です。 */

// 交代実行関数を分離

function executeSwap(outgoingPlayer, incomingPlayer, targetSeat, fromArea, toArea) {
    try {
        const outgoingParent = outgoingPlayer.parentElement;
        //const incomingParent = incomingPlayer.parentElement;

        if (fromArea === 'bench' && toArea === 'field') {
            outgoingParent.appendChild(incomingPlayer);
            targetSeat.appendChild(outgoingPlayer);
        } else if (fromArea === 'tempOut' && toArea === 'field') {
            outgoingParent.appendChild(incomingPlayer);
            targetSeat.appendChild(outgoingPlayer);
        } 

        if (toArea === 'field') {
            markSeatOccupied(targetSeat);
        }

        // モーダルを閉じる（フィールド内交代の場合は既に閉じている）
        if (reasonModal2.style.display === "block") {
            reasonModal2.style.display = "none";
        }
        updateAndSave();

    } catch (error) {
        console.error('Error during swap:', error);
        handleSwapError(outgoingPlayer, incomingPlayer, error);
    }
}

// エラーからの回復処理
function handleSwapError(outgoingPlayer, incomingPlayer, error) {
    console.error('Swap error:', error);
    // 元の位置に戻す（必要な場合）
    if (outgoingPlayer.parentElement !== dragStartSeat) {
        dragStartSeat.appendChild(outgoingPlayer);
    }
    if (incomingPlayer.parentElement !== targetSeat) {
        targetSeat.appendChild(incomingPlayer);
    }
}
/* この部分はマルチラインコメントです。 複数行にわたるコメントを記述する場合に便利です。 */



// 同一エリアに選手が存在するかを確認する関数
function isPlayerAlreadyInArea(player, areaId) {
    const area = document.getElementById(areaId);
    const playersInArea = Array.from(area.querySelectorAll('.player'));
    return playersInArea.some(p => p.id === player.id);
}


/* この部分はマルチラインコメントです。 複数行にわたるコメントを記述する場合に便利です。 */
/* この部分はマルチラインコメントです。 複数行にわたるコメントを記述する場合に便利です。 */

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
    const historyLines = contentText.split('\n');
    // Setオブジェクトの内容を文字列化
    const rcPlayersText = Array.from(rcPlayers).join(', ');
    const outPlayersText = Array.from(outPlayers).join(', ');
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
        `RCプレイヤー:\n${rcPlayersText}\n\n` +
        `OUTプレイヤー:\n${outPlayersText}\n\n` +
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
    rcPlayers.clear();
    outPlayers.clear();
    // ボタンのリセット
    registerButton.disabled = false;
    console.log('全ての記録と表示、保留中の内容がリセットされました。');
}

/* この部分はマルチラインコメントです。 複数行にわたるコメントを記述する場合に便利です。 */

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

let rcPlayers = new Set();
let outPlayers = new Set();

//////////////////// count BC ///////////////

// B/C選手の交代をチェックする関数
function isBCorC(name) {
    console.log('check',name)
    const lastChar = name[name.length - 1].toUpperCase();
    return lastChar === 'B' || lastChar === 'C';
}

///////////////////////////////////////////////

/* この部分はマルチラインコメントです。 複数行にわたるコメントを記述する場合に便利です。 */
function canEnterField(playerName, targetArea, replacingPlayer = null) {
    // ピッチ外やベンチへの移動はシートチェックをスキップ
    //playernameは常に入ってくる選手名
    if (targetArea.id === 'bench' || targetArea.id === 'tempOut') {
        // ベンチやピッチ外への移動は常に許可
        return true;
    }
    const toAreaElement = targetArea.closest('.area');
    const toArea = toAreaElement ? toAreaElement.id : null; //親の .area 要素の id を取得
    // ピッチ内への移動ではシートであることを要求
    if (toArea === 'field') {
        // targetArea は DOM 要素なので、直接 classList でチェックできる
        console.log('698 targetArea',targetArea)
        console.log("698 targetArea.classList.contains('seat')", targetArea.classList.contains('seat'))

        if (!targetArea.classList.contains('seat')) {
            alert('ピッチ内のシート上にドラッグしてください。');
            return false;
        }

        const playerElement = targetArea.querySelector('.player');
        console.log('707 playerElement nullです', playerElement);

        // 禁止されたプレイヤーのチェック
        if (outPlayers.has(playerName)) {
            alert('この選手はピッチに入ることはできません');
            return false;
        }
        else if (rcPlayers.has(playerName)) {
            alert('この選手はピッチに入ることはできません');
            return false;
        }
        const isIncomingBC = isBCorC(playerName);//入ってくる選手を調べたい
        if (isIncomingBC) {
            // 交代の場合
            if (replacingPlayer) {
                const replacingPlayerName = playerElement.getAttribute('data-name');
                const isReplacingBC = isBCorC(replacingPlayerName);
                // B/C選手同士の交代の場合は許可
                if (isReplacingBC)
                    return true;
                else if (countBC >= 4) {
                    alert('ピッチ上のB/C選手が4人を超えるため、この操作はできません');
                    return false;
                }

            }
            if (countBC >= 4) {
                alert('ピッチ上のB/C選手が4人を超えるため、この操作はできません');
                return false;
            // 現在のB/C選手のカウントをチェック
            
            }
        }

        // 移動先の位置が空いているかチェック
        return true
        //isTargetPositionEmpty(targetArea);
    }

    // その他のケース（例: ベンチやピッチ外）も許可
    return true;
}

/* この部分はマルチラインコメントです。 複数行にわたるコメントを記述する場合に便利です。 */
/* この部分はマルチラインコメントです。 複数行にわたるコメントを記述する場合に便利です。 */
/* この部分はマルチラインコメントです。 複数行にわたるコメントを記述する場合に便利です。 */

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
        outPlayers.add(secondSelectedPlayer2.dataset.name);
        localStorage.setItem(STORAGE_KEYS.OUTPLAYER, JSON.stringify(Array.from(outPlayers)));
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
    if (outPlayers.has(sub.player1.dataset.name) && sub.player2.parentElement.id === 'field') {
        alert('この選手はピッチに入ることはできません');
        return;
    }
    else if (rcPlayers.has(sub.player1.dataset.name) && sub.player2.parentElement.id === 'field') {
        alert('この選手はピッチに入ることはできません');
        return;
    }
    else if (!canEnterField(sub.player1.dataset.name, sub.player2.parentElement, sub.player2)) {
        alert('この選手はピッチに入ることはできません');
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

        if (sub.reason === '戦術' || sub.reason === '負傷') {
            outPlayers.add(sub.player2Name);
            localStorage.setItem(STORAGE_KEYS.OUTPLAYER, JSON.stringify(Array.from(outPlayers)));
        }
        // 保留リストから削除
        pendingSubstitutions.splice(index, 1);
        displayPendingOperations();
    }, 500); // アニメーション時間に同期

    localStorage.setItem(STORAGE_KEYS.PENDING_SUBS, JSON.stringify(pendingSubstitutions));
    updateAndSave();
}

////////////////////////////////////////////////////

// ローカルストレージのキー
const STORAGE_KEYS = {
    HISTORY: 'historyItems',
    BENCH: 'benchPlayers',
    FIELD: 'fieldPlayers',
    TEMP_OUT: 'tempOutPlayers',
    RCPLAYER: 'rcPlayers',
    OUTPLAYER: 'outPlayers',
    PENDING_SUBS: 'pendingSubstitutions',
    PENDING_MOVES: 'pendingMoves',
};

///////////////////////////////////////////////////////

// 状態変更時に保存を実行する関数
function updateAndSave() {
    //console.log('State is being saved');
    saveState();
    console.log('State saved successfully');
}

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
        "HIA>>負傷",
        "FPRO>>YC", 
        "FPRO>>RC",
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
            if (selectedReason === 'FPRO>>RC') {
                
                rcPlayers.add(playerInfo);
                localStorage.setItem(STORAGE_KEYS.RCPLAYER, JSON.stringify(Array.from(rcPlayers)));
            }
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

/* この部分はマルチラインコメントです。 複数行にわたるコメントを記述する場合に便利です。 */

function recordHistory(playerName, targetArea, reason) {
    const historyItem = document.createElement("div");
    historyItem.className = "history-item";

    const details = document.createElement("span");
    console.log('details',details)

    if (targetArea === "append") {
        details.textContent = reason;
    } else {
        const timestamp = timeDisplay.textContent; // ストップウォッチの現在値 (例: "00:12:34")

        // タイムスタンプに時間を加算する関数
        const calculateFutureTimestamp = (currentTimestamp, minutesToAdd) => {
            const [hours, minutes, seconds] = currentTimestamp.split(":").map(Number); // 時, 分, 秒を取得
            const totalMinutes = hours * 60 + minutes + minutesToAdd; // 時間を分に変換し、加算

            const futureHours = Math.floor(totalMinutes / 60); // 新しい時間
            const futureMinutes = totalMinutes % 60; // 新しい分

            return `${futureHours.toString().padStart(2, "0")}:${futureMinutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
        };

        let additionalTimestamp = "";

        if (reason === "FPRO") {
            const tenMinutesLater = calculateFutureTimestamp(timestamp, 10);
            const twentyMinutesLater = calculateFutureTimestamp(timestamp, 20);
            additionalTimestamp = `${tenMinutesLater} ${twentyMinutesLater}`;
        } else if (reason === "YC") {
            const tenMinutesLater = calculateFutureTimestamp(timestamp, 10);
            additionalTimestamp = `${tenMinutesLater}`;
        } else if (reason === "RC") {
            const twentyMinutesLater = calculateFutureTimestamp(timestamp, 20);
            additionalTimestamp = `${twentyMinutesLater}`;
        }

        details.textContent = `${reason} ${timestamp} ${playerName} ${additionalTimestamp}`;
    }

    if (reason === "RC") {
        rcPlayers.add(playerName);
        localStorage.setItem(STORAGE_KEYS.RCPLAYER, JSON.stringify(Array.from(rcPlayers)));
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

/* この部分はマルチラインコメントです。 複数行にわたるコメントを記述する場合に便利です。 */


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

// ページロード時に状態を復元
window.addEventListener('DOMContentLoaded', () => {
    const savedState = localStorage.getItem('appState');

    if (savedState) {
        loadState(); // 保存された状態を復元
        console.log('保存された状態を復元しました。');
    } else {
        console.log('保存された状態がありません。新しいセッションを開始します。');
    }
});


// 状態保存関数を更新して削除された履歴を反映12:25
function saveState() {
    // 履歴の保存（削除された項目は自動的に除外される）
    const historyItems = Array.from(historyList.children).map(item => ({
        text: item.querySelector('span').textContent,
        timestamp: item.querySelector('span').textContent.split(' ')[1]
    }));
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(historyItems));
    //console.log("History saved:", historyItems);

    // ピッチの状態を保存
    const fieldState = Array.from(field.getElementsByClassName('seat')).map(seat => {
        const player = seat.querySelector('.player');
        return {
            position: seat.dataset.position,
            player: player ? player.dataset.name : null // 選手がいない場合はnull
            
        };

    });
    localStorage.setItem(STORAGE_KEYS.FIELD, JSON.stringify(fieldState));
    console.log('Field saved:',fieldState);

    // bench と tempOut の状態を取得して保存
    ['bench', 'tempOut'].forEach(areaId => {
        const area = document.getElementById(areaId);
        const players = Array.from(area.getElementsByClassName('player')).map(player => ({
            name: player.dataset.name
        }));
        localStorage.setItem(STORAGE_KEYS[areaId.toUpperCase()], JSON.stringify(players));
        console.log(`${areaId.charAt(0).toUpperCase() + areaId.slice(1)} saved:`, players);
    });

    // RC選手の保存
    localStorage.setItem(STORAGE_KEYS.RCPLAYER, JSON.stringify(Array.from(rcPlayers)));
    //console.log("RC Players saved:", Array.from(rcPlayers));

    // OUT選手の保存
    localStorage.setItem(STORAGE_KEYS.OUTPLAYER, JSON.stringify(Array.from(outPlayers)));
    //console.log("Out Players saved:", Array.from(outPlayers));

    // 保留中の交代の保存
    const serializedSubs = pendingSubstitutions.map(sub => ({
        player1Name: sub.player1Name,
        player2Name: sub.player2Name,
        reason: sub.reason
    }));
    localStorage.setItem(STORAGE_KEYS.PENDING_SUBS, JSON.stringify(serializedSubs));
    console.log("Pending Substitutions saved:", serializedSubs);

    // 保留中の移動の保存
    const serializedMoves = pendingMoves.map(move => ({
        playerName: move.playerName,
        targetArea: move.targetArea,
        reason: move.reason
    }));
    localStorage.setItem(STORAGE_KEYS.PENDING_MOVES, JSON.stringify(serializedMoves));
    console.log("Pending Moves saved:", serializedMoves);


}


// 履歴の読み込み処理も更新
function loadState() {
    // 履歴の復元
    const savedHistory = JSON.parse(localStorage.getItem(STORAGE_KEYS.HISTORY) || '[]');

    // ピッチ（field）の復元
    const savedFieldState = JSON.parse(localStorage.getItem(STORAGE_KEYS.FIELD) || '[]');

    // シートがすでに15個あるかどうか確認
    if (field.children.length < 15) {
        // 15個のシートを作成する
        for (let i = 0; i < 15; i++) {
            const seat = createSeatElement(i + 1);
            field.appendChild(seat);
        }
        console.log('15個のシートを作成しました');
    }
    savedFieldState.forEach(playerData => {
        console.log('position:', playerData.position);
        console.log('player:', playerData.player);
        const position = String(playerData.position);
        const playerName = playerData.player;
        const seat = field.querySelector(`.seat[data-position="${position}"]`);

        if (seat && !seat.querySelector('.player') && playerName) {
            // プレイヤー要素を作成してシートに追加
            const player = createPlayerElement(playerName);
            seat.appendChild(player);  // プレイヤーを追加
            markSeatOccupied(seat);    // 座席を占有済みにマーク
        }
    });

    // bench と tempOut の復元
    ['bench', 'tempOut'].forEach(areaId => {
        let savedPlayers = [];
        try {
            // localStorage からデータを取得し、パースする
            const savedPlayersData = localStorage.getItem(STORAGE_KEYS[areaId.toUpperCase()]);
            savedPlayers = savedPlayersData ? JSON.parse(savedPlayersData) : [];
        } catch (error) {
            console.error(`データの復元中にエラーが発生しました (${areaId}):`, error);
        }

        const area = document.getElementById(areaId);

        // すでに選手が追加されていないかを確認
        savedPlayers.forEach(playerData => {
            // エリア内に同じ名前の選手がすでにいる場合は追加しない
            if (!Array.from(area.children).some(child => child.dataset.name === playerData.name)) {
                const player = createPlayerElement(playerData.name);
                area.appendChild(player);
            }
        });
    });

    // 保留中の選手交代の復元
    const savedPendingSubs = JSON.parse(localStorage.getItem(STORAGE_KEYS.PENDING_SUBS) || '[]');
    // 既存のpendingSubstitutionsをリセットしてから復元
    pendingSubstitutions.length = 0; // 既存データをクリア
    savedPendingSubs.forEach(sub => {
        pendingSubstitutions.push({
            player1Name: sub.player1Name,
            player2Name: sub.player2Name,
            reason: sub.reason
        });
    });
    displayPendingOperations()

    // 保留中の選手移動の復元
    const savedPendingMoves = JSON.parse(localStorage.getItem(STORAGE_KEYS.PENDING_MOVES) || '[]');

    // 既存のpendingMovesをリセットしてから復元
    pendingMoves.length = 0; // 既存データをクリア
    savedPendingMoves.forEach(move => {
        pendingMoves.push({
            playerName: move.playerName,
            targetArea: move.targetArea,
            reason: move.reason
        });
    });
    displayPendingOperations()

    // RC選手の復元
    const savedRcPlayers = JSON.parse(localStorage.getItem(STORAGE_KEYS.RCPLAYER) || '[]');
    savedRcPlayers.forEach(playerData => {
        rcPlayers.add(playerData);
    });

    // OUT選手の復元
    const savedOutPlayers = JSON.parse(localStorage.getItem(STORAGE_KEYS.OUTPLAYER) || '[]');
    savedOutPlayers.forEach(playerData => {
        outPlayers.add(playerData);
    });

    // 履歴アイテムの復元
    historyList.innerHTML = ''; // 履歴リストをクリア

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
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "削除";
        deleteButton.className = "delete-button";

        deleteButton.addEventListener("click", () => {
            historyItem.remove();
            updateAndSave(); // 状態を保存
        });
        // ボタンをコンテナに追加
        buttonContainer.appendChild(appendButton);
        // ボタンをコンテナに追加
        buttonContainer.appendChild(deleteButton);

        // 履歴アイテムに詳細とボタンを追加
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

    if (outPlayers.has(player.dataset.name) && move.targetArea === 'field') {
        alert('この選手はピッチに入ることはできません');
        return;
    }
    else if (rcPlayers.has(player.dataset.name) && move.targetArea === 'field') {
        alert('この選手はピッチに入ることはできません');
        return;
    }
    else if (!canEnterField(move.playerName, targetArea)) {
        alert('この選手はピッチに入ることはできません');
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

    if (move.reason === 'RC') {
        rcPlayers.add(move.playerName);
        localStorage.setItem(STORAGE_KEYS.RCPLAYER, JSON.stringify(Array.from(rcPlayers)));
    }

    pendingMoves.splice(index, 1);
    displayPendingOperations();

    localStorage.setItem(STORAGE_KEYS.PENDING_MOVES, JSON.stringify(pendingMoves));
    updateAndSave();
}


// モーダル選択肢を動的に更新する関数
function updateMoveReasonOptions(isMovingToField) {
    const moveReasonSelect = reasonModal.querySelector("#moveReason");
    moveReasonSelect.innerHTML = ''; // 既存の選択肢をクリア

    if (isMovingToField) {
        // ピッチへの移動理由
        const toFieldReasons = [
            { value: "YC復帰", label: "YC復帰" },
            { value: "YC替IN", label: "YC替IN" },
            { value: "RC替IN", label: "RC替IN" },
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
    if (!canEnterField(currentDraggedPlayer.dataset.name, targetArea)) {  
        reasonModal.style.display = "none";
        //currentDraggedPlayer = null;
        targetArea = null;
        return;
    }

    // 戦術または負傷でOUTした場合、禁止に追加
    if (reason === 'RC') {
        rcPlayers.add(currentDraggedPlayer.dataset.name);
        localStorage.setItem(STORAGE_KEYS.RCPLAYER, JSON.stringify(Array.from(rcPlayers)));
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

// ドラッグ移動を有効にするコード
const floatContainer = document.getElementById("float-container");

let offsetX, offsetY;

floatContainer.addEventListener("mousedown", (e) => {
    isDragging = true;
    offsetX = e.clientX - floatContainer.offsetLeft;
    offsetY = e.clientY - floatContainer.offsetTop;
    floatContainer.style.cursor = "grabbing";
});

document.addEventListener("mousemove", (e) => {
    if (isDragging) {
        floatContainer.style.left = `${e.clientX - offsetX}px`;
        floatContainer.style.top = `${e.clientY - offsetY}px`;
    }
});

document.addEventListener("mouseup", () => {
    if (isDragging) {
        isDragging = false;
        floatContainer.style.cursor = "move";
    }
});

////////////////////// dash board関係 ////////////////////////////
/* この部分はマルチラインコメントです。 複数行にわたるコメントを記述する場合に便利です。 */

const container = document.querySelector('.float-container');

// リサイズ用ハンドルを作成
const resizer = document.createElement('div');
resizer.classList.add('resizer');
container.appendChild(resizer);

resizer.addEventListener('mousedown', (e) => {
    e.preventDefault();

    // 初期状態を記録
    const startHeight = container.offsetHeight;
    const startY = e.clientY;

    function onMouseMove(event) {
        const newHeight = startHeight + (event.clientY - startY);

        // 最小高さを維持
        if (newHeight > 100) {
            container.style.height = `${newHeight}px`;
        }
    }

    function onMouseUp() {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    }

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
});

//////////ポジション交代///////////

// Position Change JavaScript
document.addEventListener('DOMContentLoaded', function () {
    const position1Select = document.getElementById('position1');
    const position2Select = document.getElementById('position2');
    const swapButton = document.getElementById('swapButton');

    // ポジションの選択肢を生成（1-15）
    for (let i = 1; i <= 15; i++) {
        const option1 = new Option(`P${i}`, i);
        const option2 = new Option(`P${i}`, i);
        position1Select.add(option1);
        position2Select.add(option2);
    }

    // 選択状態の監視
    function updateButtonState() {
        const pos1 = position1Select.value;
        const pos2 = position2Select.value;
        swapButton.disabled = !pos1 || !pos2 || pos1 === pos2;
    }

    position1Select.addEventListener('change', updateButtonState);
    position2Select.addEventListener('change', updateButtonState);

    // ポジション交換の実行
    swapButton.addEventListener('click', function () {
        const pos1 = parseInt(position1Select.value) - 1; // 0-based indexに変換
        const pos2 = parseInt(position2Select.value) - 1;

        // fieldStateの更新
        const seats = Array.from(document.getElementsByClassName('seat'));
        const fieldState = seats.map(seat => ({
            position: seat.dataset.position,
            player: seat.querySelector('.player')?.dataset.name || null
        }));

        // 選手の交換（空席を考慮）
        const tempPlayer = fieldState[pos1].player;
        fieldState[pos1].player = fieldState[pos2].player;
        fieldState[pos2].player = tempPlayer;

        // DOMの更新
        seats.forEach((seat, index) => {
            const playerDiv = seat.querySelector('.player');
            if (fieldState[index].player) {
                if (!playerDiv) {
                    const newPlayerDiv = document.createElement('div');
                    newPlayerDiv.classList.add('player');
                    newPlayerDiv.dataset.name = fieldState[index].player;
                    newPlayerDiv.textContent = fieldState[index].player;
                    seat.appendChild(newPlayerDiv);
                } else {
                    playerDiv.dataset.name = fieldState[index].player;
                    playerDiv.textContent = fieldState[index].player;
                }
            } else {
                // 空席の場合
                if (playerDiv) {
                    playerDiv.remove();
                }
            }
        });

        // 選択をリセット
        position1Select.value = '';
        position2Select.value = '';
        updateButtonState();
        updateAndSave();
    });
});

//////////B+C///////////
// カウンター機能を管理するクラス

function updateBCCount() {
    // ローカルストレージからフィールドデータを取得
    const savedFieldState = JSON.parse(localStorage.getItem(STORAGE_KEYS.FIELD) || '[]');
    console.log('savedFieldState', savedFieldState);

    // 末尾が「B」または「C」の選手をカウント
    const countBC = savedFieldState.filter(seat => {
        const playerName = seat.player;
        return playerName && (playerName.endsWith('B') || playerName.endsWith('C'));
    }).length;

    console.log('countBC', countBC);

    // <li>の<span>タグの内容を更新
    const bcCountElement = document.getElementById('bc-count');
    if (bcCountElement) {
        const spanElement = bcCountElement.querySelector('span');
        if (spanElement) {
            // 条件に応じて「MAX」または「OVER」を追加
            let displayText = countBC;
            if (countBC === 4) {
                displayText += ' MAX';
            } else if (countBC > 4) {
                displayText += ' OVER';
            }
            spanElement.textContent = displayText;
        } else {
            console.error('bc-count の <span> 要素が見つかりません');
        }
    } else {
        console.error('bc-count の <li> 要素が見つかりません');
    }
}

// 3秒ごとに実行
setInterval(updateBCCount, 4000);
// 初回の呼び出し
updateBCCount();

//////////交代回数///////////

// 交代回数を計算して更新する関数
function updateExCount() {
    // ローカルストレージから履歴データを取得
    const savedHistory = JSON.parse(localStorage.getItem(STORAGE_KEYS.HISTORY) || '[]');
    console.log('savedHistory', savedHistory);

    // 交代を意味するテキストの条件をチェック
    const exchangeCount = savedHistory.filter(entry => {
        if (typeof entry.text === 'string') {
            // 交代の基準: "→" または "替IN" を含む場合に交代
            return entry.text.includes('→') || entry.text.includes('替IN');
        }
        return false;
    }).length;

    console.log('Exchange Count:', exchangeCount);

    // <li>の<span>タグの内容を更新
    const exCountElement = document.getElementById('ex-count');
    if (exCountElement) {
        const spanElement = exCountElement.querySelector('span');
        if (spanElement) {
            // 交代回数の値を更新
            if (exchangeCount === 8) {
                spanElement.textContent = `${exchangeCount} (MAX)`;
            } else if (exchangeCount > 8) {
                spanElement.textContent = `${exchangeCount} (OVER)`;
            } else {
                spanElement.textContent = exchangeCount;
            }
        } else {
            console.error('ex-count の <span> 要素が見つかりません');
        }
    } else {
        console.error('ex-count の <li> 要素が見つかりません');
    }
}

// 5秒ごとに実行
setInterval(updateExCount, 4000);

// 初回の呼び出し
updateExCount();

/////////////////OUT///////////////////////////////

// 戦術OUT, 負傷OUT, RCの選手を取得し、HTMLを更新する関数
function updateOutPlayers() {
    // ローカルストレージから履歴データを取得
    const savedHistory = JSON.parse(localStorage.getItem(STORAGE_KEYS.HISTORY) || '[]');
    console.log('savedHistory', savedHistory);

    // 戦術OUTの選手を抽出
    const sjOutPlayers = savedHistory.filter(entry => {
        return entry.text.includes('戦術') && entry.text.includes('→');
    }).map(entry => {
        const playerName = entry.text.split('→')[1].trim(); // 矢印右側の名前
        return playerName;
    });

    // 負傷OUTの選手を抽出
    const ijOutPlayers = savedHistory.filter(entry => {
        return entry.text.includes('負傷') && entry.text.includes('→');
    }).map(entry => {
        const playerName = entry.text.split('→')[1].trim(); // 矢印右側の名前
        return playerName;
    });

    // RCまたはFPRO>>RCの選手を抽出
    const rcOutPlayers = savedHistory.filter(entry => {
        return (entry.text.includes('RC') || entry.text.includes('FPRO>>RC')) &&
            !entry.text.includes('RC替IN');
    }).map(entry => {
        const playerName = entry.text.split(' ')[2].trim();
        return playerName;
    });

    // HTML要素に名前を縦に並べる
    updateList('sj-out', sjOutPlayers);
    updateList('ij-out', ijOutPlayers);
    updateList('rc-out', rcOutPlayers);

}

// タイトルの下に選手名を縦に並べる関数
function updateList(elementId, playerList) {
    const listElement = document.getElementById(elementId);
    if (listElement) {
        // 子要素をすべて削除（タイトル部分を除く）
        const titleElement = listElement.firstElementChild.cloneNode(true); // タイトルを保持
        listElement.innerHTML = ''; // 一度内容をクリア
        listElement.appendChild(titleElement); // タイトルを復元

        // 選手名をリストに追加
        playerList.forEach(playerName => {
            const listItem = document.createElement('li');
            listItem.textContent = playerName;
            listElement.appendChild(listItem);
        });
    } else {
        console.error(`${elementId} の要素が見つかりません`);
    }
}


// 5秒ごとに実行
setInterval(updateOutPlayers, 4000);

// 初回の呼び出し
updateOutPlayers();

/////////FRONT CHEKER///////////////////////

/* この部分はマルチラインコメントです。  複数行にわたるコメントを記述する場合に便利です。  */

// フィールドデータをチェックして結果を表示する
function updateFrontPosition() {
    // ローカルストレージからフィールドデータを取得
    const savedFieldState = JSON.parse(localStorage.getItem(STORAGE_KEYS.FIELD) || '[]');
    console.log('savedFieldState', savedFieldState);

    // フィールドのポジション1、2、3における資格チェック
    const positionCheck = {
        P1: false,
        P2: false,
        P3: false
    };

    savedFieldState.forEach(seat => {
        const position = seat.position;  // シートの位置（1, 2, 3 など）
        const playerName = seat.player;  // プレイヤー名（例：1谷口祐一郎F12）

        if (playerName) {
            // プレイヤー名の末尾の「F数字」を検出する
            const match = playerName.match(/F(\d+)$/);  // 末尾に「F数字」の形式にマッチ

            if (match) {
                const positionNumbers = match[1];  // 「F数字」の部分を取得

                // シートの位置（position）が1, 2, 3の場合に資格チェック
                if (position === '1' && positionNumbers.includes('1')) {
                    positionCheck.P1 = true;
                } else if (position === '2' && positionNumbers.includes('2')) {
                    positionCheck.P2 = true;
                } else if (position === '3' && positionNumbers.includes('3')) {
                    positionCheck.P3 = true;
                }
            }
        }
    });

    console.log('positionCheck', positionCheck);

    // HTML要素に結果を表示
    updatePositionDisplay('front-check', positionCheck.P1, positionCheck.P2, positionCheck.P3);
}

// 表示用のリストを更新
function updatePositionDisplay(id, P1, P2, P3) {
    const frontCheckElement = document.getElementById(id);

    // すでに存在する <li> 要素を削除
    frontCheckElement.innerHTML = '';

    // 新しい <li> 要素を追加
    const titleItem = document.createElement('li');
    titleItem.classList.add('title');
    titleItem.textContent = 'Front Check:';
    frontCheckElement.appendChild(titleItem);

    // P1, P2, P3の結果を表示
    const p1Item = document.createElement('li');
    p1Item.textContent = `P1: ${P1 ? 'True' : 'False'}`;
    frontCheckElement.appendChild(p1Item);

    const p2Item = document.createElement('li');
    p2Item.textContent = `P2: ${P2 ? 'True' : 'False'}`;
    frontCheckElement.appendChild(p2Item);

    const p3Item = document.createElement('li');
    p3Item.textContent = `P3: ${P3 ? 'True' : 'False'}`;
    frontCheckElement.appendChild(p3Item);
}

// 5秒ごとに実行
setInterval(updateFrontPosition, 4000);

// 初回の呼び出し
updateFrontPosition();


//////////////////////dash board関係////////////////////////////

/* この部分はマルチラインコメントです。  複数行にわたるコメントを記述する場合に便利です。 */
/* この部分はマルチラインコメントです。  複数行にわたるコメントを記述する場合に便利です。 */
/* この部分はマルチラインコメントです。  複数行にわたるコメントを記述する場合に便利です。 */
/* この部分はマルチラインコメントです。  複数行にわたるコメントを記述する場合に便利です。 */
/* この部分はマルチラインコメントです。  複数行にわたるコメントを記述する場合に便利です。 */