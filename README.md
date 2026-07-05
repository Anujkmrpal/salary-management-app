# Salary Management App

ACME Org employee salary management software for a 10,000-employee organization.

## What this project includes
- A NestJS backend with TypeORM and SQLite
- A React + Vite frontend for employee, salary, and analytics workflows
- Seed data generation for 10,000 employees
- Requirements and architecture documentation in the docs folder
- Backend unit tests for core service logic

## Run locally

### Backend
```bash
cd backend
npm install
npm run start:dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend tests
```bash
cd backend
npm run test
```

## Project artifacts
- Requirements: [docs/REQUIREMENTS.md](docs/REQUIREMENTS.md)
- Architecture: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- AI prompt guide: [docs/AI_PROMPT.md](docs/AI_PROMPT.md)

## Demo checklist
- Start the backend and frontend locally
- Seed the database to generate realistic sample data
- Open the employee directory, employee detail view, and analytics dashboard
- Show salary history creation and the append-only history model
- Highlight the backend tests and documentation artifacts

## Submission notes
This app is intentionally scoped to the HR manager workflow and omits authentication, multi-tenant access, and complex currency normalization so the core salary-management experience remains clear and maintainable.

For a live demo, a short walkthrough should cover: onboarding to the app, employee management, salary history updates, and analytics insights.
