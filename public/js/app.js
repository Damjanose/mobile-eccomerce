// ---- Cart Badge (shared across all pages) ----
function updateCartBadge() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    const badge = document.getElementById('cart-badge');
    if (badge) {
        badge.textContent = count;
        badge.style.display = count > 0 ? 'flex' : 'none';
    }
}

// ---- Placeholder image for products without images ----
function getProductImageHTML(product) {
    const initial = product.brand ? product.brand.charAt(0) : '?';
    return `<div class="placeholder-img">${initial}</div>`;
}

// ---- Load and render products ----
async function loadProducts(brand, search) {
    let url = '/api/products?';
    if (brand) url += 'brand=' + encodeURIComponent(brand) + '&';
    if (search) url += 'search=' + encodeURIComponent(search);

    const res = await fetch(url);
    const products = await res.json();
    renderProducts(products);
}

function renderProducts(products) {
    const grid = document.getElementById('products-grid');

    if (products.length === 0) {
        grid.innerHTML = '<p style="text-align:center;color:#888;padding:2rem;grid-column:1/-1;">No products found.</p>';
        return;
    }

    grid.innerHTML = products.map(product => `
        <a href="/product.html?id=${product.id}" class="product-card">
            <div class="product-card-img">
                ${getProductImageHTML(product)}
            </div>
            <div class="product-card-body">
                <div class="product-card-brand">${product.brand}</div>
                <div class="product-card-name">${product.name}</div>
                <div class="product-card-price">$${product.price.toFixed(2)}</div>
                <div class="product-card-stock">${product.stock > 0 ? product.stock + ' in stock' : 'Out of stock'}</div>
            </div>
        </a>
    `).join('');
}

// ---- Load brands into filter dropdown ----
async function loadBrands() {
    const res = await fetch('/api/brands');
    const brands = await res.json();
    const select = document.getElementById('brand-filter');
    brands.forEach(brand => {
        const option = document.createElement('option');
        option.value = brand;
        option.textContent = brand;
        select.appendChild(option);
    });
}

// ---- Event listeners ----
document.addEventListener('DOMContentLoaded', () => {
    updateCartBadge();
    loadProducts();
    loadBrands();

    let searchTimeout;
    document.getElementById('search-input').addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            const brand = document.getElementById('brand-filter').value;
            loadProducts(brand, e.target.value);
        }, 300);
    });

    document.getElementById('brand-filter').addEventListener('change', (e) => {
        const search = document.getElementById('search-input').value;
        loadProducts(e.target.value, search);
    });
});
