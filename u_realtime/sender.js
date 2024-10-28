// シグナリングサーバーに接続
const ws = new WebSocket('ws://[PCのIPアドレス]:3000');
const peerConnection = new RTCPeerConnection();

// WebSocketで受信したシグナリングメッセージを処理
ws.onmessage = async (event) => {
    const data = JSON.parse(event.data);

    if (data.answer) {
        // PC側からのSDPアンサーを設定
        await peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
    } else if (data.candidate) {
        // PC側からのICE候補を追加
        await peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
    }
};

// ICE候補が発生したときにサーバーに送信
peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
        ws.send(JSON.stringify({ candidate: event.candidate }));
    }
};

// 映像をPCに送信するためのオファーを作成し、シグナリングサーバーに送信
async function startCamera() {
    try {
        // カメラ映像を取得
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        document.getElementById('localVideo').srcObject = stream;

        // 映像トラックをピア接続に追加
        stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));

        // SDPオファーを作成してシグナリングサーバーに送信
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        ws.send(JSON.stringify({ offer }));
    } catch (error) {
        console.error("カメラの起動に失敗しました:", error);
    }
}

// ページが読み込まれたらカメラ映像の送信を開始
startCamera();
