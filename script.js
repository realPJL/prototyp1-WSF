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
let initialBalance = 10000;
let msciWorldPerformance = 4.2; // MSCI World performance in percent

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
        'TSLA': { name: 'Tesla Inc.', price: 421.21, change: -1.81, changePercent: -0.41 },
        'OXY': { name: 'Occidental Pretrolium Corp.', price: 21.21, change: 0.81, changePercent: 1.51 },
        'AMD': { name: 'Advanced Micro Devices Inc.', price: 50.98, change: 0.10, changePercent: 2.81 },
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

// Leaderboard aktualisieren
function updateLeaderboard(userPerformance) {
    // Leaderboard-Daten (in einer echten App würden diese von einem Server kommen)
    const leaderboardData = [
        { name: 'TraderPro89', performance: 12.4 },
        { name: 'InvestorElite', performance: 8.7 },
        { name: 'StockMaster', performance: 5.2 },
        { name: 'MarketWhiz', performance: -1.8 },
        { name: 'TradingNewbie', performance: -7.5 }
    ];
    
    // User einfügen und sortieren
    const userEntry = { name: 'You', performance: userPerformance };
    const allEntries = [...leaderboardData, userEntry];
    
    // Nach Performance sortieren (absteigend)
    allEntries.sort((a, b) => b.performance - a.performance);
    
    // Top 5 auswählen
    const topEntries = allEntries.slice(0, 5);
    
    // Leaderboard-HTML aktualisieren
    const leaderboardItems = document.querySelector('.leaderboard-items');
    leaderboardItems.innerHTML = '';
    
    topEntries.forEach((entry, index) => {
        const item = document.createElement('div');
        item.className = 'leaderboard-item';
        
        item.innerHTML = `
            <div class="trader-info">
                <span class="rank">${index + 1}</span>
                <span class="trader-name">${entry.name}</span>
            </div>
            <div class="trader-performance ${entry.performance >= 0 ? 'up' : 'down'}">
                ${entry.performance >= 0 ? '+' : ''}${entry.performance.toFixed(1)}%
            </div>
        `;
        
        leaderboardItems.appendChild(item);
    });
}

// UI aktualisieren
function updateUI() {
    // Ticker aktualisieren
    updateTicker();
    
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
    
    // Berechne Benutzerperformance im Vergleich zum MSCI World
    const totalValue = balance + portfolioValue;
    const totalPerformance = ((totalValue - initialBalance) / initialBalance) * 100;
    const vsIndex = totalPerformance - msciWorldPerformance;
    
    // Aktualisiere Leaderboard
    updateLeaderboard(vsIndex);
}

// Zurücksetzen
document.getElementById('reset-btn').addEventListener('click', function () {
    if (confirm('Möchten Sie die Simulation zurücksetzen? Dies wird Ihr Konto auf €10.000 zurücksetzen und Ihr Portfolio löschen.')) {
        balance = initialBalance;
        portfolio = {};
        
        // Zufällige neue MSCI World Performance generieren (zwischen 3% und 6%)
        msciWorldPerformance = (Math.random() * 3 + 3).toFixed(1);
        
        updateUI();
    }
});

// Ticker aktualisieren
function updateTicker() {
    const stocks = {
        'AAPL': { price: 175.42, change: 2.15, changePercent: 1.24 },
        'MSFT': { price: 328.79, change: 3.24, changePercent: 0.99 },
        'AMZN': { price: 178.21, change: -1.35, changePercent: -0.75 },
        'GOOGL': { price: 142.65, change: 0.87, changePercent: 0.61 },
        'TSLA': { price: 421.21, change: -1.81, changePercent: -0.41 },
        'OXY': { price: 21.21, change: 0.81, changePercent: 1.51 },
        'NFLX': { price: 500.00, change: 7.5, changePercent: 1.50 },
        'FB': { price: 300.00, change: -1.5, changePercent: -0.50 },
        'NVDA': { price: 600.00, change: 18.0, changePercent: 3.00 },
        'DIS': { price: 120.00, change: -2.4, changePercent: -2.00 },
        'V': { price: 250.00, change: 2.0, changePercent: 0.80 },
        'MA': { price: 350.00, change: 3.85, changePercent: 1.10 },
        'PYPL': { price: 80.00, change: -1.2, changePercent: -1.50 },
        'SQ': { price: 200.00, change: 4.4, changePercent: 2.20 },
        'AMD': { price: 100.00, change: -0.3, changePercent: -0.30 },
        'INTC': { price: 50.00, change: 0.25, changePercent: 0.50 },
        'CSCO': { price: 60.00, change: -0.12, changePercent: -0.20 }
    };
    
    const ticker = document.querySelector('.ticker');
    ticker.innerHTML = '';
    
    // Create ticker items - adding each stock twice to ensure smooth transition
    for (let i = 0; i < 2; i++) {
        for (const symbol in stocks) {
            const stock = stocks[symbol];
            const tickerItem = document.createElement('div');
            tickerItem.className = 'ticker-item';
            tickerItem.innerHTML = `${symbol}: €${stock.price.toFixed(2)} <span class="${stock.change > 0 ? 'up' : 'down'}">${stock.change > 0 ? '+' : ''}${stock.changePercent.toFixed(2)}%</span>`;
            ticker.appendChild(tickerItem);
        }
    }
}

