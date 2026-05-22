# Architecture Context

## Stack

| Layer | Technology | Role |
| --- | --- | --- |
| Frontend | Next.js App Router + TypeScript | Customer storefront and internal admin applications with SSR, routing, and server-side rendering support |
| Client Server State | TanStack Query | Client-side mutation state, cache invalidation, hydration, and responsive server-state UX for interactive flows |
| Forms | React Hook Form | Checkout and admin form state management in interactive browser flows |
| UI | Tailwind CSS + shadcn/ui | Shared design primitives and fast, consistent interface development |
| Validation | Zod + Pydantic | Boundary validation for frontend forms and backend request/response models |
| API | FastAPI | Primary commerce API exposing domain operations and internal integrations |
| Persistence | SQLAlchemy 2.0 + Alembic | Database access, schema migrations, and transactional consistency |
| Auth | Keycloak | Self-hosted identity provider for customers and operators using OIDC, OAuth 2.0, and JWT-based access control |
| Database | PostgreSQL | System of record for commerce state, audit data, and outbox records |
| Cache | Redis | Ephemeral caching, rate limiting, idempotency helpers, and short-lived session data |
| Object Storage | S3 | Product media and generated artifacts such as exports or invoice documents |
| Async | SQS + SNS | Background processing and domain-event fan-out without day-one streaming complexity |
| Payments | Stripe Payment Intents + webhooks | Direct payment lifecycle control, confirmation, and asynchronous payment state updates for a deeper learning-oriented integration |
| Runtime | AWS ECS Fargate | Initial container orchestration target with lower operational overhead than Kubernetes |
| Observability | OpenTelemetry + Prometheus + Grafana + Loki + Tempo | Traces, metrics, logs, dashboards, and alerting for critical flows |
| Logging | structlog | Structured application logging with domain identifiers and correlation context |
| Infrastructure | Terraform | Reproducible cloud infrastructure and environment provisioning |
| CI/CD | Jenkins | Pipeline-as-code, build orchestration, test automation, artifact publishing, and deployment workflows |
| Local Runtime | Docker Compose | Local orchestration for PostgreSQL, Redis, Keycloak, and supporting development services |

## System Boundaries

- `apps/storefront/` — Owns the customer-facing web experience, including
  catalog pages, account pages, and checkout UI.
- `apps/admin/` — Owns internal operator workflows for catalog management,
  inventory updates, order review, and support actions.
- `services/commerce-api/` — Owns the modular backend application and domain
  modules for catalog, pricing, inventory, cart, checkout, orders, payments,
  and notifications.
- `services/worker/` — Owns asynchronous job execution such as webhook
  processing, notifications, retries, and projection updates.
- `platform/keycloak/` — Owns Keycloak realm bootstrap, client definitions,
  roles, groups, token mappers, and environment-specific auth configuration as
  code.
- `platform/jenkins/` — Owns Jenkins configuration-as-code, shared pipeline
  libraries, agent templates, credentials integration, and deployment jobs.
- `shared/` — Optional home for extracted cross-surface code such as contracts,
  UI primitives, and observability helpers once real reuse exists. Early phases
  may keep these concerns local to the owning app or service.
- `infra/terraform/` — Owns AWS networking, compute, storage, messaging,
  secrets, and environment provisioning.
- `docs/` — Owns ADRs, diagrams, runbooks, and other long-lived supporting
  documentation.

## Storage Model

- **PostgreSQL**: Authoritative storage for customers, products, categories,
  prices, carts, inventory, orders, payment records, audit logs, and the
  outbox.
- **Redis**: Non-authoritative storage for cache entries, rate-limit counters,
  idempotency support, and short-lived session or checkout data.
- **S3**: Product media, exports, and generated files that do not belong in the
  transactional database.
- **Search Projection**: Postgres full-text search first; OpenSearch may be
  introduced later as a rebuildable projection if search requirements outgrow
  the relational approach.

## Auth and Access Model

- Customer and operator identities are managed through Keycloak.
- Keycloak owns realms, clients, roles, groups, token mappers, and identity
  federation configuration for both storefront and admin access patterns.
- Storefront flows may support guest carts, but authenticated users own their
  saved account data and order history.
- FastAPI validates Keycloak-issued JWTs at API boundaries and enforces
  ownership checks before any customer data mutation.
- Admin and support capabilities are role-gated and every privileged mutation
  should be audit logged.
- Internal infrastructure access is granted through AWS IAM roles, not shared
  static credentials.

## Invariants

1. Phase 1 remains a modular monolith in `services/commerce-api/`; service
   extraction is a later evolution, not a starting assumption.
2. PostgreSQL is the source of truth for commerce state; caches, search, and
   projections must be disposable and rebuildable.
3. Historical orders store immutable pricing and product snapshots and are not
   rewritten when catalog data changes later.
4. Stripe webhooks are the authoritative confirmation source for payment
   outcomes; browser redirects only improve user experience.
5. Side effects such as notifications, projections, and external integrations
   run asynchronously and must be idempotent.
6. CommerceOS intentionally keeps Stripe Payment Intents instead of defaulting
   to Checkout Sessions because the project explicitly wants hands-on payment
   lifecycle, retry, and webhook reconciliation learning. Reversing that choice
   requires an explicit architecture decision.
7. Phase 0 starts with a simple single-repository layout, not managed
   JavaScript or Python workspace orchestration. Shared libraries should be
   extracted only after concrete cross-surface reuse exists.
8. `phase2/architecture-advanced.md` is an optional later learning track and
   does not replace the default modular-monolith plan unless an explicit
   decision is recorded.
