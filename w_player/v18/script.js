        const playerList = document.getElementById("playerList");
        const bench = document.getElementById("bench");
        const field = document.getElementById("field");
        const tempOut = document.getElementById("tempOut");
        const historyList = document.getElementById("history-list");
        const playerNamesInput = document.getElementById("playerNamesInput");
        const registerButton = document.getElementById("registerButton");

        const startStopButton = document.getElementById("startStopButton");
        const resetButton = document.getElementById("resetButton");
        const timeDisplay = document.getElementById("timeDisplay");

        const reasonModal = document.getElementById("reasonModal");
        const moveReasonSelect = document.getElementById("moveReason");
        const confirmReasonBtn = document.getElementById("confirmReasonBtn");
        const cancelReasonBtn = document.getElementById("cancelReasonBtn");

        let currentDraggedPlayer = null;
        let targetArea = null;

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
                    timeDisplay.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
                }, 1000);
                startStopButton.textContent = "停止";
            }
            isRunning = !isRunning;
        }

        function resetStopwatch() {
            clearInterval(timer);
            isRunning = false;
            seconds = 0;
            minutes = 0;
            hours = 0;
            timeDisplay.textContent = "00:00:00";
            startStopButton.textContent = "スタート";
        }

        // プレイヤーを生成する関数
        function generatePlayers(playerNames) {
            playerList.innerHTML = ''; // 既存の選手リストをクリア
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

        // 選手リスト要素を作成
        function createPlayerListElement(name) {
            const listItem = document.createElement("div");
            listItem.textContent = name;
            return listItem;
        }

        // 選手要素を作成
        function createPlayerElement(name) {
            const player = document.createElement("div");
            player.className = "player";
            player.textContent = name;
            player.draggable = true;
            player.dataset.name = name;
            return player;
        }

        // 理由選択モーダルを表示
        function showReasonModal(player, target) {
            currentDraggedPlayer = player;
            targetArea = target;
            reasonModal.style.display = "flex";
            moveReasonSelect.value = ""; // リセット
        }

        // ドラッグ＆ドロップイベントの設定
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
                if (player && event.currentTarget !== player.parentElement) {
                    showReasonModal(player, event.currentTarget);
                }
            });
        });

        // 理由確定ボタン
        confirmReasonBtn.addEventListener("click", () => {
            const reason = moveReasonSelect.value;
            if (reason) {
                targetArea.appendChild(currentDraggedPlayer);
                recordHistory(currentDraggedPlayer.dataset.name, targetArea.id, reason);
                reasonModal.style.display = "none";
            } else {
                alert("理由を選択してください。");
            }
        });

        // キャンセルボタン
        cancelReasonBtn.addEventListener("click", () => {
            reasonModal.style.display = "none";
        });

        // 移動履歴を記録（アイコン形式）
        function recordHistory(playerName, targetArea, reason) {
            const timestamp = timeDisplay.textContent; // ストップウォッチの値を使う
        
            // 履歴アイコンを作成
            const historyItem = document.createElement("div");
            historyItem.className = "history-item";
        
            const playerIcon = document.createElement("div");
            playerIcon.className = "player-icon";
            playerIcon.textContent = playerName[0]; // 名前の頭文字を表示
        
            const details = document.createElement("div");
            details.className = "history-details";
            if (targetArea === "field") {
                details.textContent = `${timestamp}: ${playerName} がピッチに入りました。(理由: ${reason})`;
            } else if (targetArea === "bench") {
                details.textContent = `${timestamp}: ${playerName} がベンチに移動しました。(理由: ${reason})`;
            } else if (targetArea === "tempOut") {
                details.textContent = `${timestamp}: ${playerName} がピッチ外に出ました。(理由: ${reason})`;
            }
        
            historyItem.appendChild(playerIcon);
            historyItem.appendChild(details);
            historyList.appendChild(historyItem);
            historyList.scrollTop = historyList.scrollHeight;
        }

```
        // 移動履歴を記録

        function recordHistory(playerName, targetArea, reason) {
            const timestamp = timeDisplay.textContent; // ストップウォッチの値を使う
            const listItem = document.createElement("li");

            if (targetArea === "field") {
                listItem.textContent = `${timestamp}: ${playerName} が ピッチに入りました。(理由: ${reason})`;
            } else if (targetArea === "bench") {
                listItem.textContent = `${timestamp}: ${playerName} が ベンチに移動しました。(理由: ${reason})`;
            } else if (targetArea === "tempOut") {
                listItem.textContent = `${timestamp}: ${playerName} が ピッチ外に出ました。(理由: ${reason})`;
            }

            historyList.appendChild(listItem);
            historyList.scrollTop = historyList.scrollHeight;
        }
```

        // 登録ボタンがクリックされたときの処理
        registerButton.addEventListener("click", () => {
            const inputNames = playerNamesInput.value.trim();
            if (inputNames) {
                const playerNames = inputNames.split(',').map(name => name.trim()).filter(name => name);
                generatePlayers(playerNames);
                playerNamesInput.value = ''; // 入力ボックスをリセット
            }
        });

        // ストップウォッチのボタンにイベントを追加
        startStopButton.addEventListener("click", startStopwatch);
        resetButton.addEventListener("click", resetStopwatch);





