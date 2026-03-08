# Multi-Vendor Checkout & Shipping Calculation Engine

## Purpose

In a multi-vendor marketplace, a customer cart may contain products from different vendors.

The system must automatically split the cart into **separate vendor shipments** and calculate shipping costs accordingly.

Example cart:

Vendor A → Product 1
Vendor A → Product 2
Vendor B → Product 3

The system must create:

Order
├ VendorOrder (Vendor A)
└ VendorOrder (Vendor B)

Each VendorOrder will have its own:

* shipment
* shipping cost
* tracking
* delivery timeline

---

# Checkout Workflow

Customer checkout must follow this flow:

```text
Validate cart
      ↓
Group items by vendor
      ↓
Calculate vendor subtotals
      ↓
Calculate shipping cost per vendor
      ↓
Create parent Order
      ↓
Create VendorOrders
      ↓
Create OrderItems
      ↓
Create Shipments
      ↓
Return payment amount
```

---

# Vendor Grouping Logic

Items must be grouped by vendor before order creation.

Example:

Cart items:

```text
Vendor A → Product A1
Vendor A → Product A2
Vendor B → Product B1
```

Grouping result:

```text
VendorGroupA = [A1, A2]
VendorGroupB = [B1]
```

Each vendor group becomes one **VendorOrder**.

---

# Shipping Calculation

Shipping cost must be calculated **per vendor group**.

Example formula:

```text
shippingCost = baseFee + (weight × rate)
```

Example:

```text
Vendor A shipment → ₹80
Vendor B shipment → ₹60
```

Total shipping:

```text
₹140
```

---

# Shipment Creation

Each VendorOrder must automatically create a shipment record.

Example:

```text
Shipment
id
vendorOrderId
shippingCost
status
trackingNumber
estimatedDelivery
```

Initial status:

```text
CREATED
```

---

# Estimated Delivery Calculation

Estimated delivery should be calculated using vendor shipping rules.

Example:

```text
deliveryDays = vendor.shippingTime
estimatedDelivery = orderDate + deliveryDays
```

---

# Payment Calculation

Final order amount must include:

```text
productSubtotal
+ shippingCosts
+ taxes
- coupons
```

Example:

```text
products = ₹1500
shipping = ₹140
tax = ₹75
discount = ₹100

total = ₹1615
```

---

# Commission Calculation

Platform commission must be calculated **per vendor order**.

Example:

```text
Vendor subtotal = ₹1000
Commission = 10%
Vendor earnings = ₹900
```

Commission stored in VendorOrder:

```text
commission
vendorAmount
```

---

# Data Models

## VendorOrder

```text
VendorOrder
id
orderId
vendorId
subtotal
shippingCost
commission
vendorAmount
status
createdAt
```

## Shipment

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
```

---

# Checkout Endpoint

Primary endpoint:

```text
POST /checkout
```

Responsibilities:

* validate cart
* calculate totals
* create order structure
* return payment amount

---

# Response Example

```json
{
  "orderId": "ord_123",
  "vendorOrders": [
    {
      "vendorId": "v1",
      "subtotal": 1000,
      "shippingCost": 80
    },
    {
      "vendorId": "v2",
      "subtotal": 500,
      "shippingCost": 60
    }
  ],
  "totalAmount": 1640
}
```

---

# Shipping Rules

Each vendor must define shipping settings.

Example:

```text
VendorShippingConfig
id
vendorId
baseShippingFee
perKgRate
freeShippingThreshold
estimatedDeliveryDays
```

---

# Free Shipping Support

If vendor subtotal exceeds threshold:

```text
shippingCost = 0
```

Example:

```text
Vendor subtotal = ₹2000
freeShippingThreshold = ₹1500
shippingCost = ₹0
```

---

# Edge Cases

The checkout engine must handle:

```text
empty cart
out-of-stock products
inactive vendors
expired coupons
shipping calculation errors
```

Checkout must fail gracefully if any validation fails.

---

# Performance Optimization

Checkout must run inside a **database transaction**.

Use:

```text
prisma.$transaction()
```

This ensures order consistency.

---

# Logging

Checkout operations must log:

```text
userId
cartItems
orderId
vendorOrders
totalAmount
timestamp
```

Logs help debug checkout issues.

---

# Future Enhancements

The checkout engine should later support:

```text
multi-address delivery
scheduled delivery
gift orders
dynamic courier selection
international shipping
```

---

# Final Objective

The multi-vendor checkout engine must guarantee:

* accurate vendor order splitting
* correct shipping cost calculation
* reliable commission tracking
* consistent order creation

This system forms the **core transaction engine of the marketplace**.
