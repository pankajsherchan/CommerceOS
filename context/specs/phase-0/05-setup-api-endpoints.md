# Unit 04: Setup api endpoints

## Goal

Create the first real customer-facing storefront UI in `apps/storefront` using
mocked data only. When this unit is complete, a shopper can browse a mocked
catalog, open a mocked product detail page, add items to a mocked cart, edit
cart quantities, remove cart items, and move through a mocked checkout and
confirmation flow without any live API, auth, payment, or persistence work.

## Design

This unit is a storefront-shell and interaction-shell milestone, not a backend
or integration milestone. The output should make the planned customer journey
visible and believable while staying fully local to the Next.js app.

- Keep all work inside `apps/storefront`.
- Use the visual system from `context/ui-context.md`: light premium storefront,
  semantic tokens, `Manrope` plus `Fraunces`, and no hardcoded hex values in
  app components.
- Prefer Server Components for static page structure and mocked catalog reads.
- Use Client Components only where browser interactivity is required, such as
  add-to-cart controls, quantity changes, or a mobile filter drawer.
- Keep data mocked in app-local fixtures or helper modules. Do not create API
  routes, route handlers, shared contracts, or backend dependencies in this
  unit.
- Treat "edit" and "delete" as cart-item quantity updates and removal in the
  storefront, not as product-management CRUD screens.
- Keep checkout purely presentational and form-oriented. Do not implement
  payment intent creation, tax calculation, shipping-rate lookup, or order
  submission side effects yet.

## Implementation

### Route and Flow Scope

- Replace the placeholder storefront home page with a real mocked catalog entry
  experience.
- Add the initial customer flow routes needed for UI-only commerce browsing:
  catalog/listing, product detail, cart, checkout, and order confirmation.
- Use route structure that can later connect cleanly to live catalog and cart
  APIs without reworking the page hierarchy.
- Add `loading.tsx`, `not-found.tsx`, or route-level empty-state handling when
  the page structure benefits from it.

### Mocked Data Model

- Create app-local mock data for products, categories, prices, merchandising
  copy, cart items, and order-summary totals.
- Store money as integer minor units plus currency code even in mocks so the
  frontend starts with correct domain shape.
- Keep mock types explicit and local to the storefront unless real cross-app
  reuse appears later.
- Include enough mock variation to exercise list cards, badges, inventory
  messaging, empty cart states, and checkout summary rendering.

### Storefront Shell and Theme Baseline

- Implement the approved storefront shell: sticky top navigation, generous
  centered container, premium editorial feel, and responsive spacing.
- Add the shared storefront token foundation and font setup required for this
  UI unit if they are not already present in `apps/storefront`.
- Use semantic CSS variables for backgrounds, surfaces, borders, text, accent,
  ring, error, and success states.
- Introduce reusable app-local UI building blocks only where repetition is
  real across storefront pages; do not prematurely extract shared libraries.

### Catalog Listing Experience

- Build a product listing page with a merchandising header, category/filter
  affordances, sort affordance, and responsive product grid.
- On desktop, the layout should support a filter rail plus grid. On mobile, it
  should stack or use a drawer pattern consistent with the UI context.
- Product cards should show the key browse information: image, name, short
  description or category signal, price, and a path into product detail.
- Add believable empty, filtered, and no-results states using mocked data.

### Product Detail Experience

- Add a product detail page with media, product copy, pricing, variant or size
  affordance if useful, inventory/status messaging, and purchase controls.
- Follow the defined layout pattern: media-heavy layout with purchase rail on
  desktop and a single-column flow on mobile.
- The add-to-cart interaction may be local client state only, but the UI
  should clearly reflect a successful add action.
- Do not implement reviews, recommendations, or search indexing logic in this
  unit unless the page needs simple mocked placeholders.

### Cart Review, Edit, and Remove

- Add a cart page showing line items, quantity-edit controls, remove actions,
  subtotal summary, and the path to checkout.
- Support mocked empty-cart and populated-cart states.
- Keep cart interaction state local to the storefront app for now; no cookies,
  database persistence, or auth-backed cart ownership in this unit.
- Removal and quantity editing should update the visible mocked cart state so
  the flow feels real even though persistence is absent.

### Checkout UI Only

- Add a checkout page with stacked sections for contact, shipping, delivery,
  and payment-step placeholders plus a sticky order summary on desktop.
- Use `React Hook Form` only if it meaningfully improves the mocked checkout
  implementation; otherwise keep the form lightweight and defer full form
  wiring to the real checkout unit.
- Validation in this unit should be minimal and UX-oriented only. Real
  checkout rules remain a later backend and payment milestone.
- The final action should route to a mocked success or confirmation page rather
  than creating an order or calling Stripe.

### Motion, Accessibility, and Responsiveness

- Use subtle motion only where it reinforces hierarchy: page-intro transitions,
  card hovers, drawer entrance, or add-to-cart feedback.
- Respect `prefers-reduced-motion`.
- Ensure keyboard-visible focus states work against the storefront token set.
- Cover mobile and desktop layouts for list, detail, cart, and checkout pages.

### Documentation Sync

- Update app-local storefront docs if the run commands, route inventory, or UI
  structure becomes meaningfully different from the current placeholder state.
- Update `context/progress-tracker.md` after implementation so the repo state
  reflects that the storefront moved from placeholder shell to mocked commerce
  UI.

## Dependencies

- Phase 0 foundation decisions in
  `context/specs/phase-0/01-foundation-decisions.md`
- Phase 0 repo bootstrap in
  `context/specs/phase-0/02-repo-bootstrap.md`
- Existing `apps/storefront` Next.js App Router scaffold
- Tailwind CSS and the app-local frontend toolchain already established in the
  storefront

## Verify when done

- [ ] `apps/storefront` includes mocked catalog, product detail, cart,
      checkout, and confirmation routes with no backend dependency.
- [ ] The storefront uses the documented semantic theme tokens and approved
      typography instead of placeholder default styling.
- [ ] Cart add, quantity edit, and remove flows work locally in the browser
      against mocked state.
- [ ] Desktop and mobile layouts exist for list, detail, cart, and checkout
      experiences.
- [ ] `pnpm lint`, `pnpm typecheck`, `pnpm test`, and `pnpm build` succeed in
      `apps/storefront`.
- [ ] No FastAPI routes, Stripe integration, auth flow, database persistence,
      or shared-package extraction is introduced in this unit.
- [ ] `context/progress-tracker.md` reflects the new storefront UI milestone
      and any remaining follow-up work.
