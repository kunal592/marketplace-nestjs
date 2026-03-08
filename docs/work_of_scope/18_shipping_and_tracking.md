# Shipping and Tracking System

## Purpose

Orders must support shipment tracking so customers and vendors can monitor delivery progress.

---

# Shipment Model

```text
Shipment
id
vendorOrderId
courier
trackingNumber
shippingCost
estimatedDelivery
status
createdAt
updatedAt
```

---

# Shipment Status

```text
CREATED
SHIPPED
IN_TRANSIT
DELIVERED
FAILED
RETURNED
```

---

# Endpoints

Vendor actions:

```text
POST /vendor-orders/:id/ship
PATCH /vendor-orders/:id/tracking
```

Customer actions:

```text
GET /orders/:id/tracking
```

---

# Vendor Workflow

Vendor marks order shipped:

```text
PATCH /vendor-orders/:id/status
```

System must:

1. create shipment record
2. store tracking number
3. notify customer

---

# Courier Integrations (future)

The system should later support integration with logistics providers:

```text
Shiprocket
Delhivery
FedEx
UPS
```

These services can automatically update shipment statuses via webhooks.
