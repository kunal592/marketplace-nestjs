# Bulk Product Upload

## Purpose

Vendors should be able to upload multiple products using CSV files.

---

# Endpoint

```text
POST /products/bulk-upload
```

---

# File Format

CSV columns:

```text
name
description
price
category
stock
variant
```

---

# Workflow

```text
Upload CSV
Parse rows
Validate products
Create product records
Return upload report
```
