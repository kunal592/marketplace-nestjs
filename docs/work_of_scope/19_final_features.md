# Wishlist System

## Purpose

Customers should be able to save products for later purchase.

---

# Wishlist Model

```text
Wishlist
id
userId
productId
createdAt
```

---

# Endpoints

```text
GET /wishlist
POST /wishlist
DELETE /wishlist/:productId
```

---

# Behavior

When a product is added to the wishlist:

If the product already exists in the user's wishlist, the request should return success without creating duplicates.

---

# Future Enhancements

Wishlist can support:

```text
notifications when price drops
notifications when item back in stock
```
---
# Coupon and Promotions System

## Purpose

Coupons allow vendors or administrators to offer discounts.

---

# Coupon Model

```text
Coupon
id
code
discountType
discountValue
minOrderAmount
maxDiscount
usageLimit
usedCount
vendorId
expiresAt
createdAt
```

---

# Discount Types

```text
PERCENTAGE
FIXED
```

---

# Endpoints

Admin/Vendor:

```text
POST /coupons
GET /coupons
PATCH /coupons/:id
DELETE /coupons/:id
```

Customer:

```text
POST /orders/apply-coupon
```

---

# Validation Rules

Before applying coupon:

```text
coupon must not be expired
coupon usageLimit not exceeded
order total >= minOrderAmount
```

---

# Coupon Application

The system must calculate discount and update order totals before payment.

---
# Returns and Refunds System

## Purpose

Customers must be able to return products after delivery and request refunds.

---

# Return Model

```text
ReturnRequest
id
orderItemId
userId
reason
status
createdAt
updatedAt
```

---

# Return Status

```text
REQUESTED
APPROVED
REJECTED
PICKED_UP
RECEIVED
REFUNDED
```

---

# Refund Model

```text
Refund
id
paymentId
amount
status
createdAt
```

---

# Endpoints

Customer:

```text
POST /orders/:id/return
GET /returns/my
```

Vendor/Admin:

```text
PATCH /returns/:id
```

Admin refund processing:

```text
POST /refunds/process
```

---

# Refund Workflow

```text
Return requested
      ↓
Vendor/Admin approval
      ↓
Product received
      ↓
Refund processed via Razorpay
```
---
# Notification System

## Purpose

Users must receive system notifications for important events.

---

# Notification Model

```text
Notification
id
userId
type
title
message
isRead
createdAt
```

---

# Notification Types

```text
ORDER_CREATED
ORDER_SHIPPED
ORDER_DELIVERED
PAYOUT_APPROVED
REVIEW_RECEIVED
```

---

# Endpoints

```text
GET /notifications
PATCH /notifications/:id/read
PATCH /notifications/read-all
```

---

# Delivery Channels

Notifications may be delivered via:

```text
in-app notifications
email
push notifications
```

---

# Trigger Events

Notifications must trigger when:

```text
order created
order shipped
order delivered
payout approved
```

---
# Vendor Analytics Dashboard

## Purpose

Vendors need visibility into their store performance.

---

# Metrics

Analytics must include:

```text
total revenue
orders count
top selling products
monthly sales
conversion rate
```

---

# Endpoint

```text
GET /vendor/analytics
```

---

# Example Response

```json
{
  "totalRevenue": 125000,
  "ordersCount": 320,
  "topProducts": [],
  "monthlyRevenue": []
}
```

---

# Data Source

Analytics should use aggregated queries from:

```text
VendorOrder
OrderItem
Product
```

Future optimization may include precomputed analytics tables.

---

# Product Moderation System

## Purpose

Administrators must review products before they become publicly visible.

---

# Product Status

```text
DRAFT
PENDING_APPROVAL
ACTIVE
REJECTED
ARCHIVED
```

---

# Endpoints

Admin:

```text
GET /admin/products
PATCH /admin/products/:id/approve
PATCH /admin/products/:id/reject
```

---

# Workflow

Vendor creates product:

```text
status = PENDING_APPROVAL
```

Admin approves:

```text
status = ACTIVE
```

Rejected products must include a reason.

---

# Vendor KYC Verification

## Purpose

Marketplace vendors must be verified before receiving payouts.

---

# Vendor KYC Model

```text
VendorKYC
id
vendorId
businessName
taxId
bankAccount
identityDocument
verificationStatus
createdAt
```

---

# Verification Status

```text
PENDING
VERIFIED
REJECTED
```

---

# Endpoints

Vendor:

```text
POST /vendors/kyc
GET /vendors/kyc
```

Admin:

```text
PATCH /admin/vendors/:id/verify
```

---

# Security

Sensitive documents must be stored securely using encrypted storage.

---
# Audit Logging System

## Purpose

Audit logs track critical actions performed by users and administrators.

---

# AuditLog Model

```text
AuditLog
id
userId
action
entityType
entityId
metadata
createdAt
```

---

# Logged Actions

```text
admin vendor approvals
payout approvals
wallet updates
cooldown toggles
product moderation
```

---

# Endpoints

Admin:

```text
GET /admin/audit-logs
```

---

# Retention

Audit logs should be stored for:

```text
1 year
```

This supports compliance and security auditing.

---

# Audit Logging System

## Purpose

Audit logs track critical actions performed by users and administrators.

---

# AuditLog Model

```text
AuditLog
id
userId
action
entityType
entityId
metadata
createdAt
```

---

# Logged Actions

```text
admin vendor approvals
payout approvals
wallet updates
cooldown toggles
product moderation
```

---

# Endpoints

Admin:

```text
GET /admin/audit-logs
```

---

# Retention

Audit logs should be stored for:

```text
1 year
```

This supports compliance and security auditing.

---

