// ---- Cart Badge ----
function updateCartBadge() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    const badge = document.getElementById('cart-badge');
    if (badge) {
        badge.textContent = count;
        badge.style.display = count > 0 ? 'flex' : 'none';
    }
}

// ---- Auth helpers ----
function getToken() {
    return sessionStorage.getItem('adminToken');
}

function authHeaders() {
    return { 'Content-Type': 'application/json', 'Authorization': getToken() };
}

// ---- Login ----
async function handleLogin() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const errorEl = document.getElementById('login-error');

    if (!username || !password) {
        errorEl.textContent = 'Please enter username and password.';
        errorEl.style.display = 'block';
        return;
    }

    const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (!res.ok) {
        errorEl.textContent = data.error || 'Login failed.';
        errorEl.style.display = 'block';
        return;
    }

    sessionStorage.setItem('adminToken', data.token);
    showDashboard();
}

function handleLogout() {
    sessionStorage.removeItem('adminToken');
    document.getElementById('admin-login').style.display = 'block';
    document.getElementById('admin-dashboard').style.display = 'none';
}

function showDashboard() {
    document.getElementById('admin-login').style.display = 'none';
    document.getElementById('admin-dashboard').style.display = 'block';
    loadProducts();
    loadOrders();
}

// ---- Tabs ----
function setupTabs() {
    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById('section-' + tab.dataset.tab).classList.add('active');
        });
    });
}

// ---- Products Management ----
async function loadProducts() {
    const res = await fetch('/api/products');
    const products = await res.json();
    const tbody = document.getElementById('products-tbody');

    tbody.innerHTML = products.map(p => `
        <tr>
            <td>${p.id}</td>
            <td>${p.name}</td>
            <td>${p.brand}</td>
            <td>$${p.price.toFixed(2)}</td>
            <td>${p.stock}</td>
            <td class="admin-actions">
                <button class="btn btn-secondary btn-small" onclick="editProduct(${p.id})">Edit</button>
                <button class="btn btn-danger btn-small" onclick="deleteProduct(${p.id})">Delete</button>
            </td>
        </tr>
    `).join('');
}

async function addProduct() {
    const name = document.getElementById('pf-name').value.trim();
    const brand = document.getElementById('pf-brand').value.trim();
    const price = parseFloat(document.getElementById('pf-price').value);
    const stock = parseInt(document.getElementById('pf-stock').value) || 0;
    const description = document.getElementById('pf-description').value.trim();
    const image = document.getElementById('pf-image').value.trim();

    const msgEl = document.getElementById('product-message');

    if (!name || !brand || isNaN(price)) {
        msgEl.textContent = 'Name, brand, and price are required.';
        msgEl.className = 'message error';
        return;
    }

    const res = await fetch('/api/products', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ name, brand, price, description, image, stock })
    });

    if (res.ok) {
        msgEl.textContent = 'Product added successfully!';
        msgEl.className = 'message success';
        // Clear form
        document.getElementById('pf-name').value = '';
        document.getElementById('pf-brand').value = '';
        document.getElementById('pf-price').value = '';
        document.getElementById('pf-stock').value = '';
        document.getElementById('pf-description').value = '';
        document.getElementById('pf-image').value = '';
        loadProducts();
    } else {
        const data = await res.json();
        msgEl.textContent = data.error || 'Failed to add product.';
        msgEl.className = 'message error';
    }

    setTimeout(() => { msgEl.className = 'message'; }, 3000);
}

async function editProduct(id) {
    const res = await fetch('/api/products/' + id);
    const product = await res.json();

    const name = prompt('Name:', product.name);
    if (name === null) return;
    const brand = prompt('Brand:', product.brand);
    if (brand === null) return;
    const price = prompt('Price:', product.price);
    if (price === null) return;
    const stock = prompt('Stock:', product.stock);
    if (stock === null) return;
    const description = prompt('Description:', product.description);
    if (description === null) return;

    await fetch('/api/products/' + id, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({
            name,
            brand,
            price: parseFloat(price),
            description,
            image: product.image,
            stock: parseInt(stock)
        })
    });

    loadProducts();
}

async function deleteProduct(id) {
    if (!confirm('Are you sure you want to delete this product?')) return;

    await fetch('/api/products/' + id, {
        method: 'DELETE',
        headers: authHeaders()
    });

    loadProducts();
}

// ---- Orders Management ----
async function loadOrders() {
    const res = await fetch('/api/orders', { headers: authHeaders() });
    if (!res.ok) return;

    const orders = await res.json();
    const tbody = document.getElementById('orders-tbody');
    const noOrders = document.getElementById('no-orders');

    if (orders.length === 0) {
        tbody.innerHTML = '';
        noOrders.style.display = 'block';
        return;
    }

    noOrders.style.display = 'none';
    tbody.innerHTML = orders.map(o => `
        <tr>
            <td>#${o.id}</td>
            <td>${o.customer_name}</td>
            <td>${o.email}</td>
            <td>$${o.total.toFixed(2)}</td>
            <td>${o.payment_method} •••• ${o.card_last_four}</td>
            <td><span class="status-badge ${o.status}">${o.status}</span></td>
            <td>${new Date(o.created_at).toLocaleDateString()}</td>
        </tr>
    `).join('');
}

// ---- Init ----
document.addEventListener('DOMContentLoaded', () => {
    updateCartBadge();
    setupTabs();

    // Check if already logged in
    if (getToken()) {
        showDashboard();
    }

    document.getElementById('login-btn').addEventListener('click', handleLogin);
    document.getElementById('password').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleLogin();
    });
    document.getElementById('logout-btn').addEventListener('click', handleLogout);
    document.getElementById('add-product-btn').addEventListener('click', addProduct);
});
