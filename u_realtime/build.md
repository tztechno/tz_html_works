スマホで http://localhost:3000/sender.htm

PCで http://localhost:3000/receiver.html


project-root/
├── server.js               # シグナリングサーバー (Node.js)
├── package.json            # Node.jsプロジェクトの設定ファイル
├── public/                 # 静的ファイルを格納するディレクトリ
│   ├── sender.html         # スマホ側の送信クライアント
│   ├── receiver.html       # PC側の受信クライアント
│   └── js/                 # JavaScript用のディレクトリ
│       ├── sender.js       # スマホの送信側のJavaScriptコード
│       └── receiver.js     # PCの受信側のJavaScriptコード
└── node_modules/           # 必要なNode.jsモジュール (wsなど)
