# Mobile Store — E-Commerce Web Application

## Project Overview

A simple e-commerce web application for selling mobile phones. Users can browse phones, add them to a shopping cart, and complete a purchase with a simulated payment process.

**Tech stack:** Vanilla JavaScript, HTML, CSS, Node.js, SQL (SQLite)

---

## Features

### Customer-Facing
- **Product Catalog** — Browse available phones with images, specs, and prices
- **Search & Filter** — Search phones by name; filter by brand and price range
- **Shopping Cart** — Add/remove items, update quantities, view total
- **Checkout & Payment** — Enter shipping info and card details to place an order
- **Order Confirmation** — Summary page after successful purchase

### Admin
- **Admin Panel** — Add, edit, and delete products (protected by a simple login)

---

## Pages

| Page | Description |
|------|-------------|
| `index.html` | Home page — featured phones and product grid |
| `product.html` | Single product detail page |
| `cart.html` | Shopping cart with item list and totals |
| `checkout.html` | Shipping and payment form |
| `confirmation.html` | Order confirmation summary |
| `admin.html` | Admin panel for managing products |

---

## Database (SQLite)

### Tables

**products**
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER PRIMARY KEY | Auto-increment ID |
| name | TEXT | Phone name |
| brand | TEXT | Brand (e.g. Samsung, Apple) |
| price | REAL | Price in USD |
| description | TEXT | Short description |
| image | TEXT | Image filename |
| stock | INTEGER | Units in stock |

**orders**
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER PRIMARY KEY | Auto-increment ID |
| customer_name | TEXT | Full name |
| email | TEXT | Email address |
| address | TEXT | Shipping address |
| total | REAL | Order total |
| payment_method | TEXT | Card type (Visa, MasterCard, etc.) |
| card_last_four | TEXT | Last 4 digits of card |
| status | TEXT | pending / completed |
| created_at | TEXT | Timestamp |

**order_items**
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER PRIMARY KEY | Auto-increment ID |
| order_id | INTEGER | FK → orders.id |
| product_id | INTEGER | FK → products.id |
| quantity | INTEGER | Number of units |
| price | REAL | Price at time of purchase |

**admin_users**
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER PRIMARY KEY | Auto-increment ID |
| username | TEXT | Admin username |
| password | TEXT | Hashed password |

---

## Project Structure

```
mobile-eccomerce/
├── server.js              # Node.js backend (Express-free, uses built-in http module)
├── database.js            # SQLite setup and queries
├── package.json
├── README.md
├── db/
│   └── store.db           # SQLite database file (auto-created)
├── public/
│   ├── index.html         # Home page
│   ├── product.html       # Product detail page
│   ├── cart.html          # Shopping cart
│   ├── checkout.html      # Checkout & payment
│   ├── confirmation.html  # Order confirmation
│   ├── admin.html         # Admin panel
│   ├── css/
│   │   └── style.css      # All styles
│   ├── js/
│   │   ├── app.js         # Home page logic
│   │   ├── product.js     # Product detail logic
│   │   ├── cart.js        # Cart logic
│   │   ├── checkout.js    # Checkout & payment logic
│   │   └── admin.js       # Admin panel logic
│   └── images/            # Phone images
└── sql/
    └── schema.sql         # Database schema creation script
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List all products (supports `?brand=` and `?search=` query params) |
| GET | `/api/products/:id` | Get single product |
| POST | `/api/products` | Add product (admin) |
| PUT | `/api/products/:id` | Update product (admin) |
| DELETE | `/api/products/:id` | Delete product (admin) |
| POST | `/api/orders` | Place an order (with payment info) |
| GET | `/api/orders/:id` | Get order details |
| POST | `/api/admin/login` | Admin login |

---

## Payment Flow (Simulated)

1. User fills in shipping details on the checkout page
2. User enters card information (card number, expiry, CVV)
3. Client-side validation checks card format
4. On submit, the order is saved to the database with `status: "completed"`
5. A confirmation page is shown with the order summary

> **Note:** This is a simulated payment for a school project. No real payment gateway is used. Card numbers are validated for format only, and only the last 4 digits are stored.

---

## How to Run

```bash
# 1. Install dependencies
npm install

# 2. Start the server
node server.js

# 3. Open in browser
# http://localhost:3000
```

---

## Dependencies

- **better-sqlite3** — SQLite driver for Node.js (the only external dependency)

---

## Notes

- No frameworks used — vanilla HTML/CSS/JavaScript on the frontend, plain Node.js `http` module on the backend
- Cart data is stored in `localStorage` on the client side
- Passwords are hashed with Node.js built-in `crypto` module
- This is a school project — the payment system is for demonstration purposes only
