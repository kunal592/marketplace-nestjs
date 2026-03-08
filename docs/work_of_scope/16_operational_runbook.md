# Operational Runbook

## Purpose

This document defines the **operational procedures** required to run the marketplace backend in production.

It provides guidance for:

* daily system monitoring
* incident response
* deployment management
* maintenance operations
* administrative procedures

This runbook is intended for **developers, DevOps engineers, and system administrators** responsible for maintaining the platform.

---

# System Overview

The marketplace backend consists of several components.

Core services:

```text
NestJS API server
PostgreSQL database
Redis cache
Queue workers (BullMQ)
Object storage (S3 / Cloudinary)
Payment gateway (Razorpay)
```

Supporting infrastructure:

```text
Load balancer
CDN for static assets
Monitoring and logging systems
```

---

# Daily Operations Checklist

Administrators must perform the following checks daily.

System health checks:

```text
verify API uptime
verify database connectivity
verify Redis connectivity
verify queue worker status
```

Financial integrity checks:

```text
validate daily order totals
confirm payment reconciliation job success
verify wallet balances match payouts
```

Infrastructure checks:

```text
monitor CPU usage
monitor memory consumption
monitor disk usage
monitor network latency
```

All anomalies must be investigated.

---

# Monitoring Dashboards

The following metrics must be monitored continuously.

API metrics:

```text
average response time
error rate
requests per minute
```

Database metrics:

```text
slow queries
connection pool usage
query latency
```

Business metrics:

```text
orders per hour
GMV (gross merchandise value)
payment success rate
vendor payouts
```

Recommended monitoring tools:

```text
Prometheus
Grafana
Sentry
```

---

# Alerting System

Critical alerts must trigger immediate notifications.

Example thresholds:

```text
API error rate > 5%
payment verification failures > 3
database connection failures
queue job failures
```

Alerts should notify:

```text
DevOps team
backend engineers
system administrators
```

Notifications may use:

```text
Slack
PagerDuty
Email alerts
```

---

# Deployment Workflow

Production deployments must follow a controlled process.

Step 1

Run automated tests.

Step 2

Build Docker image.

Step 3

Deploy to staging environment.

Step 4

Run staging verification tests.

Step 5

Deploy to production environment.

---

# Post Deployment Verification

After deployment verify the following endpoints:

```text
GET /health
GET /products
GET /categories
GET /orders/my
POST /auth/login
```

Also verify:

```text
payment creation
payment verification
order creation
vendor wallet updates
```

If issues occur, immediately rollback.

---

# Rollback Procedure

If a deployment introduces critical issues:

1. enable cooldown mode
2. redeploy previous application version
3. verify system health
4. disable cooldown mode

Rollback should take **less than 5 minutes**.

---

# Maintenance Operations

Scheduled maintenance tasks include:

```text
database index optimization
expired reservation cleanup
idempotency key cleanup
log rotation
```

Maintenance should be scheduled during **low traffic periods**.

Before maintenance:

```text
enable cooldown mode
```

After maintenance:

```text
disable cooldown mode
```

---

# Payment System Monitoring

Payment operations require special monitoring.

Verify:

```text
payment webhook delivery
payment verification success
failed payment retries
refund processing
```

If webhook failures occur:

1. fetch transactions from Razorpay API
2. compare with Payment table
3. resolve inconsistencies

---

# Vendor Wallet Monitoring

Vendor wallet operations must be audited.

Daily checks:

```text
verify pendingBalance updates
verify payout requests
confirm completed payouts
```

Wallet balances must always match **order payout calculations**.

---

# Incident Response

When a major system issue occurs:

Step 1

Enable cooldown mode.

```text
PATCH /admin/system/cooldown
```

Step 2

Investigate logs and metrics.

Step 3

Identify root cause.

Step 4

Apply fixes or rollback deployment.

Step 5

Verify system integrity.

Step 6

Disable cooldown mode.

---

# Security Monitoring

Security events must be logged and monitored.

Examples:

```text
multiple failed login attempts
suspicious API activity
unexpected wallet changes
unauthorized admin access
```

Recommended protection tools:

```text
rate limiting
API throttling
audit logs
```

---

# Log Management

Application logs should include:

```text
authentication events
order creation
payment verification
payout approvals
system configuration changes
```

Logs must be stored centrally.

Recommended retention:

```text
general logs → 30 days
financial logs → 1 year
```

---

# Data Integrity Checks

Daily integrity verification must include:

```text
order totals match order items
wallet balances match vendor earnings
payment records match gateway transactions
```

Any mismatch must trigger investigation.

---

# Capacity Planning

As traffic increases the system must scale.

Possible upgrades:

```text
add additional API instances
add Redis caching layer
introduce read replica databases
add search service (Elasticsearch)
```

Scaling should be proactive before performance degrades.

---

# Documentation Updates

Whenever system architecture changes:

```text
update API documentation
update schema documentation
update operational runbook
```

Documentation must always reflect the current system state.

---

# Final Objective

This runbook ensures the marketplace backend can be:

```text
operated reliably
monitored effectively
recovered quickly
maintained safely
```

Following these procedures allows the platform to maintain **high availability and operational stability in production environments**.
