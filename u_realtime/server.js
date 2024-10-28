// server.js
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 3000 });

wss.on('connection', (socket) => {
    socket.on('message', (message) => {
        // 受信したメッセージをすべてのクライアントに送信
        wss.clients.forEach(client => {
            if (client !== socket && client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });
    socket.on('close', () => console.log("クライアントが切断されました"));
});

console.log("シグナリングサーバーがポート3000で起動しました");
