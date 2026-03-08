# Global System Cooldown Mode

## Purpose

The system must support a **global cooldown mode** controlled by the admin.

When cooldown mode is enabled:

Customers may still explore the marketplace but **all transactional operations must stop**.

This allows administrators to perform:

* maintenance
* database migrations
* deployment updates
* emergency shutdown

---

# Cooldown Behavior

When cooldown mode is active:

Allowed actions:

```
browse products
view categories
view product details
add items to cart
view cart
```

Blocked actions:

```
checkout
create orders
payments
vendor product creation
vendor product editing
vendor order updates
wallet payouts
reviews
```

Only **read operations** are allowed.

---

# Database Model

Create a simple configuration table.

```
SystemConfig
id
cooldownEnabled
updatedAt
updatedBy
```

Only one record should exist.

---

# Admin Toggle Endpoint

Endpoint:

```
PATCH /admin/system/cooldown
```

Access:

```
Auth: ADMIN
```

Body:

```
{
  "enabled": true
}
```

Example response:

```
{
  "success": true,
  "data": {
    "cooldownEnabled": true
  }
}
```

---

# Cooldown Guard

Create a **global guard** named:

```
SystemCooldownGuard
```

Responsibilities:

* check system config
* block restricted actions

Pseudo logic:

```
if cooldownEnabled === true
   allow only GET requests
   block POST / PATCH / DELETE
```

Return error:

```
System is currently under maintenance. Please try again later.
```

---

# Routes Exempt from Cooldown

These routes must remain functional.

```
GET /products
GET /products/:slug
GET /categories
GET /reviews/product/:id
GET /cart
POST /cart/items
PATCH /cart/items/:id
DELETE /cart/items/:id
```

These routes allow customers to **continue shopping without checkout**.

---

# Cooldown Status Endpoint

Expose public endpoint:

```
GET /system/status
```

Example response:

```
{
  "cooldownEnabled": true
}
```

Frontend can use this to display a **maintenance banner**.

---

# Admin Usage Flow

Admin enables maintenance mode:

```
PATCH /admin/system/cooldown
{
 "enabled": true
}
```

System immediately blocks transactions.

After maintenance:

```
PATCH /admin/system/cooldown
{
 "enabled": false
}
```

All operations resume normally.

---

# Logging Requirement

Whenever cooldown mode changes the system must log:

```
adminId
timestamp
previousState
newState
```

This ensures proper auditing.
