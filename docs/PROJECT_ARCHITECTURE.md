# Multi-Vendor Ecommerce Marketplace (NestJS)

## Overview

This project is a **production-grade multi-vendor ecommerce platform** built using **NestJS**.
The platform allows multiple vendors to sell products through a centralized marketplace while the platform manages orders, payments, commissions, and vendor payouts.

The system is designed to be:

* Modular
* Scalable
* Maintainable
* Secure
* Extensible for future marketplace features

The backend follows a **layered architecture** with clear separation of responsibilities.

---

# System Goals

The marketplace must support:

* Multiple vendors selling products
* Customer product browsing and checkout
* Platform commission system
* Razorpay payment integration
* Vendor wallet and payout system
* Admin marketplace management

---

# Technology Stack

## Backend

* NestJS
* TypeScript
* Node.js

## Database

* PostgreSQL (via Prisma ORM)

## Authentication

* JWT (JSON Web Token)
* Passport

## Payments

* Razorpay

## Validation

* class-validator
* class-transformer

## Security

* Guards
* Role-based access control

## Future Infrastructure

* Redis (caching)
* BullMQ (background jobs)
* AWS S3 / Cloudinary (media storage)
* Winston (logging)

---

# Architecture Overview

The project follows a **modular layered architecture**.

High-level structure:

```
Controller
    ↓
Service
    ↓
Repository
    ↓
Database
```

Additional global layers:

* Guards
* Interceptors
* Exception Filters
* Helpers
* Utilities
* Configurations

---

# Project Folder Structure

```
src
│
├── main.ts
├── app.module.ts
│
├── config
├── common
├── helpers
├── utils
├── database
├── modules
└── shared
```

Each directory serves a specific architectural purpose.

---

# Config Layer

Location:

```
src/config
```

The config layer centralizes **all environment and service configuration**.

## Responsibilities

* Environment variable loading
* Razorpay credentials
* JWT configuration
* Database configuration

Example structure:

```
config
 ├── env.config.ts
 ├── razorpay.config.ts
 └── database.config.ts
```

Example configuration:

```ts
export default () => ({
  port: process.env.PORT,

  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES,
  },

  razorpay: {
    key: process.env.RAZORPAY_KEY_ID,
    secret: process.env.RAZORPAY_SECRET,
  }
})
```

---

# Common Layer

Location:

```
src/common
```

This folder contains **global application utilities and framework-level features**.

Structure:

```
common
 ├── guards
 ├── decorators
 ├── filters
 ├── interceptors
 ├── pipes
 └── constants
```

---

# Guards

Guards control **route access permissions**.

Location:

```
common/guards
```

Examples:

* Auth Guard
* Roles Guard

Responsibilities:

* Verify authentication tokens
* Restrict access to specific roles

Example usage:

```
@UseGuards(AuthGuard, RolesGuard)
@Roles('admin')
```

---

# Decorators

Decorators provide reusable metadata utilities.

Location:

```
common/decorators
```

Examples:

* Roles decorator
* Current user decorator

Example:

```ts
@Roles('admin')
```

---

# Filters (Global Error Handling)

Location:

```
common/filters
```

Purpose:

Provide **centralized exception handling** across the application.

Responsibilities:

* Standardize error responses
* Catch HTTP exceptions
* Prevent leaking sensitive error data

Example response format:

```
{
  success: false,
  message: "Unauthorized"
}
```

---

# Interceptors

Location:

```
common/interceptors
```

Purpose:

Modify request/response lifecycle.

Primary use:

* Standardize API responses

Example response format:

```
{
  success: true,
  data: {}
}
```

---

# Pipes

Location:

```
common/pipes
```

Purpose:

Validate and transform incoming request data.

Example:

Global validation pipe using:

* class-validator
* class-transformer

Features:

* DTO validation
* automatic type conversion
* whitelist filtering

---

# Constants

Location:

```
common/constants
```

Stores reusable application constants.

Example:

Roles enum:

```
ADMIN
VENDOR
CUSTOMER
```

---

# Helpers Layer

Location:

```
src/helpers
```

Helpers contain **reusable business logic utilities**.

Examples:

```
helpers
 ├── hash.helper.ts
 ├── jwt.helper.ts
 └── payment.helper.ts
```

