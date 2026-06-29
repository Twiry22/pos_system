// ============================================================
//  js/products.js — Products Management
// ============================================================

const currentUser = requireAuth();
if (currentUser) renderSidebarUser();

let allProducts  = [];
let allCategories = [];
let editingId    = null;

// ── Load Data ─────────────────────────────────────────────────
async function loadData() {
    try {
        const [prodRes, catRes] = await Promise.all([
            apiFetch('/products?include_inactive=true'),
            apiFetch('/categories')
        ]);

        if (catRes.ok)  { allCategories = catRes.data.categories; populateCategoryFilters(); }
        if (prodRes.ok) { allProducts   = prodRes.data.products;  renderSummary(); renderTable(); }
    } catch {
        showToast('Could not load products. Check server.', 'error');
    }
}

// ── Summary Cards ─────────────────────────────────────────────
function renderSummary() {
    const active   = allProducts.filter(p => p.is_active).length;
    const inactive = allProducts.filter(p => !p.is_active).length;
    const cats     = new Set(allProducts.map(p => p.category_name)).size;
    const avgMargin = allProducts.length > 0
        ? (allProducts.reduce((s,p) => {
            const margin = p.selling_price > 0 ? ((p.selling_price - p.buying_price) / p.selling_price * 100) : 0;
            return s + margin;
          }, 0) / allProducts.length).toFixed(1)
        : 0;

    document.getElementById('summaryCards').innerHTML = `
        <div class="stat-card">
            <div class="stat-label">Total Products</div>
            <div class="stat-value" style="font-family:'Calibri','Candara','Segoe UI',sans-serif;">
                ${allProducts.length}
            </div>
            <div class="stat-sub">Across ${cats} categories</div>
        </div>
        <div class="stat-card">
            <div class="stat-label">Active Products</div>
            <div class="stat-value text-success" style="font-family:'Calibri','Candara','Segoe UI',sans-serif;">
                ${active}
            </div>
            <div class="stat-sub">Available for sale</div>
        </div>
        <div class="stat-card">
            <div class="stat-label">Inactive Products</div>
            <div class="stat-value text-muted" style="font-family:'Calibri','Candara','Segoe UI',sans-serif;">
                ${inactive}
            </div>
            <div class="stat-sub">Hidden from POS</div>
        </div>
        <div class="stat-card">
            <div class="stat-label">Avg. Profit Margin</div>
            <div class="stat-value text-gold" style="font-family:'Calibri','Candara','Segoe UI',sans-serif;">
                ${avgMargin}%
            </div>
            <div class="stat-sub">Across all products</div>
        </div>`;
}

// ── Populate Filters & Dropdowns ──────────────────────────────
function populateCategoryFilters() {
    const catFilter   = document.getElementById('catFilter');
    const productCat  = document.getElementById('productCategory');

    // Filter dropdown
    catFilter.innerHTML = '<option value="all">All Categories</option>';
    allCategories.forEach(c => {
        catFilter.innerHTML += `<option value="${c.id}">${c.name}</option>`;
    });

    // Modal dropdown
    productCat.innerHTML = '<option value="">— Select category —</option>';
    allCategories.forEach(c => {
        productCat.innerHTML += `<option value="${c.id}">${c.name}</option>`;
    });
}

// ── Filter & Render Table ─────────────────────────────────────
function filterProducts() { renderTable(); }

