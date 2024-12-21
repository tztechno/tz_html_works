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
                    updateDisplay();
                }, 1000);
                startStopButton.textContent = "　停止　";
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
                alert("理由を選択");
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
            `ベンチ:\n${benchText.split('\n').filter(line => line.trim() !== 'ベンチ').join('\n')}`}\n\n` +
            `ピッチ:\n${fieldText.split('\n').filter(line => line.trim() !== 'ピッチ').join('\n')}`}\n\n` +
            `ピッチ外:\n${tempOutText.split('\n').filter(line => line.trim() !== 'ピッチ外').join('\n')}`}\n\n` ;
        
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
