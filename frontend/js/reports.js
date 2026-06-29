// ============================================================
//  js/reports.js — Reports Logic
// ============================================================

const currentUser = requireAuth();
if (currentUser) renderSidebarUser();

let currentType = 'daily';
let currentData = null;

// ── Dummy Data ────────────────────────────────────────────────
const DUMMY_REPORT = {
    period: { from: '2024-06-01', to: '2024-06-07' },
    summary: {
        total_transactions: 24,
        total_revenue:      58450.00,
        total_profit:       22300.00,
        items_sold:         87,
        avg_transaction:    2435.42
    },
    by_category: [
        { category: 'Lady Shoes',       revenue: 18000, profit: 7200, items_sold: 12 },
        { category: 'Bags',             revenue: 12500, profit: 4800, items_sold: 16 },
        { category: 'Deco Stuff',       revenue: 9600,  profit: 3800, items_sold: 22 },
        { category: 'Stationery',       revenue: 7200,  profit: 2900, items_sold: 95 },
        { category: 'Soda & Water',     revenue: 5400,  profit: 2100, items_sold: 68 },
        { category: 'Flavored Popcorn', revenue: 3800,  profit: 1200, items_sold: 54 },
        { category: 'Candy Shop',       revenue: 1950,  profit:  300, items_sold: 39 },
    ],
    top_products: [
        { product_name: 'Block Heel Pump',       category_name: 'Lady Shoes',       qty_sold: 6,  revenue: 9000,  profit: 3600 },
        { product_name: 'Backpack (Ladies)',      category_name: 'Bags',             qty_sold: 5,  revenue: 7500,  profit: 3500 },
        { product_name: 'Ankle Boot',             category_name: 'Lady Shoes',       qty_sold: 4,  revenue: 8800,  profit: 4000 },
        { product_name: 'Wall Clock',             category_name: 'Deco Stuff',       qty_sold: 5,  revenue: 4000,  profit: 2000 },
        { product_name: 'Printing Paper (ream)',  category_name: 'Stationery',       qty_sold: 8,  revenue: 4000,  profit: 1200 },
        { product_name: 'Mineral Water (1L)',     category_name: 'Soda & Water',     qty_sold: 30, revenue: 2400,  profit:  900 },
        { product_name: 'Tote Bag',               category_name: 'Bags',             qty_sold: 4,  revenue: 3000,  profit: 1400 },
        { product_name: 'Scented Candle',         category_name: 'Deco Stuff',       qty_sold: 8,  revenue: 2400,  profit: 1200 },
        { product_name: 'Mixed Flavor Box',       category_name: 'Flavored Popcorn', qty_sold: 8,  revenue: 2000,  profit:  640 },
        { product_name: 'Chocolate Bar',          category_name: 'Candy Shop',       qty_sold: 15, revenue:  750,  profit:  375 },
    ],
    daily: [
        { date: '2024-06-01', transactions: 4,  revenue: 8200,  profit: 3100 },
        { date: '2024-06-02', transactions: 3,  revenue: 6100,  profit: 2400 },
        { date: '2024-06-03', transactions: 5,  revenue: 12400, profit: 4800 },
        { date: '2024-06-04', transactions: 2,  revenue: 4300,  profit: 1600 },
        { date: '2024-06-05', transactions: 6,  revenue: 14200, profit: 5500 },
        { date: '2024-06-06', transactions: 3,  revenue: 8250,  profit: 3200 },
        { date: '2024-06-07', transactions: 1,  revenue: 5000,  profit: 1700 },
    ],
    payments: [
        { payment_method: 'cash',  count: 16, total: 38450 },
        { payment_method: 'mpesa', count:  6, total: 15000 },
        { payment_method: 'card',  count:  2, total:  5000 },
    ]
};

// Build context-aware dummy insights per period type
function buildDummyInsights(type) {
    if (type === 'monthly') {
        return {
            busyDays: [
                { day_name: 'Week 1', transactions: 18, revenue: 42000, profit: 16000 },
                { day_name: 'Week 2', transactions: 24, revenue: 58450, profit: 22300 },
                { day_name: 'Week 3', transactions: 20, revenue: 49000, profit: 18500 },
                { day_name: 'Week 4', transactions: 15, revenue: 36000, profit: 13800 },
            ],
            busyHours: DUMMY_INSIGHTS.busyHours,
            fastSellers: DUMMY_INSIGHTS.fastSellers
        };
    }
    if (type === 'annual') {
        return {
            busyDays: [
                { day_name: 'June',     transactions: 98,  revenue: 234500, profit: 89000 },
                { day_name: 'December', transactions: 85,  revenue: 198000, profit: 75000 },
                { day_name: 'March',    transactions: 72,  revenue: 168000, profit: 64000 },
                { day_name: 'October',  transactions: 65,  revenue: 152000, profit: 58000 },
                { day_name: 'August',   transactions: 60,  revenue: 140000, profit: 53000 },
                { day_name: 'January',  transactions: 55,  revenue: 128000, profit: 48000 },
                { day_name: 'April',    transactions: 50,  revenue: 116000, profit: 44000 },
                { day_name: 'July',     transactions: 48,  revenue: 112000, profit: 42000 },
                { day_name: 'February', transactions: 42,  revenue: 98000,  profit: 37000 },
                { day_name: 'May',      transactions: 38,  revenue: 88000,  profit: 33000 },
                { day_name: 'September',transactions: 35,  revenue: 82000,  profit: 31000 },
                { day_name: 'November', transactions: 30,  revenue: 70000,  profit: 26000 },
            ],
            busyHours: DUMMY_INSIGHTS.busyHours,
            fastSellers: DUMMY_INSIGHTS.fastSellers
        };
    }
    return DUMMY_INSIGHTS;
}

