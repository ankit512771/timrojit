let users = [
    { 
        uid: "123456", 
        email: "demo1@example.com", 
        password: "demo123", 
        balance: 1000, 
        notifications: [
            "Welcome! UID: 123456",
            "💰 Bonus 1000 NPR added to your balance",
            
        ] 
    },
    { 
        uid: "654321", 
        email: "demo2@example.com", 
        password: "demo123", 
        balance: 1000, 
        notifications: [
            "Welcome! UID: 653321",
            "💰 Bonus 1000 NPR added to your balance",
            "📱 Remember to rotate mobile for best experience"
        ] 
    },
    { 
        uid: "654324", 
        email: "demo3@example.com", 
        password: "demo123", 
        balance: 1000, 
        notifications: [
            "Welcome! UID: 654324",
            "💰 Bonus 1000 NPR added to your balance",
            "📱 Remember to rotate mobile for best experience"
        ] 
    },
    { 
        uid: "543121", 
        email: "demo4@example.com", 
        password: "demo123", 
        balance: 1000, 
        notifications: [
            "Welcome! UID: 543121",
            "💰 Bonus 1000 NPR added to your balance",
            "📱 Remember to rotate mobile for best experience"
        ] 
    }
];

let currentUser = null;

// Load saved user
const savedUID = localStorage.getItem('loggedInUID');
if (savedUID) {
    currentUser = users.find(u => u.uid === savedUID);
    if (currentUser) updateUIAfterLogin();
}

// ------------------- Home Notifications -------------------
const homeNotificationsTemplate = [
    "📱 If you are using mobile, please rotate your device",
    "Welcome to Gambling Education Site",
    "Minimum bet: 22 NPR",
    "Maximum bet: 500 NPR"
    
];

// ------------------- Tabs -------------------
function showTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(t => t.style.display = 'none');
    document.getElementById(tabId).style.display = 'block';
    if (currentUser) updateUIAfterLogin();

    const homeNotifDiv = document.getElementById('homeNotifications');
    if (tabId === 'home') {
        homeNotifDiv.innerHTML = '';
        homeNotificationsTemplate.forEach(n => {
            const p = document.createElement('p'); 
            p.innerText = n;
            p.classList.add('notificationItem');
            homeNotifDiv.appendChild(p);
        });
    } else homeNotifDiv.innerHTML = '';
}

// ------------------- Login -------------------
document.getElementById('loginForm').addEventListener('submit', e => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim().toLowerCase();
    const password = document.getElementById('loginPassword').value;
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
        currentUser = user;
        localStorage.setItem('loggedInUID', user.uid);
        updateUIAfterLogin();
        showTab('home');
        document.getElementById('loginMessage').innerText = "✅ Login successful!";
    } else {
        document.getElementById('loginMessage').innerText = "❌ Invalid email/password";
    }
});

// ------------------- Update UI -------------------
function updateUIAfterLogin() {
    if (!currentUser) return;

    // Show profile link
    document.getElementById('profileLink').style.display = 'block';

    // Hide Login and Signup links
    document.querySelectorAll('.sidebar ul li a').forEach(link => {
        const text = link.innerText.trim().toLowerCase();
        if (text === 'login' || text === 'sign up') {
            link.parentElement.style.display = 'none';
        }
    });

    // Update balances
    document.getElementById('profileUID').innerText = currentUser.uid;
    document.getElementById('profileEmail').innerText = currentUser.email;
    document.getElementById('profileBalance').innerText = `Balance: NPR ${currentUser.balance}`;
    document.getElementById('homeBalance').innerText = `Balance: NPR ${currentUser.balance}`;
    document.getElementById('gameBalance').innerText = `Balance: NPR ${currentUser.balance}`;

    // Show last 5 notifications in profile
    const notifDiv = document.getElementById('profileNotifications');
    notifDiv.innerHTML = '';
    currentUser.notifications.slice(-5).reverse().forEach(n => {
        const p = document.createElement('p');
        p.innerHTML = `🔔 ${n}`;
        p.classList.add('notificationItem');
        notifDiv.appendChild(p);
    });

    localStorage.setItem('users', JSON.stringify(users));
}

// ------------------- Logout -------------------
function logoutUser() {
    currentUser = null;
    localStorage.removeItem('loggedInUID');
    document.getElementById('profileLink').style.display = 'none';
    document.querySelectorAll('.sidebar ul li').forEach(li => li.style.display = 'block');
    showTab('home');
}

