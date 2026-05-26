# Storefront

`apps/storefront` is the mocked customer-facing storefront for CommerceOS phase 1.

## Commands

```bash
pnpm install
pnpm dev
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

## Local Auth

The storefront uses Keycloak through OIDC authorization-code flow with PKCE.
For local development, import `platform/keycloak/realm-commerceos.json` into a
Keycloak server running at `http://localhost:8080`.

One local container option:

```bash
docker run --name commerceos-keycloak \
  -p 127.0.0.1:8080:8080 \
  -e KC_BOOTSTRAP_ADMIN_USERNAME=admin \
  -e KC_BOOTSTRAP_ADMIN_PASSWORD=admin \
  -v "$PWD/../../platform/keycloak:/opt/keycloak/data/import:ro" \
  quay.io/keycloak/keycloak:26.6.1 \
  start-dev --import-realm
```

Create `apps/storefront/.env.local` from `.env.example` and set a unique
`STOREFRONT_AUTH_SESSION_SECRET` before using sign-in locally.

Expected local settings:

- Realm: `commerceos`
- Client: `commerceos-storefront`
- Redirect URI: `http://localhost:3000/auth/callback`
- Local fallback redirect URI: `http://localhost:3001/auth/callback`
- Post-logout redirects: `http://localhost:3000/*` and
  `http://localhost:3001/*`
- Required scopes: `openid email profile`

## Scope

This app currently contains:

- a premium storefront shell with semantic theme tokens and project typography
- a mocked home page and catalog listing experience
- product detail, cart, checkout, and order confirmation routes
- app-local mocked catalog and cart state with client-side quantity editing
- Keycloak-backed sign up, sign in, sign out, and server-readable session state
- protected checkout and account dashboard routes
- route-level loading and not-found handling
- Vitest coverage for the storefront home page

Live API integration, customer profile persistence, taxes, shipping quotes, and
Stripe payments are deliberately deferred to later units.