function renderTable() {
    const search = document.getElementById('productSearch').value.toLowerCase();
    const catId  = document.getElementById('catFilter').value;
    const status = document.getElementById('statusFilter').value;
    const wrap   = document.getElementById('productsTableWrap');

    const filtered = allProducts.filter(p => {
        const matchSearch = p.name.toLowerCase().includes(search) ||
                            p.category_name?.toLowerCase().includes(search);
        const matchCat    = catId   === 'all' || p.category_id == catId;
        const matchStatus = status  === 'all' ||
                           (status === 'active'   &&  p.is_active) ||
                           (status === 'inactive' && !p.is_active);
        return matchSearch && matchCat && matchStatus;
    });

    if (filtered.length === 0) {
        wrap.innerHTML = `<div class="empty-state" style="padding:60px;">
            <p>No products found. <a href="#" class="text-gold" onclick="openProductModal()">Add one?</a></p>
        </div>`;
        return;
    }

    wrap.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>Product Name</th>
                    <th>Category</th>
                    <th>Unit</th>
                    <th>Buying Price</th>
                    <th>Selling Price</th>
                    <th>Profit/Unit</th>
                    <th>Margin</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${filtered.map(p => {
                    const profit = p.selling_price - p.buying_price;
                    const margin = p.selling_price > 0
                        ? ((profit / p.selling_price) * 100).toFixed(1) : 0;
                    return `
                        <tr style="${!p.is_active ? 'opacity:0.5;' : ''}">
                            <td style="font-weight:500;color:var(--text-primary);">${p.name}</td>
                            <td><span class="badge badge-gold">${p.category_name}</span></td>
                            <td class="text-muted">${p.unit}</td>
                            <td style="font-family:'Calibri','Candara','Segoe UI',sans-serif;">
                                ${formatKES(p.buying_price)}
                            </td>
                            <td style="font-family:'Calibri','Candara','Segoe UI',sans-serif;
                                       color:var(--gold);font-weight:600;">
                                ${formatKES(p.selling_price)}
                            </td>
                            <td style="font-family:'Calibri','Candara','Segoe UI',sans-serif;
                                       color:var(--success);">
                                ${formatKES(profit)}
                            </td>
                            <td>
                                <span class="badge ${margin >= 30 ? 'badge-success' : margin >= 15 ? 'badge-warning' : 'badge-danger'}">
                                    ${margin}%
                                </span>
                            </td>
                            <td>
                                <span class="badge ${p.is_active ? 'badge-success' : 'badge-gold'}">
                                    ${p.is_active ? 'Active' : 'Inactive'}
                                </span>
                            </td>
                            <td>
                                <div class="flex-center gap-8">
                                    <button class="btn btn-outline btn-sm"
                                            onclick="openProductModal(${p.id})">Edit</button>
                                    <button class="btn btn-${p.is_active ? 'danger' : 'success'} btn-sm"
                                            onclick="toggleProduct(${p.id}, ${p.is_active})">
                                        ${p.is_active ? 'Deactivate' : 'Activate'}
                                    </button>
                                </div>
                            </td>
                        </tr>`;
                }).join('')}
            </tbody>
        </table>`;
}

// ── Product Modal ─────────────────────────────────────────────
function openProductModal(productId = null) {
    editingId = productId;
    const isEdit = productId !== null;

    document.getElementById('productModalTitle').textContent = isEdit ? 'Edit Product' : 'Add Product';
    document.getElementById('saveProductBtn').textContent    = isEdit ? 'Save Changes' : 'Save Product';
    document.getElementById('productStatusGroup').style.display = isEdit ? 'block' : 'none';
    document.getElementById('profitPreview').style.display = 'none';

    if (isEdit) {
        const p = allProducts.find(x => x.id === productId);
        if (!p) return;
        document.getElementById('productId').value       = p.id;
        document.getElementById('productName').value     = p.name;
        document.getElementById('productCategory').value = p.category_id;
        document.getElementById('productUnit').value     = p.unit;
        document.getElementById('productBuyPrice').value = p.buying_price;
        document.getElementById('productSellPrice').value= p.selling_price;
        document.getElementById('productDesc').value     = p.description || '';
        document.getElementById('productStatus').value   = p.is_active ? '1' : '0';
        updateProfitPreview();
    } else {
        document.getElementById('productId').value        = '';
        document.getElementById('productName').value      = '';
        document.getElementById('productCategory').value  = '';
        document.getElementById('productUnit').value      = 'piece';
        document.getElementById('productBuyPrice').value  = '';
        document.getElementById('productSellPrice').value = '';
        document.getElementById('productDesc').value      = '';
    }

    document.getElementById('productModal').classList.remove('hidden');
}

function closeProductModal() {
    document.getElementById('productModal').classList.add('hidden');
    editingId = null;
}

// Live profit preview
document.getElementById('productBuyPrice').addEventListener('input', updateProfitPreview);
document.getElementById('productSellPrice').addEventListener('input', updateProfitPreview);

function updateProfitPreview() {
    const buy  = parseFloat(document.getElementById('productBuyPrice').value)  || 0;
    const sell = parseFloat(document.getElementById('productSellPrice').value) || 0;
    const preview = document.getElementById('profitPreview');

    if (buy > 0 && sell > 0) {
        const profit = sell - buy;
        const margin = ((profit / sell) * 100).toFixed(1);
        document.getElementById('profitAmount').textContent = formatKES(profit);
        document.getElementById('profitMargin').textContent = `${margin}% margin`;
        document.getElementById('profitAmount').style.color = profit >= 0 ? 'var(--success)' : 'var(--danger)';
        preview.style.display = 'block';
    } else {
        preview.style.display = 'none';
    }
}

async function saveProduct() {
    const name      = document.getElementById('productName').value.trim();
    const catId     = document.getElementById('productCategory').value;
    const unit      = document.getElementById('productUnit').value;
    const buyPrice  = parseFloat(document.getElementById('productBuyPrice').value)  || 0;
    const sellPrice = parseFloat(document.getElementById('productSellPrice').value) || 0;
    const desc      = document.getElementById('productDesc').value.trim();
    const isActive  = document.getElementById('productStatus').value === '1';

    if (!name)      { showToast('Product name is required.', 'error');  return; }
    if (!catId)     { showToast('Please select a category.', 'error'); return; }
    if (!sellPrice) { showToast('Selling price is required.', 'error'); return; }

    const btn = document.getElementById('saveProductBtn');
    btn.disabled = true;

    try {
        const payload = {
            name, category_id: catId, unit,
            buying_price: buyPrice, selling_price: sellPrice,
            description: desc
        };

        let res;
        if (editingId) {
            payload.is_active = isActive;
            res = await apiFetch(`/products/${editingId}`, {
                method: 'PUT', body: JSON.stringify(payload)
            });
        } else {
            res = await apiFetch('/products', {
                method: 'POST', body: JSON.stringify(payload)
            });
        }

        if (res.ok) {
            showToast(editingId ? 'Product updated.' : 'Product added.', 'success');
            closeProductModal();
            loadData();
        } else {
            showToast(res.data.message || 'Failed to save product.', 'error');
        }
    } catch {
        showToast('Connection error.', 'error');
    }

    btn.disabled = false;
}

// ── Toggle Active/Inactive ────────────────────────────────────
async function toggleProduct(id, currentlyActive) {
    const action = currentlyActive ? 'Deactivate' : 'Activate';
    if (!confirm(`${action} this product?`)) return;

    const { ok, data } = await apiFetch(`/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ is_active: !currentlyActive })
    });

    if (ok) {
        showToast(`Product ${action.toLowerCase()}d.`, 'success');
        loadData();
    } else {
        showToast(data.message || 'Failed.', 'error');
    }
}

