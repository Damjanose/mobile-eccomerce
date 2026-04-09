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

// ---- Load product by ID ----
async function loadProduct() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (!id) {
        document.getElementById('product-detail').innerHTML = '<p>Product not found.</p>';
        return;
    }

    const res = await fetch('/api/products/' + id);
    if (!res.ok) {
        document.getElementById('product-detail').innerHTML = '<p>Product not found.</p>';
        return;
    }

    const product = await res.json();
    document.title = product.name + ' — MobileStore';
    renderProduct(product);
}

function renderProduct(product) {
    const initial = product.brand ? product.brand.charAt(0) : '?';
    const stockClass = product.stock > 0 ? 'in-stock' : 'out-of-stock';
    const stockText = product.stock > 0 ? product.stock + ' units in stock' : 'Out of stock';

    document.getElementById('product-detail').innerHTML = `
        <div class="product-detail-img">
            <div class="placeholder-img">${initial}</div>
        </div>
        <div class="product-detail-info">
            <div class="brand">${product.brand}</div>
            <h1>${product.name}</h1>
            <div class="price">$${product.price.toFixed(2)}</div>
            <p class="description">${product.description}</p>
            <p class="stock ${stockClass}">${stockText}</p>
            <div class="quantity-selector">
                <label for="qty">Quantity:</label>
                <input type="number" id="qty" value="1" min="1" max="${product.stock}" ${product.stock === 0 ? 'disabled' : ''}>
            </div>
            <button class="btn btn-primary" id="add-to-cart-btn" ${product.stock === 0 ? 'disabled' : ''}>
                Add to Cart
            </button>
            <div id="cart-message" class="message" style="margin-top:1rem;"></div>
        </div>
    `;

    document.getElementById('add-to-cart-btn').addEventListener('click', () => {
        addToCart(product);
    });
}

function addToCart(product) {
    const qty = parseInt(document.getElementById('qty').value) || 1;
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');

    const existing = cart.find(item => item.productId === product.id);
    if (existing) {
        existing.quantity += qty;
    } else {
        cart.push({
            productId: product.id,
            name: product.name,
            brand: product.brand,
            price: product.price,
            image: product.image,
            quantity: qty
        });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartBadge();

    const msg = document.getElementById('cart-message');
    msg.textContent = `Added ${qty} × ${product.name} to cart!`;
    msg.className = 'message success';
    setTimeout(() => { msg.className = 'message'; }, 2000);
}

// ---- Init ----
document.addEventListener('DOMContentLoaded', () => {
    updateCartBadge();
    loadProduct();
});
