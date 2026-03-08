# Architecture Rules

## Architectural Style

Use a layered architecture with strict separation of concerns.

Architecture flow:

Controller
↓
Service
↓
Repository
↓
Database

Controllers must never access the database directly.

---

# Folder Structure

```
src
 ├ config
 ├ common
 ├ helpers
 ├ utils
 ├ database
 ├ modules
 └ shared
```

---

# Module Structure

Every module must follow this structure.

```
module-name
 ├ controllers
 ├ services
 ├ repositories
 ├ dto
 ├ entities
 └ module.ts
```

---

# Global Layers

The project must implement the following global layers.

Guards
Interceptors
Exception Filters
Validation Pipes

---

# Code Quality Rules

* Use TypeScript strict mode
* Use DTO validation
* Use dependency injection
* Avoid business logic inside controllers
* Write reusable helpers
* Maintain clear naming conventions

---

# API Response Standard

All APIs must return standardized responses.

Success:

```
{
  "success": true,
  "data": {}
}
```

Error:

```
{
  "success": false,
  "message": "Error message"
}
```
