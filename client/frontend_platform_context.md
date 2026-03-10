# Frontend Platform Context — Multi-Vendor Marketplace

## Purpose

This document defines the **frontend architecture, design philosophy, and implementation constraints** for the marketplace platform.

The frontend must integrate with the existing backend APIs and support the following applications:

* Customer Storefront
* Vendor Dashboard
* Admin Dashboard

The UI must look **premium, aesthetic, and human-crafted**, not like a generic AI-generated interface.

---

# Critical Design Requirement

The frontend must **NOT look like a generic AI-generated interface**.

Avoid:

* default component layouts
* generic spacing patterns
* repetitive UI structures
* unstyled tables and forms
* default Tailwind layouts

The interface must feel like a **professionally designed product**.

The goal is a UI comparable to:

```text
Stripe Dashboard
Shopify
Linear
Vercel
Apple Store
```

The system should feel **clean, premium, minimal, and intentional**.

---

# Technology Stack

The frontend must use the following stack.

Framework

```text
Next.js (App Router)
```

Language

```text
TypeScript
```

Styling

```text
TailwindCSS
```

Component System

```text
ShadCN UI
```

State Management

```text
TanStack Query
Zustand
```

Forms

```text
React Hook Form
Zod validation
```

Charts

```text
Recharts
```

Payments

```text
Razorpay Checkout JS SDK
```

---

# Application Structure

The project must contain **three separate frontend applications**.

```text
apps/
   storefront
   vendor-dashboard
   admin-dashboard
```

Each app shares common UI components and utilities.

---

# Storefront Application

The storefront is the **customer-facing marketplace**.

Main features:

```text
home page
product browsing
category browsing
product detail pages
search
wishlist
cart
checkout
order tracking
```

Example routes:

```text
/
 /products
 /products/[slug]
 /categories/[slug]
 /wishlist
 /cart
 /checkout
 /orders
 /orders/[id]
```

---

# Vendor Dashboard

The vendor dashboard allows sellers to manage their stores.

Features:

```text
product creation
inventory management
order fulfillment
analytics dashboard
coupon management
payout requests
advertising campaigns
```

Example routes:

```text
/dashboard
/dashboard/products
/dashboard/products/create
/dashboard/orders
/dashboard/analytics
/dashboard/coupons
/dashboard/payouts
/dashboard/ads
```

The dashboard must use **data tables and charts designed with strong UX clarity**.

---

# Admin Dashboard

The admin dashboard manages the marketplace.

Features:

```text
vendor approval
product moderation
wallet oversight
payout approvals
feature flags
system cooldown control
analytics
audit logs
```

Example routes:

```text
/admin
/admin/vendors
/admin/products
/admin/payouts
/admin/analytics
/admin/features
/admin/system
```

---

# UI Design Principles

The UI must follow these principles.

## Minimalism

The design should prioritize clarity and whitespace.

Example:

```text
generous spacing
clear typography hierarchy
limited color palette
```

Avoid cluttered layouts.

---

## Premium Interaction Design

Interactions must feel smooth and refined.

Examples:

```text
subtle hover animations
smooth dropdown transitions
polished loading states
skeleton loading components
```

Animations must be subtle and elegant.

Use:

```text
Framer Motion
```

when needed.

---

## Typography

Typography must feel modern and readable.

Recommended font stack:

```text
Inter
Geist
```

Font hierarchy:

```text
H1 — page titles
H2 — section titles
Body — primary text
Caption — metadata
```

---

# Component Architecture

All UI components must be reusable.

Example structure:

```text
src/components
   ui
   product
   cart
   checkout
   dashboard
   analytics
```

Examples of reusable components:

```text
ProductCard
ProductGrid
ProductFilters
CartDrawer
CheckoutSummary
VendorOrdersTable
AnalyticsCharts
```

---

# Data Fetching Strategy

Use **TanStack Query** for server state.

Example usage:

```typescript
const { data, isLoading } = useQuery({
  queryKey: ["products"],
  queryFn: fetchProducts
});
```

Benefits:

```text
automatic caching
background updates
request deduplication
loading state handling
```

---

# Global State

Use **Zustand** for UI state.

Examples:

```text
cart state
authentication state
notification state
theme state
```

Example store:

```typescript
useCartStore
```

---

# API Integration

The frontend must consume backend endpoints using a centralized API layer.

Example folder:

```text
src/lib/api
```

Example services:

```text
authService
productService
orderService
cartService
paymentService
```

All API calls must be typed using TypeScript.

---

# Checkout Flow

Checkout must integrate Razorpay.

Flow:

```text
Customer clicks checkout
      ↓
Call POST /orders
      ↓
Call POST /payments/create
      ↓
Launch Razorpay checkout
      ↓
Receive payment response
      ↓
Call POST /payments/verify
      ↓
Redirect to order confirmation
```

---

# Product Search UI

Search interface must support:

```text
keyword search
category filters
price range filters
rating filters
sorting
pagination
```

Sorting options:

```text
price_low_to_high
price_high_to_low
newest
top_rated
```

---

# Performance Strategy

To maintain fast performance:

Use:

```text
Next.js image optimization
server-side rendering for product pages
incremental static regeneration
lazy loading for heavy components
```

Example:

```typescript
export const revalidate = 60;
```

---

# SEO Optimization

Product pages must be SEO optimized.

Each product page must include:

```text
meta title
meta description
structured data schema
Open Graph tags
```

Example:

```typescript
generateMetadata()
```

---

# Notifications UI

Implement a notification bell component.

Features:

```text
notification dropdown
mark as read
real-time updates
```

API endpoints:

```text
GET /notifications
PATCH /notifications/:id/read
```

---

# Design Quality Requirements

The UI must feel like a **real product built by experienced designers**.

Avoid:

```text
default component spacing
unstyled tables
raw forms
generic dashboards
```

The UI must include:

```text
well-structured layouts
consistent spacing scale
clear visual hierarchy
refined typography
```

This project should **not resemble an AI-generated interface**.

The final result should resemble a **modern SaaS or premium marketplace application**.

---

# Expected Outcome

After implementation the frontend should deliver:

```text
a high-performance storefront
a powerful vendor dashboard
a comprehensive admin console
```

The experience should feel **premium, polished, and human-designed**, suitable for a real production marketplace.
