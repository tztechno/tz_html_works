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

// URLを検出する正規表現（httpまたはhttpsで始まるURL）
const urlRegex = /(https?:\/\/[^\s<>"']+)/gi;

// 相対パスを絶対URLに変換する関数
function resolveUrl(baseUrl, relativePath) {
    // 既に絶対URLの場合はそのまま返す
    if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
        return relativePath;
    }

    // baseUrlをパースするためのURL objectを作成
    const base = new URL(baseUrl);

    if (relativePath.startsWith('//')) {
        // プロトコル相対URLの場合
        return `${base.protocol}${relativePath}`;
    }

    if (relativePath.startsWith('/')) {
        // ルート相対パスの場合
        return `${base.protocol}//${base.host}${relativePath}`;
    }

    // 現在のパスからの相対パスの場合
    const basePath = baseUrl.substring(0, baseUrl.lastIndexOf('/') + 1);
    return new URL(relativePath, basePath).href;
}

// HTMLからリダイレクト先URLを取得する関数
async function getFinalUrlFromHtml(url) {
    try {
        const response = await fetch(url);
        const html = await response.text();

        // 一時的なDOMパーサーを作成
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        // metaリダイレクトを確認
        const metaRedirect = doc.querySelector('meta[http-equiv="refresh"]');
        if (metaRedirect) {
            const content = metaRedirect.getAttribute('content');
            const match = content.match(/URL=(.+)$/i);
            if (match) {
                return resolveUrl(url, match[1].trim());
            }
        }

        // img要素のsrcを確認
        const img = doc.querySelector('img');
        if (img && img.getAttribute('src')) {
            return resolveUrl(url, img.getAttribute('src'));
        }

        return url;
    } catch (error) {
        console.warn(`Warning: Could not fetch HTML for ${url}:`, error);
        return url;
    }
}

async function extractUrls() {
    const editableBox = document.getElementById('editableBox');
    const output = document.getElementById('output');

    // URLの集合を作成（重複を防ぐため）
    const urlSet = new Set();
    const urlMapping = new Map(); // 元のURLとリダイレクト先URLのマッピング

    // 1. ハイパーリンクからURLを抽出
    const links = editableBox.querySelectorAll('a');
    for (const link of links) {
        const originalUrl = link.href;
        const finalUrl = await getFinalUrlFromHtml(originalUrl);
        urlSet.add(finalUrl);
        urlMapping.set(originalUrl, finalUrl);
    }

    // 2. テキストコンテンツからURLを抽出
    const text = editableBox.innerText;
    const matchedUrls = text.match(urlRegex);
    if (matchedUrls) {
        for (const url of matchedUrls) {
            const finalUrl = await getFinalUrlFromHtml(url);
            urlSet.add(finalUrl);
            urlMapping.set(url, finalUrl);
        }
    }

    // 結果の表示
    if (urlSet.size === 0) {
        output.textContent = 'URLが見つかりませんでした。\n' +
            '以下の形式で入力してください：\n' +
            '1. URLを直接入力\n' +
            '2. ハイパーリンクをペースト\n' +
            '3. 上記の組み合わせ';
        return null;
    }

    // リダイレクト情報を含めた結果を表示
    let result = `検出したURL (${urlSet.size}件):\n\n`;
    let index = 1;
    for (const [originalUrl, finalUrl] of urlMapping.entries()) {
        if (originalUrl !== finalUrl) {
            result += `${index}. ${originalUrl}\n   → ${finalUrl}\n\n`;
        } else {
            result += `${index}. ${originalUrl}\n\n`;
        }
        index++;
    }
    output.textContent = result;

    return Array.from(urlSet);
}

async function generateHtml() {
    const urls = await extractUrls();
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