// ── Category Modal ────────────────────────────────────────────
function openCategoryModal() {
    loadCategoriesList();
    document.getElementById('categoryModal').classList.remove('hidden');
}

function closeCategoryModal() {
    document.getElementById('categoryModal').classList.add('hidden');
}

async function loadCategoriesList() {
    const el = document.getElementById('categoriesList');
    el.innerHTML = '<div class="text-center" style="padding:20px;"><div class="spinner"></div></div>';

    const { ok, data } = await apiFetch('/categories');
    if (!ok) { el.innerHTML = '<p class="text-muted">Could not load.</p>'; return; }

    el.innerHTML = data.categories.map(c => `
        <div style="display:flex;align-items:center;justify-content:space-between;
                    padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.04);">
            <div style="display:flex;align-items:center;gap:10px;">
                <div style="width:12px;height:12px;border-radius:50%;
                            background:${c.color};flex-shrink:0;"></div>
                <span style="font-size:0.875rem;font-weight:500;color:var(--text-primary);">
                    ${c.name}
                </span>
            </div>
            <div class="flex-center gap-8">
                <span class="text-muted text-sm">${c.description || ''}</span>
                <button class="btn btn-danger btn-sm" onclick="deleteCategory(${c.id}, '${c.name}')">
                    Remove
                </button>
            </div>
        </div>`).join('');
}

async function addCategory() {
    const name  = document.getElementById('newCatName').value.trim();
    const color = document.getElementById('newCatColor').value.trim() || '#4A90D9';

    if (!name) { showToast('Category name is required.', 'error'); return; }

    const { ok, data } = await apiFetch('/categories', {
        method: 'POST',
        body: JSON.stringify({ name, color })
    });

    if (ok) {
        showToast('Category added.', 'success');
        document.getElementById('newCatName').value  = '';
        document.getElementById('newCatColor').value = '';
        loadCategoriesList();
        loadData();
    } else {
        showToast(data.message || 'Failed to add category.', 'error');
    }
}

async function deleteCategory(id, name) {
    if (!confirm(`Remove category "${name}"? This cannot be undone.`)) return;

    const { ok, data } = await apiFetch(`/categories/${id}`, { method: 'DELETE' });

    if (ok) {
        showToast('Category removed.', 'success');
        loadCategoriesList();
        loadData();
    } else {
        showToast(data.message || 'Cannot remove — category has products.', 'error');
    }
}

// ── Keyboard shortcuts ────────────────────────────────────────
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeProductModal(); closeCategoryModal(); }
});

// ── Init ──────────────────────────────────────────────────────
loadData();
