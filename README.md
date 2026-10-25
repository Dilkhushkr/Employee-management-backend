# Employee Management Backend

Multi-tenant Employee Management SaaS backend. Node.js + TypeScript + Express + MongoDB (Mongoose).

## Multi-tenancy

Shared database, single deployment. Every tenant-scoped document (`User`, `Attendance`) carries a `companyId` field. A `superadmin` has `companyId: null` (belongs to no company). Users log in with just email (no company slug) since email is globally unique.

## Roles

- `superadmin` — creates companies and their first admin. Not scoped to any company.
- `admin` — manages employees and views attendance for their own company.
- `user` — an employee. Logs in with a login code (no password), marks their own attendance.

## Setup

```bash
npm install
npm run dev              # starts the server (ts-node-dev)
npm run seed:superadmin   # creates the initial superadmin account
```

Requires a `.env` with `MONGO_URI`, `JWT_SECRET`, `PORT` (defaults to 5000).

## Health check

| Method | Route | Protected by |
|---|---|---|
| GET | `/api/health` | none — returns `{ "message": "Server is running" }` |

## Auth

Two login flows, both return a JWT (`{ userId, companyId, role }`) to send back as `Authorization: Bearer <token>` on every other request.

| Method | Route | Who | Body |
|---|---|---|---|
| POST | `/api/auth/login` | superadmin / admin | `{ email, password }` |
| POST | `/api/auth/login-code` | employee | `{ code }` |

## Companies

Superadmin only. Not scoped to any company.

| Method | Route | Protected by | Body |
|---|---|---|---|
| POST | `/api/companies` | `protect` + `requireRole("superadmin")` | `{ companyName, adminName, adminEmail, adminPassword }` |
| GET | `/api/companies/admins` | `protect` + `requireRole("superadmin")` | — |

`POST` creates a company plus its first admin user in one call. The company `slug` is generated from the name (lowercased, spaces become `-`) and must be unique.

`GET /admins` returns `{ count, admins }` for every company admin, with each admin's company `name` and `slug` populated. The password hash is never returned.

## Users (employees)

All routes scoped to the admin's own `companyId` — an admin never sees another company's users.

| Method | Route | Protected by | Body |
|---|---|---|---|
| POST | `/api/users` | `protect` + `requireRole("admin")` | `{ name, phone?, designation?, department? }` — returns a one-time `loginCode` |
| GET | `/api/users` | `protect` + `requireRole("admin")` | — |
| PUT | `/api/users/:id` | `protect` + `requireRole("admin")` | any of `{ name, phone, designation, department }` |
| DELETE | `/api/users/:id` | `protect` + `requireRole("admin")` | — (hard delete) |

## Attendance

One record per employee per day (enforced by a unique `{ userId, date }` index). `date` is stored as `"YYYY-MM-DD"`.

| Method | Route | Protected by | Notes |
|---|---|---|---|
| POST | `/api/attendance/check-in` | `protect` + `requireRole("user")` | Creates today's record, `status: "present"` |
| POST | `/api/attendance/check-out` | `protect` + `requireRole("user")` | Sets `checkOutTime`, computes `totalHours` |
| GET | `/api/attendance/my-attendance` | `protect` + `requireRole("user")` | `?date=YYYY-MM-DD` (defaults to today), one record |
| GET | `/api/attendance/all-attendance` | `protect` + `requireRole("admin")` | `?userId=&from=&to=` — all optional, all-company by default |

## Auth middleware (`src/middleware/auth.ts`)

- `protect` — verifies the JWT, attaches `req.user = { userId, companyId, role }`. Required on every route except login.
- `requireRole(...roles)` — stacks after `protect`, 403s unless `req.user.role` is in the allowed list.

## Not yet built

- Soft delete for users
- Leave management, payroll, notifications, reporting/dashboard (per phased build order)
- Deployment / CI-CD (deferred until local app works end-to-end)
