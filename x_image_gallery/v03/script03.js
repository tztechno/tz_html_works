// HTMLテンプレートを読み込む
const templateHtml = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Image Grid</title>
    <style>
        .image-container {
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            gap: 10px;
            padding: 10px;
        }
        .image-wrapper {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 300px;
            border: 1px solid #ddd;
        }
        .image-wrapper img {
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
        }
    </style>
</head>
<body>
    <div class="image-container">
        {{IMAGE_GRID_PLACEHOLDER}}
    </div>
</body>
</html>`;

// URLを検出する正規表現
const urlRegex = /(https?:\/\/[^\s<>"']+?\.(?:jpg|jpeg|png|gif|webp))/gi;

function extractUrls() {
    const editableBox = document.getElementById('editableBox');
    const output = document.getElementById('output');

    // URLの集合を作成（重複を防ぐため）
    const urlSet = new Set();

    // 1. ハイパーリンクからURLを抽出
    const links = editableBox.querySelectorAll('a');
    links.forEach(link => {
        const url = link.href;
        if (isImageUrl(url)) {
            urlSet.add(url);
        }
    });

    // 2. テキストコンテンツからURLを抽出
    const text = editableBox.innerText;
    const matchedUrls = text.match(urlRegex);
    if (matchedUrls) {
        matchedUrls.forEach(url => urlSet.add(url));
    }

    // 結果の表示
    if (urlSet.size === 0) {
        output.textContent = '画像URLが見つかりませんでした。\n' +
            '以下の形式で入力してください：\n' +
            '1. 画像URLを直接入力\n' +
            '2. 画像へのハイパーリンクをペースト\n' +
            '3. 上記の組み合わせ\n\n' +
            '対応する画像形式: jpg, jpeg, png, gif, webp';
        return null;
    }

    const urlArray = Array.from(urlSet);
    let result = `検出した画像URL (${urlArray.length}件):\n`;
    urlArray.forEach((url, index) => {
        result += `${index + 1}. ${url}\n`;
    });
    output.textContent = result;

    return urlArray;
}

function isImageUrl(url) {
    return url.match(/\.(jpg|jpeg|png|gif|webp)$/i);
}

function generateHtml() {
    const urls = extractUrls();
    if (!urls) return;

    // 画像グリッドHTMLの生成
    const imageGridHtml = urls.map(url =>
        `        <div class="image-wrapper">
            <img src="${url}" alt="Image"/>
        </div>`
    ).join('\n');

    // テンプレートに画像グリッドを挿入
    const finalHtml = templateHtml.replace('{{IMAGE_GRID_PLACEHOLDER}}', imageGridHtml);

    // HTMLファイルとして保存
    const blob = new Blob([finalHtml], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'image-grid.html';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    // プレビューを表示
    const imageGrid = document.getElementById('imageGrid');
    imageGrid.innerHTML = `<div class="image-container">
        ${imageGridHtml}
    </div>`;
}