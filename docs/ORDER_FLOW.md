# Order & Payment Flow

## Overview

This document explains the **checkout and payment lifecycle** for the marketplace.

The system supports:

* Multi-vendor orders
* Razorpay payments
* Commission tracking
* Vendor earnings

---

# Checkout Flow

Step-by-step order creation process.

```
Customer adds products to cart
        ↓
Customer opens checkout page
        ↓
Backend calculates order total
        ↓
Backend creates Razorpay order
        ↓
Customer completes payment
        ↓
Razorpay webhook confirms payment
        ↓
Order created in database
        ↓
Vendor orders generated
        ↓
Vendor wallet updated
```

---

# Multi Vendor Cart Example

Customer cart:

```
Vendor A → Product ₹500
Vendor B → Product ₹300
```

Order created:

```
Order
 ├ VendorOrder A
 └ VendorOrder B
```

---

# Payment Flow

```
Client requests checkout
       ↓
Server creates Razorpay order
       ↓
Client opens Razorpay checkout
       ↓
Customer pays
       ↓
Razorpay returns paymentId
       ↓
Backend verifies signature
       ↓
Order stored in database
```

---

# Razorpay Webhook

Webhook ensures payment authenticity.

Important events:

```
payment.captured
payment.failed
refund.created
```

Webhook endpoint:

```
POST /payments/webhook
```

---

# Commission Calculation

Example:

```
Product price = ₹1000
Platform commission = 10%
Vendor earnings = ₹900
```

Order stores:

```
vendorAmount
commission
```

---

# Vendor Wallet Update

After order creation:

```
vendor.pendingBalance += vendorAmount
```

After delivery confirmation:

```
vendor.balance += vendorAmount
vendor.pendingBalance -= vendorAmount
```

---

# Vendor Payout Flow

```
Vendor requests withdrawal
        ↓
Admin reviews request
        ↓
Admin sends payout manually
        ↓
Payout marked as completed
```

---

# Refund Flow

If order refunded:

```
Payment refunded via Razorpay
        ↓
Vendor wallet adjusted
        ↓
Order marked refunded
```

---

# Order Status Lifecycle

```
CREATED
PROCESSING
SHIPPED
DELIVERED
CANCELLED
REFUNDED
```

---

# Important Rules

Always verify payment with:

```
Razorpay signature verification
```

Never rely only on frontend confirmation.

All payment confirmations must be validated server-side.
