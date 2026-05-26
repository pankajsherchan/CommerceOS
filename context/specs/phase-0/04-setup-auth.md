# Unit 04: Setup Auth

## Goal

Add the first real storefront authentication flow using Keycloak. When this
unit is complete, a shopper can browse the storefront and use a local cart as
a guest, sign up or sign in through Keycloak, sign out cleanly, and reach
auth-gated storefront areas such as checkout and a simple account dashboard.

## Design

This unit is an auth-integration and access-gating milestone for
`apps/storefront`. It should wire the storefront into the chosen identity
provider without pulling commerce business rules into the auth layer.

- Keep the primary work inside `apps/storefront`.
- Use Keycloak as the only identity provider and align the flow with the
  architecture decision already documented in `context/architecture.md`.
- Treat login, signup, logout, callback handling, session reading, and route
  protection as the scope of this unit.
- Keep guest browsing and guest cart behavior available.
- Gate checkout and account/dashboard access behind authentication.
- Do not implement FastAPI JWT validation, customer account persistence, order
  history, or role-based admin access in this unit.

## Implementation

### Storefront Auth Flow

- Add storefront entry points for sign up, sign in, and sign out.
- Use OIDC authorization-code flow with Keycloak for browser-based
  authentication.
- Handle the auth callback inside `apps/storefront` with a Route Handler or
  equivalent web-layer entry point.
- Persist authenticated browser session state in a secure, server-readable
  session mechanism appropriate for Next.js App Router.

### Signed-Out Experience

- The storefront home and browse flows should remain accessible without login.
- Signed-out navigation should clearly expose sign up and sign in actions.
- Guests may still add items to the local cart.
- Guests who attempt to open checkout or the account/dashboard route should be
  redirected to sign in.

### Signed-In Experience

- Signed-in navigation should replace sign up and sign in actions with account
  and sign out affordances.
- Add a simple authenticated dashboard or account landing page in
  `apps/storefront` that confirms session state and serves as the first
  protected customer route.
- Authenticated shoppers should be allowed to proceed to the existing
  storefront checkout page.
- Signing out should clear the local session and return the shopper to a
  public storefront route.

### Route Protection and Session Access

- Keep route protection close to the storefront web layer using middleware,
  layout guards, or server-side session checks consistent with App Router.
- Protect only the routes that need auth in this unit: checkout and the
  dashboard/account page.
- Prefer server-side session reads for protected pages so initial render
  correctness does not depend on client hydration.
- Keep auth utilities app-local unless reuse becomes real.

### Keycloak Local Configuration

- Add the minimum local Keycloak configuration needed to support storefront
  login and signup in development.
- Document the expected realm, client, redirect URIs, logout redirect URIs,
  and required environment variables.
- Keep roles and groups out of scope unless the storefront client setup
  strictly requires defaults.

### Documentation Sync

- Update storefront auth setup notes if local run steps or environment setup
  changes.
- Update `context/progress-tracker.md` after implementation so the repo state
  reflects that storefront auth is now defined and wired.

## Dependencies

- Phase 0 foundation decisions in
  `context/specs/phase-0/01-foundation-decisions.md`
- Phase 0 repo bootstrap in
  `context/specs/phase-0/02-repo-bootstrap.md`
- Phase 0 storefront pages in
  `context/specs/phase-0/03-setup-storefront-pages.md`
- Existing `apps/storefront` Next.js App Router scaffold
- Existing `platform/keycloak` placeholder for local auth configuration

## Verify when done

- [ ] A shopper can sign up, sign in, and sign out from the storefront.
- [ ] Signed-out users can browse and add items to the local cart but cannot
      access checkout or the dashboard/account route.
- [ ] Signed-in users can access checkout and the protected dashboard/account
      route.
- [ ] Auth callback handling and session reads work in the Next.js App Router
      flow without relying on client-only auth state.
- [ ] Required Keycloak client settings and storefront auth environment
      variables are documented.
- [ ] `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build` succeed in
      `apps/storefront`.
- [ ] No FastAPI auth enforcement, customer profile persistence, order
      history, admin authorization model, or checkout/payment backend logic is
      introduced in this unit.
