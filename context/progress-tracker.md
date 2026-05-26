# Progress Tracker

## Phase 0

- [x] 01 Foundation Decisions
- [x] 02 Repo Bootstrap
- [x] 03 Setup Storefront Pages
- [x] 04 Setup Auth
- [x] 05 Setup API Endpoints

Current unit: 05 Setup API Endpoints

Status: implemented and verified.

Completed scope:

- Added the first FastAPI app with health, catalog, product detail, cart read,
  and placeholder-authenticated cart item write/update/remove/clear endpoints.
- Kept catalog and cart data in memory for Phase 0, with explicit Pydantic
  request and response models.
- Wired storefront catalog/product/cart reads through a small typed API client.
- Wired storefront cart add, quantity, remove, and sample-order clear actions
  through route handlers that proxy to the commerce API.
- Removed storefront catalog/cart fixture fallbacks; failed API list reads now
  resolve to empty arrays, and cart display enriches lines from API-loaded
  products.

Next unit: 06 Setup Logger.

## Phase 1

- [ ] 03 Setup Logger
- [ ] 04 Setup DB
- [ ] 05 Setup Jenkins
- [ ] 06 Setup TF

## Phase 2

- [ ] 01 Setup Authentication
- [ ] 02 Setup Payment Stripe

## Phase 3

- [ ] 01 Microservice Setup
