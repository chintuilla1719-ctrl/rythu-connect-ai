const API_URL = 'http://localhost:5000/api';

// ============ GLOBAL AUTH FUNCTIONS ============

function showFarmerAuth() {
    document.getElementById('farmerAuthModal').classList.remove('hidden');
}

function closeFarmerAuth() {
    document.getElementById('farmerAuthModal').classList.add('hidden');
}

function showBuyerAuth() {
    document.getElementById('buyerAuthModal').classList.remove('hidden');
}

function closeBuyerAuth() {
    document.getElementById('buyerAuthModal').classList.add('hidden');
}

function switchTab(role, tabType) {
    const loginTab = document.getElementById(role + 'LoginTab');
    const registerTab = document.getElementById(role + 'RegisterTab');
    const loginBtn = document.querySelector(`#${role}AuthModal .tab-btn:nth-child(1)`);
    const registerBtn = document.querySelector(`#${role}AuthModal .tab-btn:nth-child(2)`);

    if (tabType === 'login') {
        loginTab.classList.remove('hidden');
        registerTab.classList.add('hidden');
        loginBtn.classList.add('active');
        registerBtn.classList.remove('active');
    } else {
        loginTab.classList.add('hidden');
        registerTab.classList.remove('hidden');
        loginBtn.classList.remove('active');
        registerBtn.classList.add('active');
    }
}

// ============ FARMER AUTH ============

function farmerRegister() {
    const data = {
        fullName: document.getElementById('farmerName').value,
        email: document.getElementById('farmerEmail').value,
        password: document.getElementById('farmerPassword').value,
        phone: document.getElementById('farmerPhone').value,
        village: document.getElementById('farmerVillage').value,
        state: document.getElementById('farmerState').value,
        role: 'farmer'
    };

    if (!data.fullName || !data.email || !data.password) {
        alert('Please fill all required fields');
        return;
    }

    fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    .then(r => r.json())
    .then(res => {
        if (res.error) {
            alert('Registration failed: ' + res.error);
        } else {
            alert('Registration successful! Please login.');
            switchTab('farmer', 'login');
            document.getElementById('farmerRegisterTab').querySelectorAll('input').forEach(el => el.value = '');
        }
    })
    .catch(err => alert('Error: ' + err));
}

function farmerLogin() {
    const email = document.getElementById('farmerLoginEmail').value;
    const password = document.getElementById('farmerLoginPassword').value;

   fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
})
.then(r => r.json())
.then(res => {

    console.log("LOGIN RESPONSE:", res);

    if (res.error) {
            alert('Login failed: ' + res.error);
        } else {
            console.log("User data:", res.user);
            localStorage.setItem('userId', res.user._id);
            localStorage.setItem('userName', res.user.fullName);
            localStorage.setItem('userRole', 'farmer');
            localStorage.setItem('userEmail', res.user.email);
            localStorage.setItem('userVillage', res.user.village || '');
            localStorage.setItem('userState', res.user.state || '');
            document.getElementById('authSection').classList.add('hidden');
            document.getElementById('dashboardSection').classList.remove('hidden');
            document.getElementById('farmerDashboard').classList.remove('hidden');
            closeFarmerAuth();
            const farmerFrame = document.getElementById('farmerFrame');
            if (farmerFrame && farmerFrame.contentWindow) {
                farmerFrame.contentWindow.location.reload();
            }
        }
    })
    .catch(err => alert('Error: ' + err));
}

// ============ BUYER AUTH ============

function buyerRegister() {
    const data = {
        fullName: document.getElementById('buyerName').value,
        email: document.getElementById('buyerEmail').value,
        password: document.getElementById('buyerPassword').value,
        phone: document.getElementById('buyerPhone').value,
        village: document.getElementById('buyerVillage').value,
        state: document.getElementById('buyerState').value,
        role: 'buyer'
    };

    if (!data.fullName || !data.email || !data.password) {
        alert('Please fill all required fields');
        return;
    }

    fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    .then(r => r.json())
    .then(res => {
        if (res.error) {
            alert('Registration failed: ' + res.error);
        } else {
            alert('Registration successful! Please login.');
            switchTab('buyer', 'login');
            document.getElementById('buyerRegisterTab').querySelectorAll('input').forEach(el => el.value = '');
        }
    })
    .catch(err => alert('Error: ' + err));
}

function buyerLogin() {
    const email = document.getElementById('buyerLoginEmail').value;
    const password = document.getElementById('buyerLoginPassword').value;

    fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    })
    .then(r => r.json())
    .then(res => {
        if (res.error) {
            alert('Login failed: ' + res.error);
        } else {
            const buyerName = res.user.fullName || res.user.email || 'Buyer';
            localStorage.setItem('userId', res.user._id);
            localStorage.setItem('userName', buyerName);
            localStorage.setItem('userRole', 'buyer');
            localStorage.setItem('userEmail', res.user.email);
            localStorage.setItem('userVillage', res.user.village || '');
            localStorage.setItem('userState', res.user.state || '');
            document.getElementById('authSection').classList.add('hidden');
            document.getElementById('dashboardSection').classList.remove('hidden');
            document.getElementById('buyerDashboard').classList.remove('hidden');
            closeBuyerAuth();
            const buyerFrame = document.getElementById('buyerFrame');
            if (buyerFrame && buyerFrame.contentWindow) {
                buyerFrame.contentWindow.location.reload();
            }
        }
    })
    .catch(err => alert('Error: ' + err));
}

// ============ LOGOUT ============

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.clear();
        location.reload();
    }
}

// ============ INITIALIZE ============

document.addEventListener('DOMContentLoaded', () => {
    const userId = localStorage.getItem('userId');
    if (userId) {
        const role = localStorage.getItem('userRole');
        document.getElementById('authSection').classList.add('hidden');
        document.getElementById('dashboardSection').classList.remove('hidden');
        if (role === 'farmer') {
            document.getElementById('farmerDashboard').classList.remove('hidden');
        } else {
            document.getElementById('buyerDashboard').classList.remove('hidden');
        }
    }
});