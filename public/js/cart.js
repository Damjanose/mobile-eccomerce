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

// ---- Get cart from localStorage ----
function getCart() {
    return JSON.parse(localStorage.getItem('cart') || '[]');
}

function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartBadge();
}

// ---- Render cart ----
function renderCart() {
    const cart = getCart();
    const container = document.getElementById('cart-content');

    if (cart.length === 0) {
        container.innerHTML = `
            <div class="cart-empty">
                <p>Your cart is empty.</p>
                <a href="/" class="btn btn-primary" style="margin-top:1rem;">Continue Shopping</a>
            </div>
        `;
        return;
    }

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    container.innerHTML = `
        <div class="cart-items">
            ${cart.map((item, index) => `
                <div class="cart-item">
                    <div class="cart-item-img">
                        <div class="placeholder-img" style="width:80px;height:80px;font-size:1.2rem;border-radius:8px;">
                            ${item.brand ? item.brand.charAt(0) : '?'}
                        </div>
                    </div>
                    <div class="cart-item-info">
                        <h3>${item.name}</h3>
                        <div class="price">$${item.price.toFixed(2)}</div>
                    </div>
                    <div class="cart-item-qty">
                        <button onclick="changeQty(${index}, -1)">−</button>
                        <span>${item.quantity}</span>
                        <button onclick="changeQty(${index}, 1)">+</button>
                    </div>
                    <div class="cart-item-total">$${(item.price * item.quantity).toFixed(2)}</div>
                    <button class="cart-item-remove" onclick="removeItem(${index})" title="Remove">✕</button>
                </div>
            `).join('')}
        </div>
        <div class="cart-summary">
            <div class="total">Total: <span>$${total.toFixed(2)}</span></div>
            <div>
                <a href="/" class="btn btn-secondary" style="margin-right:0.5rem;">Continue Shopping</a>
                <a href="/checkout.html" class="btn btn-primary">Proceed to Checkout</a>
            </div>
        </div>
    `;
}

// ---- Cart actions ----
function changeQty(index, delta) {
    const cart = getCart();
    cart[index].quantity += delta;
    if (cart[index].quantity < 1) cart[index].quantity = 1;
    saveCart(cart);
    renderCart();
}

function removeItem(index) {
    const cart = getCart();
    cart.splice(index, 1);
    saveCart(cart);
    renderCart();
}

// ---- Init ----
document.addEventListener('DOMContentLoaded', () => {
    updateCartBadge();
    renderCart();
});
