# Architecture Context - Advanced Distributed Variant

## Intent

This file is an alternate architecture track for CommerceOS. It is intentionally
more complex than `architecture.md` and is designed for deep learning in
distributed systems, production operations, search infrastructure, deployment
safety, and platform engineering.

Use this file when the goal is maximum learning breadth and depth, not minimum
time to ship.

## Learning Focus

- Microservice decomposition and service boundaries
- Rolling, canary, and blue/green deployments
- Read/write split and read replicas
- Event-driven consistency and workflow orchestration
- Search indexing with OpenSearch
- Rate limiting at both edge and application layers
- Production observability, resilience, and incident response

## Stack

| Layer | Technology | Role |
| --- | --- | --- |
| Edge DNS | Route53 | Public DNS, health-aware routing, and environment separation |
| CDN | CloudFront | Global caching for storefront assets, image delivery, and selected cacheable API responses |
| Edge Security | AWS WAF | Rate-based rules, bot protection, IP reputation filtering, and path-specific traffic controls |
| Frontend | Next.js App Router + TypeScript | Storefront and admin applications with SSR and server-driven UI |
| BFF | Next.js server actions / route handlers or dedicated BFF service | Aggregates frontend-facing data and reduces client-to-microservice coupling |
| Service Runtime | AWS ECS Fargate | Per-service container runtime with autoscaling and isolated deployments |
| Service Networking | ALB + ECS Service Connect | Ingress, service discovery, and service-to-service communication |
| API Services | FastAPI | Domain-oriented microservices with typed contracts and async I/O |
| Auth | Keycloak | Self-hosted identity provider for customers and operators with OIDC, OAuth 2.0, and JWT-based access control |
| Primary Database | Aurora PostgreSQL | Transactional source of truth with writer and reader endpoints |
| Cache / Coordination | Redis | Cart/session caching, application rate limiting, idempotency keys, and short-lived coordination state |
| Search | Amazon OpenSearch Service | Full-text search, faceting, ranking experiments, and autocomplete indexes |
| Search Ingestion | OpenSearch Ingestion or dedicated indexer workers | Managed or application-driven indexing pipelines |
| Messaging | EventBridge + SQS + SNS | Domain events, queue-based workers, retries, DLQs, and decoupled async flows |
| Ordered Messaging | SQS FIFO | Ordered workflows where duplicates and reordering are unacceptable |
| Payments | Stripe Payment Intents + webhooks | External payment lifecycle and asynchronous payment state confirmation |
| Secrets | AWS Secrets Manager | Secure secret storage and rotation |
| Observability | OpenTelemetry + Prometheus + Grafana + Loki + Tempo | Traces, metrics, logs, dashboards, and alerting |
| Infrastructure | Terraform | Environment provisioning and immutable infrastructure changes |
| CI/CD | Jenkins + ECS deployment strategies + CodeDeploy | Build, validate, and progressively deploy services through pipeline-as-code and controlled rollout jobs |

## Deployment Topology

```text
Users
  ->
Route53
  ->
CloudFront
  ->
AWS WAF
  ->
ALB
  ->
Next.js Storefront / Admin
  ->
BFF
  ->
Microservices on ECS Fargate

Microservices communicate via:
- synchronous HTTP through Service Connect
- asynchronous domain events through EventBridge
- queue-based jobs through SQS

Data systems:
- Aurora PostgreSQL writer endpoint
- Aurora reader endpoint / replicas
- Redis
- OpenSearch
- S3
```

## System Boundaries

- `apps/storefront/` — Customer-facing commerce UI, SEO pages, account flows,
  and checkout experience.
- `apps/admin/` — Internal operator console for catalog, inventory, order, and
  support workflows.
- `services/bff/` — Frontend-facing aggregation layer that shields clients from
  microservice topology and centralizes request shaping, caching, and
  application-level rate limiting.
- `services/catalog-service/` — Product, category, attribute, and merchandising
  ownership. Publishes catalog change events.
- `services/search-service/` — Search query APIs, relevance tuning, facets,
  autocomplete, and zero-downtime index alias switching.
- `services/cart-service/` — Guest and authenticated carts, cart recovery,
  pricing previews, and cart persistence strategy.
- `services/pricing-service/` — Price lists, sale pricing, currency logic,
  promotional calculations, and price snapshots for downstream consumers.
