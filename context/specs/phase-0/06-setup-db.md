# Unit 06: Setup DB

## Goal

Replace the Phase 0 in-memory catalog and cart repositories with a real
database-backed persistence layer. The storefront/API contract from Unit 05
must remain stable, but data should be fetched from and written to PostgreSQL.
Local development must run PostgreSQL from Docker so contributors do not need a
host-level database installation.

## Design

- Use PostgreSQL as the local database runtime through Docker Compose.
- Use SQLAlchemy 2.0 typed declarative mappings for service data access.
- Use Alembic for schema creation and seed data needed by the Phase 0
  storefront flow.
- Keep catalog and cart behavior inside `services/commerce-api`; do not add
  admin, checkout, payment, worker, or infrastructure behavior in this unit.
- Preserve existing API response shapes and placeholder auth behavior.
- Store money as integer minor units plus currency code.
- Keep cart persistence simple for Phase 0 with one placeholder storefront cart
  key until real customer/session ownership is added.
- Make tests use an isolated database session and seed data instead of shared
  process memory.

## Data Model

- `catalog_categories`
  - `slug`, `name`, `description`, and `sort_order`
- `catalog_products`
  - product display fields, category relationship, inventory fields, money
    fields, sizes, details, and merchandising tone
- `cart_items`
  - placeholder cart key, product slug, selected size, quantity, and timestamps

## Implementation

- Add SQLAlchemy, Alembic, and a PostgreSQL driver to `services/commerce-api`.
- Add `COMMERCE_API_DATABASE_URL` setting with a local Docker Postgres default.
- Add service-local DB modules for engine/session management, models, and seed
  helpers.
- Add an initial Alembic migration that creates the catalog/cart tables and
  inserts the starter storefront data from Unit 05.
- Rewrite catalog and cart repositories to query and mutate through a
  SQLAlchemy `Session`.
- Add a FastAPI DB session dependency and inject it into catalog/cart routes.
- Add a root Docker Compose file for local PostgreSQL.
- Update docs with the local database startup and migration workflow.

## Verify when done

- [ ] `docker compose up -d postgres` starts a local PostgreSQL container.
- [ ] Alembic migrations apply cleanly.
- [ ] Commerce API imports and boots cleanly.
- [ ] Catalog endpoints return DB-backed categories and products.
- [ ] Cart endpoints read, add, update, remove, and clear DB-backed lines.
- [ ] `services/commerce-api` tests pass.
