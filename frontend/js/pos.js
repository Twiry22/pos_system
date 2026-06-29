// ============================================================
//  js/pos.js — POS Sales Screen Logic
// ============================================================

const currentUser = requireAuth();
if (currentUser) renderSidebarUser();

// ── State ─────────────────────────────────────────────────────
let allProducts   = [];
let categories    = [];
let cart          = [];
let selectedCatId = 'all';
let paymentMethod = 'cash';

// ── Dummy Data ────────────────────────────────────────────────
const DUMMY_CATEGORIES = [
    { id: 1, name: 'Stationery',       color: '#4A90D9' },
    { id: 2, name: 'Candy Shop',       color: '#E91E8C' },
    { id: 3, name: 'Lady Shoes',       color: '#C2185B' },
    { id: 4, name: 'Bags',             color: '#795548' },
    { id: 5, name: 'Deco Stuff',       color: '#43A047' },
    { id: 6, name: 'Flavored Popcorn', color: '#FF8F00' },
    { id: 7, name: 'Soda & Water',     color: '#0288D1' },
];

const DUMMY_PRODUCTS = [
    { id:1,  category_id:1, name:'Manilla Envelope (A4)',  selling_price:20,   category_name:'Stationery',       category_color:'#4A90D9', stock:50, stock_status:'ok' },
    { id:2,  category_id:1, name:'Crayons (12 pack)',      selling_price:90,   category_name:'Stationery',       category_color:'#4A90D9', stock:30, stock_status:'ok' },
    { id:3,  category_id:1, name:'Printing Paper (ream)',  selling_price:500,  category_name:'Stationery',       category_color:'#4A90D9', stock:20, stock_status:'ok' },
    { id:4,  category_id:1, name:'Ballpoint Pen (blue)',   selling_price:15,   category_name:'Stationery',       category_color:'#4A90D9', stock:4,  stock_status:'low' },
    { id:5,  category_id:1, name:'Ruler 30cm',             selling_price:30,   category_name:'Stationery',       category_color:'#4A90D9', stock:25, stock_status:'ok' },
    { id:6,  category_id:1, name:'Stapler',                selling_price:150,  category_name:'Stationery',       category_color:'#4A90D9', stock:15, stock_status:'ok' },
    { id:7,  category_id:1, name:'Notebook (A5)',          selling_price:80,   category_name:'Stationery',       category_color:'#4A90D9', stock:22, stock_status:'ok' },
    { id:8,  category_id:2, name:'Lollipop',               selling_price:5,    category_name:'Candy Shop',       category_color:'#E91E8C', stock:100,stock_status:'ok' },
    { id:9,  category_id:2, name:'Chocolate Bar',          selling_price:50,   category_name:'Candy Shop',       category_color:'#E91E8C', stock:40, stock_status:'ok' },
    { id:10, category_id:2, name:'Gummy Bears (pack)',     selling_price:60,   category_name:'Candy Shop',       category_color:'#E91E8C', stock:35, stock_status:'ok' },
    { id:11, category_id:2, name:'Mint Drops (tin)',       selling_price:80,   category_name:'Candy Shop',       category_color:'#E91E8C', stock:28, stock_status:'ok' },
    { id:12, category_id:3, name:'Block Heel Pump',        selling_price:1500, category_name:'Lady Shoes',       category_color:'#C2185B', stock:10, stock_status:'ok' },
    { id:13, category_id:3, name:'Flat Sandal',            selling_price:950,  category_name:'Lady Shoes',       category_color:'#C2185B', stock:12, stock_status:'ok' },
    { id:14, category_id:3, name:'Ankle Boot',             selling_price:2200, category_name:'Lady Shoes',       category_color:'#C2185B', stock:8,  stock_status:'ok' },
    { id:15, category_id:3, name:'Ballet Flat',            selling_price:1100, category_name:'Lady Shoes',       category_color:'#C2185B', stock:3,  stock_status:'low' },
    { id:16, category_id:3, name:'Sneaker (Ladies)',       selling_price:1300, category_name:'Lady Shoes',       category_color:'#C2185B', stock:9,  stock_status:'ok' },
    { id:17, category_id:4, name:'Tote Bag',               selling_price:750,  category_name:'Bags',             category_color:'#795548', stock:15, stock_status:'ok' },
    { id:18, category_id:4, name:'Clutch Purse',           selling_price:600,  category_name:'Bags',             category_color:'#795548', stock:18, stock_status:'ok' },
    { id:19, category_id:4, name:'Backpack (Ladies)',      selling_price:1500, category_name:'Bags',             category_color:'#795548', stock:9,  stock_status:'ok' },
    { id:20, category_id:4, name:'Shoulder Bag',           selling_price:1100, category_name:'Bags',             category_color:'#795548', stock:11, stock_status:'ok' },
    { id:21, category_id:5, name:'Scented Candle',         selling_price:300,  category_name:'Deco Stuff',       category_color:'#43A047', stock:22, stock_status:'ok' },
    { id:22, category_id:5, name:'Photo Frame (4x6)',      selling_price:160,  category_name:'Deco Stuff',       category_color:'#43A047', stock:30, stock_status:'ok' },
    { id:23, category_id:5, name:'Wall Clock',             selling_price:800,  category_name:'Deco Stuff',       category_color:'#43A047', stock:7,  stock_status:'ok' },
    { id:24, category_id:5, name:'Decorative Cushion',     selling_price:600,  category_name:'Deco Stuff',       category_color:'#43A047', stock:14, stock_status:'ok' },
    { id:25, category_id:6, name:'Butter Popcorn (small)', selling_price:60,   category_name:'Flavored Popcorn', category_color:'#FF8F00', stock:45, stock_status:'ok' },
    { id:26, category_id:6, name:'Cheese Popcorn (small)', selling_price:70,   category_name:'Flavored Popcorn', category_color:'#FF8F00', stock:40, stock_status:'ok' },
    { id:27, category_id:6, name:'Caramel Popcorn',        selling_price:70,   category_name:'Flavored Popcorn', category_color:'#FF8F00', stock:3,  stock_status:'low' },
    { id:28, category_id:6, name:'Mixed Flavor Box',       selling_price:250,  category_name:'Flavored Popcorn', category_color:'#FF8F00', stock:20, stock_status:'ok' },
    { id:29, category_id:7, name:'Mineral Water (500ml)',  selling_price:50,   category_name:'Soda & Water',     category_color:'#0288D1', stock:0,  stock_status:'out' },
    { id:30, category_id:7, name:'Mineral Water (1L)',     selling_price:80,   category_name:'Soda & Water',     category_color:'#0288D1', stock:60, stock_status:'ok' },
    { id:31, category_id:7, name:'Soda - Cola (300ml)',    selling_price:80,   category_name:'Soda & Water',     category_color:'#0288D1', stock:55, stock_status:'ok' },
    { id:32, category_id:7, name:'Energy Drink (250ml)',   selling_price:150,  category_name:'Soda & Water',     category_color:'#0288D1', stock:28, stock_status:'ok' },
];