- `services/inventory-service/` — Inventory availability, reservation, release,
  and stock adjustment workflows.
- `services/checkout-service/` — Checkout validation, idempotency, quote
  creation, and orchestration of payment/order handoff.
- `services/order-service/` — Order creation, immutable order snapshots,
  lifecycle state changes, and customer-visible order history.
- `services/payment-service/` — Stripe integration, payment intent lifecycle,
  webhook verification, and payment state reconciliation.
- `services/notification-service/` — Email, SMS, webhook fan-out, and customer
  communication templates.
- `services/indexer-service/` — Consumes domain events and updates OpenSearch
  indexes and other read models.
- `services/audit-service/` — Centralized audit event ingestion and queryable
  trail of privileged actions.
- `services/worker/` — Shared background processing for retries, DLQ replay,
  scheduled jobs, and non-user-facing async tasks.
- `platform/keycloak/` — Keycloak realm bootstrap, client definitions, role
  mapping, identity provider configuration, themes, and environment-specific
  auth configuration as code.
- `platform/jenkins/` — Jenkins controller configuration-as-code, shared
  libraries, multibranch pipeline definitions, agent templates, credentials
  integration, and deployment orchestration jobs.
- `packages/contracts/` — Shared API schemas, event envelopes, versioned
  contracts, and typed SDK helpers.
- `packages/observability/` — Logging, tracing, metrics, and correlation-id
  helpers used by every service.
- `infra/terraform/` — Networking, compute, databases, caches, search,
  queues, IAM, observability, and deployment plumbing.

## Service Communication Model

- Frontends talk to the BFF, not directly to every domain service.
- Synchronous HTTP is reserved for low-latency request/response operations such
  as product detail hydration, cart retrieval, and operator actions that need
  immediate confirmation.
- Domain events are published after successful writes through the outbox
  pattern, then delivered to downstream services through EventBridge or SQS.
- Critical ordered workflows such as payment reconciliation or inventory
  reservation use FIFO queues where ordering matters.
- Cross-service writes must never rely on distributed transactions; consistency
  is achieved through idempotent events, retries, compensations, and explicit
  workflow state.

## Storage Model

- **Aurora PostgreSQL Writer Endpoint**: All authoritative writes for service
  domains. Each microservice owns its own schema or logical database. If a
  domain becomes hot or operationally independent enough, it can graduate to a
  separate cluster later.
- **Aurora Reader Endpoint / Replicas**: Read-heavy operations for catalog,
  product detail hydration, reporting, and selected admin queries. Services
  must assume replica lag and avoid using replicas where read-after-write
  consistency is required.
- **Redis**: Cart acceleration, checkout session state, rate limiting counters,
  idempotency helpers, and short-lived cache entries.
- **OpenSearch**: Search documents, facets, suggestions, synonyms, and ranking
  experiments. Search remains a projection and can be fully rebuilt from
  authoritative data.
- **S3**: Product media, export files, report artifacts, and other large binary
  objects.
- **Audit Store**: Append-only audit log storage for privileged mutations and
  security-sensitive events.

## Search Architecture

- Catalog and pricing changes publish events through an outbox.
- The indexer service or OpenSearch Ingestion pipeline transforms those events
  into search documents.
- Search indexes are versioned and accessed through aliases so reindexing can
  happen without downtime.
- OpenSearch owns relevance concerns such as stemming, analyzers, synonyms,
  autocomplete, and facet filtering.
- Product detail pages should still be renderable even if OpenSearch is
  degraded; search failure must not take down the entire storefront.

## Deployment Strategy

- Low-risk services such as notification or audit can use standard ECS rolling
  deployments with deployment health thresholds and circuit breakers.
- Customer-critical services such as checkout, payment, order, and the BFF
  should use safer progressive deployment strategies, favoring blue/green or
  canary rollout when the team is ready.
- Every service deployment must be backward-compatible with the previous API
  contract and current event schema during rollout.
- Database changes follow expand-contract migration patterns so old and new
  service versions can coexist during deployment.
- Autoscaling should combine CPU, memory, ALB request count, and SQS backlog,
  depending on the service profile.

## Tradeoffs and Risks

- This architecture provides much stronger learning coverage, but it slows down
  feature delivery and raises the cognitive load of every change.
