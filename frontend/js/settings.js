// ============================================================
//  js/settings.js
// ============================================================

const currentUser = requireAuth();
if (currentUser) renderSidebarUser();

// Hide user management for non-admins
if (currentUser && currentUser.role !== 'admin') {
    document.addEventListener('DOMContentLoaded', function() {
        var el = document.getElementById('usersNavItem');
        if (el) el.style.display = 'none';
    });
} else if (currentUser && currentUser.role === 'admin') {
    document.addEventListener('DOMContentLoaded', loadUsers);
}

// Populate profile from localStorage on load
document.addEventListener('DOMContentLoaded', function() {
    if (!currentUser) return;
    document.getElementById('profileName').value     = currentUser.full_name || '';
    document.getElementById('profileUsername').value = currentUser.username  || '';
    document.getElementById('profileEmail').value    = currentUser.email     || '';
    document.getElementById('profileRole').value     = currentUser.role      || '';
});

// ── Panel switching ───────────────────────────────────────────
function showPanel(name, el) {
    document.querySelectorAll('.settings-panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.settings-nav-item').forEach(n => n.classList.remove('active'));
    document.getElementById('panel-' + name).classList.add('active');
    el.classList.add('active');
}

// ── Save Profile — uses /auth/me (self-update, no adminOnly) ──
async function saveProfile() {
    const full_name = document.getElementById('profileName').value.trim();
    const email     = document.getElementById('profileEmail').value.trim();
    if (!full_name) { showToast('Name is required.', 'error'); return; }

    const { ok, data } = await apiFetch('/auth/me', {
        method: 'PUT',
        body: JSON.stringify({ full_name, email })
    });

    if (ok) {
        const stored     = JSON.parse(localStorage.getItem('kk_user') || '{}');
        stored.full_name = full_name;
        stored.email     = email;
        localStorage.setItem('kk_user', JSON.stringify(stored));
        document.getElementById('sidebarUserName').textContent = full_name;
        showToast('Profile updated.', 'success');
    } else {
        showToast(data.message || 'Failed to update.', 'error');
    }
}

// ── Change Password ───────────────────────────────────────────
async function changePassword() {
    const current = document.getElementById('currentPwd').value;
    const newPwd  = document.getElementById('newPwd').value;
    const confirm = document.getElementById('confirmPwd').value;

    if (!current || !newPwd)  { showToast('All fields are required.', 'error'); return; }
    if (newPwd.length < 6)    { showToast('Min 6 characters.', 'error'); return; }
    if (newPwd !== confirm)   { showToast('Passwords do not match.', 'error'); return; }

    const { ok, data } = await apiFetch('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ current_password: current, new_password: newPwd })
    });

    if (ok) {
        showToast('Password changed. Logging out...', 'success');
        setTimeout(() => logout(), 2000);
    } else {
        showToast(data.message || 'Incorrect current password.', 'error');
    }
}

// ── Users (admin only) ────────────────────────────────────────
async function loadUsers() {
    const el = document.getElementById('usersList');
    if (!el) return;
    el.innerHTML = '<div class="text-center" style="padding:20px;"><div class="spinner"></div></div>';

    const { ok, data } = await apiFetch('/auth/users');
    if (!ok) {
        el.innerHTML = '<p class="text-muted text-sm" style="padding:8px 0;">Could not load users.</p>';
        return;
    }

    el.innerHTML = data.users.map(u => `
        <div class="user-card">
            <div class="user-card-info">
                <div class="user-avatar" style="width:36px;height:36px;font-size:0.85rem;
                     display:flex;align-items:center;justify-content:center;
                     background:var(--gold-glow);border-radius:50%;flex-shrink:0;">
                    ${u.full_name.charAt(0).toUpperCase()}
                </div>
                <div>
                    <div class="user-card-name">${u.full_name}</div>
                    <div class="user-card-role">
                        @${u.username} &nbsp;·&nbsp;
                        <span class="badge ${u.role === 'admin' ? 'badge-gold' : 'badge-info'}"
                              style="font-size:0.65rem;">${u.role}</span>
                        &nbsp;·&nbsp;
                        <span class="badge ${u.is_active ? 'badge-success' : 'badge-danger'}"
                              style="font-size:0.65rem;">${u.is_active ? 'Active' : 'Inactive'}</span>
                    </div>
                </div>
            </div>
            <div style="display:flex;gap:8px;align-items:center;">
                ${u.id !== currentUser.id
                    ? `<button class="btn btn-${u.is_active ? 'danger' : 'success'} btn-sm"
                               onclick="toggleUser(${u.id}, ${u.is_active ? 1 : 0})">
                           ${u.is_active ? 'Deactivate' : 'Activate'}
                       </button>`
                    : '<span class="text-muted text-sm">You</span>'}
            </div>
        </div>`).join('');
}

async function addUser() {
    const full_name = document.getElementById('newUserName').value.trim();
    const username  = document.getElementById('newUserUsername').value.trim();
    const password  = document.getElementById('newUserPwd').value;
    const role      = document.getElementById('newUserRole').value;
    const email     = document.getElementById('newUserEmail').value.trim();

    if (!full_name || !username || !password) {
        showToast('Name, username and password required.', 'error'); return;
    }
    if (password.length < 6) {
        showToast('Password must be at least 6 characters.', 'error'); return;
    }

    const { ok, data } = await apiFetch('/auth/users', {
        method: 'POST',
        body: JSON.stringify({ full_name, username, password, role, email })
    });

    if (ok) {
        showToast(full_name + ' created.', 'success');
        document.getElementById('newUserName').value     = '';
        document.getElementById('newUserUsername').value = '';
        document.getElementById('newUserPwd').value      = '';
        document.getElementById('newUserEmail').value    = '';
        loadUsers();
    } else {
        showToast(data.message || 'Failed to create user.', 'error');
    }
}

async function toggleUser(id, isActive) {
    const action = isActive ? 'deactivate' : 'activate';
    if (!confirm('Are you sure you want to ' + action + ' this user?')) return;

    const { ok, data } = await apiFetch('/auth/users/' + id, {
        method: 'PUT',
        body: JSON.stringify({ is_active: !isActive })
    });

    if (ok) {
        showToast('User ' + action + 'd.', 'success');
        loadUsers();
    } else {
        showToast(data.message || 'Failed.', 'error');
    }
}
