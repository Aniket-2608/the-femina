# THE FEMINA EXCLUSIVE
> **High-Performance Luxury Female Fashion E-Commerce Platform & Enterprise Admin CRM / ERP**

A complete, production-grade MERN stack solution architected specifically for **The Femina Exclusive** luxury female fashion brand (Sarees, Lehengas, Anarkalis, Kurtis, and Gowns).

---

## 💎 Key Platform Features

### 🛍️ 1. Customer-Facing Storefront
- **Luxury Fashion Aesthetic:** Curated color palette (Rose Gold, Deep Maroon, Gold Shimmer gradients), Playfair Display typography, responsive glassmorphism, and micro-animations.
- **Cinematic Promotional Video:** Hero background showcase with live sound toggle, poster fallback, and headline banners.
- **Faceted Discovery Engine:** Dynamic multi-attribute filtering by **Fabric** (*Banarasi Silk, Chanderi, Georgette, Velvet, Organza*), **Occasion** (*Bridal, Festive, Cocktail, Royal Gala*), **Craft/Work Type** (*Zari, Zardozi, Chikankari, Gotta Patti, Mirror Work*), Color, and Price Range.
- **Rich Product Detail (PDP):**
  - High-resolution zoom gallery and view angles.
  - Multi-dimensional variant matrix (Color & Size selectors) with live inventory indicators.
  - Interactive Size Guide with centimeter/inch dimensions.
  - Craftsmanship and Fabric Wash Care accordion guides.
- **Guest Shopping & Persistent Carts:** Add items to cart as a guest (stored in `localStorage`), with automated consolidation upon sign-in.
- **Frictionless Authentication with Dual OTP:**
  - Email verification (6-digit OTP).
  - Phone verification (SMS OTP simulation with developer console preview).
- **Secure Checkout & Server-Verified Razorpay Payments:**
  - Saved multi-address manager.
  - Zero-frontend price trust: backend recalculates every item price, tax, and shipping from database records.
  - Atomic stock reservation (`$inc` condition) during checkout to prevent overselling.
  - Razorpay standard popup with cryptographic HMAC-SHA256 signature verification.
- **Business-Driven Order Flow:**
  - Mandatory **No-Returns Policy** acknowledgement.
  - Official business fulfillment stages (`PAID` → `CONFIRMED` → `PROCESSING` → `PACKED` → `SHIPPED` → `DELIVERED`).
  - Printable boutique invoice / packing slip with customer concierge direct WhatsApp link.
- **Physical Boutiques & Brand Story:** Interactive branch locator with opening hours and Google Maps links.

---

### 👑 2. Enterprise Admin CRM & ERP Portal
- **Executive BI Dashboard:**
  - Real-time Gross Revenue, Total Orders, Active Customers, and Low Stock Alerts.
  - **Live Accounting P&L Statement:** $\text{Gross Sales} - \text{COGS} - \text{Operating Expenses} = \text{Net EBITDA}$.
  - Current Inventory Valuation at cost and selling value.
- **Article & Master Product Data Management:**
  - Multi-variant SKU generation (`TFE-2026-CAT-COL-SZ`).
  - Cost price, selling price, compare-at price, and margin calculation.
  - Low-stock threshold triggers.
- **Immutable Inventory Movement Ledger:**
  - Append-only transaction log tracking `PURCHASE_INWARD`, `ORDER_RESERVATION`, `ORDER_FULFILLMENT`, `DAMAGE_WRITE_OFF`, and `AUDIT_ADJUSTMENT`.
  - Manual audit adjustment modal with mandatory reason logging.
- **Order Processing & Fulfillment Workflow:**
  - Stage transitions with audit notes.
  - Item detail inspections with color/size/SKU breakdown.
  - Direct printable packing slips.
- **Artisan, Weaver & Vendor Management:**
  - Master supplier registry categorized by craft cluster (e.g. Varanasi Silk Guild, Surat Georgette Hub).
  - Purchase Order (PO) Stock Inward flow that automatically updates stock and recalculates cost prices.
- **Accounting & Expense Ledger:**
  - Record operational overheads across Salary, Rent, Marketing, Velvet Packaging, Freight, and Maintenance.
- **Customer Directory & LTV Analytics:**
  - Patron directory with verified badges, order count, and lifetime value (LTV).
- **Storefront Content CMS:**
  - Live editing of Hero video MP4 URL, poster image, promotional slogans, and policy terms.
- **Tamper-Evident Audit Trail:**
  - Detailed system activity log capturing staff actions, entity IDs, IP addresses, and JSON payloads.
- **Granular RBAC:**
  - `super_admin`, `inventory_manager`, `sales_manager`, `accountant`, `content_manager`.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, TypeScript, Vite, React Router v6, Redux Toolkit, RTK Query, Tailwind CSS, Lucide Icons |
