// Globale Variablen
let currentStock = {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    price: 175.42,
    change: 2.15,
    changePercent: 1.24
};

let portfolio = {};
let balance = 10000;

// Zufällige Preisdaten erstellen
function generatePriceData(startPrice, days) {
    const data = [];
    let currentPrice = startPrice;

    for (let i = 0; i < days; i++) {
        // Zufällige Preisänderung zwischen -2% und +2%
        const change = currentPrice * (Math.random() * 0.04 - 0.02);
        currentPrice += change;
        data.push(currentPrice);
    }

    return data;
}

// Chart initialisieren
const ctx = document.getElementById('priceChart').getContext('2d');
const priceData = generatePriceData(currentStock.price, 30);

const labels = [];
for (let i = 30; i > 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    labels.push(date.toLocaleDateString('de-DE', { month: 'short', day: 'numeric' }));
}

const chart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: labels,
        datasets: [{
            label: 'Kurs (€)',
            data: priceData,
            borderColor: '#4caf50',
            backgroundColor: 'rgba(76, 175, 80, 0.1)',
            tension: 0.2,
            fill: true
        }]
    },
    options: {
        responsive: true,
        interaction: {
            intersect: false,
            mode: 'index',
        },
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        return `€${context.raw.toFixed(2)}`;
                    }
                }
            }
        },
        scales: {
            y: {
                ticks: {
                    callback: function (value) {
                        return '€' + value.toFixed(2);
                    }
                }
            }
        }
    }
});

// Aktie auswählen
function selectStock(symbol) {
    // Hier würden in einer echten App Daten von einer API geladen
    const stocks = {
        'AAPL': { name: 'Apple Inc.', price: 175.42, change: 2.15, changePercent: 1.24 },
        'MSFT': { name: 'Microsoft Corp.', price: 328.79, change: 3.24, changePercent: 0.99 },
        'AMZN': { name: 'Amazon.com Inc.', price: 178.21, change: -1.35, changePercent: -0.75 },
        'GOOGL': { name: 'Alphabet Inc.', price: 142.65, change: 0.87, changePercent: 0.61 }
    };

    currentStock = {
        symbol: symbol,
        ...stocks[symbol]
    };

    // UI aktualisieren
    document.getElementById('stock-name').textContent = currentStock.name;
    document.getElementById('stock-symbol').textContent = currentStock.symbol;
    document.getElementById('stock-price').textContent = `€${currentStock.price.toFixed(2)}`;

    const stockChange = document.getElementById('stock-change');
    stockChange.textContent = `${currentStock.change > 0 ? '+' : ''}${currentStock.change.toFixed(2)} (${currentStock.changePercent.toFixed(2)}%)`;

    if (currentStock.change > 0) {
        stockChange.className = 'stock-change up';
    } else {
        stockChange.className = 'stock-change down';
    }

    // Chart aktualisieren
    const newData = generatePriceData(currentStock.price, 30);
    chart.data.datasets[0].data = newData;

    // Farbe des Charts je nach Trend ändern
    if (newData[0] < newData[newData.length - 1]) {
        chart.data.datasets[0].borderColor = '#4caf50';
        chart.data.datasets[0].backgroundColor = 'rgba(76, 175, 80, 0.1)';
    } else {
        chart.data.datasets[0].borderColor = '#f44336';
        chart.data.datasets[0].backgroundColor = 'rgba(244, 67, 54, 0.1)';
    }

    chart.update();
}

// Zeitraum ändern
function changeTimeframe(timeframe) {
    let days;

    switch (timeframe) {
        case '1D': days = 1; break;
        case '1W': days = 7; break;
        case '1M': days = 30; break;
        case '3M': days = 90; break;
        case '1Y': days = 365; break;
        default: days = 30;
    }

    const newLabels = [];
    if (days === 1) {
        // Für einen Tag: stündliche Daten
        for (let i = 0; i < 8; i++) {
            newLabels.push(`${9 + i}:00`);
        }
    } else {
        // Für längere Zeiträume: tägliche Daten
        for (let i = days; i > 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);

            if (days > 90) {
                newLabels.push(date.toLocaleDateString('de-DE', { month: 'short' }));
            } else {
                newLabels.push(date.toLocaleDateString('de-DE', { month: 'short', day: 'numeric' }));
            }
        }
    }

    chart.data.labels = newLabels;
    const newData = generatePriceData(currentStock.price, days);
    chart.data.datasets[0].data = newData;

    // Farbe des Charts je nach Trend ändern
    if (newData[0] < newData[newData.length - 1]) {
        chart.data.datasets[0].borderColor = '#4caf50';
        chart.data.datasets[0].backgroundColor = 'rgba(76, 175, 80, 0.1)';
    } else {
        chart.data.datasets[0].borderColor = '#f44336';
        chart.data.datasets[0].backgroundColor = 'rgba(244, 67, 54, 0.1)';
    }

    chart.update();
}

