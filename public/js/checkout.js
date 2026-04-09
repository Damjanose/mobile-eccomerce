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

// ---- Populate order summary from cart ----
function renderSummary() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const summaryItems = document.getElementById('summary-items');
    const summaryTotal = document.getElementById('summary-total');

    if (cart.length === 0) {
        window.location.href = '/cart.html';
        return;
    }

    let total = 0;
    summaryItems.innerHTML = cart.map(item => {
        const lineTotal = item.price * item.quantity;
        total += lineTotal;
        return `
            <div class="checkout-summary-item">
                <span>${item.name} × ${item.quantity}</span>
                <span>$${lineTotal.toFixed(2)}</span>
            </div>
        `;
    }).join('');

    summaryTotal.textContent = '$' + total.toFixed(2);
}

// ---- Card type detection ----
function detectCardType(number) {
    const cleaned = number.replace(/\s/g, '');
    if (cleaned.startsWith('4')) return 'Visa';
    if (cleaned.startsWith('5')) return 'MasterCard';
    if (cleaned.startsWith('37') || cleaned.startsWith('34')) return 'American Express';
    if (cleaned.startsWith('6')) return 'Discover';
    return '';
}

// ---- Format card number with spaces ----
function formatCardNumber(value) {
    const cleaned = value.replace(/\D/g, '').substring(0, 16);
    const groups = cleaned.match(/.{1,4}/g);
    return groups ? groups.join(' ') : '';
}

// ---- Validation ----
function validateForm() {
    let valid = true;

    const name = document.getElementById('customer-name').value.trim();
    const email = document.getElementById('email').value.trim();
    const address = document.getElementById('address').value.trim();
    const cardNumber = document.getElementById('card-number').value.replace(/\s/g, '');
    const expiry = document.getElementById('card-expiry').value.trim();
    const cvv = document.getElementById('card-cvv').value.trim();

    // Reset errors
    document.querySelectorAll('.form-group .error').forEach(el => el.style.display = 'none');

    if (!name) {
        document.getElementById('err-name').style.display = 'block';
        valid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
        document.getElementById('err-email').style.display = 'block';
        valid = false;
    }

    if (!address) {
        document.getElementById('err-address').style.display = 'block';
        valid = false;
    }

    if (!cardNumber || cardNumber.length !== 16 || !/^\d+$/.test(cardNumber)) {
        document.getElementById('err-card').style.display = 'block';
        valid = false;
    }

    const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
    if (!expiry || !expiryRegex.test(expiry)) {
        document.getElementById('err-expiry').style.display = 'block';
        valid = false;
    } else {
        // Check if not expired
        const [month, year] = expiry.split('/').map(Number);
        const now = new Date();
        const expiryDate = new Date(2000 + year, month);
        if (expiryDate < now) {
            document.getElementById('err-expiry').style.display = 'block';
            valid = false;
        }
    }

    if (!cvv || cvv.length !== 3 || !/^\d+$/.test(cvv)) {
        document.getElementById('err-cvv').style.display = 'block';
        valid = false;
    }

    return valid;
}

// ---- Place order ----
async function placeOrder() {
    if (!validateForm()) return;

    const btn = document.getElementById('place-order-btn');
    btn.disabled = true;
    btn.textContent = 'Processing...';

    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const cardNumber = document.getElementById('card-number').value.replace(/\s/g, '');

    const orderData = {
        customer_name: document.getElementById('customer-name').value.trim(),
        email: document.getElementById('email').value.trim(),
        address: document.getElementById('address').value.trim(),
        total: total,
        payment_method: detectCardType(cardNumber) || 'Card',
        card_last_four: cardNumber.slice(-4),
        items: cart.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price
        }))
    };

    try {
        const res = await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.error || 'Order failed');
        }

        // Clear cart and redirect to confirmation
        localStorage.removeItem('cart');
        window.location.href = '/confirmation.html?orderId=' + data.orderId;
    } catch (e) {
        const errorEl = document.getElementById('checkout-error');
        errorEl.textContent = e.message;
        errorEl.className = 'message error';
        btn.disabled = false;
        btn.textContent = 'Place Order';
    }
}

// ---- Init ----
document.addEventListener('DOMContentLoaded', () => {
    updateCartBadge();
    renderSummary();

    // Card number formatting and type detection
    const cardInput = document.getElementById('card-number');
    cardInput.addEventListener('input', (e) => {
        e.target.value = formatCardNumber(e.target.value);
        const type = detectCardType(e.target.value);
        document.getElementById('card-type').textContent = type ? 'Card type: ' + type : '';
    });

    // Expiry formatting
    const expiryInput = document.getElementById('card-expiry');
    expiryInput.addEventListener('input', (e) => {
        let val = e.target.value.replace(/\D/g, '').substring(0, 4);
        if (val.length >= 3) {
            val = val.substring(0, 2) + '/' + val.substring(2);
        }
        e.target.value = val;
    });

    // CVV — numbers only
    document.getElementById('card-cvv').addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/\D/g, '').substring(0, 3);
    });

    document.getElementById('place-order-btn').addEventListener('click', placeOrder);
});
