# Feature Flags System

## Purpose

Feature flags allow enabling/disabling features without deploying code.

---

# Feature Model

```text
FeatureFlag
id
key
enabled
description
```

---

# Example Features

```text
enableCoupons
enableReviews
enableWishlist
enableRecommendations
```

---

# Endpoint

Admin:

```text
PATCH /admin/features/:key
```

Public:

```text
GET /features
```
