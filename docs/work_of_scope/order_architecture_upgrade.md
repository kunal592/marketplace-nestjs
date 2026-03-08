# Order Architecture Upgrade

## Purpose

This document defines the **scalable order architecture** required for the marketplace system.

The original design stored items directly in orders.
This approach becomes problematic for large orders and multi-vendor logic.

Instead we implement a **3-layer order structure**.

Order
↓
VendorOrder
↓
OrderItem

This structure is used in **large ecommerce platforms** because it simplifies:

* vendor separation
* refunds
* shipping
* commission tracking
* analytics

---

# Order Structure

```
Order
 ├ VendorOrder A
 │    ├ OrderItem
 │    ├ OrderItem
 │
 └ VendorOrder B
      ├ OrderItem
```

Each vendor only interacts with **their own VendorOrder**.

---

# Order Model

Represents the parent order created by the customer.

Fields:

```
Order
id
userId
totalAmount
paymentStatus
orderStatus
createdAt
updatedAt
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
COMPLETED
CANCELLED
```

---

# VendorOrder Model

Each vendor receives their own order.

Fields:

```
VendorOrder
id
orderId
vendorId
vendorAmount
commission
status
createdAt
```

Status:

```
PENDING
PROCESSING
SHIPPED
DELIVERED
CANCELLED
```

When a vendor marks:

```
DELIVERED
```

The vendor wallet must update.

---

# OrderItem Model

Represents a single product purchased.

Fields:

```
OrderItem
id
vendorOrderId
productId
variantId
quantity
price
total
```

This model stores **snapshot data**.

Example:

If a product price changes later, the order record remains accurate.

---

# Order Creation Flow

Checkout process must follow this sequence.

```
Customer checkout
       ↓
Validate cart items
       ↓
Create Order
       ↓
Group items by vendor
       ↓
Create VendorOrders
       ↓
Create OrderItems
       ↓
Calculate commissions
       ↓
Update vendor pendingBalance
       ↓
Clear cart
```

---

# Transaction Requirement

Order creation must run inside a **database transaction**.

Example:

```
prisma.$transaction()
```

Steps inside transaction:

* create order
* create vendor orders
* create order items
* update vendor wallets
* clear cart

If any step fails the transaction must roll back.

---

# Refund Handling

Refund must operate at the **VendorOrder level**.

Example:

```
VendorOrder refunded
 ↓
wallet adjustment
 ↓
order status update
```

This prevents refund conflicts between vendors.

---

# Vendor Dashboard

Vendor endpoints must operate only on VendorOrders.

Example:

```
GET /vendor-orders
PATCH /vendor-orders/:id/status
```

Vendors must never access the parent Order directly.
