# Project Overview

## Project Name

Multi Vendor Ecommerce Marketplace

## Objective

Build a scalable backend marketplace platform where multiple vendors can register and sell products while customers can browse, purchase, and review products.

The platform should support multiple product categories including:

* clothing
* electronics
* cosmetics
* general merchandise

The system must be flexible enough to allow customization for different marketplaces.

---

# Technology Stack

Backend Framework:
NestJS

Language:
TypeScript

Database:
PostgreSQL

ORM:
Prisma

Payment Gateway:
Razorpay

Authentication:
JWT

Validation:
class-validator

---

# Core System Roles

Admin

Platform administrators who manage the marketplace.

Vendor

Sellers who list and sell products.

Customer

Users who browse and purchase products.

---

# Core Features

Customer Features

* product browsing
* product search
* add to cart
* checkout
* order history
* reviews

Vendor Features

* vendor registration
* product management
* order management
* earnings tracking
* payout requests

Admin Features

* vendor approval
* category management
* order monitoring
* commission management
* payout approvals

---

# Core Business Logic

Platform earns commission from vendor sales.

Example:

Product Price = ₹1000
Platform Commission = 10%
Vendor Earnings = ₹900

---

# System Goals

The system must be:

* modular
* scalable
* secure
* maintainable
* production ready
