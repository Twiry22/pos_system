// ============================================================
//  js/dashboard.js — Dashboard Logic
// ============================================================

const currentUser = requireAuth();
if (currentUser) renderSidebarUser();

// ── Clock ─────────────────────────────────────────────────────
function updateClock() {
    const now  = new Date();
    const hour = now.getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

    // Fix 2: use full_name from the logged-in user
    const firstName = currentUser.full_name.split(' ')[0];
    document.getElementById('welcomeMsg').textContent = `${greeting}, ${firstName}!`;

    // Elegant date: "03 June 2026" on top, "Wednesday" below
    const day     = String(now.getDate()).padStart(2, '0');
    const month   = now.toLocaleDateString('en-KE', { month: 'long' });
    const year    = now.getFullYear();
    const weekday = now.toLocaleDateString('en-KE', { weekday: 'long' });
    document.getElementById('dateDay').textContent  = `${day} ${month} ${year}`;
    document.getElementById('dateFull').textContent = weekday.toUpperCase();
    document.getElementById('topbarTime').textContent = now.toLocaleTimeString('en-KE', {
        hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
}
updateClock();
setInterval(updateClock, 1000);

// ── Dummy Data ────────────────────────────────────────────────
const DUMMY_STATS = {
    today:      { revenue: 12450.00, transactions: 8 },
    this_week:  { revenue: 67800.00 },
    this_month: { revenue: 234500.00 },
    low_stock:  2
};

const DUMMY_SALES = [
    { receipt_number: 'RCP-20240601-0001', cashier: 'Admin', total_amount: 1850.00, created_at: new Date() },
    { receipt_number: 'RCP-20240601-0002', cashier: 'Admin', total_amount: 3200.00, created_at: new Date(Date.now() - 3600000) },
    { receipt_number: 'RCP-20240601-0003', cashier: 'Admin', total_amount:  750.00, created_at: new Date(Date.now() - 7200000) },
    { receipt_number: 'RCP-20240601-0004', cashier: 'Admin', total_amount: 4900.00, created_at: new Date(Date.now() - 10800000) },
    { receipt_number: 'RCP-20240601-0005', cashier: 'Admin', total_amount: 1750.00, created_at: new Date(Date.now() - 14400000) },
];

const DUMMY_ALERTS = [
    { product_name: 'Mineral Water (500ml)', category: 'Soda & Water',     category_icon: '', stock: 0 },
    { product_name: 'Caramel Popcorn',       category: 'Flavored Popcorn', category_icon: '', stock: 3 },
    { product_name: 'Ballpoint Pen (blue)',  category: 'Stationery',       category_icon: '', stock: 4 },
];

const DUMMY_CATEGORIES = [
    { category: 'Lady Shoes',       revenue: 45000 },
    { category: 'Bags',             revenue: 38500 },
    { category: 'Deco Stuff',       revenue: 27000 },
    { category: 'Stationery',       revenue: 21000 },
    { category: 'Soda & Water',     revenue: 18500 },
    { category: 'Flavored Popcorn', revenue: 14000 },
    { category: 'Candy Shop',       revenue:  9800 },
];

// ── Load Dashboard ────────────────────────────────────────────
async function loadDashboard() {
    try {
        const { ok, data } = await apiFetch('/reports/dashboard');
        const hasReal = ok && data.today.transactions > 0;
        renderStats(hasReal ? data : DUMMY_STATS, !hasReal);
        renderRecentSales(hasReal ? data.recent_sales : DUMMY_SALES, !hasReal);
        updateStockBadge(hasReal ? data.low_stock : DUMMY_STATS.low_stock);
    } catch {
        renderStats(DUMMY_STATS, true);
        renderRecentSales(DUMMY_SALES, true);
    }
    loadStockAlerts();
    loadCategoryPerformance();
}

// ── Stat Cards (Fix 1: no emojis, Fix 3: Calibri on numbers) ──
function renderStats(data, isDummy = false) {
    const tag = isDummy
        ? `<span style="font-size:0.62rem;color:var(--gold-dim);letter-spacing:0.06em;"> · SAMPLE</span>`
        : '';

    document.getElementById('statsGrid').innerHTML = `
        <div class="stat-card">
            <div class="stat-label">Today's Sales${tag}</div>
            <div class="stat-value" style="font-family:'Calibri','Candara','Segoe UI',sans-serif;">
                ${formatKES(data.today.revenue)}
            </div>
            <div class="stat-sub">${data.today.transactions} transactions today</div>
        </div>
        <div class="stat-card">
            <div class="stat-label">This Week${tag}</div>
            <div class="stat-value" style="font-family:'Calibri','Candara','Segoe UI',sans-serif;">
                ${formatKES(data.this_week.revenue)}
            </div>
            <div class="stat-sub">Weekly revenue</div>
        </div>
        <div class="stat-card">
            <div class="stat-label">This Month${tag}</div>
            <div class="stat-value" style="font-family:'Calibri','Candara','Segoe UI',sans-serif;">
                ${formatKES(data.this_month.revenue)}
            </div>
            <div class="stat-sub">Monthly revenue</div>
        </div>
        <div class="stat-card" style="${data.low_stock > 0 ? 'border-color:rgba(224,92,92,0.3);' : ''}">
            <div class="stat-label">Stock Alerts</div>
            <div class="stat-value ${data.low_stock > 0 ? 'text-danger' : 'text-success'}"
                 style="font-family:'Calibri','Candara','Segoe UI',sans-serif;">
                ${data.low_stock}
            </div>
            <div class="stat-sub">${data.low_stock > 0 ? 'Products need restocking' : 'All stocked up'}</div>
        </div>`;
}

// ── Recent Sales (Fix 1: no emojis) ──────────────────────────
function renderRecentSales(sales, isDummy = false) {
    const wrap = document.getElementById('recentSalesWrap');
    if (!sales || sales.length === 0) {
        wrap.innerHTML = `
            <div class="empty-state">
                <p>No sales yet today.<br>
                <a href="pos.html" class="text-gold">Make your first sale</a></p>
            </div>`;
        return;
    }

    const note = isDummy ? `
        <tr><td colspan="4" style="text-align:center;font-size:0.72rem;
        color:var(--gold-dim);padding:10px;border:none;">
        Sample data — real sales will appear here automatically</td></tr>` : '';

    wrap.innerHTML = `
        <table>
            <thead><tr><th>Receipt</th><th>Cashier</th><th>Amount</th><th>Time</th></tr></thead>
            <tbody>
                ${sales.map(s => `
                    <tr>
                        <td><span class="text-gold fw-500">${s.receipt_number}</span></td>
                        <td>${s.cashier || '—'}</td>
                        <td style="font-family:'Calibri','Candara','Segoe UI',sans-serif;font-weight:600;">
                            ${formatKES(s.total_amount)}
                        </td>
                        <td class="text-muted">${formatDateTime(s.created_at)}</td>
                    </tr>`).join('')}
                ${note}
            </tbody>
        </table>`;
}

// ── Stock Badge ───────────────────────────────────────────────
function updateStockBadge(count) {
    const badge = document.getElementById('stockAlertBadge');
    if (count > 0) { badge.textContent = count; badge.classList.remove('hidden'); }
}

// ── Stock Alerts (Fix 1: no emojis) ──────────────────────────
async function loadStockAlerts() {
    const el = document.getElementById('stockAlertsList');
    let alerts  = DUMMY_ALERTS;
    let isDummy = true;

    try {
        const { ok, data } = await apiFetch('/inventory/alerts');
        if (ok && data.alerts.length > 0) { alerts = data.alerts; isDummy = false; }
    } catch {}

    if (alerts.length === 0) {
        el.innerHTML = `
            <div class="empty-state" style="padding:24px;">
                <p>All products are well stocked!</p>
            </div>`;
        return;
    }

    el.innerHTML = alerts.slice(0, 6).map(item => `
        <div class="stock-alert-item">
            <div>
                <div class="stock-product-name">${item.product_name}</div>
                <div class="stock-category">${item.category}</div>
            </div>
            <div>
                <div class="stock-qty ${item.stock === 0 ? 'out' : 'low'}"
                     style="font-family:'Calibri','Candara','Segoe UI',sans-serif;">
                    ${item.stock === 0 ? 'OUT' : item.stock}
                </div>
                <div class="text-muted text-sm text-right">
                    ${item.stock === 0 ? 'Out of stock' : 'units left'}
                </div>
            </div>
        </div>`).join('');

    if (isDummy) {
        el.innerHTML += `<p style="font-size:0.7rem;color:var(--gold-dim);text-align:center;padding:8px 0;">
            Sample alerts — restock via Inventory</p>`;
    }
}

// ── Category Bars ─────────────────────────────────────────────
async function loadCategoryPerformance() {
    const el = document.getElementById('categoryBars');
    let cats    = DUMMY_CATEGORIES;
    let isDummy = true;

    try {
        const { ok, data } = await apiFetch('/reports/monthly');
        if (ok && data.by_category && data.by_category.length > 0) {
            cats = data.by_category; isDummy = false;
        }
    } catch {}

    const max = Math.max(...cats.map(c => parseFloat(c.revenue)));

    el.innerHTML = cats.map(cat => {
        const pct = max > 0 ? (parseFloat(cat.revenue) / max * 100).toFixed(1) : 0;
        return `
            <div class="category-bar-wrap">
                <div class="category-bar-label">
                    <span>${cat.category}</span>
                    <span style="font-family:'Calibri','Candara','Segoe UI',sans-serif;">
                        ${formatKES(cat.revenue)}
                    </span>
                </div>
                <div class="category-bar-track">
                    <div class="category-bar-fill" style="width:0%" data-width="${pct}%"></div>
                </div>
            </div>`;
    }).join('');

    if (isDummy) {
        el.innerHTML += `<p style="font-size:0.7rem;color:var(--gold-dim);text-align:center;padding:8px 0;">
            Sample data — updates as you make sales</p>`;
    }

    requestAnimationFrame(() => {
        document.querySelectorAll('.category-bar-fill').forEach(b => b.style.width = b.dataset.width);
    });
}

// ── Init ──────────────────────────────────────────────────────
loadDashboard();
