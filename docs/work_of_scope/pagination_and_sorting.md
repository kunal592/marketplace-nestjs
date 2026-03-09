# Pagination and Sorting

## Purpose

Large datasets must be paginated to maintain performance.

---

# Query Parameters

```text
?page
&limit
&sort
```

Example:

```text
GET /products?page=2&limit=20&sort=price_desc
```

---

# Sorting Options

```text
price_asc
price_desc
rating
newest
```

---

# Endpoints Requiring Pagination

```text
/products
/reviews
/orders
/vendor-orders
/admin/orders
```
