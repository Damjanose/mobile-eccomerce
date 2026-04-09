const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const url = require('url');
const db = require('./database');

// Initialize database
db.init();

// Simple in-memory admin token store
const adminTokens = new Set();

// MIME types for static file serving
const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

// Helper: parse JSON body from request
function parseBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
            try {
                resolve(body ? JSON.parse(body) : {});
            } catch (e) {
                reject(new Error('Invalid JSON'));
            }
        });
        req.on('error', reject);
    });
}

// Helper: send JSON response
function sendJSON(res, statusCode, data) {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
}

// Helper: check admin token
function isAdmin(req) {
    const token = req.headers['authorization'];
    return token && adminTokens.has(token);
}

// Helper: hash password with SHA-256
function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

// Route handler
async function handleRequest(req, res) {
    const parsed = url.parse(req.url, true);
    const pathname = parsed.pathname;
    const method = req.method;

    // ---- API Routes ----

    // GET /api/products
    if (method === 'GET' && pathname === '/api/products') {
        const { brand, search } = parsed.query;
        const products = db.getAllProducts(brand || null, search || null);
        return sendJSON(res, 200, products);
    }

    // GET /api/brands
    if (method === 'GET' && pathname === '/api/brands') {
        const brands = db.getAllBrands();
        return sendJSON(res, 200, brands);
    }

    // GET /api/products/:id
    if (method === 'GET' && pathname.match(/^\/api\/products\/(\d+)$/)) {
        const id = parseInt(pathname.split('/')[3]);
        const product = db.getProductById(id);
        if (!product) return sendJSON(res, 404, { error: 'Product not found' });
        return sendJSON(res, 200, product);
    }

    // POST /api/products (admin only)
    if (method === 'POST' && pathname === '/api/products') {
        if (!isAdmin(req)) return sendJSON(res, 401, { error: 'Unauthorized' });
        try {
            const body = await parseBody(req);
            const product = db.createProduct(
                body.name, body.brand, body.price,
                body.description, body.image, body.stock
            );
            return sendJSON(res, 201, product);
        } catch (e) {
            return sendJSON(res, 400, { error: e.message });
        }
    }

    // PUT /api/products/:id (admin only)
    if (method === 'PUT' && pathname.match(/^\/api\/products\/(\d+)$/)) {
        if (!isAdmin(req)) return sendJSON(res, 401, { error: 'Unauthorized' });
        const id = parseInt(pathname.split('/')[3]);
        try {
            const body = await parseBody(req);
            const product = db.updateProduct(
                id, body.name, body.brand, body.price,
                body.description, body.image, body.stock
            );
            if (!product) return sendJSON(res, 404, { error: 'Product not found' });
            return sendJSON(res, 200, product);
        } catch (e) {
            return sendJSON(res, 400, { error: e.message });
        }
    }

    // DELETE /api/products/:id (admin only)
    if (method === 'DELETE' && pathname.match(/^\/api\/products\/(\d+)$/)) {
        if (!isAdmin(req)) return sendJSON(res, 401, { error: 'Unauthorized' });
        const id = parseInt(pathname.split('/')[3]);
        const result = db.deleteProduct(id);
        if (result.changes === 0) return sendJSON(res, 404, { error: 'Product not found' });
        return sendJSON(res, 200, { message: 'Product deleted' });
    }

    // POST /api/orders
    if (method === 'POST' && pathname === '/api/orders') {
        try {
            const body = await parseBody(req);
            const { customer_name, email, address, total, payment_method, card_last_four, items } = body;

            if (!customer_name || !email || !address || !total || !payment_method || !card_last_four || !items || !items.length) {
                return sendJSON(res, 400, { error: 'Missing required fields' });
            }

            const orderId = db.createOrder(customer_name, email, address, total, payment_method, card_last_four, items);
            return sendJSON(res, 201, { orderId });
        } catch (e) {
            return sendJSON(res, 400, { error: e.message });
        }
    }

    // GET /api/orders/:id
    if (method === 'GET' && pathname.match(/^\/api\/orders\/(\d+)$/)) {
        const id = parseInt(pathname.split('/')[3]);
        const order = db.getOrderById(id);
        if (!order) return sendJSON(res, 404, { error: 'Order not found' });
        return sendJSON(res, 200, order);
    }

    // GET /api/orders (admin only)
    if (method === 'GET' && pathname === '/api/orders') {
        if (!isAdmin(req)) return sendJSON(res, 401, { error: 'Unauthorized' });
        const orders = db.getAllOrders();
        return sendJSON(res, 200, orders);
    }

    // POST /api/admin/login
    if (method === 'POST' && pathname === '/api/admin/login') {
        try {
            const body = await parseBody(req);
            const { username, password } = body;
            if (!username || !password) {
                return sendJSON(res, 400, { error: 'Username and password required' });
            }

            const admin = db.getAdminByUsername(username);
            if (!admin || admin.password !== hashPassword(password)) {
                return sendJSON(res, 401, { error: 'Invalid credentials' });
            }

            const token = crypto.randomBytes(32).toString('hex');
            adminTokens.add(token);
            return sendJSON(res, 200, { token });
        } catch (e) {
            return sendJSON(res, 400, { error: e.message });
        }
    }

    // ---- Static File Serving ----

    let filePath = pathname === '/' ? '/index.html' : pathname;
    filePath = path.join(__dirname, 'public', filePath);

    // Prevent directory traversal
    const publicDir = path.join(__dirname, 'public');
    if (!path.resolve(filePath).startsWith(publicDir)) {
        res.writeHead(403);
        return res.end('Forbidden');
    }

    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/html' });
            return res.end('<h1>404 — Page Not Found</h1>');
        }
        const ext = path.extname(filePath);
        const mime = MIME_TYPES[ext] || 'application/octet-stream';
        res.writeHead(200, { 'Content-Type': mime });
        res.end(data);
    });
}

// Export handler for Vercel serverless
module.exports = handleRequest;

// Only start server when running directly (not imported by Vercel)
if (require.main === module) {
    const PORT = process.env.PORT || 3000;
    const server = http.createServer(handleRequest);
    server.listen(PORT, () => {
        console.log(`Mobile Store server running at http://localhost:${PORT}`);
    });
}
