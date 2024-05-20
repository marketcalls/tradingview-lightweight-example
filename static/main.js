// Initial chart setup
const chartOptions = {
    layout: {
        background: { type: 'solid', color: 'white' },
        textColor: 'black',
    },
    grid: {
        vertLines: {
            color: '#e1e1e1',
        },
        horzLines: {
            color: '#e1e1e1',
        },
    },
    width: document.getElementById('chart').clientWidth,
    height: document.getElementById('chart').clientHeight,
};

const chart = LightweightCharts.createChart(document.getElementById('chart'), chartOptions);
const candlestickSeries = chart.addCandlestickSeries();
const emaLine = chart.addLineSeries({
    color: 'blue', // Set the color for the EMA line
    lineWidth: 2
});
const rsiChart = LightweightCharts.createChart(document.getElementById('rsiChart'), {
    ...chartOptions,
    height: document.getElementById('rsiChart').clientHeight,
});
const rsiLine = rsiChart.addLineSeries({
    color: 'red', // Set the color for the RSI line
    lineWidth: 2
});

let autoUpdateInterval;

// Fetch data function
function fetchData(ticker, timeframe, emaPeriod, rsiPeriod) {
    fetch(`/api/data/${ticker}/${timeframe}/${emaPeriod}/${rsiPeriod}`)
        .then(response => response.json())
        .then(data => {
            candlestickSeries.setData(data.candlestick);
            emaLine.setData(data.ema);
            rsiLine.setData(data.rsi);
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });
}

// Fetch NVDA data on page load with default timeframe (daily), EMA period (20) and RSI period (14)
window.addEventListener('load', () => {
    fetchData('NVDA', '1d', 20, 14);
    loadWatchlist();
});

// Handle data fetching on button click
document.getElementById('fetchData').addEventListener('click', () => {
    const ticker = document.getElementById('ticker').value;
    const timeframe = document.getElementById('timeframe').value;
    const emaPeriod = document.getElementById('emaPeriod').value;
    const rsiPeriod = document.getElementById('rsiPeriod').value;
    fetchData(ticker, timeframe, emaPeriod, rsiPeriod);
});

// Handle auto-update functionality
document.getElementById('autoUpdate').addEventListener('change', (event) => {
    if (event.target.checked) {
        const frequency = document.getElementById('updateFrequency').value * 1000;
        autoUpdateInterval = setInterval(() => {
            const ticker = document.getElementById('ticker').value;
            const timeframe = document.getElementById('timeframe').value;
            const emaPeriod = document.getElementById('emaPeriod').value;
            const rsiPeriod = document.getElementById('rsiPeriod').value;
            fetchData(ticker, timeframe, emaPeriod, rsiPeriod);
        }, frequency);
    } else {
        clearInterval(autoUpdateInterval);
    }
});

// Handle window resize
window.addEventListener('resize', () => {
    chart.resize(document.getElementById('chart').clientWidth, document.getElementById('chart').clientHeight);
    rsiChart.resize(document.getElementById('rsiChart').clientWidth, document.getElementById('rsiChart').clientHeight);
});

// Theme toggle functionality
document.getElementById('themeToggle').addEventListener('click', () => {
    const bodyClassList = document.body.classList;
    const watchlist = document.getElementById('watchlist');
    if (bodyClassList.contains('bg-white')) {
        bodyClassList.replace('bg-white', 'bg-gray-900');
        bodyClassList.replace('text-black', 'text-white');
        watchlist.classList.replace('bg-gray-100', 'bg-gray-800');
        watchlist.classList.replace('text-black', 'text-white');
        chart.applyOptions({
            layout: {
                background: { type: 'solid', color: 'black' },
                textColor: 'white',
            },
            grid: {
                vertLines: {
                    color: 'black',
                },
                horzLines: {
                    color: 'black',
                },
            }
        });
        rsiChart.applyOptions({
            layout: {
                background: { type: 'solid', color: 'black' },
                textColor: 'white',
            },
            grid: {
                vertLines: {
                    color: 'black',
                },
                horzLines: {
                    color: 'black',
                },
            }
        });
    } else {
        bodyClassList.replace('bg-gray-900', 'bg-white');
        bodyClassList.replace('text-white', 'text-black');
        watchlist.classList.replace('bg-gray-800', 'bg-gray-100');
        watchlist.classList.replace('text-white', 'text-black');
        chart.applyOptions({
            layout: {
                background: { type: 'solid', color: 'white' },
                textColor: 'black',
            },
            grid: {
                vertLines: {
                    color: '#e1e1e1',
                },
                horzLines: {
                    color: '#e1e1e1',
                },
            }
        });
        rsiChart.applyOptions({
            layout: {
                background: { type: 'solid', color: 'white' },
                textColor: 'black',
            },
            grid: {
                vertLines: {
                    color: '#e1e1e1',
                },
                horzLines: {
                    color: '#e1e1e1',
                },
            }
        });
    }
});

// Load watchlist symbols from the server
function loadWatchlist() {
    fetch('/api/symbols')
        .then(response => response.json())
        .then(symbols => {
            const watchlistItems = document.getElementById('watchlistItems');
            watchlistItems.innerHTML = '';
            symbols.forEach(symbol => {
                const item = document.createElement('div');
                item.className = 'watchlist-item';
                item.innerText = symbol;
                item.addEventListener('click', () => {
                    document.getElementById('ticker').value = symbol;
                    fetchData(symbol, document.getElementById('timeframe').value, document.getElementById('emaPeriod').value, document.getElementById('rsiPeriod').value);
                });
                watchlistItems.appendChild(item);
            });
        })
        .catch(error => {
            console.error('Error loading watchlist:', error);
        });
}