// Gruppen-Datenstruktur
let groups = {
    'trading-crew': {
        name: 'Trading Crew',
        members: [
            { id: 'user1', name: 'MaxMustermann', isAdmin: true, performance: 15.2 },
            { id: 'user2', name: 'AnnaBeispiel', isAdmin: false, performance: 12.7 },
            { id: 'user3', name: 'TomTest', isAdmin: false, performance: 8.4 },
            { id: 'user4', name: 'LisaMuster', isAdmin: false, performance: 5.1 },
            { id: 'user5', name: 'You', isAdmin: false, performance: 3.9 }
        ],
        privacy: 'private',
        chat: [
            { user: 'MaxMustermann', message: 'Hallo zusammen!', time: '10:30' },
            { user: 'AnnaBeispiel', message: 'Hat jemand einen Tipp für heute?', time: '10:45' },
            { user: 'TomTest', message: 'Ich setze auf Tech-Aktien heute', time: '11:20' }
        ],
        performanceData: generateGroupPerformanceData()
    },
    'investor-club': {
        name: 'Investor Club',
        members: [
            { id: 'user6', name: 'InvestorPro', isAdmin: true, performance: 18.3 },
            { id: 'user7', name: 'FinanceGuru', isAdmin: false, performance: 14.6 },
            { id: 'user5', name: 'You', isAdmin: false, performance: 3.9 }
            // Weitere Mitglieder...
        ],
        privacy: 'public',
        chat: [],
        performanceData: generateGroupPerformanceData()
    }
};

let currentGroupId = 'trading-crew';

// Gruppen-Performance-Daten generieren
function generateGroupPerformanceData() {
    const data = [];
    let currentValue = 100;
    
    for (let i = 0; i < 30; i++) {
        const change = currentValue * (Math.random() * 0.04 - 0.02);
        currentValue += change;
        data.push(currentValue);
    }
    
    return data;
}

