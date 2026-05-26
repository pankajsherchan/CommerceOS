# Progress Tracker

## Phase 0

- [x] 01 Foundation Decisions
- [x] 02 Repo Bootstrap
- [x] 03 Setup Storefront Pages
- [x] 04 Setup Auth
- [x] 05 Setup API Endpoints
- [x] 06 Setup DB
- [ ] 07 Setup TF
- [ ] 08 Setup Jenkins
- [ ] 09 Setup Logger

Current unit: 06 Setup DB

Status: implemented and verified.

Completed scope:

- Added Docker Compose PostgreSQL for local development.
- Added SQLAlchemy 2.0 models, request-scoped DB sessions, and Alembic
  migrations for catalog and placeholder cart tables.
- Seeded the Phase 0 starter categories, products, and cart lines through the
  initial migration.
- Replaced in-memory catalog and cart repositories with DB-backed repositories
  while preserving the Unit 05 API contract.
- Updated backend tests to use isolated seeded database sessions.

Next unit: 07 Setup TF.

## Phase 1

- [ ] 01 Microservice Setup
- [ ] 02 Setup Payment Stripe
