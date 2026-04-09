const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// On Vercel, use /tmp since the rest of the filesystem is read-only
const isVercel = !!process.env.VERCEL;
const dbDir = isVercel ? '/tmp' : path.join(__dirname, 'db');
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(path.join(dbDir, 'store.db'));

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Initialize database with schema
function init() {
    const schema = fs.readFileSync(path.join(__dirname, 'sql', 'schema.sql'), 'utf8');
    db.exec(schema);
}

// ---- Product queries ----

function getAllProducts(brand, search) {
    let sql = 'SELECT * FROM products WHERE 1=1';
    const params = {};

    if (brand) {
        sql += ' AND brand = @brand';
        params.brand = brand;
    }
    if (search) {
        sql += ' AND (name LIKE @search OR brand LIKE @search OR description LIKE @search)';
        params.search = '%' + search + '%';
    }

    sql += ' ORDER BY id';
    return db.prepare(sql).all(params);
}

function getProductById(id) {
    return db.prepare('SELECT * FROM products WHERE id = ?').get(id);
}

function createProduct(name, brand, price, description, image, stock) {
    const stmt = db.prepare(
        'INSERT INTO products (name, brand, price, description, image, stock) VALUES (?, ?, ?, ?, ?, ?)'
    );
    const result = stmt.run(name, brand, price, description, image, stock);
    return getProductById(result.lastInsertRowid);
}

function updateProduct(id, name, brand, price, description, image, stock) {
    db.prepare(
        'UPDATE products SET name = ?, brand = ?, price = ?, description = ?, image = ?, stock = ? WHERE id = ?'
    ).run(name, brand, price, description, image, stock, id);
    return getProductById(id);
}

function deleteProduct(id) {
    return db.prepare('DELETE FROM products WHERE id = ?').run(id);
}

// ---- Order queries ----

function createOrder(customerName, email, address, total, paymentMethod, cardLastFour, items) {
    const insertOrder = db.prepare(
        `INSERT INTO orders (customer_name, email, address, total, payment_method, card_last_four, status)
         VALUES (?, ?, ?, ?, ?, ?, 'completed')`
    );
    const insertItem = db.prepare(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)'
    );
    const updateStock = db.prepare(
        'UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?'
    );

    const placeOrder = db.transaction(() => {
        const orderResult = insertOrder.run(customerName, email, address, total, paymentMethod, cardLastFour);
        const orderId = orderResult.lastInsertRowid;

        for (const item of items) {
            const stockResult = updateStock.run(item.quantity, item.productId, item.quantity);
            if (stockResult.changes === 0) {
                throw new Error(`Insufficient stock for product ID ${item.productId}`);
            }
            insertItem.run(orderId, item.productId, item.quantity, item.price);
        }

        return orderId;
    });

    return placeOrder();
}

function getOrderById(id) {
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
    if (!order) return null;

    order.items = db.prepare(
        `SELECT oi.*, p.name, p.image FROM order_items oi
         JOIN products p ON oi.product_id = p.id
         WHERE oi.order_id = ?`
    ).all(id);

    return order;
}

function getAllOrders() {
    return db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all();
}

// ---- Admin queries ----

function getAdminByUsername(username) {
    return db.prepare('SELECT * FROM admin_users WHERE username = ?').get(username);
}

// ---- Brands list ----

function getAllBrands() {
    const rows = db.prepare('SELECT DISTINCT brand FROM products ORDER BY brand').all();
    return rows.map(r => r.brand);
}

module.exports = {
    init,
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    createOrder,
    getOrderById,
    getAllOrders,
    getAdminByUsername,
    getAllBrands
};
