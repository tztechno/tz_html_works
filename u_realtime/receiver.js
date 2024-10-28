// シグナリングサーバーに接続
const ws = new WebSocket('ws://[PCのIPアドレス]:3000');
const peerConnection = new RTCPeerConnection();

// WebSocketで受信したシグナリングメッセージを処理
ws.onmessage = async (event) => {
    const data = JSON.parse(event.data);

    if (data.offer) {
        // スマホ側からのSDPオファーを受信し、設定
        await peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));

        // SDPアンサーを作成し、シグナリングサーバーに送信
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        ws.send(JSON.stringify({ answer }));
    } else if (data.candidate) {
        // スマホ側からのICE候補を追加
        await peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
    }
};

// ICE候補が発生したときにサーバーに送信
peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
        ws.send(JSON.stringify({ candidate: event.candidate }));
    }
};

// スマホ側の映像が追加されたときに受信して表示
peerConnection.ontrack = (event) => {
    document.getElementById('remoteVideo').srcObject = event.streams[0];
};
