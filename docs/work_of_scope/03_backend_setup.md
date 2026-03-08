# Backend Setup

## Create NestJS Project

```
nest new marketplace-api
```

---

# Install Dependencies

Core dependencies:

```
@nestjs/config
class-validator
class-transformer
bcrypt
jsonwebtoken
razorpay
```

Database dependencies:

```
prisma
@prisma/client
```

---

# Configure Prisma

Initialize Prisma.

```
npx prisma init
```

Set PostgreSQL connection in `.env`.

Example:

```
DATABASE_URL=postgresql://user:pass@localhost:5432/marketplace
```

---

# Prisma Service

Create a global Prisma service.

Responsibilities:

* manage database connection
* provide prisma client across modules

---

# Global Config

Create a config module to load environment variables.

Config should include:

* JWT secrets
* Razorpay credentials
* database URL
* server port
