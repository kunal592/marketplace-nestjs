# Idempotency and Transaction Lock System

## Purpose

This document defines the **idempotency and transaction locking mechanism** required to ensure safe order and payment processing.

In ecommerce systems, requests may be sent multiple times due to:

* network retries
* frontend double-clicks
* mobile connectivity issues
* payment gateway retries
* webhook race conditions

Without protection, this can cause:

* duplicate orders
* double wallet credits
* inconsistent payment states

This system ensures that **critical operations are executed only once**.

---

# Idempotency Concept

Idempotency means:

> Performing the same operation multiple times produces the same result.

Example:

If the frontend calls:

```
POST /payments/verify
```

twice, the system must **not create duplicate payment updates**.

Instead, it should return the **existing result**.

---

# Idempotency Key

Critical endpoints must require an **Idempotency-Key header**.

Example request:

```
POST /orders
Headers:
Idempotency-Key: 8a92c3c2-912e-11ee-b9d1-0242ac120002
```

The backend must store this key and prevent duplicate processing.

---

# Database Model

Create a table:

```
IdempotencyKey
```

Fields:

```
id
key
endpoint
userId
requestHash
responseBody
status
createdAt
expiresAt
```

Status values:

```
PROCESSING
COMPLETED
FAILED
```

---

# Workflow

When a request arrives:

1. Check if the idempotency key already exists.
2. If status = COMPLETED → return stored response.
3. If status = PROCESSING → return "request in progress".
4. If not found → create new record and process request.

Example flow:

```
Request received
      ↓
Check IdempotencyKey table
      ↓
If exists → return stored response
      ↓
If not exists → process request
      ↓
Store response
```

---

# Critical Endpoints Requiring Idempotency

The following endpoints must enforce idempotency:

```
POST /orders
POST /payments/create-order/:orderId
POST /payments/verify
POST /payouts/request
```

These endpoints involve **financial transactions** and must never run twice.

---

# Transaction Locking

All financial operations must run inside a **database transaction**.

Use:

```
prisma.$transaction()
```

Example operations inside transaction:

* create order
* create vendor orders
* create order items
* update vendor wallets
* clear cart

If any step fails:

```
ROLLBACK
```

---

# Payment Verification Lock

The endpoint:

```
POST /payments/verify
```

must enforce the following rules.

Steps:

1. Verify Razorpay signature.
2. Check if order already marked as PAID.
3. If already PAID → return existing response.
4. Otherwise update order and wallet balances.

Example logic:

```
if order.paymentStatus === "PAID"
    return existing response
```

This prevents duplicate payment processing.

---

# Webhook Race Condition Protection

Payment gateways may send multiple webhook events.

Example:

```
payment.captured
payment.authorized
payment.failed
```

The webhook handler must:

1. verify Razorpay signature
2. check if payment already processed
3. ignore duplicate events

Example:

```
if paymentRecordExists
   ignore webhook
```

---

# Idempotency Expiration

Idempotency keys should expire automatically.

Recommended duration:

```
24 hours
```

Old records can be cleaned using a scheduled job.

---

# Response Storage

When a request completes successfully, the system must store:

```
responseBody
status
```

Future duplicate requests must return the **exact same response**.

---

# Example Scenario

Customer clicks checkout twice.

```
POST /orders
Idempotency-Key: abc123
```

First request:

```
creates order successfully
```

Second request:

```
system detects duplicate key
returns same order response
```

No duplicate order is created.

---

# Logging

The system must log:

```
endpoint
userId
idempotencyKey
timestamp
status
```

This helps track duplicate requests.

---

# Security Benefits

This system protects against:

* payment replay attacks
* duplicate order creation
* wallet balance corruption
* webhook race conditions

---

# Final Requirement

All **financial or order-related endpoints must implement idempotency protection** before production deployment.

Failure to implement this may cause **serious financial inconsistencies**.
