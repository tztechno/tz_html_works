
const ctx = document.getElementById('usdJpyChart').getContext('2d');
let usdJpyChart;

// 時間と価格のデータを保持するリスト
const labels = [];
const data = [];

// APIキーを設定
const API_KEY = 'ZVX8JE1ZFJWFS0TU'; // ここにAlpha VantageのAPIキーを入力してください https://www.alphavantage.co/

// USD/JPYの為替レートを取得する関数
async function getUsdJpyPrice() {
    const response = await fetch(`https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=USD&to_currency=JPY&apikey=${API_KEY}`);
    const result = await response.json();
    const price = parseFloat(result['Realtime Currency Exchange Rate']['5. Exchange Rate']);
    return price;
}

// グラフの初期化
function initChart() {
    usdJpyChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'USD/JPY Price',
                data: data,
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 2,
                fill: false
            }]
        },
        options: {
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'minute'
                    },
                    title: {
                        display: true,
                        text: 'Time'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Price (JPY)'
                    }
                }
            }
        }
    });
}

// データを更新する関数
async function updateChart() {
    const price = await getUsdJpyPrice();
    const now = new Date();

    // 時間と価格をリストに追加
    labels.push(now);
    data.push(price);

    // 最大50データポイントに制限
    if (labels.length > 50) {
        labels.shift();
        data.shift();
    }

    usdJpyChart.update();
}

// 初期化と定期更新の設定
initChart();
setInterval(updateChart, 60000);  // 1分ごとに価格データを更新
