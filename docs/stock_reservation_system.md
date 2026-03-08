# Stock Reservation System

## Purpose

This document defines the **inventory reservation system** used during checkout to prevent overselling.

Without reservation logic, multiple customers can purchase the same product when only limited stock exists. This leads to inventory corruption and failed orders.

The system must temporarily reserve stock during checkout and release it if payment fails or expires.

---

# Problem Example

Product stock:

```
Product A stock = 1
```

Two customers attempt checkout simultaneously.

Without reservation:

```
User A checkout → success
User B checkout → success
```

Now the system has sold **2 items with stock = 1**.

This must never happen.

---

# Reservation Strategy

When a customer initiates checkout, the system must:

1. Validate available stock.
2. Reserve stock temporarily.
3. Create reservation record.
4. Reduce available stock.
5. Allow payment to proceed.

Reservation remains valid for a limited time.

---

# Reservation Model

Create table:

```
StockReservation
```

Fields:

```
id
productId
variantId
userId
quantity
status
expiresAt
createdAt
```

Status values:

```
ACTIVE
COMPLETED
EXPIRED
CANCELLED
```

---

# Reservation Lifecycle

Stock reservation flow:

```
Checkout initiated
      ↓
Validate stock
      ↓
Create reservation
      ↓
Reduce available stock
      ↓
Wait for payment
```

If payment succeeds:

```
Reservation → COMPLETED
Stock permanently reduced
```

If payment fails or expires:

```
Reservation → EXPIRED
Stock restored
```

---

# Reservation Duration

Reservation expiration time:

```
10 minutes
```

If payment does not complete within this time, the reservation must expire automatically.

---

# Reservation Creation Flow

When the endpoint:

```
POST /payments/create-order/:orderId
```

is called:

Steps:

```
1 Validate cart stock
2 Create StockReservation records
3 Reduce available stock
4 Return Razorpay order
```

Each cart item generates a reservation entry.

---

# Reservation Release

If payment fails or user abandons checkout:

```
StockReservation.status = EXPIRED
```

Stock must be returned to inventory.

Example logic:

```
product.stock += reservedQuantity
```

---

# Reservation Completion

When payment verification succeeds:

```
POST /payments/verify
```

Steps:

```
1 Mark reservations as COMPLETED
2 Convert cart items → OrderItems
3 Finalize stock reduction
```

No stock should be restored.

---

# Expiration Job

A background worker must check for expired reservations.

Schedule:

```
Every 1 minute
```

Job responsibilities:

```
Find reservations where expiresAt < now
Restore stock
Mark reservation EXPIRED
```

---

# Example Reservation Flow

Customer cart:

```
Product A qty = 2
Product B qty = 1
```

System creates:

```
StockReservation
 ├ Product A (2)
 └ Product B (1)
```

Inventory adjusted temporarily.

If payment succeeds:

```
Reservation → COMPLETED
```

If payment fails:

```
Reservation → EXPIRED
Inventory restored
```

---

# Inventory Calculation

Available stock must consider reservations.

Formula:

```
availableStock = product.stock - activeReservations
```

This prevents other users from overselling the product.

---

# Concurrency Safety

Stock reservation must run inside a **database transaction**.

Use:

```
prisma.$transaction()
```

Steps inside transaction:

```
1 Lock product row
2 Validate stock
3 Create reservation
4 Update stock
```

This prevents race conditions.

---

# Reservation Cleanup

Old reservations must be cleaned periodically.

Recommended job:

```
daily cleanup
```

Delete expired reservation records older than:

```
7 days
```

---

# Logging

Every reservation event must log:

```
productId
variantId
userId
quantity
status
timestamp
```

---

# Benefits

The stock reservation system ensures:

* no overselling
* accurate inventory tracking
* safe concurrent checkouts
* stable marketplace operations

This feature is required for **high traffic ecommerce environments**.