// Unified insights renderer for weekly, monthly, annual
function renderPeriodInsights(data, type, isDummy) {
    const labels = {
        weekly:  { days: 'Busiest Days',   daysNote: 'by day of week' },
        monthly: { days: 'Busiest Weeks',  daysNote: 'by week of month' },
        annual:  { days: 'Busiest Months', daysNote: 'by month' },
    };
    const titles = {
        weekly:  { title: 'Weekly Insights',  sub: 'Busiest days, hours & top sellers' },
        monthly: { title: 'Monthly Insights', sub: 'Busiest weeks, hours & top sellers' },
        annual:  { title: 'Annual Insights',  sub: 'Busiest months, hours & top sellers' },
    };
    const l = labels[type] || labels.weekly;
    const t = titles[type] || titles.weekly;

    const titleEl = document.getElementById('insightsPanelTitle');
    const subEl   = document.getElementById('insightsPanelSub');
    if (titleEl) titleEl.textContent = t.title;
    if (subEl)   subEl.textContent   = t.sub;

    renderWeeklyInsights(data, isDummy, l);
}

const DUMMY_INSIGHTS = {
    busyDays: [
        { day_name: 'Friday',    transactions: 6, revenue: 14200, profit: 5500 },
        { day_name: 'Wednesday', transactions: 5, revenue: 12400, profit: 4800 },
        { day_name: 'Saturday',  transactions: 4, revenue: 8200,  profit: 3100 },
        { day_name: 'Monday',    transactions: 3, revenue: 6100,  profit: 2400 },
        { day_name: 'Sunday',    transactions: 3, revenue: 8250,  profit: 3200 },
        { day_name: 'Tuesday',   transactions: 2, revenue: 4300,  profit: 1600 },
        { day_name: 'Thursday',  transactions: 1, revenue: 5000,  profit: 1700 },
    ],
    busyHours: [
        { hour: 12, transactions: 8,  revenue: 18200 },
        { hour: 14, transactions: 6,  revenue: 14400 },
        { hour: 10, transactions: 5,  revenue: 11000 },
        { hour: 16, transactions: 4,  revenue: 9200  },
        { hour: 9,  transactions: 3,  revenue: 6500  },
    ],
    fastSellers: [
        { product_name: 'Mineral Water (1L)',    category_name: 'Soda & Water',     qty_sold: 30, revenue: 2400, profit: 900  },
        { product_name: 'Chocolate Bar',         category_name: 'Candy Shop',       qty_sold: 15, revenue:  750, profit: 375  },
        { product_name: 'Printing Paper (ream)', category_name: 'Stationery',       qty_sold:  8, revenue: 4000, profit: 1200 },
    ]
};

const DUMMY_TRANSACTIONS = [
    { receipt_number: 'RCP-20240601-0001', cashier_name: 'Admin', total_amount: 4500, line_items: 3, payment_method: 'cash',  created_at: new Date() },
    { receipt_number: 'RCP-20240601-0002', cashier_name: 'Admin', total_amount: 9200, line_items: 2, payment_method: 'mpesa', created_at: new Date(Date.now()-3600000) },
    { receipt_number: 'RCP-20240601-0003', cashier_name: 'Admin', total_amount: 1850, line_items: 5, payment_method: 'cash',  created_at: new Date(Date.now()-7200000) },
    { receipt_number: 'RCP-20240601-0004', cashier_name: 'Admin', total_amount: 3200, line_items: 1, payment_method: 'cash',  created_at: new Date(Date.now()-10800000) },
    { receipt_number: 'RCP-20240601-0005', cashier_name: 'Admin', total_amount: 6750, line_items: 4, payment_method: 'card',  created_at: new Date(Date.now()-14400000) },
];

