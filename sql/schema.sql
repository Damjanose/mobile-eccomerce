-- Create tables

CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    brand TEXT NOT NULL,
    price REAL NOT NULL,
    description TEXT,
    image TEXT,
    stock INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_name TEXT NOT NULL,
    email TEXT NOT NULL,
    address TEXT NOT NULL,
    total REAL NOT NULL,
    payment_method TEXT NOT NULL,
    card_last_four TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    price REAL NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

CREATE TABLE IF NOT EXISTS admin_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL
);

-- Seed admin user (password: admin123 hashed with SHA-256)
INSERT OR IGNORE INTO admin_users (username, password)
VALUES ('admin', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9');

-- Seed products
INSERT OR IGNORE INTO products (id, name, brand, price, description, image, stock) VALUES
(1, 'Galaxy S24 Ultra', 'Samsung', 1299.99, '6.8" Dynamic AMOLED, Snapdragon 8 Gen 3, 200MP camera, 5000mAh battery, S Pen included.', 'galaxy-s24-ultra.jpg', 15),
(2, 'iPhone 15 Pro Max', 'Apple', 1199.99, '6.7" Super Retina XDR, A17 Pro chip, 48MP camera system, Titanium design, USB-C.', 'iphone-15-pro-max.jpg', 20),
(3, 'Pixel 8 Pro', 'Google', 999.99, '6.7" LTPO OLED, Tensor G3, 50MP camera with AI features, 7 years of updates.', 'pixel-8-pro.jpg', 12),
(4, 'OnePlus 12', 'OnePlus', 799.99, '6.82" LTPO AMOLED, Snapdragon 8 Gen 3, 50MP Hasselblad camera, 100W charging.', 'oneplus-12.jpg', 18),
(5, 'Xiaomi 14 Ultra', 'Xiaomi', 899.99, '6.73" LTPO AMOLED, Snapdragon 8 Gen 3, Leica quad camera, 90W charging.', 'xiaomi-14-ultra.jpg', 10),
(6, 'Galaxy A55', 'Samsung', 449.99, '6.6" Super AMOLED, Exynos 1480, 50MP camera, 5000mAh battery, IP67 rated.', 'galaxy-a55.jpg', 30),
(7, 'iPhone 15', 'Apple', 799.99, '6.1" Super Retina XDR, A16 Bionic, 48MP camera, Dynamic Island, USB-C.', 'iphone-15.jpg', 25),
(8, 'Pixel 8a', 'Google', 499.99, '6.1" OLED 120Hz, Tensor G3, 64MP camera, 7 years of updates, great value.', 'pixel-8a.jpg', 22),
(9, 'Nothing Phone 2', 'Nothing', 599.99, '6.7" LTPO OLED, Snapdragon 8+ Gen 1, Glyph interface, 50MP dual camera.', 'nothing-phone-2.jpg', 14),
(10, 'Motorola Edge 50 Pro', 'Motorola', 549.99, '6.7" pOLED 144Hz, Snapdragon 7 Gen 3, 50MP camera, 125W TurboPower charging.', 'motorola-edge-50-pro.jpg', 16);