| **Backend** | Node.js, Express, TypeScript, Mongoose ODM, Zod, JWT, bcryptjs, Razorpay SDK, Nodemailer |
| **Database** | MongoDB (Replica Set / Atlas / Local) |
| **Styling** | Custom Luxury Design System (`Playfair Display`, `Montserrat`, Gold gradients, Glassmorphism) |

---

## 🚀 Quickstart Guide

### Prerequisites
- Node.js 18+ and npm
- MongoDB running locally on `mongodb://127.0.0.1:27017/the-femina` (or MongoDB Atlas URI in `.env`)

### 1. Install Dependencies
In the root directory:
```bash
npm install
```

### 2. Configure Environment Variables
Create `server/.env` (a template is pre-configured):
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb://127.0.0.1:27017/the-femina
JWT_SECRET=super_secret_femina_jwt_access_key_2026_luxury
JWT_REFRESH_SECRET=super_secret_femina_jwt_refresh_key_2026_luxury
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
RAZORPAY_KEY_ID=rzp_test_luxury_femina
RAZORPAY_KEY_SECRET=rzp_test_secret_luxury_femina
EMAIL_HOST=smtp.mailtrap.io
EMAIL_PORT=2525
EMAIL_USER=test_user
EMAIL_PASS=test_pass
EMAIL_FROM="The Femina Exclusive <concierge@thefeminaexclusive.com>"
```

### 3. Seed the Luxury Catalog & Staff Accounts
```bash
npm run seed
```
This populates:
- 5 Core Categories (*Sarees, Lehengas, Anarkalis, Kurtis, Gowns*)
- Master Fabrics (*Banarasi Silk, Chanderi, Georgette, Organza, Velvet*)
- Occasions (*Bridal, Festive, Royal Gala, Cocktail*)
- 8 Luxury Master Ensembles with multi-variant matrices (Color/Size/SKUs)
- Suppliers, Sample Expenses, Boutique Locations & Staff Accounts

### 4. Run Development Servers
```bash
npm run dev
```
- **Customer Storefront:** `http://localhost:5173`
- **Admin CRM Portal:** `http://localhost:5173/admin`
- **API Server:** `http://localhost:5000/api/v1`

---

## 🔐 Default Staff & Demo Credentials

| Role | Email | Password | Access Area |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@thefeminaexclusive.com` | `Femina@2026` | Full Platform & CRM Access |
| **Inventory Manager** | `inventory@thefeminaexclusive.com` | `Femina@2026` | Products, Stock Ledger, Inward POs |
| **Accountant** | `accounts@thefeminaexclusive.com` | `Femina@2026` | P&L Reports, Expenses, Valuation |
| **Customer** | `customer@femina.com` | `Femina@2026` | Storefront Shopping & Order Portal |

*(Note: During development OTP testing, OTP codes are logged in the backend terminal and returned in the development JSON response for fast verification).*

---

## 🏛️ Project Structure

```
the-femina/
├── package.json               # Monorepo workspaces configuration
├── ARCHITECTURE_BLUEPRINT.md  # Comprehensive system design specification
├── server/                    # Node.js + Express + TypeScript Backend
│   ├── src/
│   │   ├── config/            # DB, Razorpay, Mailer, Env configs
│   │   ├── constants/         # Roles, Order Stages, Taxonomy constants
│   │   ├── middlewares/       # Auth, RBAC, Zod validation, Error handlers
│   │   ├── models/            # Mongoose Schemas (13 entities)
│   │   ├── modules/           # Auth, Products, Checkout, Payments, Orders, Admin, Content
│   │   ├── scripts/           # Master database seed script
│   │   ├── utils/             # Token utils, OTP generators, Mailer
│   │   ├── app.ts
│   │   └── server.ts
│   └── tsconfig.json
│
└── client/                    # Vite + React 18 + TypeScript Frontend
    ├── src/
    │   ├── components/
    │   │   ├── auth/          # Dual OTP Modal, Sign-in, Register
    │   │   ├── common/        # Button, Badge, PriceDisplay, ToastContainer, SearchOverlay
    │   │   ├── display/       # ProductCard, VideoPlayer, ZoomGallery
    │   │   └── layout/        # Navbar, Footer, CartDrawer
    │   ├── features/
    │   │   ├── customer/      # Home, Shop, PDP, Checkout, Confirmation, Orders, Profile, Branches
    │   │   └── admin/         # Dashboard, Products, Inventory, Orders, Accounting, Vendors, Content, Audit
    │   ├── store/             # Redux Store, RTK Query API slices, Cart & Auth slices
    │   ├── types/             # Shared TypeScript domain interfaces
    │   ├── App.tsx            # Protected routing & layout shell
    │   └── main.tsx
    ├── tailwind.config.js     # Rose gold, deep maroon & luxury theme tokens
    └── vite.config.ts
```

---

## 🛡️ License & Copyright
© 2026 **The Femina Exclusive**. All rights reserved. Built with precision for luxury fashion e-commerce.