// ------------------- Spin & Win -------------------
function spinGame() {
    if (!currentUser) { alert('Login first'); return; }
    const bet = parseInt(document.getElementById('spinBet').value);
    if (isNaN(bet) || bet < 22 || bet > 500) { alert("Bet 22-500"); return; }
    if (bet > currentUser.balance) { alert("Not enough balance"); return; }

    currentUser.balance -= bet;

    const rewards = [
        { label: "0x", multiplier: 0, chance: 70 },
        { label: "2x", multiplier: 2, chance: 10 },
        { label: "3x", multiplier: 3, chance: 4 },
        { label: "4x", multiplier: 4, chance: 1 },
        { label: "5x", multiplier: 5, chance: 0.2 }
    ];

    const rand = Math.random() * 100;
    let cumulative = 0, reward;
    for (let r of rewards) {
        cumulative += r.chance;
        if (rand <= cumulative) { reward = r; break; }
    }

    const winAmount = bet * reward.multiplier;
    currentUser.balance += winAmount;
    currentUser.notifications.push(`Spin Bet ${bet} => ${reward.label} => Net Win NPR ${winAmount - bet}`);

    document.getElementById('wheelDisplay').innerText = reward.label;
    document.getElementById('spinResult').innerText = `Result: ${reward.label} 🎉 Net Win: NPR ${winAmount - bet}`;
    updateUIAfterLogin();
}

// ------------------- Rock Paper Scissors -------------------
function rpsGame(choice) {
    if (!currentUser) { alert('Login first'); return; }
    const bet = parseInt(document.getElementById('rpsBet').value);
    if (isNaN(bet) || bet < 22 || bet > 500) { alert("Bet 22-500"); return; }
    if (bet > currentUser.balance) { alert("Not enough balance"); return; }

    currentUser.balance -= bet;

    const options = ['rock', 'paper', 'scissors'];
    const computer = options[Math.floor(Math.random() * 3)];
    const win = Math.random() < 0.4;

    let resultText = '', winAmount = 0;
    if (win) { resultText = `You won! ${choice} beats ${computer}`; winAmount = bet * 2; }
    else { resultText = `You lost! ${computer} beats ${choice}`; winAmount = 0; }

    currentUser.balance += winAmount;
    currentUser.notifications.push(`RPS Bet ${bet} => ${resultText} => Net Win NPR ${winAmount - bet}`);
    document.getElementById('rpsResult').innerText = `${resultText} (Net Win NPR ${winAmount - bet})`;

    updateUIAfterLogin();
}

// ------------------- Coin Flip -------------------
function flipCoin(choice) {
    if (!currentUser) { alert('Login first'); return; }
    const bet = parseInt(document.getElementById('flipBet').value);
    if (isNaN(bet) || bet < 22 || bet > 500) { alert("Bet 22-500"); return; }
    if (bet > currentUser.balance) { alert("Not enough balance"); return; }

    currentUser.balance -= bet;

    const display = document.getElementById('flipResult');
    const options = ['head', 'tail'];
    let i = 0;
    const interval = setInterval(() => {
        display.innerText = options[i % 2].toUpperCase();
        i++;
    }, 25); // faster spin

    setTimeout(() => {
        clearInterval(interval);
        const computer = options[Math.floor(Math.random() * 2)];
        const win = choice === computer;
        const winAmount = win ? bet * 2 : 0;
        currentUser.balance += winAmount;
        currentUser.notifications.push(`Coin Bet ${bet} => ${win ? 'Win' : 'Lose'} => Net Win NPR ${winAmount - bet}`);
        display.innerText = `Result: ${computer.toUpperCase()} => ${win ? 'You Win!' : 'You Lose!'}`;
        updateUIAfterLogin();
    }, 1000); // spin 1 sec
}



// ------------------- Instructions Modal -------------------
function showInstructions(game) {
    const modal = document.getElementById('instructionsModal');
    const text = document.getElementById('instructionsText');
    let msg = '';
    if (game === 'spin') msg = 'Enter bet 22-500. Click Spin. Wait for result.';
    if (game === 'rps') msg = 'Enter bet 22-500. Choose Rock, Paper, or Scissors.';
    if (game === 'coin') msg = 'Enter bet 22-500. Choose Head or Tail. Coin spins and shows result.';
    if (game === 'ttt') msg = 'Enter bet 22-500. Click a cell to place X. AI plays O. Try to win!';
    text.innerText = msg;
    modal.style.display = 'block';
}

function closeInstructions() { document.getElementById('instructionsModal').style.display = 'none'; }

showTab('home');

