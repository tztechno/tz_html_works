const ctx = document.getElementById('bitcoinChart').getContext('2d');
let bitcoinChart;

// 時間と価格のデータを保持するリスト
const labels = [];
const data = [];

// Bitcoin価格を取得する関数
async function getBitcoinPrice() {
    const response = await fetch('https://api.coindesk.com/v1/bpi/currentprice/BTC.json');
    const data = await response.json();
    const price = data.bpi.USD.rate_float;
    return price;
}

// グラフの初期化
function initChart() {
    bitcoinChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Bitcoin Price (USD)',
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
                        text: 'Price (USD)'
                    }
                }
            }
        }
    });
}

// データを更新する関数
async function updateChart() {
    const price = await getBitcoinPrice();
    const now = new Date();

    // 時間と価格をリストに追加
    labels.push(now);
    data.push(price);

    // 最大50データポイントに制限
    if (labels.length > 50) {
        labels.shift();
        data.shift();
    }

    bitcoinChart.update();
}

// 初期化と定期更新の設定
initChart();
setInterval(updateChart, 60000);  // 1分ごとに価格データを更新
