# AI Master Prompt — Multi Vendor Ecommerce Backend

## Purpose

This document acts as the **primary instruction set for the AI coding system** used to generate the backend of a **Multi Vendor Ecommerce Marketplace**.

The AI must generate the backend **incrementally and in the correct architectural order**.

The project must be implemented using **NestJS + PostgreSQL + Prisma + Razorpay**.

---

# Project Goal

Build a **production-ready multi vendor ecommerce backend** that supports:

* customer shopping
* vendor product management
* platform commission system
* payment processing
* vendor wallets
* admin marketplace control

The system must support **multiple product categories** and must be adaptable for marketplaces such as:

* clothing
* electronics
* cosmetics
* general goods

---

# Technology Stack

Framework
NestJS

Language
TypeScript

Database
PostgreSQL

ORM
Prisma

Payment Gateway
Razorpay

Authentication
JWT

Validation
class-validator

---

# System Roles

The system must support three roles.

Admin
Vendor
Customer

Admin manages the entire platform.

Vendor manages products and orders.

Customer browses and purchases products.

---

# Core Architecture

The backend must follow a strict layered architecture.

Controller
↓
Service
↓
Repository
↓
Prisma ORM
↓
Database

Controllers must **never interact directly with the database**.

All database interactions must be handled through repositories.

---

# Folder Structure

The backend must follow this structure.

```
src
 ├ config
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

# API Response Format

All API responses must follow a standardized format.

Successful response

```
{
  "success": true,
  "data": {}
}
```

Error response

```
{
  "success": false,
  "message": "Error message"
}
```

---

# Database Design Requirements

The database must support a multi-vendor marketplace.

Required models:

User
Vendor
Category
Product
ProductVariant
Cart
CartItem
Order
VendorOrder
Payment
Review
VendorWallet
PayoutRequest

Relationships must be properly defined.

Example:

User → Vendor
Vendor → Products
Product → Variants
Order → VendorOrders

---

# Vendor Commission System

The platform earns commission from vendor sales.

Example

Product price = ₹1000
Platform commission = 10%
Vendor receives = ₹900

Order records must store:

vendorAmount
commission

---

# Multi Vendor Order Design

Customers may purchase products from multiple vendors in a single cart.

Example cart

Vendor A product
Vendor B product

The system must create

Order
├ VendorOrder A
└ VendorOrder B

Each vendor must only see their own orders.

---

# Payment System

Payment gateway: Razorpay.

Payment flow must follow this process.

Customer checkout
↓
Backend creates Razorpay order
↓
Frontend opens Razorpay checkout
↓
Customer completes payment
↓
Backend verifies payment signature
↓
Order created in database

Important rule:

Never trust frontend payment success.

Payment must always be verified on the backend.

---

# Vendor Wallet System

Vendor earnings must be stored in a wallet system.

Fields:

balance
pendingBalance

Flow

Customer payment
↓
pendingBalance updated
↓
Order delivered
↓
Amount moves to balance

Vendors can request withdrawals.

Admins approve payouts.

---

# Global Security Layers

The system must implement the following global layers.

Auth Guard
Role Guard
Validation Pipe
Exception Filter
Response Interceptor

All routes must be protected appropriately.

---

# Development Order

The AI must generate the backend modules in the following order.

Step 1
Project setup and configuration

Step 2
Prisma schema

Step 3
Authentication module

Step 4
Vendor module

Step 5
Category module

Step 6
Product module

Step 7
Cart module

Step 8
Order module

Step 9
Payment module

Step 10
Wallet module

Step 11
Admin module

The AI must complete each module before generating the next one.

---

# Code Quality Rules

The AI must follow these coding standards.

Use strict TypeScript typing.

Avoid use of `any`.

Use DTO validation for request bodies.

Use dependency injection.

Keep controllers thin and services responsible for business logic.

Use repositories for database interaction.

---

# Logging Requirements

Critical operations must include logging.

Authentication
Order creation
Payment verification
Payout processing

---

# Production Readiness

Before project completion ensure the following.

All modules implemented.

Razorpay webhook verification implemented.

Database migrations complete.

Error handling standardized.

Environment variables configured.

---

# Expected Outcome

After following this instruction set the backend should produce a fully functional **multi vendor ecommerce marketplace backend** with:

* modular architecture
* scalable design
* secure authentication
* vendor marketplace system
* payment integration
* wallet and payout management

The generated system must be suitable for production deployment.
