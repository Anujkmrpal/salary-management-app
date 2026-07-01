# Requirements Document — ACME Salary Management System

**Version:** 1.0  
**Author:** Anuj Kumar Pal  
**Date:** July 2026  
**Persona:** HR Manager, ACME Organisation

---

## 1. Goal

Replace the Excel-based salary management workflow for ACME's 10,000-employee organisation with a **web-based system** that lets the HR Manager manage employee salary data, track salary history, and answer analytical questions about how the organisation pays its people — across departments and multiple countries.

---

## 2. Scope & Features

### 2.1 Employee Management
- View a **paginated, searchable list** of all employees (10,000+)
- Filter employees by department, country, employment type, and status
- **Add** a new employee with all relevant profile fields
- **Edit** an existing employee's profile
- View a full **employee detail page** showing profile + complete salary history

### 2.2 Salary Management
- Record a **salary entry** for any employee (base salary, currency, effective date, notes)
- View the **complete salary history** for each employee (all entries, sorted by date)
- Salary is tracked as a **history of changes**, not a single current value — enabling auditability

### 2.3 Dashboard & Analytics
- **KPI summary cards**: Total employees, active headcount, total monthly payroll, average salary
- **Salary distribution** by employment type and pay bands (histogram)
- **Headcount by country** and **average salary by department**
- Analytics work across multi-currency data (shown per-currency, not normalised)

### 2.4 Data Seeding
- A seed script populates the database with **10,000 realistic employees** across 10 countries and multiple departments on first run

---

## 3. Technical Constraints

| Layer | Technology |
|---|---|
| Backend | NestJS + TypeScript |
| ORM | TypeORM |
| Database | SQLite (file-based, zero-config) |
| Frontend | React 18 + Vite + TypeScript |
| Charts | Recharts |
| Forms | react-hook-form + Zod |

---

## 4. Deliberately Out of Scope (and Why)

| Excluded Feature | Reasoning |
|---|---|
| **Authentication / Login** | The assessment describes a single trusted HR Manager persona. Adding JWT auth would add significant boilerplate with zero functional value for demonstrating the core domain. It is noted as a future enhancement. |
| **Role-based access control** | Single-persona tool — RBAC would be premature. |
| **Real-time / WebSocket updates** | HR salary management is not a live-collaborative editing scenario. Page-level refetch on mutation is sufficient. |
| **FX rate normalisation** | Requires an external API, introduces latency and potential failure. Analytics are shown per-currency with explicit labelling to remain accurate without a dependency. |
| **Excel import / export** | The goal is to *replace* Excel workflows. Import is noted as a future enhancement once the core CRUD is adopted. |
| **Audit log / change history** | The salary table is already append-only (history is preserved). A full audit trail on all entity changes is a future enhancement. |
| **Email notifications** | Out of scope for a data-management tool at this stage. |
| **Cloud deployment** | Docker Compose is provided for one-command local run. Cloud deployment steps (Render / Railway) are documented in README. |

---

## 5. Non-Functional Requirements

- **Performance**: Employee list must render within 500ms for any page, regardless of total record count (server-side pagination with DB indexes)
- **Correctness**: All salary history is append-only — no data is ever deleted
- **Testability**: Business logic is isolated in service classes; unit tests run without a real database
- **Maintainability**: Clean Architecture (Controller → Service → Repository) — swapping SQLite to PostgreSQL requires one config line change

---

## 6. Assumptions

- One HR Manager user — no multi-tenancy
- Employee `email` is unique across the organisation
- A salary row is added for each change — the most recent `effective_date` represents the current salary
- Currencies are stored as ISO 4217 codes (USD, INR, GBP, EUR, etc.)
