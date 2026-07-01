# Architecture Document — ACME Salary Management System

**Version:** 1.0  
**Date:** July 2026

---

## 1. System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT BROWSER                           │
│              React 18 + Vite + TypeScript (Port 5173)           │
│  Dashboard │ Employees │ Employee Detail │ Analytics            │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTP/JSON REST API
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                   NestJS API (Port 3000)                        │
│                                                                 │
│   Controllers → Services → Repositories → TypeORM → SQLite     │
│                                                                 │
│   Modules: Employees │ Salaries │ Departments │ Analytics       │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────────┐
│                     SQLite Database                             │
│            employees │ salaries │ departments                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Backend: Clean Architecture (Layered)

### Why Clean Architecture?

The core rule: **business logic (Services) must never depend on frameworks or databases**.  
This enables:
- Services tested with mocked repositories — no DB, no HTTP, sub-millisecond test runs
- Swapping SQLite → PostgreSQL by changing one config line (no service changes)
- Controllers replaced or extended (e.g., GraphQL) without touching business logic

### Layers

```
HTTP Request
    ↓
[Controller]  — Parses & validates HTTP (DTO + class-validator). No logic.
    ↓
[Service]     — Orchestrates business rules. Pure TypeScript, no framework knowledge.
    ↓
[Repository]  — TypeORM-backed. All SQL lives here. Services depend on the interface.
    ↓
[Entity]      — @Entity classes matching the DB schema.
    ↓
SQLite
```

---

## 3. Database Schema

```
departments
  id           INTEGER PRIMARY KEY
  name         TEXT UNIQUE NOT NULL
  created_at   DATETIME

employees
  id                INTEGER PRIMARY KEY
  name              TEXT NOT NULL
  email             TEXT UNIQUE NOT NULL
  gender            TEXT                   -- Male / Female / Non-binary
  department_id     INTEGER FK → departments.id
  country           TEXT NOT NULL
  employment_type   TEXT NOT NULL          -- full-time / part-time / contractor
  status            TEXT NOT NULL          -- active / inactive
  hire_date         DATE NOT NULL
  created_at        DATETIME

salaries
  id              INTEGER PRIMARY KEY
  employee_id     INTEGER FK → employees.id
  base_salary     DECIMAL(12,2) NOT NULL
  currency        TEXT NOT NULL            -- ISO 4217 (USD, INR, GBP…)
  effective_date  DATE NOT NULL
  notes           TEXT
  created_at      DATETIME
```

**Key design decisions:**
- `salaries` is **append-only history** — each salary change adds a row; nothing is deleted. Current salary = latest `effective_date`.
- `department` is a **separate normalised table** — enables clean GROUP BY analytics without string duplication.
- `currency` is per-row — correct multi-currency support without FX conversion complexity.

---

## 4. API Design

### Principles
- RESTful resource-oriented URLs
- Server-side pagination (mandatory for 10k rows — client cannot hold all records)
- Consistent response envelope: `{ data, meta }`
- Validation via class-validator DTOs before hitting service layer

### Endpoints

```
# Employees
GET    /employees?page=1&limit=20&search=&department=&country=&status=
POST   /employees
GET    /employees/:id
PUT    /employees/:id

# Salary History
GET    /employees/:id/salary-history
POST   /salaries

# Departments
GET    /departments

# Analytics
GET    /analytics/summary
GET    /analytics/by-department
GET    /analytics/by-country
GET    /analytics/salary-distribution

# Seed
POST   /seed/run   (idempotent — skips if already seeded)
```

---

## 5. Frontend Architecture

### Folder Structure
```
src/
├── api/          — Axios API client functions, one file per domain
├── hooks/        — TanStack Query hooks (useEmployees, useAnalytics…)
├── components/
│   ├── ui/       — Atoms: Button, Badge, Card, Input, Select, Modal
│   └── shared/   — Molecules: DataTable, StatCard, SalaryChart, Pagination
├── pages/        — Route-level components (Dashboard, Employees, Analytics…)
└── types/        — Shared TypeScript interfaces
```

### Why TanStack Query (React Query)?
- Built-in caching: navigating back to employee list is instant
- `keepPreviousData` for seamless pagination across 500 pages
- Background refetch after mutations (add/edit employee) without manual `useEffect`
- Eliminates `useState(loading, error, data)` boilerplate throughout

---

## 6. Testing Strategy

```
Unit Tests (Jest)
  ├── EmployeesService — all CRUD methods with mocked repositories
  ├── SalariesService  — history retrieval, latest salary logic
  └── AnalyticsService — aggregate calculations

Integration Tests (Jest + Supertest)
  ├── GET /employees   — pagination, filters
  ├── POST /employees  — validation + creation
  ├── POST /salaries   — salary history append
  └── GET /analytics/summary — correct aggregates
```

Tests run against an **in-memory SQLite** instance — no external DB needed in CI.

---

## 7. Scalability Path

| Current | Production upgrade | Migration effort |
|---|---|---|
| SQLite | PostgreSQL | 1 config line in TypeORM |
| Single process | Horizontal scale with PM2/K8s | No code change |
| No cache | Redis on analytics endpoints | Add cache decorator to service |
| REST | GraphQL | Add resolver layer, services unchanged |
