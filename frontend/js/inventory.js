// ============================================================
//  js/inventory.js — Inventory Management
// ============================================================

const currentUser = requireAuth();
if (currentUser) renderSidebarUser();

// ── State ─────────────────────────────────────────────────────
let allInventory  = [];
let statusFilter  = 'all';
let adjustTarget  = null;

// ── Load Inventory ────────────────────────────────────────────
async function loadInventory() {
    try {
        const [invRes, catRes] = await Promise.all([
            apiFetch('/inventory'),
            apiFetch('/categories')
        ]);

        if (invRes.ok) {
            allInventory = invRes.data.inventory;
            renderSummary();
            renderTable();
            populateCategoryFilter(catRes.ok ? catRes.data.categories : []);
            populateRestockDropdown();
            updateStockBadge();
        }
    } catch (err) {
        showToast('Could not load inventory. Check server.', 'error');
    }
}

// ── Summary Cards ─────────────────────────────────────────────
function renderSummary() {
    const total   = allInventory.length;
    const inStock = allInventory.filter(i => i.stock_status === 'In Stock').length;
    const low     = allInventory.filter(i => i.stock_status === 'Low Stock').length;
    const out     = allInventory.filter(i => i.stock_status === 'Out of Stock').length;

    document.getElementById('summaryCards').innerHTML = `
        <div class="stat-card">
            <div class="stat-label">Total Products</div>
            <div class="stat-value" style="font-family:'Calibri','Candara','Segoe UI',sans-serif;">${total}</div>
            <div class="stat-sub">Across all categories</div>
        </div>
        <div class="stat-card">
            <div class="stat-label">In Stock</div>
            <div class="stat-value text-success" style="font-family:'Calibri','Candara','Segoe UI',sans-serif;">${inStock}</div>
            <div class="stat-sub">Ready to sell</div>
        </div>
        <div class="stat-card" style="${low > 0 ? 'border-color:rgba(230,168,23,0.3);' : ''}">
            <div class="stat-label">Low Stock</div>
            <div class="stat-value text-warning" style="font-family:'Calibri','Candara','Segoe UI',sans-serif;">${low}</div>
            <div class="stat-sub">Need restocking soon</div>
        </div>
        <div class="stat-card" style="${out > 0 ? 'border-color:rgba(224,92,92,0.3);' : ''}">
            <div class="stat-label">Out of Stock</div>
            <div class="stat-value text-danger" style="font-family:'Calibri','Candara','Segoe UI',sans-serif;">${out}</div>
            <div class="stat-sub">${out > 0 ? 'Restock immediately' : 'All good'}</div>
        </div>`;
}

// ── Stock Alert Badge ─────────────────────────────────────────
function updateStockBadge() {
    const count = allInventory.filter(i => i.stock_status !== 'In Stock').length;
    const badge = document.getElementById('stockAlertBadge');
    if (badge && count > 0) { badge.textContent = count; badge.classList.remove('hidden'); }
}

// ── Populate Filters ──────────────────────────────────────────
function populateCategoryFilter(categories) {
    const sel = document.getElementById('catFilter');
    categories.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.name;
        opt.textContent = c.name;
        sel.appendChild(opt);
    });
}

function populateRestockDropdown() {
    const sel = document.getElementById('restockProductId');
    sel.innerHTML = '<option value="">— Select product —</option>';
    allInventory
        .sort((a, b) => a.product_name.localeCompare(b.product_name))
        .forEach(item => {
            const opt = document.createElement('option');
            opt.value       = item.product_id;
            opt.textContent = `${item.product_name} (${item.category}) — ${item.stock} in stock`;
            sel.appendChild(opt);
        });
}

// ── Filter & Render Table ─────────────────────────────────────
function setStatusFilter(status, el) {
    statusFilter = status;
    document.querySelectorAll('.status-tab').forEach(t => t.classList.remove('active'));
    el.classList.add('active');
    renderTable();
}

function filterInventory() { renderTable(); }

function getStatusKey(item) {
    if (item.stock_status === 'Out of Stock') return 'out';
    if (item.stock_status === 'Low Stock')    return 'low';
    return 'ok';
}

