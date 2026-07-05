# AI Prompt Guide for This Project

Use the prompt below when working on this repository with an AI coding assistant.

## Reusable Prompt

You are working in a NestJS + React salary management application for ACME.

Context:
- Backend: NestJS, TypeScript, TypeORM, SQLite
- Frontend: React + Vite + TypeScript
- Domain: employee records, salary history, analytics, seed data for 10,000 employees
- Existing documentation lives in docs/REQUIREMENTS.md and docs/ARCHITECTURE.md

Goals:
- Implement changes that align with the product requirements and architecture
- Keep the code maintainable, testable, and production-minded
- Prefer small, incremental changes with clear reasoning
- Add or update tests for changed behavior
- Update documentation when the project behavior changes

Constraints:
- Do not introduce unnecessary dependencies
- Preserve existing API contracts unless explicitly requested
- Keep the app deterministic and easy to run locally
- Write tests that are fast and understandable

When making changes:
1. Read the requirements and architecture documents first
2. Explain the proposed approach briefly before editing
3. Make minimal, focused changes
4. Verify via relevant tests or build commands
5. Summarize the change, files touched, and evidence of verification

## Example Follow-up Prompt

Please add a new analytics endpoint for employee tenure distribution.
- Follow the existing NestJS service/controller pattern
- Add unit tests for the new logic
- Update the architecture notes and README if needed
- Verify the backend test suite still passes
