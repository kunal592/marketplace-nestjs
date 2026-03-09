# Returns System

## Purpose

Customers must be able to return delivered products within a defined return window.

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
```

---

# Status Flow

```text
REQUESTED
APPROVED
REJECTED
PICKED_UP
RECEIVED
REFUNDED
```

---

# Endpoints

Customer:

```text
POST /returns
GET /returns/my
```

Vendor/Admin:

```text
PATCH /returns/:id
```

---

# Workflow

```text
Customer submits return
      ↓
Vendor/Admin approves
      ↓
Courier picks item
      ↓
Warehouse receives item
      ↓
Refund issued
```
