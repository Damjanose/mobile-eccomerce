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

// ---- Load order details ----
async function loadOrder() {
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get('orderId');
    const container = document.getElementById('confirmation');

    if (!orderId) {
        container.innerHTML = '<p>No order found.</p><a href="/" class="btn btn-primary">Back to Home</a>';
        return;
    }

    const res = await fetch('/api/orders/' + orderId);

    if (!res.ok) {
        container.innerHTML = '<p>Order not found.</p><a href="/" class="btn btn-primary">Back to Home</a>';
        return;
    }

    const order = await res.json();

    container.innerHTML = `
        <div class="confirmation-icon">✓</div>
        <h1>Order Confirmed!</h1>
        <p class="subtitle">Thank you for your purchase, ${order.customer_name}.</p>

        <div class="confirmation-details">
            <h3>Order #${order.id}</h3>
            <div class="confirmation-row">
                <span>Email</span>
                <span>${order.email}</span>
            </div>
            <div class="confirmation-row">
                <span>Shipping Address</span>
                <span>${order.address}</span>
            </div>
            <div class="confirmation-row">
                <span>Payment</span>
                <span>${order.payment_method} •••• ${order.card_last_four}</span>
            </div>
            <div class="confirmation-row">
                <span>Status</span>
                <span class="status-badge ${order.status}">${order.status}</span>
            </div>

            <div class="confirmation-items">
                <h3>Items</h3>
                ${order.items.map(item => `
                    <div class="confirmation-item">
                        <span>${item.name} × ${item.quantity}</span>
                        <span>$${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                `).join('')}
                <div class="confirmation-total">
                    <span>Total</span>
                    <span>$${order.total.toFixed(2)}</span>
                </div>
            </div>
        </div>

        <a href="/" class="btn btn-primary" style="margin-top:2rem;">Back to Home</a>
    `;
}

// ---- Init ----
document.addEventListener('DOMContentLoaded', () => {
    updateCartBadge();
    loadOrder();
});