function renderTable() {
    const search  = document.getElementById('invSearch').value.toLowerCase();
    const catVal  = document.getElementById('catFilter').value;
    const wrap    = document.getElementById('invTableWrap');

    const filtered = allInventory.filter(item => {
        const matchStatus = statusFilter === 'all' || getStatusKey(item) === statusFilter;
        const matchSearch = item.product_name.toLowerCase().includes(search) ||
                            item.category.toLowerCase().includes(search);
        const matchCat    = catVal === 'all' || item.category === catVal;
        return matchStatus && matchSearch && matchCat;
    });

    if (filtered.length === 0) {
        wrap.innerHTML = `
            <div class="empty-state" style="padding:60px;">
                <p>No products match your filter.</p>
            </div>`;
        return;
    }

    // Max stock for bar width calculation
    const maxStock = Math.max(...filtered.map(i => Math.max(i.stock, i.low_stock_alert * 3, 1)));

    wrap.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Stock Level</th>
                    <th>Buying Price</th>
                    <th>Selling Price</th>
                    <th>Status</th>
                    <th>Last Restocked</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${filtered.map(item => {
                    const key    = getStatusKey(item);
                    const pct    = Math.min(100, (item.stock / maxStock) * 100).toFixed(0);
                    const status = item.stock_status;

                    return `
                        <tr>
                            <td>
                                <div style="font-weight:500;color:var(--text-primary);">${item.product_name}</div>
                            </td>
                            <td>
                                <span class="badge badge-gold">${item.category}</span>
                            </td>
                            <td>
                                <div class="stock-bar-wrap">
                                    <div class="stock-bar-track">
                                        <div class="stock-bar-fill ${key}" style="width:${pct}%"></div>
                                    </div>
                                    <div class="qty-display ${key}">${item.stock}</div>
                                </div>
                            </td>
                            <td style="font-family:'Calibri','Candara','Segoe UI',sans-serif;">
                                ${formatKES(item.buying_price)}
                            </td>
                            <td style="font-family:'Calibri','Candara','Segoe UI',sans-serif;">
                                ${formatKES(item.selling_price)}
                            </td>
                            <td>
                                <span class="badge ${key === 'ok' ? 'badge-success' : key === 'low' ? 'badge-warning' : 'badge-danger'}">
                                    ${status}
                                </span>
                            </td>
                            <td class="text-muted" style="font-size:0.8rem;">
                                ${item.last_restocked ? formatDate(item.last_restocked) : 'Never'}
                            </td>
                            <td>
                                <div class="flex-center gap-8">
                                    <button class="btn btn-success btn-sm"
                                            onclick="openRestockForProduct(${item.product_id})">
                                        Restock
                                    </button>
                                    <button class="btn btn-outline btn-sm"
                                            onclick="openAdjustModal(${item.product_id})">
                                        Adjust
                                    </button>
                                    <button class="btn btn-ghost btn-sm"
                                            onclick="openHistoryModal(${item.product_id}, '${item.product_name.replace(/'/g, "\\'")}')">
                                        History
                                    </button>
                                </div>
                            </td>
                        </tr>`;
                }).join('')}
            </tbody>
        </table>`;
}

// ── Restock Modal ─────────────────────────────────────────────
function openRestockModal() {
    document.getElementById('restockProductId').value = '';
    document.getElementById('restockQty').value       = '';
    document.getElementById('restockAlert').value     = '';
    document.getElementById('restockNote').value      = '';
    document.getElementById('restockCurrentInfo').classList.add('hidden');
    document.getElementById('restockModal').classList.remove('hidden');
}

function openRestockForProduct(productId) {
    openRestockModal();
    document.getElementById('restockProductId').value = productId;
    onRestockProductChange();
}

function onRestockProductChange() {
    const id   = document.getElementById('restockProductId').value;
    const info = document.getElementById('restockCurrentInfo');
    if (!id) { info.classList.add('hidden'); return; }

    const item = allInventory.find(i => i.product_id == id);
    if (item) {
        info.textContent = `Current stock: ${item.stock} units  |  Alert threshold: ${item.low_stock_alert}`;
        info.classList.remove('hidden');
        document.getElementById('restockAlert').value = item.low_stock_alert;
    }
}

function closeRestockModal() {
    document.getElementById('restockModal').classList.add('hidden');
}

async function confirmRestock() {
    const productId = document.getElementById('restockProductId').value;
    const quantity  = parseInt(document.getElementById('restockQty').value);
    const alert     = parseInt(document.getElementById('restockAlert').value) || 5;
    const note      = document.getElementById('restockNote').value;

    if (!productId) { showToast('Please select a product.', 'error'); return; }
    if (!quantity || quantity < 1) { showToast('Enter a valid quantity.', 'error'); return; }

    try {
        const { ok, data } = await apiFetch('/inventory/restock', {
            method: 'POST',
            body: JSON.stringify({ product_id: productId, quantity, note })
        });

        // Also update low stock alert if changed
        if (ok) {
            await apiFetch(`/inventory/${productId}`, {
                method: 'PUT',
                body: JSON.stringify({ low_stock_alert: alert })
            });
            showToast(data.message || 'Stock updated successfully.', 'success');
            closeRestockModal();
            loadInventory();
        } else {
            showToast(data.message || 'Restock failed.', 'error');
        }
    } catch {
        showToast('Connection error.', 'error');
    }
}

// ── Adjust Modal ──────────────────────────────────────────────
function openAdjustModal(productId) {
    const item = allInventory.find(i => i.product_id === productId);
    if (!item) return;

    adjustTarget = productId;
    document.getElementById('adjustProductName').textContent  = item.product_name;
    document.getElementById('adjustCurrentStock').textContent = `Current stock: ${item.stock} units`;
    document.getElementById('adjustQty').value   = item.stock;
    document.getElementById('adjustAlert').value = item.low_stock_alert;
    document.getElementById('adjustNote').value  = '';
    document.getElementById('adjustModal').classList.remove('hidden');
}

function closeAdjustModal() {
    document.getElementById('adjustModal').classList.add('hidden');
    adjustTarget = null;
}

async function confirmAdjust() {
    if (!adjustTarget) return;
    const quantity = parseInt(document.getElementById('adjustQty').value);
    const alert    = parseInt(document.getElementById('adjustAlert').value) || 5;
    const note     = document.getElementById('adjustNote').value || 'Manual adjustment';

    if (isNaN(quantity) || quantity < 0) { showToast('Enter a valid quantity.', 'error'); return; }

    try {
        const { ok, data } = await apiFetch(`/inventory/${adjustTarget}`, {
            method: 'PUT',
            body: JSON.stringify({ quantity, low_stock_alert: alert, note })
        });

        if (ok) {
            showToast('Stock adjusted successfully.', 'success');
            closeAdjustModal();
            loadInventory();
        } else {
            showToast(data.message || 'Adjustment failed.', 'error');
        }
    } catch {
        showToast('Connection error.', 'error');
    }
}

// ── History Modal ─────────────────────────────────────────────
async function openHistoryModal(productId, productName) {
    document.getElementById('historyProductName').textContent = `${productName} — History`;
    document.getElementById('historyTableWrap').innerHTML =
        '<div class="text-center" style="padding:40px;"><div class="spinner"></div></div>';
    document.getElementById('historyModal').classList.remove('hidden');

    try {
        const { ok, data } = await apiFetch(`/inventory/${productId}/history`);
        const wrap = document.getElementById('historyTableWrap');

        if (!ok || data.history.length === 0) {
            wrap.innerHTML = '<div class="empty-state" style="padding:40px;"><p>No history yet.</p></div>';
            return;
        }

        wrap.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Type</th>
                        <th>Change</th>
                        <th>Before</th>
                        <th>After</th>
                        <th>By</th>
                        <th>Note</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.history.map(h => `
                        <tr>
                            <td class="text-muted" style="font-size:0.8rem;">${formatDateTime(h.created_at)}</td>
                            <td>
                                <span class="badge ${
                                    h.change_type === 'restock'    ? 'badge-success' :
                                    h.change_type === 'sale'       ? 'badge-info'    :
                                    h.change_type === 'return'     ? 'badge-warning' :
                                    'badge-gold'
                                }">${h.change_type}</span>
                            </td>
                            <td style="font-family:'Calibri','Candara','Segoe UI',sans-serif;
                                       color:${h.quantity_change > 0 ? 'var(--success)' : 'var(--danger)'};">
                                ${h.quantity_change > 0 ? '+' : ''}${h.quantity_change}
                            </td>
                            <td style="font-family:'Calibri','Candara','Segoe UI',sans-serif;">${h.quantity_before}</td>
                            <td style="font-family:'Calibri','Candara','Segoe UI',sans-serif;">${h.quantity_after}</td>
                            <td class="text-muted">${h.performed_by_name || '—'}</td>
                            <td class="text-muted" style="font-size:0.8rem;">${h.note || '—'}</td>
                        </tr>`).join('')}
                </tbody>
            </table>`;
    } catch {
        showToast('Could not load history.', 'error');
    }
}

function closeHistoryModal() {
    document.getElementById('historyModal').classList.add('hidden');
}

// ── Export CSV ────────────────────────────────────────────────
function exportCSV() {
    const rows = [
        ['Product', 'Category', 'Stock', 'Low Stock Alert', 'Status', 'Buying Price', 'Selling Price', 'Last Restocked']
    ];

    allInventory.forEach(item => {
        rows.push([
            item.product_name,
            item.category,
            item.stock,
            item.low_stock_alert,
            item.stock_status,
            item.buying_price,
            item.selling_price,
            item.last_restocked ? formatDate(item.last_restocked) : 'Never'
        ]);
    });

    const csv     = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob    = new Blob([csv], { type: 'text/csv' });
    const url     = URL.createObjectURL(blob);
    const a       = document.createElement('a');
    a.href        = url;
    a.download    = `KilaKitu_Inventory_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Inventory exported successfully.', 'success');
}

// ── Keyboard shortcuts ────────────────────────────────────────
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
        closeRestockModal();
        closeAdjustModal();
        closeHistoryModal();
    }
});

// ── Init ──────────────────────────────────────────────────────
loadInventory();