Responsibilities:

* Password hashing
* JWT token generation
* Razorpay signature verification

Example:

```
hashPassword()
comparePassword()
generateToken()
verifyPaymentSignature()
```

---

# Utils Layer

Location:

```
src/utils
```

Utils contain **small generic reusable functions**.

Examples:

```
utils
 ├── slug.util.ts
 ├── pagination.util.ts
 └── date.util.ts
```

Responsibilities:

* slug generation
* pagination calculation
* formatting utilities

Example:

```
generateSlug("Red Shirt")
→ red-shirt
```

---

# Database Layer

Location:

```
src/database
```

The database layer manages **database connection and ORM configuration**.

We use:

* PostgreSQL
* Prisma ORM

Structure:

```
database
 ├── prisma.module.ts
 └── prisma.service.ts
```

Responsibilities:

* database connection
* Prisma client access
* transaction management

---

# Modules Layer

Location:

```
src/modules
```

Each business domain is implemented as a **NestJS module**.

Structure:

```
modules
 ├── auth
 ├── users
 ├── vendors
 ├── products
 ├── categories
 ├── cart
 ├── orders
 ├── payments
 ├── wallets
 ├── payouts
 └── reviews
```

Each module follows a standard structure.

---

# Module Structure

Example: Products module

```
products
 ├── controllers
 ├── services
 ├── repositories
 ├── dto
 ├── schemas
 └── products.module.ts
```

Responsibilities:

Controllers
Handle HTTP requests.

Services
Contain business logic.

Repositories
Interact with database.

DTOs
Validate request payloads.

Schemas / Entities
Define database models.

---

# Authentication System

Roles supported:

* Admin
* Vendor
* Customer

Authentication flow:

```
Register
    ↓
Login
    ↓
JWT Token Issued
    ↓
Protected Routes
```

Security features:

* JWT authentication
* Role-based authorization
* Password hashing with bcrypt

---

# Payment System

Payment gateway:

Razorpay

Payment flow:

```
Customer Checkout
        ↓
Create Razorpay Order
        ↓
Customer Payment
        ↓
Razorpay Webhook
        ↓
Order Confirmation
```

Important rules:

* Always verify payment via Razorpay signature
* Never trust frontend payment success

---

# Order System

Orders support **multi-vendor checkout**.

Example cart:

```
Vendor A product
Vendor B product
```

Order structure:

```
Order
 ├── VendorOrder A
 └── VendorOrder B
```

This allows vendors to manage only their own orders.

---

# Vendor Wallet System

Vendor earnings are stored in a wallet.

Flow:

```
Customer Payment
      ↓
Order Completed
      ↓
Vendor Pending Balance
      ↓
Delivery Confirmed
      ↓
Withdrawable Balance
      ↓
Vendor Withdrawal Request
      ↓
Admin Approval
```

---

# Security Practices

The project follows multiple security best practices.

* JWT authentication
* Password hashing
* Role-based access control
* Input validation
* Global exception filters
* Standardized responses

Future improvements:

* Rate limiting
* API throttling
* Audit logging

---

# Environment Variables

Example `.env` configuration:

```
PORT=5000

JWT_SECRET=supersecret
JWT_EXPIRES=7d

DATABASE_URL=postgresql://user:pass@localhost:5432/marketplace

RAZORPAY_KEY_ID=xxxx
RAZORPAY_SECRET=xxxx
```

Environment variables must never be committed to Git.

---

# Future Enhancements

The architecture allows adding future marketplace features.

Possible additions:

* Redis caching
* Background jobs with BullMQ
* Product search with Elasticsearch
* CDN image delivery
* Recommendation system
* Vendor analytics
* Notification system

---

# Development Principles

The project follows these development principles:

1. Modular architecture
2. Separation of concerns
3. Reusable utilities
4. Centralized configuration
5. Standardized error handling
6. Production-grade security practices

---

# Conclusion

This architecture provides a **scalable foundation for a multi-vendor ecommerce marketplace** built with NestJS.

It ensures:

* clean architecture
* maintainable code
* scalable feature growth
* secure payment processing

This foundation will support building the following core marketplace systems:

* authentication
* vendor management
* product catalog
* cart and checkout
* Razorpay payments
* order management
* vendor wallets
* payouts
