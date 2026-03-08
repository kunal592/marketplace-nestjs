# System Architecture — Multi-Vendor Ecommerce Marketplace

## Purpose

This document describes the **high-level architecture** of the marketplace backend.

It explains:

* system components
* service layers
* request flows
* data storage
* background processing
* scaling strategy

The architecture is designed to support a **multi-vendor ecommerce platform** with high reliability and scalability.

---

# High-Level Architecture

```text
Client Applications
(Web / Mobile)
        │
        ▼
API Gateway / Load Balancer
        │
        ▼
NestJS API Servers
        │
        ├── Auth Module
        ├── Vendor Module
        ├── Product Module
        ├── Cart Module
        ├── Order Module
        ├── Payment Module
        ├── Wallet Module
        ├── Notification Module
        └── Admin Module
        │
        ▼
Database Layer (PostgreSQL + Prisma)
        │
        ├── Redis Cache
        ├── Job Queue Workers (BullMQ)
        ├── Object Storage (S3 / Cloudinary)
        └── External Services (Razorpay, Email)
```

---

# Core System Components

## Client Layer

Client applications include:

```text
web frontend
mobile apps
admin dashboard
vendor dashboard
```

Clients communicate with the backend via **REST APIs**.

---

## API Layer

The backend is built using **NestJS**.

Responsibilities:

```text
authentication
request validation
business logic execution
database interaction
external service integration
```

Each domain is implemented as a separate module.

---

# Core Backend Modules

## Authentication Module

Handles:

```text
user registration
login
JWT token generation
role verification
```

Roles supported:

```text
ADMIN
VENDOR
CUSTOMER
```

---

## Vendor Module

Manages:

```text
vendor registration
store profiles
vendor KYC
vendor analytics
```

---

## Product Module

Handles:

```text
product catalog
product variants
product images
product moderation
inventory management
```

Products belong to vendors.

---

## Cart Module

Stores temporary cart data before checkout.

Responsibilities:

```text
add items
remove items
update quantities
calculate totals
```

Cart items must be validated against stock availability.

---

## Checkout & Order Module

Responsible for:

```text
cart validation
order creation
multi-vendor splitting
shipment generation
commission calculation
```

Order hierarchy:

```text
Order
 ├ VendorOrder
 │    ├ OrderItem
 │
 └ VendorOrder
```

---

## Payment Module

Handles integration with Razorpay.

Payment flow:

```text
create Razorpay order
customer completes payment
verify payment signature
update order status
```

Webhook endpoint processes asynchronous events.

---

## Wallet Module

Vendor earnings are tracked using wallets.

Wallet fields:

```text
balance
pendingBalance
```

Workflow:

```text
order created
 → pendingBalance updated

order delivered
 → balance updated
```

---

## Payout Module

Handles vendor withdrawals.

Workflow:

```text
vendor requests payout
admin approves payout
wallet balance updated
```

---

## Notification Module

Sends notifications for system events.

Triggers:

```text
order created
order shipped
order delivered
payout approved
review received
```

Delivery channels:

```text
in-app notifications
email
push notifications
```

---

# Database Layer

The system uses **PostgreSQL** with Prisma ORM.

Key tables:

```text
User
Vendor
Category
Product
ProductVariant
Cart
CartItem
Order
VendorOrder
OrderItem
Shipment
Payment
Wallet
PayoutRequest
Review
Notification
```

Indexes are added to frequently queried fields.

---

# Redis Caching Layer

Redis improves performance by caching frequently requested data.

Cached resources:

```text
product listings
product details
category trees
vendor stores
system configuration
```

Cache expiration is configured depending on resource type.

---

# Job Queue Workers

Background tasks are handled using **BullMQ**.

Worker responsibilities:

```text
send email notifications
expire stock reservations
reconcile payments
clean expired idempotency keys
aggregate analytics
```

Queues prevent heavy tasks from blocking API requests.

---

# Object Storage

Media files are stored outside the main application.

Recommended storage:

```text
AWS S3
Cloudinary
```

Assets include:

```text
product images
vendor logos
KYC documents
```

These assets are delivered through a CDN.

---

# External Services

The backend integrates with third-party services.

```text
Razorpay (payments)
Email provider (notifications)
Shipping providers (future integration)
```

External services are accessed through dedicated service layers.

---

# Security Architecture

Security mechanisms include:

```text
JWT authentication
role-based access control
DTO validation
rate limiting
audit logs
```

Sensitive actions such as payouts require strict authorization.

---

# Transaction Safety

Critical operations use database transactions.

Example operations:

```text
order creation
wallet updates
payment verification
stock reservation
```

Transactions ensure data consistency.

---

# Scalability Strategy

The system is designed to scale horizontally.

Example infrastructure:

```text
Load Balancer
   │
API Instance 1
API Instance 2
API Instance 3
```

Redis and PostgreSQL serve as shared resources across instances.

---

# Monitoring and Observability

The system must expose operational metrics.

Recommended tools:

```text
Prometheus
Grafana
Sentry
```

Monitored metrics:

```text
API response time
database query performance
payment success rate
order throughput
error rates
```

---

# Disaster Recovery Integration

The architecture supports recovery through:

```text
automated database backups
wallet reconciliation jobs
payment reconciliation
cooldown maintenance mode
```

These systems ensure data safety.

---

# Future Architectural Improvements

Possible improvements for very large scale deployments:

```text
read replica databases
microservices architecture
dedicated search engine
event streaming (Kafka)
global CDN
```

These upgrades enable the platform to support **millions of users**.

---

# Final Architecture Goal

The marketplace backend should support:

```text
high availability
financial data integrity
scalable product catalog
reliable order processing
secure vendor payouts
```

This architecture forms the **foundation for a production-grade multi-vendor ecommerce platform**.
