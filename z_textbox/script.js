const puppeteer = require('puppeteer');

(async () => {
    // ブラウザを起動
    const browser = await puppeteer.launch({ headless: false }); // headless: falseでUIを表示
    const page = await browser.newPage();

    // 外部のindex.htmlにアクセス
    await page.goto('https://tztechno.github.io/tz_html_works/z_textbox/index.html');

    // テキストボックスに値を入力
    await page.type('#text0', '遠隔操作されたテキスト 16:48'); // IDが'textInput'の要素を指定
    
    // 値を入力した後、1秒待機
    await new Promise(resolve => setTimeout(resolve, 100));

    // ボタンをクリック
    await page.click('#button0'); // IDが'button'の要素を指定

    // 必要に応じてページのスクリーンショットを撮る
    await page.screenshot({ path: 'screenshot.png' });

    // ブラウザを閉じる
    await browser.close();
})();