// Gruppe auswählen
function selectGroup(groupId) {
    currentGroupId = groupId;
    const group = groups[groupId];
    
    // UI aktualisieren
    document.getElementById('group-title').textContent = group.name;
    
    // Gruppenmitglieder anzeigen
    updateGroupMembers();
    
    // Chat anzeigen
    updateGroupChat();
    
    // Performance-Chart aktualisieren
    updateGroupPerformanceChart();
    
    // Aktive Gruppe markieren
    document.querySelectorAll('.group-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`.group-item[onclick="selectGroup('${groupId}')"]`).classList.add('active');
}

// Gruppenmitglieder aktualisieren
function updateGroupMembers() {
    const group = groups[currentGroupId];
    const membersGrid = document.getElementById('members-grid');
    membersGrid.innerHTML = '';
    
    // Mitglieder nach Performance sortieren
    const sortedMembers = [...group.members].sort((a, b) => b.performance - a.performance);
    
    sortedMembers.forEach((member, index) => {
        const memberCard = document.createElement('div');
        memberCard.className = 'member-card';
        
        memberCard.innerHTML = `
            <div class="member-rank">${index + 1}</div>
            <div class="member-name">${member.name} ${member.isAdmin ? '(Admin)' : ''}</div>
            <div class="member-performance ${member.performance >= 0 ? 'up' : 'down'}">
                ${member.performance >= 0 ? '+' : ''}${member.performance.toFixed(1)}%
            </div>
            ${member.isAdmin ? '<div class="admin-badge">Admin</div>' : ''}
        `;
        
        membersGrid.appendChild(memberCard);
    });
    
    // Besten Trader und Durchschnitt aktualisieren
    const bestTrader = sortedMembers[0];
    document.getElementById('best-trader').textContent = `${bestTrader.name} (+${bestTrader.performance.toFixed(1)}%)`;
    
    const avgPerformance = sortedMembers.reduce((sum, member) => sum + member.performance, 0) / sortedMembers.length;
    document.getElementById('avg-performance').textContent = `${avgPerformance >= 0 ? '+' : ''}${avgPerformance.toFixed(1)}%`;
    
    // Benutzerrang finden
    const userIndex = sortedMembers.findIndex(member => member.name === 'You');
    document.getElementById('user-rank').textContent = `${userIndex + 1}/${sortedMembers.length}`;
}

// Gruppen-Chat aktualisieren
function updateGroupChat() {
    const group = groups[currentGroupId];
    const chatMessages = document.getElementById('chat-messages');
    chatMessages.innerHTML = '';
    
    group.chat.forEach(msg => {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'chat-message';
        messageDiv.innerHTML = `
            <span class="chat-user">${msg.user}:</span>
            <span class="chat-text">${msg.message}</span>
            <span class="chat-time">${msg.time}</span>
        `;
        chatMessages.appendChild(messageDiv);
    });
    
    // Nach unten scrollen
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Gruppen-Performance-Chart aktualisieren
function updateGroupPerformanceChart() {
    const group = groups[currentGroupId];
    const ctx = document.getElementById('groupChart').getContext('2d');
    
    // Wenn bereits ein Chart existiert, zerstören wir es
    if (window.groupChart) {
        window.groupChart.destroy();
    }
    
    const labels = [];
    for (let i = 30; i > 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        labels.push(date.toLocaleDateString('de-DE', { month: 'short', day: 'numeric' }));
    }
    
    window.groupChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Gruppenperformance',
                data: group.performanceData,
                borderColor: '#3a7bd5',
                backgroundColor: 'rgba(58, 123, 213, 0.1)',
                tension: 0.2,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.raw.toFixed(2)}%`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                }
            }
        }
    });
}

// Nachricht senden
function sendGroupMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    
    if (message) {
        const now = new Date();
        const timeString = now.getHours() + ':' + (now.getMinutes() < 10 ? '0' : '') + now.getMinutes();
        
        groups[currentGroupId].chat.push({
            user: 'You',
            message: message,
            time: timeString
        });
        
        input.value = '';
        updateGroupChat();
    }
}

// Modals anzeigen/verstecken
function showInviteModal() {
    document.getElementById('invite-modal').style.display = 'block';
}

function showGroupSettings() {
    const group = groups[currentGroupId];
    document.getElementById('group-name').value = group.name;
    document.getElementById('group-privacy').value = group.privacy;
    document.getElementById('group-settings-modal').style.display = 'block';
}

function showCreateGroupModal() {
    document.getElementById('create-group-modal').style.display = 'block';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Einladungslink kopieren
function copyInviteLink() {
    const linkInput = document.getElementById('invite-link');
    linkInput.select();
    document.execCommand('copy');
    alert('Link wurde in die Zwischenablage kopiert!');
}

// Neue Gruppe erstellen
function createNewGroup() {
    const name = document.getElementById('new-group-name').value.trim();
    const privacy = document.getElementById('new-group-privacy').value;
    
    if (!name) {
        alert('Bitte geben Sie einen Gruppennamen ein');
        return;
    }
    
    const newGroupId = name.toLowerCase().replace(/\s+/g, '-');
    
    groups[newGroupId] = {
        name: name,
        members: [
            { id: 'user5', name: 'You', isAdmin: true, performance: 3.9 }
        ],
        privacy: privacy,
        chat: [],
        performanceData: generateGroupPerformanceData()
    };
    
    closeModal('create-group-modal');
    selectGroup(newGroupId);
    
    // Neue Gruppe zur Liste hinzufügen
    const groupList = document.querySelector('.group-list');
    const newGroupItem = document.createElement('div');
    newGroupItem.className = 'group-item active';
    newGroupItem.setAttribute('onclick', `selectGroup('${newGroupId}')`);
    newGroupItem.innerHTML = `
        <div>${name}</div>
        <div class="members-count">1 Mitglied</div>
    `;
    groupList.appendChild(newGroupItem);
}

// Initialisierung
document.addEventListener('DOMContentLoaded', function() {
    // Gruppen initialisieren
    selectGroup(currentGroupId);
    
    // Event-Listener für Enter-Taste im Chat
    document.getElementById('chat-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendGroupMessage();
        }
    });
    
    // Event-Listener für Modals schließen beim Klicken außerhalb
    window.addEventListener('click', function(event) {
        if (event.target.className === 'modal') {
            event.target.style.display = 'none';
        }
    });
});
// Initialisierung
updateUI();

// Initialize ticker on page load
updateTicker();