// ── Tab switching ─────────────────────────────────────────────
function switchTab(type, el) {
    currentType = type;
    document.querySelectorAll('.report-tab').forEach(t => t.classList.remove('active'));
    el.classList.add('active');

    const weeklyInsights = document.getElementById('weeklyInsights');
    const customRange    = document.getElementById('customRange');

    customRange.classList.add('hidden');
    weeklyInsights.classList.add('hidden');

    if (type === 'custom') { customRange.classList.remove('hidden'); return; }
    if (['weekly','monthly','annual'].includes(type)) weeklyInsights.classList.remove('hidden');

    loadReport(type);
}

function loadCustomReport() {
    const from = document.getElementById('customFrom').value;
    const to   = document.getElementById('customTo').value;
    if (!from || !to)  { showToast('Please select both dates.', 'error'); return; }
    if (from > to)     { showToast('Start date must be before end date.', 'error'); return; }
    loadReport('custom', { from, to });
}

// ── Load Report ───────────────────────────────────────────────
async function loadReport(type, params = {}) {
    showSkeletons();

    try {
        const range    = getDateRange(type, params);
        let endpoint   = `/reports/${type}`;
        if (type === 'custom') endpoint += `?from=${params.from}&to=${params.to}`;

        const promises = [
            apiFetch(endpoint),
            apiFetch(`/sales?from=${range.from}&to=${range.to}&limit=100`)
        ];
        const needsInsights = ['weekly','monthly','annual'].includes(type);
        if (needsInsights) promises.push(apiFetch(`/reports/weekly-insights?from=${range.from}&to=${range.to}`));

        const results    = await Promise.all(promises);
        const reportRes  = results[0];
        const salesRes   = results[1];
        const insightRes = results[2];

        const hasReal  = reportRes.ok && reportRes.data.summary.total_transactions > 0;
        currentData    = hasReal ? reportRes.data : DUMMY_REPORT;
        const sales    = (salesRes.ok && salesRes.data.sales.length > 0) ? salesRes.data.sales : DUMMY_TRANSACTIONS;
        const insights = (insightRes?.ok && insightRes.data.busyDays?.length > 0) ? insightRes.data : buildDummyInsights(type);

        renderReport(currentData, type, params, !hasReal);
        renderTransactions(sales, !hasReal);
        if (needsInsights) {
            window._weeklyInsights = insights;
            renderPeriodInsights(insights, type, !hasReal);
        }

    } catch (err) {
        currentData = DUMMY_REPORT;
        renderReport(DUMMY_REPORT, type, params, true);
        renderTransactions(DUMMY_TRANSACTIONS, true);
        if (['weekly','monthly','annual'].includes(type)) {
            const di = buildDummyInsights(type);
            window._weeklyInsights = di;
            renderPeriodInsights(di, type, true);
        }
    }
}

function showSkeletons() {
    document.getElementById('summaryRow').innerHTML = `
        <div class="stat-card skeleton" style="height:110px;"></div>
        <div class="stat-card skeleton" style="height:110px;"></div>
        <div class="stat-card skeleton" style="height:110px;"></div>
        <div class="stat-card skeleton" style="height:110px;"></div>`;
}

