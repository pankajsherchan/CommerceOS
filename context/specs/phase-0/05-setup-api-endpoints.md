# Unit 05: Setup API Endpoints

## Goal

Add the first FastAPI-backed storefront endpoints so the UI reads catalog and
cart data from `services/commerce-api` instead of local fixtures. Data remains
in-memory until the database unit.

## Design

- Keep commerce business logic in `services/commerce-api`.
- Keep storefront API access in `apps/storefront` thin and typed.
- Use hardcoded repository data only for this unit.
- Validate all request input with Pydantic models.
- Return explicit response models.
- Require authentication only for customer-owned or mutation endpoints.
- Do not add database, payments, admin APIs, or worker behavior.

## Endpoints

- `GET /health` returns service health.
- `GET /api/catalog/categories` returns storefront categories.
- `GET /api/catalog/products` returns products with optional category filter.
- `GET /api/catalog/products/{slug}` returns one product or `404`.
- `GET /api/cart` returns the current cart fixture.
- `POST /api/cart/items` validates and adds or updates a cart line.

## Implementation

- Bootstrap a FastAPI app in `services/commerce-api`.
- Organize code by domain: app setup, catalog router, cart router, schemas,
  and in-memory repositories.
- Add CORS configuration for the local storefront origin.
- Add a lightweight auth dependency placeholder for protected cart mutation
  routes; real JWT validation is deferred until the auth/API integration unit.
- Update storefront data loading to call the API through a small typed client
  with a local fallback only if required for build-time safety.
- Document required local API environment variables.

## Dependencies

- Existing storefront pages and product/cart fixture shapes.
- Existing Keycloak storefront auth flow.
- No database dependency.

## Verify when done

- [ ] Commerce API imports and boots cleanly.
- [ ] Health, catalog, product detail, and cart endpoints return documented
      shapes.
- [ ] Invalid product slugs and invalid cart payloads return correct errors.
- [ ] Storefront pages render from API-backed data.
- [ ] `services/commerce-api` tests pass.
- [ ] `apps/storefront` lint, typecheck, test, and build pass.