// Aktie kaufen
function buyStock() {
    const amount = parseInt(document.getElementById('trade-amount').value);

    if (!amount || amount <= 0) {
        alert('Bitte geben Sie eine gültige Anzahl ein.');
        return;
    }

    const totalCost = amount * currentStock.price;

    if (totalCost > balance) {
        alert('Nicht genügend Guthaben für diesen Kauf.');
        return;
    }

    // Kauf durchführen
    balance -= totalCost;

    // Portfolio aktualisieren
    if (portfolio[currentStock.symbol]) {
        portfolio[currentStock.symbol].amount += amount;
        portfolio[currentStock.symbol].avgPrice = (portfolio[currentStock.symbol].totalCost + totalCost) / portfolio[currentStock.symbol].amount;
        portfolio[currentStock.symbol].totalCost += totalCost;
    } else {
        portfolio[currentStock.symbol] = {
            name: currentStock.name,
            amount: amount,
            avgPrice: currentStock.price,
            totalCost: totalCost,
            currentPrice: currentStock.price
        };
    }

    updateUI();
    document.getElementById('trade-amount').value = '';
}

// Aktie verkaufen
function sellStock() {
    const amount = parseInt(document.getElementById('trade-amount').value);

    if (!amount || amount <= 0) {
        alert('Bitte geben Sie eine gültige Anzahl ein.');
        return;
    }

    if (!portfolio[currentStock.symbol] || portfolio[currentStock.symbol].amount < amount) {
        alert('Sie besitzen nicht genügend Anteile zum Verkauf.');
        return;
    }

    // Verkauf durchführen
    const saleProceeds = amount * currentStock.price;
    balance += saleProceeds;

    // Portfolio aktualisieren
    portfolio[currentStock.symbol].amount -= amount;

    if (portfolio[currentStock.symbol].amount === 0) {
        delete portfolio[currentStock.symbol];
    }

    updateUI();
    document.getElementById('trade-amount').value = '';
}

// UI aktualisieren
function updateUI() {
    // Kontostand aktualisieren
    document.querySelector('.balance').textContent = `Kontostand: €${balance.toFixed(2)}`;

    // Portfolio aktualisieren
    const portfolioList = document.getElementById('portfolio-list');
    portfolioList.innerHTML = '';

    let portfolioValue = 0;

    for (const symbol in portfolio) {
        const position = portfolio[symbol];
        const currentValue = position.amount * currentStock.price;
        portfolioValue += currentValue;

        const profitLoss = currentValue - position.totalCost;
        const profitLossPercent = (profitLoss / position.totalCost) * 100;

        const item = document.createElement('div');
        item.className = 'portfolio-item';
        item.onclick = () => selectStock(symbol);

        item.innerHTML = `
                    <div>
                        <div>${symbol}</div>
                        <div>${position.amount} Anteile</div>
                    </div>
                    <div>
                        <div class="price ${profitLoss >= 0 ? 'up' : 'down'}">€${currentValue.toFixed(2)}</div>
                        <div class="price ${profitLoss >= 0 ? 'up' : 'down'}">${profitLoss >= 0 ? '+' : ''}${profitLossPercent.toFixed(2)}%</div>
                    </div>
                `;

        portfolioList.appendChild(item);
    }

    document.getElementById('portfolio-value').innerHTML = `<p>Gesamtwert: €${portfolioValue.toFixed(2)}</p>`;
}

// Zurücksetzen
document.getElementById('reset-btn').addEventListener('click', function () {
    if (confirm('Möchten Sie die Simulation zurücksetzen? Dies wird Ihr Konto auf €10.000 zurücksetzen und Ihr Portfolio löschen.')) {
        balance = 10000;
        portfolio = {};
        updateUI();
    }
});

// Initialisierung
updateUI();