// ── Clock ─────────────────────────────────────────────────────
function tickClock() {
    const el = document.getElementById('topbarTime');
    if (el) el.textContent = new Date().toLocaleTimeString('en-KE', {
        hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
}
tickClock();
setInterval(tickClock, 1000);

// ── Load Data ─────────────────────────────────────────────────
async function loadData() {
    try {
        const [catRes, prodRes] = await Promise.all([
            apiFetch('/categories'),
            apiFetch('/products')
        ]);

        const realCats  = catRes.ok  && catRes.data.categories.length > 0;
        const realProds = prodRes.ok && prodRes.data.products.length  > 0;
        const hasStock  = realProds  && prodRes.data.products.some(p => p.stock > 0);

        categories  = realCats ? catRes.data.categories  : DUMMY_CATEGORIES;
        allProducts = hasStock ? prodRes.data.products   : DUMMY_PRODUCTS;

        if (!hasStock) {
            showToast('Showing sample products. Add stock in Inventory to sell real items.', 'warning', 5000);
        }
    } catch {
        categories  = DUMMY_CATEGORIES;
        allProducts = DUMMY_PRODUCTS;
        showToast('Using sample data. Check server connection.', 'warning', 4000);
    }

    renderCategoryTabs();
    renderProducts();
}

// ── Category Tabs (no emojis) ─────────────────────────────────
function renderCategoryTabs() {
    const tabs = document.getElementById('categoryTabs');
    tabs.innerHTML = `
        <button class="cat-tab ${selectedCatId === 'all' ? 'active' : ''}"
                data-id="all" onclick="selectCategory('all', this)">All</button>
        ${categories.map(c => `
            <button class="cat-tab"
                    data-id="${c.id}"
                    onclick="selectCategory(${c.id}, this)"
                    style="--cat-color:${c.color}">
                ${c.name}
            </button>`).join('')}`;
}

function selectCategory(id, el) {
    selectedCatId = id;
    document.querySelectorAll('.cat-tab').forEach(t => t.classList.remove('active'));
    el.classList.add('active');
    renderProducts();
}

// ── Render Products (no emojis, clean cards) ──────────────────
function renderProducts() {
    const search   = document.getElementById('productSearch').value.toLowerCase();
    const grid     = document.getElementById('productsGrid');

    const filtered = allProducts.filter(p => {
        const matchCat  = selectedCatId === 'all' || p.category_id == selectedCatId;
        const matchName = p.name.toLowerCase().includes(search);
        return matchCat && matchName;
    });

    if (filtered.length === 0) {
        grid.innerHTML = `
            <div style="grid-column:1/-1;" class="empty-state">
                <p>No products found.</p>
            </div>`;
        return;
    }

    grid.innerHTML = filtered.map(p => {
        const isOut = p.stock_status === 'out';
        const isLow = p.stock_status === 'low';

        // Colored left border per category
        const borderColor = p.category_color || 'var(--gold)';

        return `
            <div class="product-card ${isOut ? 'out-of-stock' : ''}"
                 style="border-left: 3px solid ${borderColor}; --cat-color:${borderColor}"
                 onclick="${isOut ? '' : `addToCart(${p.id})`}"
                 title="${p.name}">
                <div class="product-name">${p.name}</div>
                <div class="product-price"
                     style="font-family:'Calibri','Candara','Segoe UI',sans-serif;">
                    ${formatKES(p.selling_price)}
                </div>
                <div class="product-stock ${p.stock_status}"
                     style="font-family:'Calibri','Candara','Segoe UI',sans-serif;">
                    ${isOut ? 'Out of stock' : isLow ? `Only ${p.stock} left` : `${p.stock} in stock`}
                </div>
                <div style="font-size:0.7rem;color:var(--text-muted);margin-top:2px;">
                    ${p.category_name}
                </div>
            </div>`;
    }).join('');
}

function filterProducts() { renderProducts(); }

// ── Cart Operations ───────────────────────────────────────────
function addToCart(productId) {
    const product  = allProducts.find(p => p.id === productId);
    if (!product) return;

    const existing = cart.find(i => i.product_id === productId);
    if (existing) {
        if (existing.quantity >= product.stock) {
            showToast(`Only ${product.stock} units available.`, 'warning');
            return;
        }
        existing.quantity++;
    } else {
        cart.push({
            product_id:    product.id,
            name:          product.name,
            selling_price: parseFloat(product.selling_price),
            quantity:      1,
            stock:         product.stock
        });
    }
    renderCart();
    showToast(`${product.name} added`, 'success', 1200);
}

function changeQty(productId, delta) {
    const item = cart.find(i => i.product_id === productId);
    if (!item) return;
    item.quantity += delta;
    if (item.quantity <= 0) {
        cart = cart.filter(i => i.product_id !== productId);
    } else if (item.quantity > item.stock) {
        item.quantity = item.stock;
        showToast('Max stock reached.', 'warning');
    }
    renderCart();
}

function removeFromCart(productId) {
    cart = cart.filter(i => i.product_id !== productId);
    renderCart();
}

function clearCart() {
    if (cart.length === 0) return;
    cart = [];
    document.getElementById('discountInput').value = '';
    renderCart();
}

// ── Render Cart ───────────────────────────────────────────────
function renderCart() {
    const el      = document.getElementById('cartItems');
    const countEl = document.getElementById('cartCount');
    const payBtn  = document.getElementById('payBtn');

    countEl.textContent = cart.reduce((s, i) => s + i.quantity, 0);
    payBtn.disabled     = cart.length === 0;

    if (cart.length === 0) {
        el.innerHTML = `
            <div class="cart-empty">
                <p>Tap a product to add it to cart</p>
            </div>`;
        updateTotals();
        return;
    }

    el.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price"
                     style="font-family:'Calibri','Candara','Segoe UI',sans-serif;">
                    ${formatKES(item.selling_price)} each
                </div>
            </div>
            <div class="cart-item-qty">
                <button class="qty-btn" onclick="changeQty(${item.product_id}, -1)">−</button>
                <span class="qty-num">${item.quantity}</span>
                <button class="qty-btn" onclick="changeQty(${item.product_id}, 1)">+</button>
            </div>
            <div class="cart-item-total"
                 style="font-family:'Calibri','Candara','Segoe UI',sans-serif;">
                ${formatKES(item.selling_price * item.quantity)}
            </div>
            <button class="cart-remove" onclick="removeFromCart(${item.product_id})">x</button>
        </div>`).join('');

    updateTotals();
}

// ── Totals ────────────────────────────────────────────────────
function updateTotals() {
    const subtotal = cart.reduce((s, i) => s + i.selling_price * i.quantity, 0);
    const discount = parseFloat(document.getElementById('discountInput').value) || 0;
    const total    = Math.max(0, subtotal - discount);

    document.getElementById('cartSubtotal').textContent = formatKES(subtotal);
    document.getElementById('cartTotal').textContent    = formatKES(total);

    const discountRow = document.getElementById('discountRow');
    if (discount > 0) {
        discountRow.style.display = 'flex';
        document.getElementById('cartDiscount').textContent = `- ${formatKES(discount)}`;
    } else {
        discountRow.style.display = 'none';
    }
}

// ── Payment Modal ─────────────────────────────────────────────
function openPaymentModal() {
    if (cart.length === 0) return;
    const subtotal = cart.reduce((s, i) => s + i.selling_price * i.quantity, 0);
    const discount = parseFloat(document.getElementById('discountInput').value) || 0;
    const total    = Math.max(0, subtotal - discount);
    const items    = cart.reduce((s, i) => s + i.quantity, 0);

    document.getElementById('modalItemCount').textContent = `${items} item${items !== 1 ? 's' : ''}`;
    document.getElementById('modalTotal').textContent     = formatKES(total);
    document.getElementById('amountPaid').value           = '';
    document.getElementById('changeDisplay').classList.add('hidden');
    document.getElementById('paymentModal').classList.remove('hidden');
    setTimeout(() => document.getElementById('amountPaid').focus(), 100);
}

function closePaymentModal() {
    document.getElementById('paymentModal').classList.add('hidden');
}

function selectPayMethod(el) {
    document.querySelectorAll('.pay-method-btn').forEach(b => b.classList.remove('active'));
    el.classList.add('active');
    paymentMethod = el.dataset.method;
    const group = document.getElementById('amountPaidGroup');
    if (paymentMethod !== 'cash') {
        group.style.opacity = '0.5';
        document.getElementById('amountPaid').value = getTotal();
        calcChange();
    } else {
        group.style.opacity = '1';
        document.getElementById('amountPaid').value = '';
        document.getElementById('changeDisplay').classList.add('hidden');
    }
}

function getTotal() {
    const subtotal = cart.reduce((s, i) => s + i.selling_price * i.quantity, 0);
    const discount = parseFloat(document.getElementById('discountInput').value) || 0;
    return Math.max(0, subtotal - discount);
}

function calcChange() {
    const total  = getTotal();
    const paid   = parseFloat(document.getElementById('amountPaid').value) || 0;
    const change = paid - total;
    const el     = document.getElementById('changeDisplay');
    if (paid >= total && paid > 0) {
        document.getElementById('changeAmount').textContent = formatKES(change);
        el.classList.remove('hidden');
    } else {
        el.classList.add('hidden');
    }
}

// ── Confirm Sale ──────────────────────────────────────────────
async function confirmSale() {
    const total = getTotal();
    const paid  = parseFloat(document.getElementById('amountPaid').value) || 0;

    if (paymentMethod === 'cash' && paid < total) {
        showToast('Amount received is less than total.', 'error');
        return;
    }

    const btn       = document.getElementById('confirmPayBtn');
    btn.disabled    = true;
    btn.textContent = 'Processing...';
    const discount  = parseFloat(document.getElementById('discountInput').value) || 0;

    try {
        const { ok, data } = await apiFetch('/sales', {
            method: 'POST',
            body: JSON.stringify({
                items:           cart.map(i => ({ product_id: i.product_id, quantity: i.quantity })),
                amount_paid:     paymentMethod === 'cash' ? paid : total,
                payment_method:  paymentMethod,
                discount_amount: discount
            })
        });

        if (ok && data.success) {
            closePaymentModal();
            showReceipt(data);
            await loadData();
        } else {
            showToast(data.message || 'Sale failed. Try again.', 'error');
        }
    } catch {
        showToast('Connection error. Check server.', 'error');
    }

    btn.disabled    = false;
    btn.textContent = 'Confirm Sale';
}

// ── Receipt ───────────────────────────────────────────────────
function showReceipt(saleData) {
    const now      = new Date();
    const discount = parseFloat(document.getElementById('discountInput').value) || 0;
    const total    = saleData.total_amount;
    const paid     = parseFloat(document.getElementById('amountPaid').value) || total;
    const change   = saleData.change_given;

    const lines = cart.map(i =>
        `<div class="r-row">
            <span>${i.name} x${i.quantity}</span>
            <span>${formatKES(i.selling_price * i.quantity)}</span>
         </div>`
    ).join('');

    document.getElementById('receiptContent').innerHTML = `
        <div class="r-title">KILAKITU</div>
        <div class="r-sub">Point of Sale System</div>
        <div class="r-sub">${now.toLocaleString('en-KE')}</div>
        <div class="r-sub">Receipt No: ${saleData.receipt_number}</div>
        <div class="r-sub">Cashier: ${currentUser.full_name}</div>
        <hr class="r-divider"/>
        ${lines}
        <hr class="r-divider"/>
        ${discount > 0 ? `<div class="r-row"><span>Discount</span><span>- ${formatKES(discount)}</span></div>` : ''}
        <div class="r-row r-total"><span>TOTAL</span><span>${formatKES(total)}</span></div>
        <div class="r-row"><span>Paid (${paymentMethod.toUpperCase()})</span><span>${formatKES(paid)}</span></div>
        ${change > 0 ? `<div class="r-row"><span>Change</span><span>${formatKES(change)}</span></div>` : ''}
        <hr class="r-divider"/>
        <div class="r-footer">Thank you for shopping at KilaKitu!</div>`;

    document.getElementById('receiptModal').classList.remove('hidden');
    cart = [];
    document.getElementById('discountInput').value = '';
    renderCart();
}

function closeReceiptModal() {
    document.getElementById('receiptModal').classList.add('hidden');
}

function printReceipt() {
    const content = document.getElementById('receiptContent').innerHTML;
    const win = window.open('', '_blank', 'width=400,height=600');
    win.document.write(`
        <html><head><title>Receipt - KilaKitu</title>
        <style>
            body       { font-family:'Courier New',monospace; font-size:13px; padding:20px; color:#111; }
            .r-title   { text-align:center; font-size:16px; font-weight:700; margin-bottom:4px; }
            .r-sub     { text-align:center; font-size:11px; color:#555; margin-bottom:4px; }
            .r-divider { border:none; border-top:1px dashed #ccc; margin:8px 0; }
            .r-row     { display:flex; justify-content:space-between; margin:3px 0; }
            .r-total   { font-weight:700; font-size:14px; margin-top:4px; }
            .r-footer  { text-align:center; margin-top:12px; font-size:11px; color:#555; }
        </style></head>
        <body>${content}</body></html>`);
    win.document.close();
    win.print();
}

// ── Keyboard shortcuts ────────────────────────────────────────
document.addEventListener('keydown', e => {
    if (e.key === 'F2' && cart.length > 0) openPaymentModal();
    if (e.key === 'Escape') { closePaymentModal(); closeReceiptModal(); }
});

// ── Init ──────────────────────────────────────────────────────
loadData();
