# Order Cancellation System

## Purpose

Customers must be able to cancel orders before shipment.

Cancellation ensures users can recover from mistakes or payment issues.

---

# Endpoint

```text
POST /orders/:id/cancel
```

Access:

```text
Auth: CUSTOMER
```

---

# Validation Rules

Order can be cancelled only if:

```text
orderStatus = CREATED
OR
orderStatus = PROCESSING
```

Cancellation must fail if:

```text
orderStatus = SHIPPED
orderStatus = DELIVERED
```

---

# Workflow

```text
Customer requests cancellation
       ↓
Validate order ownership
       ↓
Update VendorOrders status
       ↓
Restore reserved stock
       ↓
Trigger refund if payment completed
```

---

# Refund Handling

If payment already completed:

```text
Trigger Razorpay refund
Update Payment record
Update Order status = CANCELLED
```

---

# Notification

Customer and vendor must be notified.