// ── Date range helper ─────────────────────────────────────────
function getDateRange(type, params = {}) {
    const now   = new Date();
    const today = now.toISOString().slice(0,10);
    if (type === 'daily')   return { from: today, to: today };
    if (type === 'custom')  return params;
    if (type === 'weekly') {
        const day = now.getDay() || 7;
        const mon = new Date(now); mon.setDate(now.getDate() - day + 1);
        const sun = new Date(mon); sun.setDate(mon.getDate() + 6);
        return { from: mon.toISOString().slice(0,10), to: sun.toISOString().slice(0,10) };
    }
    if (type === 'monthly') {
        const from = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-01`;
        const to   = new Date(now.getFullYear(), now.getMonth()+1, 0).toISOString().slice(0,10);
        return { from, to };
    }
    if (type === 'annual') return { from:`${now.getFullYear()}-01-01`, to:`${now.getFullYear()}-12-31` };
    return { from: today, to: today };
}

// ── Render Report ─────────────────────────────────────────────
function renderReport(data, type, params, isDummy) {
    const range = data.period || getDateRange(type, params);
    const s     = data.summary;
    const titles = { daily:"Today's Report", weekly:"This Week's Report", monthly:"This Month's Report", annual:"Annual Report", custom:"Custom Report" };

    document.getElementById('reportTitle').textContent  = titles[type] || 'Report';
    document.getElementById('reportPeriod').textContent =
        range.from === range.to ? formatDate(range.from) : `${formatDate(range.from)} — ${formatDate(range.to)}`;

    const tag = isDummy ? ' · SAMPLE' : '';

    // Profit margin
    const margin = s.total_revenue > 0 ? ((s.total_profit / s.total_revenue)*100).toFixed(1) : 0;

    document.getElementById('summaryRow').innerHTML = `
        <div class="stat-card">
            <div class="stat-label">Total Revenue${tag}</div>
            <div class="stat-value" style="font-family:'Calibri','Candara','Segoe UI',sans-serif;">
                ${formatKES(s.total_revenue)}
            </div>
            <div class="stat-sub">Total money received from customers</div>
        </div>
        <div class="stat-card">
            <div class="stat-label">Total Profit${tag}</div>
            <div class="stat-value" style="font-family:'Calibri','Candara','Segoe UI',sans-serif;color:var(--fuchsia);">
                ${formatKES(s.total_profit)}
            </div>
            <div class="stat-sub">${margin}% profit margin</div>
        </div>
        <div class="stat-card">
            <div class="stat-label">Items Sold${tag}</div>
            <div class="stat-value" style="font-family:'Calibri','Candara','Segoe UI',sans-serif;">
                ${s.items_sold}
            </div>
            <div class="stat-sub">Units across all categories</div>
        </div>
        <div class="stat-card">
            <div class="stat-label">Transactions${tag}</div>
            <div class="stat-value" style="font-family:'Calibri','Candara','Segoe UI',sans-serif;">
                ${s.total_transactions}
            </div>
            <div class="stat-sub">Avg ${formatKES(s.avg_transaction)} per sale</div>
        </div>`;

    renderBarChart(data, type);
    renderCategoryPerf(data.by_category, isDummy);
    renderPayments(data.payments, isDummy);
    renderTopProducts(data.top_products, isDummy);
}

// ── Weekly Insights ───────────────────────────────────────────
function renderWeeklyInsights(data, isDummy, labels = { days: 'Busiest Days', daysNote: 'by day of week' }) {
    const el = document.getElementById('weeklyInsightsContent');

    const formatHour = h => {
        const hour = parseInt(h);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const h12  = hour % 12 || 12;
        return `${h12}:00 ${ampm}`;
    };

    const medal = ['1st', '2nd', '3rd'];

    el.innerHTML = `
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:20px;">

            <!-- Busiest Days -->
            <div>
                <div style="font-size:0.72rem;letter-spacing:0.15em;text-transform:uppercase;
                            color:var(--gold);margin-bottom:14px;font-weight:600;">
                    ${labels.days}
                </div>
                ${data.busyDays.slice(0,7).map((d, i) => {
                    const maxTx  = data.busyDays[0].transactions;
                    const pct    = ((d.transactions / maxTx) * 100).toFixed(0);
                    return `
                        <div style="margin-bottom:12px;">
                            <div style="display:flex;justify-content:space-between;
                                        font-size:0.8rem;margin-bottom:4px;">
                                <span style="color:${i===0?'var(--gold)':'var(--text-secondary)'};">
                                    ${d.day_name}
                                </span>
                                <span style="font-family:'Calibri','Candara','Segoe UI',sans-serif;
                                             color:var(--text-muted);">
                                    ${d.transactions} sales
                                </span>
                            </div>
                            <div style="height:4px;background:rgba(255,255,255,0.06);border-radius:2px;overflow:hidden;">
                                <div style="height:100%;width:${pct}%;
                                            background:${i===0?'linear-gradient(to right,var(--fuchsia),var(--gold))':'rgba(64,224,208,0.2)'};
                                            border-radius:2px;"></div>
                            </div>
                        </div>`;
                }).join('')}
            </div>

            <!-- Busiest Hours -->
            <div>
                <div style="font-size:0.72rem;letter-spacing:0.15em;text-transform:uppercase;
                            color:var(--gold);margin-bottom:14px;font-weight:600;">
                    Busiest Hours
                </div>
                ${data.busyHours.slice(0,5).map((h, i) => {
                    const maxTx = data.busyHours[0].transactions;
                    const pct   = ((h.transactions / maxTx) * 100).toFixed(0);
                    return `
                        <div style="margin-bottom:12px;">
                            <div style="display:flex;justify-content:space-between;
                                        font-size:0.8rem;margin-bottom:4px;">
                                <span style="color:${i===0?'var(--gold)':'var(--text-secondary)'};">
                                    ${formatHour(h.hour)}
                                </span>
                                <span style="font-family:'Calibri','Candara','Segoe UI',sans-serif;
                                             color:var(--text-muted);">
                                    ${h.transactions} sales
                                </span>
                            </div>
                            <div style="height:4px;background:rgba(255,255,255,0.06);border-radius:2px;overflow:hidden;">
                                <div style="height:100%;width:${pct}%;
                                            background:${i===0?'linear-gradient(to right,var(--fuchsia),var(--gold))':'rgba(64,224,208,0.2)'};
                                            border-radius:2px;"></div>
                            </div>
                        </div>`;
                }).join('')}
            </div>

            <!-- Top 3 Fastest Selling -->
            <div>
                <div style="font-size:0.72rem;letter-spacing:0.15em;text-transform:uppercase;
                            color:var(--gold);margin-bottom:14px;font-weight:600;">
                    Fastest Selling
                </div>
                ${data.fastSellers.map((p, i) => `
                    <div style="background:var(--bg-secondary);border:1px solid var(--border);
                                border-radius:var(--radius-sm);padding:12px;margin-bottom:10px;">
                        <div style="display:flex;align-items:center;justify-content:space-between;
                                    margin-bottom:4px;">
                            <span style="font-size:0.7rem;font-weight:700;color:var(--gold);
                                         letter-spacing:0.08em;">${medal[i]}</span>
                            <span style="font-family:'Calibri','Candara','Segoe UI',sans-serif;
                                         font-size:0.85rem;font-weight:700;color:var(--text-primary);">
                                ${p.qty_sold} sold
                            </span>
                        </div>
                        <div style="font-size:0.83rem;font-weight:500;color:var(--text-primary);
                                    margin-bottom:2px;">${p.product_name}</div>
                        <div style="font-size:0.72rem;color:var(--text-muted);">${p.category_name}</div>
                        <div style="display:flex;justify-content:space-between;margin-top:6px;">
                            <span style="font-size:0.72rem;color:var(--text-muted);">
                                Revenue: <span style="font-family:'Calibri','Candara','Segoe UI',sans-serif;
                                color:var(--text-secondary);">${formatKES(p.revenue)}</span>
                            </span>
                            <span style="font-size:0.72rem;color:var(--text-muted);">
                                Profit: <span style="font-family:'Calibri','Candara','Segoe UI',sans-serif;
                                color:var(--fuchsia);">${formatKES(p.profit)}</span>
                            </span>
                        </div>
                    </div>`).join('')}
            </div>

        </div>
        ${isDummy ? `<p style="font-size:0.7rem;color:var(--gold-dim);text-align:center;padding:8px 0 0;">
            Sample data — updates as you make sales</p>` : ''}`;
}

// ── Bar Chart ─────────────────────────────────────────────────
function renderBarChart(data, type) {
    const chart = document.getElementById('barChart');
    let points  = [];

    if (type === 'daily') {
        // X-axis: Hours (0-23) grouped by hour
        const hourMap = {};
        (data.daily || []).forEach(d => {
            const h = new Date(d.date).getHours ? new Date(d.date).getHours() : 0;
            hourMap[h] = { revenue: parseFloat(d.revenue||0), profit: parseFloat(d.profit||0) };
        });
        // Show hours 8am-8pm
        points = Array.from({length:13}, (_,i) => i+8).map(h => {
            const ampm = h >= 12 ? 'PM' : 'AM';
            const h12  = h % 12 || 12;
            return { label: `${h12}${ampm}`, value: hourMap[h]?.revenue||0, profit: hourMap[h]?.profit||0 };
        });
        // If no hourly breakdown, show single bar
        if (points.every(p => p.value === 0)) {
            points = [{ label: 'Today', value: parseFloat(data.summary.total_revenue||0), profit: parseFloat(data.summary.total_profit||0) }];
        }
        document.getElementById('chartTitle').textContent = 'Sales vs Profit by Hour';

    } else if (type === 'weekly') {
        // X-axis: Days of the week
        const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
        const dayMap = {};
        (data.daily || []).forEach(d => {
            const name = new Date(d.date).toLocaleDateString('en-KE', { weekday: 'short' });
            dayMap[name] = { revenue: parseFloat(d.revenue||0), profit: parseFloat(d.profit||0) };
        });
        points = days.map(day => ({
            label:  day,
            value:  dayMap[day]?.revenue || 0,
            profit: dayMap[day]?.profit  || 0
        }));
        document.getElementById('chartTitle').textContent = 'Sales vs Profit by Day';

    } else if (type === 'monthly') {
        // X-axis: Weeks of the month (Week 1, Week 2, Week 3, Week 4)
        const weekMap = { 'Wk 1':{ revenue:0, profit:0 }, 'Wk 2':{ revenue:0, profit:0 }, 'Wk 3':{ revenue:0, profit:0 }, 'Wk 4':{ revenue:0, profit:0 } };
        (data.daily || []).forEach(d => {
            const day  = new Date(d.date).getDate();
            const week = day <= 7 ? 'Wk 1' : day <= 14 ? 'Wk 2' : day <= 21 ? 'Wk 3' : 'Wk 4';
            weekMap[week].revenue += parseFloat(d.revenue||0);
            weekMap[week].profit  += parseFloat(d.profit||0);
        });
        points = Object.entries(weekMap).map(([label, v]) => ({ label, value: v.revenue, profit: v.profit }));
        document.getElementById('chartTitle').textContent = 'Sales vs Profit by Week';

    } else if (type === 'annual') {
        // X-axis: Months (Jan - Dec)
        const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        const monthMap   = {};
        monthNames.forEach(m => { monthMap[m] = { revenue:0, profit:0 }; });
        (data.monthly || []).forEach(m => {
            const idx  = parseInt(m.month.slice(5)) - 1;
            const name = monthNames[idx];
            if (name) { monthMap[name].revenue = parseFloat(m.revenue||0); monthMap[name].profit = parseFloat(m.profit||0); }
        });
        points = monthNames.map(m => ({ label: m, value: monthMap[m].revenue, profit: monthMap[m].profit }));
        document.getElementById('chartTitle').textContent = 'Sales vs Profit by Month';

    } else {
        // Custom: use daily breakdown
        points = (data.daily || []).map(d => ({
            label:  formatDate(d.date).slice(0,6),
            value:  parseFloat(d.revenue||0),
            profit: parseFloat(d.profit||0)
        }));
        if (points.length === 0) {
            points = [{ label: 'Period', value: parseFloat(data.summary.total_revenue||0), profit: parseFloat(data.summary.total_profit||0) }];
        }
        document.getElementById('chartTitle').textContent = 'Sales vs Profit';
    }

    if (points.length === 0) {
        chart.innerHTML = '<div class="empty-state" style="padding:40px;"><p>No data to chart.</p></div>';
        return;
    }

    const max = Math.max(...points.map(p => p.value), 1);

    chart.innerHTML = points.map(p => {
        const revPct    = ((p.value  / max) * 100).toFixed(1);
        const profitPct = ((p.profit / max) * 100).toFixed(1);
        return `
            <div class="bar-chart-col">
                <div style="position:relative;width:100%;display:flex;align-items:flex-end;
                            gap:2px;height:132px;">
                    <div class="bar-fill" style="height:0%;flex:1;
                         background:linear-gradient(to top,var(--gold-dim),var(--gold));"
                         data-height="${revPct}%"
                         title="Sales: ${formatKES(p.value)}"></div>
                    <div class="bar-fill" style="height:0%;flex:1;
                         background:linear-gradient(to top,var(--fuchsia-dim),var(--fuchsia));"
                         data-height="${profitPct}%"
                         title="Profit: ${formatKES(p.profit)}"></div>
                </div>
                <div class="bar-label">${p.label}</div>
            </div>`;
    }).join('');

    // Legend already in HTML — no duplicate needed

    requestAnimationFrame(() => {
        document.querySelectorAll('.bar-fill').forEach(b => b.style.height = b.dataset.height);
    });
}

// ── Category Performance ──────────────────────────────────────
function renderCategoryPerf(cats, isDummy) {
    const el = document.getElementById('categoryPerf');
    if (!cats || cats.length === 0) {
        el.innerHTML = '<div class="empty-state" style="padding:24px;"><p>No category data.</p></div>';
        return;
    }
    el.innerHTML = cats.map(c => `
        <div class="cat-perf-row">
            <div>
                <div class="cat-perf-name">${c.category}</div>
                <div class="cat-perf-items">${c.items_sold} items sold</div>
            </div>
            <div class="cat-perf-stats">
                <div class="cat-perf-rev">${formatKES(c.revenue)}</div>
                <div class="cat-perf-items" style="color:var(--fuchsia);">
                    Profit: ${formatKES(c.profit)}
                </div>
            </div>
        </div>`).join('');
    if (isDummy) el.innerHTML += `<p style="font-size:0.7rem;color:var(--gold-dim);text-align:center;padding:8px 0;">Sample data</p>`;
}

// ── Payment Methods ───────────────────────────────────────────
function renderPayments(payments, isDummy) {
    const el = document.getElementById('paymentBreakdown');
    if (!payments || payments.length === 0) {
        el.innerHTML = '<div class="empty-state" style="padding:24px;"><p>No payment data.</p></div>';
        return;
    }
    el.innerHTML = `<div class="pay-breakdown">
        ${payments.map(p => `
            <div class="pay-item">
                <div class="pay-item-method">${p.payment_method}</div>
                <div class="pay-item-amount">${formatKES(p.total)}</div>
                <div class="pay-item-count">${p.count} transaction${p.count!==1?'s':''}</div>
            </div>`).join('')}
    </div>`;
}

// ── Top Products ──────────────────────────────────────────────
function renderTopProducts(products, isDummy) {
    const wrap = document.getElementById('topProductsWrap');
    if (!products || products.length === 0) {
        wrap.innerHTML = '<div class="empty-state" style="padding:40px;"><p>No product data.</p></div>';
        return;
    }
    wrap.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>#</th><th>Product</th><th>Category</th>
                    <th>Qty Sold</th><th>Revenue</th><th>Profit</th>
                </tr>
            </thead>
            <tbody>
                ${products.map((p,i) => `
                    <tr>
                        <td><span class="top-prod-rank">${i+1}</span></td>
                        <td style="font-weight:500;color:var(--text-primary);">${p.product_name}</td>
                        <td><span class="badge badge-gold">${p.category_name}</span></td>
                        <td style="font-family:'Calibri','Candara','Segoe UI',sans-serif;font-weight:600;">
                            ${p.qty_sold}
                        </td>
                        <td style="font-family:'Calibri','Candara','Segoe UI',sans-serif;color:var(--gold);font-weight:600;">
                            ${formatKES(p.revenue)}
                        </td>
                        <td style="font-family:'Calibri','Candara','Segoe UI',sans-serif;color:var(--fuchsia);">
                            ${formatKES(p.profit)}
                        </td>
                    </tr>`).join('')}
            </tbody>
        </table>`;
}

// ── Transactions ──────────────────────────────────────────────
function renderTransactions(sales, isDummy) {
    const wrap = document.getElementById('transactionsWrap');
    document.getElementById('txCount').textContent = `${sales.length} records`;
    if (!sales || sales.length === 0) {
        wrap.innerHTML = '<div class="empty-state" style="padding:40px;"><p>No transactions found.</p></div>';
        return;
    }
    wrap.innerHTML = `
        <table>
            <thead>
                <tr><th>Receipt No.</th><th>Cashier</th><th>Items</th><th>Payment</th><th>Amount</th><th>Date & Time</th></tr>
            </thead>
            <tbody>
                ${sales.map(s => `
                    <tr>
                        <td><span class="text-gold fw-500">${s.receipt_number}</span></td>
                        <td>${s.cashier_name || s.cashier || '—'}</td>
                        <td style="font-family:'Calibri','Candara','Segoe UI',sans-serif;">${s.line_items||'—'}</td>
                        <td><span class="badge badge-info">${s.payment_method}</span></td>
                        <td style="font-family:'Calibri','Candara','Segoe UI',sans-serif;font-weight:600;color:var(--gold);">
                            ${formatKES(s.total_amount)}
                        </td>
                        <td class="text-muted" style="font-size:0.8rem;">${formatDateTime(s.created_at)}</td>
                    </tr>`).join('')}
            </tbody>
        </table>`;
}

// ── Downloads ─────────────────────────────────────────────────
function downloadCSV() {
    if (!currentData) { showToast('Load a report first.', 'warning'); return; }
    const s = currentData.summary;
    let csv = `KilaKitu Report\nPeriod,${currentData.period?.from} to ${currentData.period?.to}\n\n`;
    csv += `SUMMARY\nTotal Revenue,${s.total_revenue}\nTotal Profit,${s.total_profit}\n`;
    csv += `Transactions,${s.total_transactions}\nItems Sold,${s.items_sold}\n\n`;
    csv += `CATEGORY BREAKDOWN\nCategory,Revenue,Profit,Items Sold\n`;
    currentData.by_category?.forEach(c => { csv += `"${c.category}",${c.revenue},${c.profit},${c.items_sold}\n`; });
    csv += `\nTOP PRODUCTS\nProduct,Category,Qty Sold,Revenue,Profit\n`;
    currentData.top_products?.forEach(p => { csv += `"${p.product_name}","${p.category_name}",${p.qty_sold},${p.revenue},${p.profit}\n`; });

    // Include weekly insights if available
    if (currentType === 'weekly' && window._weeklyInsights) {
        const wi = window._weeklyInsights;
        csv += `\nBUSIEST DAYS\nDay,Transactions,Revenue,Profit\n`;
        wi.busyDays?.forEach(d => { csv += `"${d.day_name}",${d.transactions},${d.revenue},${d.profit}\n`; });
        csv += `\nBUSIEST HOURS\nHour,Transactions,Revenue\n`;
        wi.busyHours?.forEach(h => {
            const ampm = h.hour >= 12 ? 'PM' : 'AM';
            const h12  = h.hour % 12 || 12;
            csv += `"${h12}:00 ${ampm}",${h.transactions},${h.revenue}\n`;
        });
        csv += `\nFASTEST SELLING (Top 3)\nRank,Product,Category,Qty Sold,Revenue,Profit\n`;
        wi.fastSellers?.forEach((p,i) => { csv += `${i+1},"${p.product_name}","${p.category_name}",${p.qty_sold},${p.revenue},${p.profit}\n`; });
    }
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = `KilaKitu_Report_${new Date().toISOString().slice(0,10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
    showToast('Report downloaded as CSV.', 'success');
}

function downloadPDF() {
    if (!currentData) { showToast('Load a report first.', 'warning'); return; }
    const s   = currentData.summary;
    const per = currentData.period;
    const win = window.open('', '_blank');
    win.document.write(`
        <html><head><title>KilaKitu Report</title>
        <style>
            body{font-family:Calibri,sans-serif;padding:32px;color:#111;font-size:13px;}
            h1{font-size:22px;margin-bottom:4px;} h2{font-size:15px;margin:20px 0 8px;border-bottom:1px solid #ccc;padding-bottom:4px;}
            .sub{color:#666;font-size:12px;margin-bottom:20px;}
            .row{display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid #f0f0f0;}
            .val{font-weight:600;} table{width:100%;border-collapse:collapse;margin-top:8px;}
            th{background:#f5f5f5;padding:8px;text-align:left;font-size:11px;}
            td{padding:7px 8px;border-bottom:1px solid #f0f0f0;font-size:12px;}
            .gold{color:#9a7a2e;} .green{color:#2e7a4e;}
        </style></head><body>
        <h1>KILAKITU</h1>
        <div class="sub">Point of Sale — Report | ${per?.from} to ${per?.to}</div>
        <h2>Summary</h2>
        <div class="row"><span>Total Revenue</span><span class="val gold">KES ${parseFloat(s.total_revenue).toLocaleString()}</span></div>
        <div class="row"><span>Total Profit</span><span class="val green">KES ${parseFloat(s.total_profit).toLocaleString()}</span></div>
        <div class="row"><span>Profit Margin</span><span class="val">${s.total_revenue>0?((s.total_profit/s.total_revenue)*100).toFixed(1):0}%</span></div>
        <div class="row"><span>Transactions</span><span class="val">${s.total_transactions}</span></div>
        <div class="row"><span>Items Sold</span><span class="val">${s.items_sold}</span></div>
        <div class="row"><span>Avg. Transaction</span><span class="val">KES ${parseFloat(s.avg_transaction).toLocaleString()}</span></div>
        <h2>Sales by Category</h2>
        <table><thead><tr><th>Category</th><th>Revenue</th><th>Profit</th><th>Items Sold</th></tr></thead>
        <tbody>${currentData.by_category?.map(c=>`<tr><td>${c.category}</td><td>KES ${parseFloat(c.revenue).toLocaleString()}</td><td>KES ${parseFloat(c.profit).toLocaleString()}</td><td>${c.items_sold}</td></tr>`).join('')||''}</tbody></table>
        <h2>Top Products</h2>
        <table><thead><tr><th>#</th><th>Product</th><th>Category</th><th>Qty</th><th>Revenue</th><th>Profit</th></tr></thead>
        <tbody>${currentData.top_products?.map((p,i)=>`<tr><td>${i+1}</td><td>${p.product_name}</td><td>${p.category_name}</td><td>${p.qty_sold}</td><td>KES ${parseFloat(p.revenue).toLocaleString()}</td><td>KES ${parseFloat(p.profit).toLocaleString()}</td></tr>`).join('')||''}</tbody></table>
        ${currentType === 'weekly' && window._weeklyInsights ? `
        <h2>Weekly Insights — Fastest Selling Products</h2>
        <table><thead><tr><th>Rank</th><th>Product</th><th>Category</th><th>Qty Sold</th><th>Revenue</th><th>Profit</th></tr></thead>
        <tbody>${window._weeklyInsights.fastSellers?.map((p,i)=>`
            <tr><td>${['1st','2nd','3rd'][i]}</td><td>${p.product_name}</td><td>${p.category_name}</td>
            <td>${p.qty_sold}</td><td>KES ${parseFloat(p.revenue).toLocaleString()}</td>
            <td>KES ${parseFloat(p.profit).toLocaleString()}</td></tr>`).join('')||''}
        </tbody></table>
        <h2>Busiest Days</h2>
        <table><thead><tr><th>Day</th><th>Transactions</th><th>Revenue</th><th>Profit</th></tr></thead>
        <tbody>${window._weeklyInsights.busyDays?.map(d=>`
            <tr><td>${d.day_name}</td><td>${d.transactions}</td>
            <td>KES ${parseFloat(d.revenue).toLocaleString()}</td>
            <td>KES ${parseFloat(d.profit).toLocaleString()}</td></tr>`).join('')||''}
        </tbody></table>` : ''}
        <div style="margin-top:32px;color:#999;font-size:11px;text-align:center;">
            Generated by KilaKitu POS — ${new Date().toLocaleString('en-KE')}
        </div></body></html>`);
    win.document.close();
    setTimeout(() => win.print(), 500);
}

// ── Init ──────────────────────────────────────────────────────
loadReport('daily');