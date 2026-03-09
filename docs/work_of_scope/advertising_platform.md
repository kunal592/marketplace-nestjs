# Advertising Platform

## Purpose

Vendors should be able to promote products for higher visibility.

---

# Ad Model

```text
AdCampaign
id
vendorId
productId
budget
bidAmount
startDate
endDate
status
```

---

# Endpoints

Vendor:

```text
POST /ads
GET /ads
PATCH /ads/:id
```

Admin:

```text
GET /admin/ads
```

---

# Ad Placement

Promoted products appear in:

```text
search results
category listings
homepage banners
```
