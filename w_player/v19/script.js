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
                actionText = "ベンチに移動しました";
            } else if (targetArea === "tempOut") {
                actionText = "ピッチ外に出ました";
            } else if (targetArea === "append") {
                actionText = "追記されました";
            }
            details.textContent = `${timestamp}: ${playerName} が ${actionText} (理由: ${reason})`;

            // コメント入力ボックス
            const commentBox = document.createElement("textarea");
            commentBox.className = "comment-box";
            commentBox.placeholder = "コメントを追加...";

                
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
        
            const title = document.createElement("p");
            title.textContent = "理由を選択";
            reasonWindow.appendChild(title);
        
            // 理由リスト
            const reasons = ["HIA>>戦術", "HIA>>負傷", "出血>>戦術", "出血>>負傷", "-"];
            reasons.forEach((reason) => {
                const button = document.createElement("button");
                button.textContent = reason;
                button.addEventListener("click", () => {
                    recordHistory(playerName, "append", reason); // 新たな履歴を追加
                    document.body.removeChild(reasonWindow); // ウィンドウを閉じる
                });
                reasonWindow.appendChild(button);
            });
        
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



        // 履歴をCSVかTXT形式で保存
        function saveHistory() {
            let historyContent = [];
        
            // 各履歴アイテムから内容を取得
            const historyItems = document.querySelectorAll(".history-item");
            historyItems.forEach((item) => {
                const text = item.querySelector("span").textContent;
                const comment = item.querySelector(".comment-box").value;
                historyContent.push(`${text}, ${comment}`);
            });
        
            // CSV形式で保存
            const csvContent = "data:text/csv;charset=utf-8," + historyContent.join("\n");
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", "history.csv");
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
        
        // 履歴をリセット
        function resetHistory() {
            historyList.innerHTML = ""; // 履歴リストを全削除
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

        // ストップウォッチのボタンにイベントを追加
        startStopButton.addEventListener("click", startStopwatch);
        resetButton.addEventListener("click", resetStopwatch);
