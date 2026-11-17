const API_URL = 'http://127.0.0.1:8000';

function getAccessToken() {
    return localStorage.getItem('access_token');
}

function getRefreshToken() {
    return localStorage.getItem('refresh_token');
}

function getUsername() {
    return localStorage.getItem('username');
}

function isLoggedIn() {
    return !!getAccessToken();
}

function logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('username');
    window.location.href = 'login.html';
}

async function refreshAccessToken() {
    const refresh = getRefreshToken();
    if (!refresh) return false;

    try {
        const response = await fetch(`${API_URL}/api/accounts/token/refresh/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh })
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('access_token', data.access);
            return true;
        }
    } catch (e) {
        console.error('Помилка оновлення токена:', e);
    }
    return false;
}

async function authFetch(url, options = {}) {
    const headers = options.headers || {};
    const token = getAccessToken();
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    options.headers = headers;

    let response = await fetch(url, options);

    if (response.status === 401 && getRefreshToken()) {
        const refreshed = await refreshAccessToken();
        if (refreshed) {
            options.headers['Authorization'] = `Bearer ${getAccessToken()}`;
            response = await fetch(url, options);
        } else {
            logout();
        }
    }
    return response;
}

function renderNavbar() {
    const nav = document.getElementById('navbar');
    if (!nav) return;

    if (isLoggedIn()) {
        nav.innerHTML = `
            <a href="index.html">Каталог ігор</a>
            <a href="add-game.html">Додати гру</a>
            <span style="margin-left: auto;">Привіт, <b>${getUsername()}</b>!</span>
            <button onclick="logout()">Вийти</button>
        `;
    } else {
        nav.innerHTML = `
            <a href="index.html">Каталог ігор</a>
            <a href="add-game.html">Додати гру</a>
            <a href="login.html" style="margin-left: auto;">Логін</a>
            <a href="register.html">Реєстрація</a>
        `;
    }
}