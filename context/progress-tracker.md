# Progress Tracker

## Phase 0

- [x] 01 Foundation Decisions
- [x] 02 Repo Bootstrap
- [x] 03 Setup Storefront Pages
- [x] 04 Setup Auth
- [ ] 05 Setup API Endpoints

### Completed: 04 Setup Auth

- Added Keycloak OIDC authorization-code flow with PKCE for storefront sign up,
  sign in, callback handling, and sign out.
- Added signed, HTTP-only storefront session cookies readable from server
  components and route handlers.
- Protected checkout and account routes with server-side session checks while
  leaving home, catalog, product detail, and cart browsing public for guests.
- Added a simple authenticated account dashboard that displays Keycloak session
  identity details without introducing customer persistence.
- Added local Keycloak realm/client import config and storefront auth
  environment documentation.
- Added a local Docker Compose Keycloak runtime for end-to-end storefront auth
  testing against the imported `commerceos` realm.

### Next: 05 Setup API Endpoints

- Introduce the first commerce API slice without moving auth enforcement,
  customer account persistence, order history, or payment behavior ahead of
  their planned units.

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
