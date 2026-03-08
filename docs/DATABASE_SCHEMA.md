# Database Schema – Multi Vendor Ecommerce

## Overview

This document describes the **database structure** used in the marketplace platform.

The database is designed to support:

* Multiple vendors
* Multiple product categories
* Product variants
* Multi-vendor orders
* Vendor wallets
* Platform commissions
* Payment tracking

The recommended database is **PostgreSQL with Prisma ORM**.

---

# Core Entities

Main system entities:

* Users
* Vendors
* Categories
* Products
* Product Variants
* Cart
* Orders
* Vendor Orders
* Payments
* Reviews
* Vendor Wallet
* Payout Requests

---

# Users Table

Represents all platform users.

Roles supported:

* Admin
* Vendor
* Customer

Fields:

```id="user_schema"
User
id
name
email
password
role
phone
createdAt
updatedAt
```

Role values:

```
ADMIN
VENDOR
CUSTOMER
```

---

# Vendors Table

Stores vendor store information.

```id="vendor_schema"
Vendor
id
userId
storeName
storeSlug
storeLogo
description
status
rating
createdAt
```

Vendor status:

```
PENDING
APPROVED
REJECTED
```

Relationship:

```
User → Vendor (1:1)
```

---

# Categories Table

Used for product classification.

Supports nested categories.

Example:

```
Electronics
 ├ Phones
 └ Laptops
```

Structure:

```id="category_schema"
Category
id
name
slug
parentId
createdAt
```

---

# Products Table

Stores product data created by vendors.

```id="product_schema"
Product
id
vendorId
categoryId
name
slug
description
price
discountPrice
stock
status
rating
createdAt
```

Product status:

```
ACTIVE
INACTIVE
OUT_OF_STOCK
```

---

# Product Variants

Supports product variations like:

* size
* color
* storage
* RAM

Example:

```
T-Shirt
Size: S, M, L
Color: Red, Blue
```

Structure:

```id="variant_schema"
ProductVariant
id
productId
sku
price
stock
attributes
```

Example attributes JSON:

```
{
  "size": "M",
  "color": "Blue"
}
```

---

# Cart Table

Stores user cart items.

```id="cart_schema"
Cart
id
userId
createdAt
```

Cart items:

```id="cart_item_schema"
CartItem
id
cartId
productId
variantId
quantity
```

---

# Orders Table

Main order record.

Supports multi-vendor purchases.

```id="order_schema"
Order
id
userId
totalAmount
paymentStatus
orderStatus
createdAt
```

Payment status:

```
PENDING
PAID
FAILED
REFUNDED
```

Order status:

```
CREATED
PROCESSING
SHIPPED
DELIVERED
CANCELLED
```

---

# Vendor Orders

Each vendor receives their own order record.

Example:

Customer order:

```
Order
 ├ VendorOrder (Vendor A)
 └ VendorOrder (Vendor B)
```

Structure:

```id="vendor_order_schema"
VendorOrder
id
orderId
vendorId
status
vendorAmount
commission
createdAt
```

---

# Payments Table

Stores Razorpay transaction data.

```id="payment_schema"
Payment
id
orderId
razorpayOrderId
razorpayPaymentId
amount
currency
status
createdAt
```

---

# Reviews Table

Customers can review products.

```id="review_schema"
Review
id
userId
productId
rating
comment
createdAt
```

---

# Vendor Wallet

Tracks vendor earnings.

```id="wallet_schema"
VendorWallet
id
vendorId
balance
pendingBalance
updatedAt
```

Balance meaning:

```
balance → withdrawable
pendingBalance → waiting for delivery completion
```

---

# Payout Requests

Vendors request withdrawals.

```id="payout_schema"
PayoutRequest
id
vendorId
amount
status
requestedAt
processedAt
```

Status:

```
PENDING
APPROVED
REJECTED
COMPLETED
```

---

# Database Relationships

Overview:

```
User → Vendor
Vendor → Products
Category → Products
Product → Variants
User → Orders
Order → VendorOrders
Vendor → Wallet
Vendor → PayoutRequests
Product → Reviews
```

---

# Notes

Important design decisions:

* Orders split per vendor
* Product attributes stored as JSON
* Vendor wallet used for payout tracking
* Payments verified via Razorpay webhook
