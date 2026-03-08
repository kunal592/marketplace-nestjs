# Authentication System

## Authentication Strategy

Use JWT based authentication.

Users login and receive a token.

The token is used to access protected routes.

---

# User Roles

ADMIN
VENDOR
CUSTOMER

---

# Endpoints

Register Customer

POST /auth/register

Login

POST /auth/login

Get Profile

GET /auth/me

---

# Password Security

Passwords must be hashed using bcrypt.

Never store plaintext passwords.

---

# JWT Token Payload

Example payload:

```
{
  userId
  role
}
```

---

# Guards

Auth Guard

Verifies JWT token.

Roles Guard

Restricts access based on role.
