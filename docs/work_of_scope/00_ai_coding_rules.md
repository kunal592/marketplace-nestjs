# AI Coding Rules

This document defines strict instructions for the AI coding assistant.

The AI must follow these rules while generating code for the project.

---

# Core Principles

The project is a **production-grade multi-vendor ecommerce backend built using NestJS**.

The system must be:

* modular
* scalable
* maintainable
* secure
* testable

---

# Architecture Enforcement

All code must follow this architecture:

Controller
↓
Service
↓
Repository
↓
Prisma ORM
↓
Database

Controllers must **never access the database directly**.

---

# Code Generation Rules

The AI must always:

* generate TypeScript code
* use NestJS modules
* use dependency injection
* use DTO validation
* follow REST API design

The AI must never:

* mix business logic in controllers
* access Prisma directly from controllers
* duplicate logic across modules
* skip validation layers

---

# Folder Structure Rules

Every module must follow this structure.

```
module
 ├ controllers
 ├ services
 ├ repositories
 ├ dto
 ├ entities
 └ module.ts
```

---

# Global Layers

The project must implement:

Auth Guard
Role Guard
Validation Pipe
Exception Filter
Response Interceptor

---

# API Response Format

Success response:

```
{
 "success": true,
 "data": {}
}
```

Error response:

```
{
 "success": false,
 "message": "Error message"
}
```

All generated endpoints must follow this format.
