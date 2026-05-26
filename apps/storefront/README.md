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

## Scope

This app currently contains:

- a premium storefront shell with semantic theme tokens and project typography
- a mocked home page and catalog listing experience
- product detail, cart, checkout, and order confirmation routes
- app-local mocked catalog and cart state with client-side quantity editing
- route-level loading and not-found handling
- Vitest coverage for the storefront home page

Live API integration, auth, persistence, taxes, shipping quotes, and Stripe
payments are deliberately deferred to later units.
