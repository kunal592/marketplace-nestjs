# Multi-Vendor Ecommerce Marketplace Backend

Production-ready **Multi-Vendor Ecommerce Marketplace Backend** built with **NestJS, PostgreSQL, Prisma, and Razorpay**.
The platform allows multiple vendors to sell products while customers browse, purchase, and review items.
It is designed with **scalable architecture, modular modules, and secure payment handling**.

This project follows **production engineering practices** including layered architecture, DTO validation, guards, interceptors, centralized error handling, and modular services.

---

# 🚀 Features

## Customer Features

* Browse products
* Category based filtering
* Product variants
* Add to cart
* Checkout system
* Order history
* Product reviews

## Vendor Features

* Vendor registration
* Store profile management
* Product management
* Inventory tracking
* Vendor orders dashboard
* Earnings tracking
* Payout requests

## Admin Features

* Vendor approval system
* Category management
* Product moderation
* Order monitoring
* Commission management
* Payout approvals
* Marketplace analytics

---

# 🧠 Architecture

The project follows a **layered architecture**:

```
Controller
   ↓
Service
   ↓
Repository
   ↓
Prisma ORM
   ↓
Database
```

Controllers handle requests
Services contain business logic
Repositories interact with the database

This architecture ensures **maintainability and scalability**.

---

# 🏗️ Tech Stack

Backend Framework
NestJS

Language
TypeScript

Database
PostgreSQL

ORM
Prisma

Authentication
JWT + Passport

Payment Gateway
Razorpay

Validation
class-validator

Infrastructure (recommended)

* Redis
* Docker
* AWS / DigitalOcean

---

# 📁 Project Structure

```
src
│
├ config
│
├ common
│   ├ guards
│   ├ decorators
│   ├ filters
│   ├ interceptors
│   ├ pipes
│   └ constants
│
├ helpers
├ utils
├ database
│
├ modules
│   ├ auth
│   ├ users
│   ├ vendors
│   ├ products
│   ├ categories
│   ├ cart
│   ├ orders
│   ├ payments
│   ├ wallets
│   ├ payouts
│   └ reviews
│
└ shared
```

---

# 🗄️ Database Design

Core models:

* User
* Vendor
* Category
* Product
* ProductVariant
* Cart
* CartItem
* Order
* VendorOrder
* Payment
* Review
* VendorWallet
* PayoutRequest

Example order structure:

```
Order
 ├ VendorOrder (Vendor A)
 └ VendorOrder (Vendor B)
```

This enables **multi-vendor checkout support**.

---

# 💳 Payment Integration

Payment gateway used:

**Razorpay**

Payment flow:

```
Customer checkout
      ↓
Backend creates Razorpay order
      ↓
Customer completes payment
      ↓
Backend verifies signature
      ↓
Order created in database
```

⚠️ Important
Payment verification always happens on the **backend**.

---

# 💰 Vendor Commission System

Example:

```
Product price = ₹1000
Platform commission = 10%
Vendor earnings = ₹900
```

Orders store:

* vendorAmount
* commission

---

# 🧾 Vendor Wallet System

Vendor earnings are stored in a wallet.

Flow:

```
Customer payment
      ↓
pendingBalance updated
      ↓
Order delivered
      ↓
balance updated
```

Vendors can request withdrawals.

Admins approve payouts.

---

# 🔐 Security

Security practices implemented:

* JWT authentication
* Role based access control
* DTO request validation
* Global exception filters
* Response interceptors
* Password hashing with bcrypt

Roles supported:

```
ADMIN
VENDOR
CUSTOMER
```

---

# ⚙️ Environment Variables

Example `.env` configuration:

```
PORT=5000

DATABASE_URL=postgresql://user:pass@localhost:5432/marketplace

JWT_SECRET=supersecret
JWT_EXPIRES=7d

RAZORPAY_KEY_ID=xxxx
RAZORPAY_SECRET=xxxx
```

---

# 📦 Installation

Clone the repository

```
git clone https://github.com/your-username/marketplace-nestjs.git
```

Install dependencies

```
npm install
```

---

# 🗄️ Setup Database

Run Prisma migrations

```
npx prisma migrate dev
```

Generate Prisma client

```
npx prisma generate
```

---

# ▶️ Run Development Server

```
npm run start:dev
```

Server will start at:

```
http://localhost:5000
```

---

# 📚 Documentation

Project documentation is stored in:

```
docs/
```

Important docs include:

* Architecture design
* API routes
* Database schema
* Order flow
* AI coding prompts

---

# 🧪 Testing

Recommended testing types:

* Unit tests
* Service tests
* Integration tests

Critical areas:

* authentication
* order creation
* payment verification
* wallet updates

---

# 🚀 Production Deployment

Recommended stack:

Backend server
NestJS

Database
PostgreSQL

Storage
AWS S3 / Cloudinary

Infrastructure
Docker + Nginx

Monitoring recommended for:

* API errors
* payment failures
* order processing

---

# 📌 Roadmap

Future improvements may include:

* Redis caching
* Elasticsearch product search
* AI product recommendations
* notification system
* vendor analytics dashboard

---

# 👨‍💻 Author

Kunal Daharwal
MERN Developer & Machine Learning Engineer

---

# 📄 License

This project is licensed under the **MIT License**.
