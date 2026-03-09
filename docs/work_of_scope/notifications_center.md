# Notification Center

## Purpose

Users must receive notifications for important events.

---

# Notification Model

```text
Notification
id
userId
type
title
message
isRead
createdAt
```

---

# Endpoints

```text
GET /notifications
PATCH /notifications/:id/read
PATCH /notifications/read-all
```

---

# Trigger Events

```text
order created
order shipped
order delivered
payout approved
review received
```