- Keycloak adds real identity-platform learning, but it also adds operational
  surface area around upgrades, availability, session behavior, and realm
  configuration management.
- Jenkins adds meaningful CI/CD platform depth, but it also adds operational
  overhead around controller durability, plugin hygiene, agent management, and
  credentials security.
- Eventual consistency becomes a daily design concern, especially across
  checkout, inventory, pricing, and search.
- Local development, CI, and debugging all become significantly more expensive
  and slower than in the default modular-monolith track.
- Employers will value this more if the repo clearly explains why each piece of
  complexity exists and what failure mode it addresses.
- If this path is chosen, architecture decision records and incident-style
  runbooks become mandatory, not optional.

## Rate Limiting Strategy

- **Edge rate limiting with WAF**: IP-based and path-scoped limits for login,
  search, checkout, and admin entry points.
- **Application rate limiting with Redis**: Token bucket or sliding-window
  controls per user, session, API key, or route inside the BFF and selected
  backend services.
- **Abuse-sensitive endpoints**: Login, password reset, coupon application,
  search autocomplete, checkout mutations, and admin mutations receive stricter
  thresholds than ordinary browse traffic.
- **Internal protection**: Concurrency caps and queue backpressure protect
  payment, order, and indexing services from fan-out storms.

## Reliability and Resilience Patterns

- Outbox pattern for reliable event publication
- Idempotency keys on checkout, payment initiation, and webhook processing
- Dead-letter queues for all important async consumers
- Retry policies with exponential backoff and jitter
- Circuit breakers and timeout budgets for service-to-service HTTP calls
- Replica-aware read paths that tolerate lag or fall back to primary reads
- Graceful degradation when search, notifications, or non-critical services are
  impaired
- Scheduled replay and redrive workflows for failed events

## Security Model

- Keycloak manages customer and operator authentication.
- Keycloak configuration should be versioned and bootstrapped as code so realms,
  clients, roles, groups, and token mappings are reproducible across
  environments.
- Service-to-service permissions are enforced through IAM roles, network
  boundaries, and explicit service authorization checks.
- Secrets live in Secrets Manager and are injected at runtime rather than being
  baked into images or source control.
- WAF protects public entry points before traffic reaches the application.
- Admin actions are role-gated and audit logged.
- Stripe webhooks must be signature-verified and processed idempotently.
- Sensitive data is encrypted at rest and in transit, with KMS-backed key
  management where applicable.

## Observability Model

- Every request carries a correlation ID from the edge through the BFF,
  services, workers, and asynchronous consumers.
- OpenTelemetry spans connect storefront requests to downstream service calls,
  queue publishes, and queue consumers.
- Metrics cover both platform health and business health: request latency,
  error rates, queue age, index lag, checkout success rate, payment failure
  rate, and order creation throughput.
- Logs are structured JSON and must include domain identifiers such as cart ID,
  order ID, payment intent ID, and event ID when relevant.
- Dashboards and alerts should exist for at least: checkout, payment webhook
  flow, search indexing lag, replica lag, and deployment health.

## Invariants

1. Each microservice owns its write model and is the only writer to its
   authoritative data boundary.
2. Read replicas and OpenSearch are read-only projections and must never be
   treated as the system of record.
3. Payment confirmation is authoritative only after verified webhook or an
   equivalent trusted server-side confirmation path.
4. Historical orders store immutable pricing and product snapshots and are not
   mutated to match later catalog changes.
5. Every public entry point must have both edge protection and application-level
   abuse controls.
6. All asynchronous consumers must be safe to retry and safe to receive
   duplicates.
7. No deployment may require coordinated downtime across all services.
8. Search, notifications, and analytics may be eventually consistent; checkout
   correctness may not be sacrificed for architectural elegance.

## Advanced Extensions

- Introduce MSK if you want replayable, partitioned event streams beyond what
  EventBridge and SQS comfortably provide.
- Introduce Temporal for long-lived workflows such as returns, refunds,
  fulfillment exceptions, or human approval loops.
- Add separate Aurora clusters for the hottest domains if per-service logical
  isolation on one cluster becomes a bottleneck.
- Add global distribution, multi-region DR, or active-active edge concerns only
  after the single-region platform is well understood.
