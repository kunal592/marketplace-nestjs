# Razorpay Payment Integration

Payment gateway:

Razorpay

---

# Payment Flow

Customer initiates checkout.

Backend creates Razorpay order.

Customer completes payment.

Backend verifies payment using signature.

Order is stored in database.

---

# Important Rule

Never trust frontend payment success.

Always verify Razorpay signature on backend.

---

# Webhook

Implement webhook endpoint.

```
POST /payments/webhook
```
