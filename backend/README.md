## Description

Backend service for the ACME salary management application.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Seed data

The seed endpoint creates realistic salary data for 10,000 employees.

```bash
curl -X POST http://localhost:3000/seed/run
```

## Deployment notes

The backend is designed to run locally with SQLite and can be moved to a hosted environment by switching the ORM configuration. For a simple deployment path, a containerized setup or a managed PostgreSQL service would be the next step.

## Demo flow
1. Start the backend with npm run start:dev
2. Seed the database with the seed endpoint
3. Open the frontend and show employee listing, detail, and analytics views
4. Explain the salary-history design and the current test coverage
