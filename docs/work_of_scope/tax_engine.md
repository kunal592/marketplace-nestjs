# Tax Calculation Engine

## Purpose

Taxes must be calculated dynamically during checkout.

---

# Tax Model

```text
TaxRate
id
country
state
taxPercentage
```

---

# Endpoint

```text
GET /tax/calculate
```

---

# Calculation

```text
tax = subtotal × taxPercentage
```

Tax must be added to final order total.
