# Code Standards

## General

- Keep modules small and aligned to a single responsibility or domain boundary.
- Keep business rules in domain or service code, not in UI components, ORM
  models, or infrastructure glue.
- Fix root causes instead of layering retries, guards, or UI workarounds over
  ambiguous behavior.
- Prefer explicit contracts, typed boundaries, and readable names over magic.
- Do not mix unrelated read, write, transport, and presentation concerns in
  one file or function.

## TypeScript

- `strict` mode is required in every TypeScript project.
- Avoid `any`. Use `unknown` at untrusted boundaries and parse before use.
- Keep contract types close to the owning surface until reuse is real; when the
  same API shape is reused across boundaries, extract one shared definition
  instead of hand-copying it.
- Use Zod to validate unknown external input before application code trusts it.
- Prefer discriminated unions and literal workflow states for multi-step flows.
- Use `satisfies` where it strengthens config typing without widening values.

## Next.js App Router

- App Router only. Pages and layouts are Server Components by default.
- Add `"use client"` only when state, event handlers, browser APIs, or custom
  browser-only hooks require it.
- Fetch initial page data on the server when SEO, first render correctness, or
  auth-gated SSR matters.
- Use client-side server-state tooling only for mutation-heavy, interactive, or
  revalidated experiences; do not wrap every page in client fetching by habit.
- Declare cache intent explicitly for server fetches and route segments.
- Keep Route Handlers focused on web-layer concerns such as auth callbacks,
  cookies, signed upload helpers, proxying, or third-party webhooks. Commerce
  business logic belongs in FastAPI.
- Use `loading.tsx`, `error.tsx`, `not-found.tsx`, and suspense boundaries for
  route-level UX instead of ad hoc spinners.
- Use `next/font` for project fonts.

## Forms and Validation

- Use a single schema per form boundary when possible so UI validation and
  transport validation stay aligned.
- Client validation improves UX; server validation remains authoritative.
- Multi-step forms must persist state only when the product spec explicitly
  requires it.
- Do not let form components own pricing, inventory, auth, or payment rules.

## FastAPI and Python

- Organize the API as domain modules with `APIRouter`s and shared dependencies.
- Keep routers thin: parse input, enforce auth, and orchestrate services only.
- Use Pydantic models for external input and output; do not expose raw ORM
  entities at the transport layer.
- Default write models to strict, explicit field handling. Unexpected fields
  should be rejected unless a boundary explicitly allows them.
- Use dependency injection for DB session, auth context, settings, and shared
  services.
- Return explicit response models so output filtering is intentional.

## SQLAlchemy and Alembic

- Use SQLAlchemy 2.0 typed declarative mappings.
- Treat the session as a unit-of-work boundary: one session per request or job.
- Lower layers must not call `commit()` or `rollback()`; transaction control
  happens at the service or request boundary.
- All schema changes go through Alembic.
- Review every `--autogenerate` migration manually before merge.
- Name constraints explicitly so migration diffs remain stable and reviewable.
- Keep the main branch on a single migration head.

## Styling

- Use the semantic CSS variables and theme tokens defined in `ui-context.md`.
- No hardcoded hex values in app components.
- Reuse the shared radius scale from `ui-context.md`; do not invent one-off
  radii.
- Prefer a shared UI module only after a pattern repeats across pages or apps;
  do not extract component libraries before the second real use case exists.
- Focus states must remain visible in both storefront and admin themes.
- Respect reduced-motion preferences.

## API Routes

- Validate request input before business logic runs.
- Enforce auth, ownership, and role checks before any mutation.
- Return documented, consistent response shapes.
- Stripe write requests must use idempotency keys.
- Each Stripe `PaymentIntent` maps to a single cart or checkout session and
  should be reused when the customer resumes checkout.
- Webhook handlers must verify signatures from the raw request body, return
  success quickly, and move side effects into idempotent async processing.
- Browser redirects improve checkout UX, but Stripe webhooks remain the
  authoritative payment confirmation path.

## Data and Storage

- PostgreSQL is the authoritative source of truth.
- Redis, search indexes, and UI caches are disposable layers.
- Store money as integer minor units plus currency code; never persist floating
  point monetary values.
- Historical orders must store immutable snapshots of the purchased state.
- Metadata belongs in the database; large binary assets belong in S3.
- Store timestamps in UTC.
- Do not store secrets, raw card data, or sensitive payment details in
  application tables or logs.
- Avoid PII in Stripe metadata, idempotency keys, and structured logs.

## Async and Observability

- Every request, job, and domain event should carry a correlation ID.
- Use structured JSON logs and include business identifiers such as `cart_id`,
  `order_id`, `payment_intent_id`, or `event_id` when present.
- Instrument services with traces, metrics, and logs using OpenTelemetry
  conventions where practical.
- Prometheus metrics must use low-cardinality labels only. Never create
  per-user or free-text label values.
- Async consumers must be safe to retry, safe to replay, and explicit about
  dead-letter behavior.
- Notifications, projections, and other side effects run asynchronously and
  must not determine order correctness.

## Infrastructure and Delivery

- Terraform is the source of truth for cloud infrastructure.
- Run `terraform fmt` and `terraform validate` on touched infrastructure code.
- Organize Terraform as reusable modules and environment compositions.
- Keep variable and output descriptions current in Terraform modules.
- Jenkins delivery logic lives in source control. Prefer Declarative Pipeline
  unless Scripted Pipeline is clearly justified.
- Database migrations run as an explicit delivery step, not as an implicit
  application-start side effect.
- Container images are immutable build artifacts and should be deployed by
  reference, not rebuilt during deployment.

## File Organization

- `apps/storefront/` — Customer-facing Next.js application, route handlers,
  page shells, and app-local UI wiring.
- `apps/admin/` — Operator-facing Next.js application and admin-specific
  workflows.
- `services/commerce-api/` — FastAPI application code organized by domain,
  including routers, services, schemas, repositories, and migrations.
- `services/worker/` — Async consumers, scheduled jobs, and retry/replay logic.
- `shared/` — Optional extracted cross-surface code such as contracts, UI
  primitives, or observability helpers once reuse is proven.
- `platform/keycloak/` — Realm bootstrap, client scopes, roles, groups, token
  mappers, and auth configuration as code.
- `platform/jenkins/` — Jenkinsfiles, shared libraries, and configuration as
  code.
- `infra/terraform/` — Reusable Terraform modules and environment entrypoints.
- `docs/` — ADRs, runbooks, diagrams, and operational documentation.
- `context/` — Product, architecture, UI, workflow, and progress-tracking
  documents that guide implementation.
