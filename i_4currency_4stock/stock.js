// List of Japanese stocks to display
const stocks_JP = [
    { symbol: '7203.T', name: 'Toyota', id: 'stockChart1' },  // トヨタ自動車
    { symbol: '6758.T', name: 'Sony', id: 'stockChart2' },    // ソニー
    { symbol: '9984.T', name: 'SoftBank', id: 'stockChart3' }, // ソフトバンク
    { symbol: '6501.T', name: 'Hitachi', id: 'stockChart4' }   // 日立製作所
];
const stocks = [
    { symbol: 'AAPL', name: 'Apple', id: 'stockChart1' },     // Apple Inc.
    { symbol: 'MSFT', name: 'Microsoft', id: 'stockChart2' }, // Microsoft Corporation
    { symbol: 'AMZN', name: 'Amazon', id: 'stockChart3' },    // Amazon.com Inc.
    { symbol: 'GOOGL', name: 'Google', id: 'stockChart4' }    // Alphabet Inc. (Google)
];

// Array to hold chart instances and data
const charts = [];
const API_KEY = 'S1OnG7CZeRFuZepJDZKSomf77MAhBj2S'; // Replace with your Alpha Vantage API key

// Function to fetch stock price data
async function getStockPrice(symbol) {
    try {
        const response = await fetch(`https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=1min&apikey=${API_KEY}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();

        // Extract the latest stock price
        const timeSeries = result['Time Series (1min)'];
        if (timeSeries) {
            const latestTime = Object.keys(timeSeries)[0];
            const latestPrice = parseFloat(timeSeries[latestTime]['4. close']);
            console.log(`Fetched ${symbol} price: ${latestPrice}`);
            return latestPrice;
        } else {
            console.error('Error: Unexpected API response format', result);
            return null;
        }
    } catch (error) {
        console.error(`Error fetching ${symbol} price:`, error);
        return null;
    }
}

// Function to initialize a chart
function initChart(stockInfo) {
    const ctx = document.getElementById(stockInfo.id).getContext('2d');

    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: `${stockInfo.name} Price`,
                data: [],
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 2,
                fill: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
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

    charts.push({ chart, ...stockInfo });
}

// Function to update all charts
async function updateCharts() {
    for (let stockInfo of charts) {
        const price = await getStockPrice(stockInfo.symbol);
        if (price !== null) {
            const now = new Date();

            // Update the chart data
            stockInfo.chart.data.labels.push(now);
            stockInfo.chart.data.datasets[0].data.push(price);

            // Limit to the last 50 data points
            if (stockInfo.chart.data.labels.length > 50) {
                stockInfo.chart.data.labels.shift();
                stockInfo.chart.data.datasets[0].data.shift();
            }

            stockInfo.chart.update();
        }
    }
}

// Initialize all charts
stocks.forEach(initChart);

// Set interval to update all charts every minute
setInterval(updateCharts, 300000); // Update every 1 minute

// Initial update to populate data immediately
updateCharts();
