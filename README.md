# KilaKitu POS 

A full-featured, web-based Point of Sale system built for **KilaKitu Shop, Nairobi, Kenya**.
Designed for small to medium retail shops managing multiple product categories, staff, inventory and sales reporting — all from a browser.

---

## Screenshots

> Login Page · Dashboard · POS Sales · Inventory · Reports · Products · Settings

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | HTML5, CSS3, Vanilla JavaScript |
| **Backend** | Node.js, Express.js |
| **Database** | MySQL (via XAMPP / phpMyAdmin) |
| **Auth** | JWT (JSON Web Tokens), bcryptjs |
| **Runtime** | Node.js v18+ |

---

## Features

### Point of Sale
- Fast product search and category filtering
- Add to cart, adjust quantities, remove items
- Discount support per transaction
- Payment methods: Cash, M-Pesa, Card, Other
- Automatic change calculation
- Printable receipt per sale
- Keyboard shortcut: `F2` to open payment, `Esc` to close

### Inventory Management
- Real-time stock tracking per product
- Low stock and out-of-stock alerts
- Restock products with notes
- Manual stock adjustment (for stock counts)
- Full stock movement history per product
- Export inventory to CSV

### Reports
- **Daily** — hourly breakdown
- **Weekly** — busiest days, busiest hours, top 3 fastest selling products
- **Monthly** — busiest weeks, top sellers
- **Annual** — busiest months, top sellers
- **Custom Range** — pick any start and end date
- Revenue vs Profit bar chart per period
- Sales by category with profit breakdown
- Payment method breakdown
- Top 10 products by quantity sold
- Full transaction list
- Download as CSV or PDF (print)

### Products
- Add, edit, activate and deactivate products
- Live profit and margin preview when setting prices
- Profit margin badge (green ≥30%, amber ≥15%, red <15%)
- Category management (add/remove categories with colour codes)
- Filter by category, status and search

### Settings
- Edit your own profile (name, email)
- Change password (with automatic logout)
- User management (admin only):
  - Create cashier and admin accounts
  - Activate / deactivate staff accounts

### Dashboard
- Today's sales, weekly and monthly revenue at a glance
- Stock alerts for low and out-of-stock items
- Sales by category performance bars
- Recent transactions list
- Live clock and greeting

---

## Project Structure

```
pos-system/
├── backend/
│   ├── server.js              # Express server entry point
│   ├── db.js                  # MySQL connection pool
│   ├── .env                   # Environment variables (not committed)
│   ├── package.json
│   ├── middleware/
│   │   └── auth.js            # JWT authentication middleware
│   └── routes/
│       ├── auth.js            # Login, users, password
│       ├── categories.js      # Category CRUD
│       ├── products.js        # Product CRUD
│       ├── inventory.js       # Stock management
│       ├── sales.js           # Sales processing
│       └── reports.js         # All report endpoints
│
├── frontend/
│   ├── index.html             # Login page
│   ├── dashboard.html         # Dashboard
│   ├── pos.html               # Point of Sale screen
│   ├── inventory.html         # Inventory management
│   ├── products.html          # Product management
│   ├── reports.html           # Reports
│   ├── settings.html          # Settings
│   ├── stationery.jfif        # Login background image
│   ├── css/
│   │   └── style.css          # Full design system
│   └── js/
│       ├── auth.js            # Auth helpers, apiFetch, shared utils
│       ├── dashboard.js       # Dashboard logic
│       ├── pos.js             # POS logic
│       ├── inventory.js       # Inventory logic
│       ├── products.js        # Products logic
│       ├── reports.js         # Reports logic
│       └── settings.js        # Settings logic
│
└── database/
    ├── schema.sql             # Full database schema + seed data
    └── import_real_data.sql   # Real product data import script
```

---

## Database Schema

| Table | Purpose |
|---|---|
| `users` | Staff accounts with roles (admin, cashier) |
| `categories` | Product categories with colour codes |
| `products` | All products with buying and selling prices |
| `inventory` | Stock levels and low-stock thresholds |
| `inventory_history` | Full audit trail of stock movements |
| `sales` | Sale transactions with payment info |
| `sale_items` | Individual line items per sale |
| `reports_log` | Report generation log |

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- [XAMPP](https://www.apachefriends.org/) (for MySQL)
- A modern browser (Chrome, Edge, Firefox)

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/kilakitu-pos.git
cd kilakitu-pos
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Set Up the Database

1. Open XAMPP and start **Apache** and **MySQL**
2. Go to `http://localhost/phpmyadmin`
3. Create a new database called `kilakitu_pos`
4. Click the **SQL** tab and paste the contents of `database/schema.sql`
5. Click **Go**

### 4. Configure Environment Variables

Inside the `backend/` folder, create a `.env` file:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=kilakitu_pos
JWT_SECRET=your_secret_key_here
PORT=3000
```

> Change `JWT_SECRET` to any long random string.  
> If your MySQL has a password, add it to `DB_PASSWORD`.

### 5. Import Your Products (optional)

If you have products to import:
1. Go to phpMyAdmin → `kilakitu_pos` → SQL tab
2. Paste the contents of `database/import_real_data.sql`
3. Click **Go**

### 6. Start the Server

```bash
cd backend
node server.js
```

You should see:
```
KilaKitu POS running on http://localhost:3000
Database connected successfully
```

### 7. Open the App

Go to `http://localhost:3000` in your browser.

**Default login credentials:**
```
Username: admin
Password: password
```

> Change this password immediately after first login via Settings → Change Password.

---

## Default Admin Setup

After first login:
1. Go to **Settings → Change Password** and set a secure password
2. Go to **Settings → User Management** and create cashier accounts for your staff
3. Go to **Products → Add Product** to set up your product catalogue
4. Go to **Inventory → Restock** to add opening stock quantities

---

## Running on a Local Network

To let other devices (phones, tablets) on the same WiFi access the system:

1. Find your laptop's local IP address:
   - Windows: open Command Prompt → `ipconfig` → look for **IPv4 Address** (e.g. `192.168.1.5`)
2. On any device connected to the same WiFi, open a browser and go to:
   ```
   http://192.168.1.5:3000
   ```
3. They can now log in and use the system from their device.

> Your laptop must be on and the server must be running for this to work.

---

## Design System

| Element | Value |
|---|---|
| Primary colour | Turquoise `#40E0D0` |
| Accent colour | Fuchsia `#D100D1` |
| Background | Dark grey `#2A2A2A` |
| Cards | `#3C3C3C` |
| Sidebar | `#202020` |
| Display font | Cormorant Garamond |
| Body font | Jost |
| Number font | Calibri |

---

## Planned Features

- [ ] Cloud deployment 
- [ ] Offline mode with automatic sync when internet returns
- [ ] Email report delivery (daily/weekly summaries)
- [ ] Excel import for bulk product upload
- [ ] Barcode support (optional)
- [ ] Multi-branch support

---

## License

This project is private and built for KilaKitu Shop, Nairobi, Kenya.  
Not licensed for redistribution.

---

## Built With

Designed and developed with the assistance of [Claude](https://claude.ai) by Anthropic.

---
