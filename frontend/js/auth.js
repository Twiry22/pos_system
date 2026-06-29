// ============================================================
//  js/auth.js — Login Logic + Shared Helpers
// ============================================================

const API = 'http://localhost:3000/api';

// ── Token helpers ────────────────────────────────────────────
function getToken()  { return localStorage.getItem('kk_token'); }
function getUser()   { return JSON.parse(localStorage.getItem('kk_user') || 'null'); }
function setSession(token, user) {
    localStorage.setItem('kk_token', token);
    localStorage.setItem('kk_user', JSON.stringify(user));
}
function clearSession() {
    localStorage.removeItem('kk_token');
    localStorage.removeItem('kk_user');
}

// ── Central API fetch ────────────────────────────────────────
async function apiFetch(endpoint, options = {}) {
    const token = getToken();
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res  = await fetch(`${API}${endpoint}`, { headers, ...options });

    if (res.status === 403 || res.status === 401) {
        clearSession();
        window.location.replace('index.html');
        return { ok: false, data: {} };
    }

    const data = await res.json();
    return { ok: res.ok, status: res.status, data };
}

// ── Toast ────────────────────────────────────────────────────
function showToast(message, type = 'success', duration = 3500) {
    let container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    const icons  = { success: '✓', error: '✕', warning: '⚠' };
    const colors = { success: 'var(--success)', error: 'var(--danger)', warning: 'var(--warning)' };
    const toast  = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <span style="color:${colors[type]};font-weight:700;">${icons[type]}</span>
        <span style="flex:1;">${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 400); }, duration);
}

// ── Formatters ───────────────────────────────────────────────
function formatKES(amount) {
    return 'KES ' + parseFloat(amount || 0).toLocaleString('en-KE', {
        minimumFractionDigits: 2, maximumFractionDigits: 2
    });
}
function formatDate(d) {
    return new Date(d).toLocaleDateString('en-KE', { day:'2-digit', month:'short', year:'numeric' });
}
function formatDateTime(d) {
    return new Date(d).toLocaleString('en-KE', {
        day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit'
    });
}

// ── Auth guards ──────────────────────────────────────────────
function requireAuth() {
    const token = getToken();
    const user  = getUser();
    if (!token || !user) {
        window.location.replace('index.html');
        return null;
    }
    return user;
}

function requireAdmin() {
    const user = requireAuth();
    if (user && user.role !== 'admin') {
        showToast('Admin access required.', 'error');
        window.location.replace('dashboard.html');
        return null;
    }
    return user;
}

// ── Logout ────────────────────────────────────────────────────
function logout() {
    clearSession();
    window.location.replace('index.html');
}

// ── Sidebar helpers ───────────────────────────────────────────
function renderSidebarUser() {
    const user = getUser();
    if (!user) return;
    const nameEl   = document.getElementById('sidebarUserName');
    const roleEl   = document.getElementById('sidebarUserRole');
    const avatarEl = document.getElementById('sidebarAvatar');
    if (nameEl)   nameEl.textContent   = user.full_name;
    if (roleEl)   roleEl.textContent   = user.role;
    if (avatarEl) avatarEl.textContent = user.full_name.charAt(0).toUpperCase();
}

// ============================================================
//  LOGIN PAGE — only runs when the login form exists
// ============================================================
const loginForm = document.getElementById('loginForm');

if (loginForm) {
    // If already logged in, go straight to dashboard
    if (getToken() && getUser()) {
        window.location.replace('dashboard.html');
    }

    // Toggle password visibility
    const toggleBtn = document.getElementById('togglePwd');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            const pwd = document.getElementById('password');
            pwd.type  = pwd.type === 'password' ? 'text' : 'password';
        });
    }

    // Handle form submit
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        e.stopPropagation();

        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        const btn      = document.getElementById('loginBtn');
        const btnText  = document.getElementById('loginBtnText');
        const spinner  = document.getElementById('loginSpinner');
        const errBox   = document.getElementById('loginError');
        const errText  = document.getElementById('loginErrorText');

        if (!username || !password) {
            errText.textContent = 'Please enter username and password.';
            errBox.classList.remove('hidden');
            return;
        }

        // Loading state
        btn.disabled        = true;
        btnText.textContent = 'Signing in...';
        spinner.classList.remove('hidden');
        errBox.classList.add('hidden');

        try {
            const res = await fetch(`${API}/auth/login`, {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({ username, password })
            });

            const data = await res.json();

            if (res.ok && data.success) {
                // Save session
                localStorage.setItem('kk_token', data.token);
                localStorage.setItem('kk_user',  JSON.stringify(data.user));

                btnText.textContent = '✓ Welcome!';
                spinner.classList.add('hidden');

                // Hard redirect
                window.location.replace('dashboard.html');
            } else {
                errText.textContent = data.message || 'Invalid username or password.';
                errBox.classList.remove('hidden');
                btn.disabled        = false;
                btnText.textContent = 'Sign In';
                spinner.classList.add('hidden');
            }
        } catch (err) {
            errText.textContent = 'Cannot connect to server. Make sure it is running.';
            errBox.classList.remove('hidden');
            btn.disabled        = false;
            btnText.textContent = 'Sign In';
            spinner.classList.add('hidden');
        }
    });
}
