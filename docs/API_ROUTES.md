# API Routes – Multi Vendor Marketplace

## Overview

This document lists the major API endpoints used in the marketplace system.

All responses follow a standardized format.

Example response:

```
{
  "success": true,
  "data": {}
}
```

---

# Authentication

Base route:

```
/auth
```

Endpoints:

### Register Customer

```
POST /auth/register
```

### Login

```
POST /auth/login
```

### Get Current User

```
GET /auth/me
```

---

# Vendor APIs

Base route:

```
/vendors
```

### Vendor Registration

```
POST /vendors/register
```

### Get Vendor Profile

```
GET /vendors/profile
```

### Update Vendor Store

```
PATCH /vendors/profile
```

---

# Product APIs

Base route:

```
/products
```

### Create Product

```
POST /products
```

Vendor only.

---

### Get All Products

```
GET /products
```

Supports:

* pagination
* filters
* search

---

### Get Product By Slug

```
GET /products/:slug
```

---

### Update Product

```
PATCH /products/:id
```

---

### Delete Product

```
DELETE /products/:id
```

---

# Category APIs

```
GET /categories
POST /categories
PATCH /categories/:id
DELETE /categories/:id
```

Admin only for mutations.

---

# Cart APIs

Base route:

```
/cart
```

### Get Cart

```
GET /cart
```

### Add Item

```
POST /cart/items
```

### Update Quantity

```
PATCH /cart/items/:id
```

### Remove Item

```
DELETE /cart/items/:id
```

---

# Order APIs

Base route:

```
/orders
```

### Create Order

```
POST /orders
```

### Get My Orders

```
GET /orders/my
```

### Get Order Details

```
GET /orders/:id
```

---

# Vendor Orders

Vendor-specific orders.

```
GET /vendor-orders
```

---

# Payment APIs

Base route:

```
/payments
```

### Create Razorpay Order

```
POST /payments/create-order
```

### Verify Payment

```
POST /payments/verify
```

### Razorpay Webhook

```
POST /payments/webhook
```

---

# Reviews

```
POST /reviews
GET /products/:id/reviews
```

---

# Vendor Wallet

```
GET /wallet
```

---

# Payouts

### Request Payout

```
POST /payouts/request
```

### Get Vendor Payouts

```
GET /payouts
```

---

# Admin APIs

Admin routes:

```
/admin
```

Examples:

```
GET /admin/vendors
PATCH /admin/vendors/:id/approve
GET /admin/orders
GET /admin/analytics
```
