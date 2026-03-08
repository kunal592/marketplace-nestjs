# Code Quality Rules

The AI must ensure the generated code follows production quality.

---

# TypeScript

Use strict typing.

Avoid using `any`.

---

# Naming Conventions

Use:

camelCase for variables
PascalCase for classes
kebab-case for file names

---

# Validation

All request bodies must use DTO validation.

Use class-validator.

---

# Error Handling

All errors must use centralized exception filters.

Never expose stack traces to API users.

---

# Logging

Important operations must include logs:

authentication
payment
order creation
payout processing
