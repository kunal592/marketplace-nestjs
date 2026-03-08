# Customer Address Management

## Purpose

Customers must be able to manage multiple delivery addresses.
Orders will reference a selected shipping address.

---

# Address Model

Fields:

```text
Address
id
userId
name
phone
street
city
state
postalCode
country
isDefault
createdAt
updatedAt
```

Each user may store multiple addresses.

---

# Endpoints

```text
GET /addresses
POST /addresses
PATCH /addresses/:id
DELETE /addresses/:id
```

Access: Authenticated user only.

---

# Behavior

When creating a new address:

If `isDefault = true` then all other addresses must be set to `false`.

Orders must store a snapshot of the shipping address to prevent future changes affecting past orders.

---

# Order Integration

Orders must include:

```text
shippingAddressId
```

or store the address snapshot in the order record.

---

# Validation

Required fields:

```text
name
phone
street
city
postalCode
country
```

Phone number must follow international format when possible.
