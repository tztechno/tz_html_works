// List of currency pairs to display
const currencyPairs = [
    { from: 'USD', to: 'JPY', id: 'usdJpyChart1' },
    { from: 'EUR', to: 'USD', id: 'usdJpyChart2' },
    { from: 'GBP', to: 'USD', id: 'usdJpyChart3' },
    { from: 'AUD', to: 'USD', id: 'usdJpyChart4' }
];

// Array to hold chart instances and data
const charts = [];
const API_KEY = 'S1OnG7CZeRFuZepJDZKSomf77MAhBj2S'; // Replace with your Alpha Vantage API key

// Function to fetch the exchange rate for a given pair
async function getExchangeRate(from, to) {
    try {
        const response = await fetch(`https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=${from}&to_currency=${to}&apikey=${API_KEY}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();

        // Check if the response contains the expected data
        if (result['Realtime Currency Exchange Rate']) {
            const price = parseFloat(result['Realtime Currency Exchange Rate']['5. Exchange Rate']);
            console.log(`Fetched ${from}/${to} price: ${price}`);
            return price;
        } else {
            console.error('Error: Unexpected API response format', result);
            return null;
        }
    } catch (error) {
        console.error(`Error fetching ${from}/${to} rate:`, error);
        return null;
    }
}

// Function to initialize a chart
function initChart(chartInfo) {
    const ctx = document.getElementById(chartInfo.id).getContext('2d');

    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: `${chartInfo.from}/${chartInfo.to} Price`,
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
                        text: `Price (${chartInfo.to})`
                    }
                }
            }
        }
    });

    charts.push({ chart, ...chartInfo });
}

// Function to update all charts
async function updateCharts() {
    for (let chartInfo of charts) {
        const price = await getExchangeRate(chartInfo.from, chartInfo.to);
        if (price !== null) {
            const now = new Date();

            // Update the chart data
            chartInfo.chart.data.labels.push(now);
            chartInfo.chart.data.datasets[0].data.push(price);

            // Limit to the last 50 data points
            if (chartInfo.chart.data.labels.length > 50) {
                chartInfo.chart.data.labels.shift();
                chartInfo.chart.data.datasets[0].data.shift();
            }

            chartInfo.chart.update();
        }
    }
}

// Initialize all charts
currencyPairs.forEach(initChart);

// Set interval to update all charts every minute
setInterval(updateCharts, 60000); // Update every 1 minute

// Initial update to populate data immediately
updateCharts();