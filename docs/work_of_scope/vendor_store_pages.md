# Vendor Store Pages

## Purpose

Customers should be able to browse vendor storefronts.

---

# Endpoints

```text
GET /stores/:slug
GET /stores/:slug/products
```

---

# Store Model

```text
VendorStore
id
vendorId
storeName
slug
logo
banner
description
```

---

# Store Page Data

Store page must include:

```text
vendor profile
product list
average rating
review count
```
