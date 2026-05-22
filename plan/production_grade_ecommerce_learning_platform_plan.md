# CommerceOS Production-Grade E-Commerce Learning Plan

## Project Intent

CommerceOS is a portfolio-quality reference implementation of a modern
commerce platform. The point is not to collect the maximum number of cloud
services. The point is to demonstrate senior-level engineering judgment by
building a revenue-critical system with clear tradeoffs, strong operational
discipline, and an architecture that evolves for the right reasons.

This project should teach and showcase:

- Product-to-architecture translation
- Modular monolith design and service extraction strategy
- Production operations, observability, and incident thinking
- Cloud infrastructure and delivery automation
- Security, compliance-minded design, and failure handling
- Modern frontend and backend system design

---

## Verification Notes

These updates align the plan with current official guidance and with a more
realistic production learning path:

- Next.js App Router is still the recommended path for new full-stack
  applications.
- FastAPI remains a strong production API choice, but deployment concerns such
  as HTTPS, restarts, replication, and memory sizing need to be planned
  explicitly.
- AWS ECS on Fargate is still the right initial container target when the goal
  is shipping production containers without the operational cost of Kubernetes.
- Jenkins is the preferred CI/CD choice for this plan because it deepens
  learning around controller and agent operations, pipeline-as-code, plugin
  management, secret handling, and deployment orchestration in a way that is
  still highly recognizable to many employers.
- Keycloak is the preferred auth choice for this plan because it deepens
  identity and access learning, keeps the architecture cloud-portable, and
  gives stronger hands-on experience with OIDC, roles, token mapping, and
  self-hosted auth operations.
- Stripe webhook events must be treated as the authoritative payment
  confirmation path, not browser redirects.
- Temporal, Kafka, OpenSearch, and EKS are valuable, but they should be added
  behind clear decision gates instead of being assumed from day one.

---

## Product Definition

### Phase 1 Product Shape

Build a realistic B2C commerce platform with:

- A customer storefront
- An internal admin/operations console
- A modular backend API
- A background worker for async jobs
- A real AWS deployment path

### Primary User Flows

#### Shopper

1. Browse and search the catalog
2. View product details
3. Add items to a cart as a guest or signed-in user
4. Enter shipping and billing details
5. Pay through Stripe
6. Receive order confirmation
7. View order status history

#### Operator

1. Sign in to the admin console
2. Create and update products, prices, and inventory
3. Review and manage orders
4. Investigate payment or fulfillment issues
5. View audit-friendly event history for critical actions

#### Engineer

1. Run the platform locally with containers
2. Ship changes through CI/CD
3. Observe logs, traces, metrics, and alerts
4. Roll forward or recover from bad deployments safely

---

## What Production-Grade Means Here

For this project, "production-grade" means:

- Reproducible infrastructure from source control
- Local, staging, and production-like environments
- Automated tests and CI quality gates
- Explicit security and access-control rules
- Observable critical flows with logs, metrics, and traces
- Idempotent payment and order workflows
- Backups, restore strategy, and operational runbooks
- Documentation that explains decisions, not just implementation

It does not mean:

- Starting with microservices everywhere
- Starting with Kubernetes everywhere
- Adding distributed systems tools before there is a reason
- Chasing hyperscale patterns before core correctness is solved

---

## Architecture Strategy

1. Start with a modular monolith.
   Phase 1 should keep business domains in one deployable backend so you can
   focus on correctness, boundaries, observability, migrations, and delivery.

2. Design modules as future service boundaries.
   Catalog, cart, checkout, orders, payments, notifications, and admin should
   have explicit ownership and minimal coupling even before extraction.

3. Keep PostgreSQL as the source of truth.
   Search indexes, caches, and analytics views should be projections that can
   be rebuilt.

4. Introduce async processing early, not distributed services early.
   Background jobs, outbox processing, retries, DLQs, and idempotency create
   real production learning without premature service sprawl.

5. Extract services only when you can defend the move.
   Service extraction should follow operational pain, scaling pressure,
   deployment independence, or ownership boundaries, not aesthetics.

---

## Recommended Stack

### Frontend

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- TanStack Query
- React Hook Form
- Zod

### Backend

- Python
- FastAPI
- Pydantic v2
- SQLAlchemy 2.0
- Alembic
- pytest

### Data and Platform

- PostgreSQL
- Redis
- S3
- Keycloak
- AWS ECS Fargate
- AWS ALB
- CloudFront
- Route53
- ECR
- Terraform

### Identity and Delivery

- Jenkins
- Keycloak with realm and client configuration managed as code

### Async and Observability

- SQS
- SNS
- OpenTelemetry
- Prometheus
- Grafana
- Loki
- Tempo
- structlog

### Later, Behind Decision Gates

- OpenSearch
- Kafka / MSK
- Temporal
- EKS
- Helm
- ArgoCD
- pgvector

---

## Recommended Repository Shape

```text
apps/
  storefront/
  admin/

services/
  commerce-api/
  worker/

packages/
  contracts/
  ui/
  config/
  observability/

platform/
  keycloak/
  jenkins/

infra/
  terraform/
  docker/

docs/
  adr/
  diagrams/
  runbooks/

context/
```

---

## Domain Model

### Phase 1 Domains

- Identity and access
- Catalog
- Pricing
- Inventory
- Cart
- Checkout
- Orders
- Payments
- Notifications
- Admin operations

### Later Domains

- Promotions and couponing
- Search indexing
- Refunds and returns
- Fulfillment workflows
- Recommendations
- Customer support tooling

---

## Data Ownership and Consistency Rules

- PostgreSQL is the system of record for customers, products, carts, orders,
  payment records, inventory, audit data, and the outbox.
- Redis is for ephemeral state and acceleration only: cache entries,
  rate-limits, idempotency helpers, and short-lived session data.
- S3 stores product media and generated artifacts such as exports or invoice
  documents.
- Search indexes are projections, never the source of truth.
- Historical orders store immutable pricing and product snapshots.
- Every externally triggered mutation must be idempotent.
- Payment success is confirmed by Stripe webhook processing, not by client-side
  callbacks.

---

## Environment Strategy

### Local

- Docker Compose for PostgreSQL, Redis, observability stack, and local service
  runtime
- Fast feedback for development and integration testing

### Preview

- Optional per-PR environment if cost is acceptable
- Useful for reviewer demos and end-to-end smoke tests

### Staging

- Production-like AWS environment
- Full checkout, queue, observability, and migration validation

### Production

- Real deployment target with controlled rollouts
- Stronger alerting, backup policy, and incident handling

---

## AWS Baseline

### Phase 1 Runtime

- CloudFront at the edge
- ALB for HTTP ingress
- ECS Fargate for storefront, admin, API, and worker containers
- RDS PostgreSQL
- ElastiCache Redis
- S3 for media
- SQS/SNS for async jobs and notifications

### Supporting Services

- Keycloak deployment on ECS Fargate
- Dedicated PostgreSQL database or schema for Keycloak state
- Jenkins controller with configuration-as-code
- Ephemeral Jenkins agents for builds, tests, image publishing, and deployment
- IAM roles for workloads
- Secrets Manager or SSM Parameter Store for secrets
- KMS for encryption
- CloudWatch for baseline AWS integration

### Later Additions

- WAF
- OpenSearch
- Multi-account environment isolation
- EKS as a separate capstone, not a prerequisite

---

## Security Baseline

- Self-hosted Keycloak for customer and operator authentication
- OIDC and JWT-based access control at every application boundary
- Realm, client, role, and mapper configuration managed as code
- JWT validation at every API boundary
- Role-based access for admin and support users
- Ownership checks for customer resources
- Least-privilege IAM for AWS workloads
- No secrets in source control or container images
- Stripe webhook signature verification
- Audit logging for admin mutations
- Dependency scanning and container image scanning in CI
- PII minimization and clear data retention rules

---

## Reliability and Observability Baseline

- Structured logs with request and correlation IDs
- OpenTelemetry traces across storefront, API, worker, and queue boundaries
- RED metrics for customer-facing APIs
- Business metrics for checkout conversion, payment failures, and order creation
- DLQs for failed async jobs
- Explicit timeout and retry policies
- Idempotency keys for payment and order workflows
- Database backup and restore drills
- SLOs and alert thresholds for critical paths
- Runbooks for the top failure scenarios

Suggested initial operational targets:

- API availability target: 99.9%
- P95 product page response under normal load: under 300 ms server time
- P95 checkout mutation response under normal load: under 500 ms server time
- RPO: 15 minutes or better
- RTO: under 1 hour for the first production-capable version

---

## Testing and Quality Gates

### Required Test Layers

- Unit tests for domain logic
- Integration tests for database and queue flows
- Contract tests for external provider boundaries
- End-to-end tests for storefront and admin critical paths
- Smoke tests after deployment

### CI Gates

- Formatting and linting
- Type checking
- Backend tests and frontend tests
- Production builds
- Migration validation
- Terraform fmt and validate
- Container image build
- Dependency and image security scanning

### Nice-to-Have Later

- Load testing for checkout and admin workflows
- OpenAPI or contract diff checks
- Chaos experiments for queue and dependency failures

---

## Delivery Roadmap

## Phase 0 - Foundation

### Goal

Establish the project skeleton, context docs, local tooling, CI, and baseline
infrastructure.

### Build

- Monorepo structure
- Six-file context system
- ADR template and docs structure
- Docker Compose for local dependencies
- Jenkins bootstrap with pipeline-as-code and configuration-as-code
- Local Keycloak setup and realm bootstrap
- Terraform bootstrap for networking, ECR, ECS, RDS, Redis, and S3

### Exit Criteria

- A new contributor can run the platform locally
- CI validates the repo on every change
- Core architecture and delivery rules are documented

---

## Phase 1 - Core Commerce

### Goal

Ship a production-shaped but still simple commerce platform end to end.

### Build

- Storefront for browse, product details, cart, and checkout
- Admin console for product, price, and order management
- Modular `commerce-api`
- Customer and operator auth flows through Keycloak
- Stripe payment flow
- Order confirmation and order history
- Initial deployment to staging and production-like AWS

### Exit Criteria

- A shopper can browse, add to cart, pay, and see an order confirmation
- An operator can manage products and inspect orders
- The stack is deployable from source with documented steps

---

## Phase 2 - Reliability and Async Work

### Goal

Add the operational patterns that make the system resilient.

### Build

- Worker service
- Outbox pattern
- SQS/SNS integration
- Notification processing
- Idempotent webhook handling
- Distributed tracing, dashboards, and alerts
- Backup, restore, and rollback procedures

### Exit Criteria

- Duplicate webhook delivery does not create duplicate business outcomes
- Failed async work is visible and recoverable
- Critical paths are observable through dashboards and traces

---

## Phase 3 - Projections and Evolution

### Goal

Introduce richer read models and selectively increase architectural complexity.

### Build

- Search projection pipeline
- Redis-backed performance improvements
- Catalog read-model optimization
- Optional service extraction if justified
- Initial fulfillment and refund workflows

### Exit Criteria

- Search and cache layers can be rebuilt from authoritative data
- Performance improvements are measured, not assumed
- Any extracted service has a documented reason to exist

---

## Phase 4 - Scale and Resilience

### Goal

Practice operating the platform under higher load and failure conditions.

### Build

- Load testing
- Rate limiting
- Feature flags
- Read scaling strategies
- Failure injection and chaos drills
- Capacity and cost review

### Exit Criteria

- Bottlenecks are documented with evidence
- The platform degrades predictably under stress
- Recovery playbooks exist for the highest-risk scenarios

---

## Phase 5 - Kubernetes / Platform Capstone

### Goal

Learn Kubernetes and GitOps only after the application already works well.

### Build

- EKS deployment path
- Helm charts
- ArgoCD
- Cluster observability and workload policies

### Exit Criteria

- You can articulate why ECS was sufficient earlier
- You can compare ECS and EKS tradeoffs with evidence from the project
- Kubernetes adds learning value instead of replacing solved problems

---

## Decision Gates for Advanced Tech

- Add OpenSearch only when PostgreSQL full-text search no longer meets
  relevance, latency, or filtering requirements.
- Add Kafka / MSK only when you need replayable event streams, multiple
  independent consumers, partition-based ordering, or higher event throughput
  than queues comfortably support.
- Add Temporal only when workflows become long-lived, multi-step, retry-heavy,
  or involve human approval and compensation logic that is painful to manage in
  ordinary queue consumers.
- Add EKS only when Kubernetes itself is a learning objective or when ECS
  meaningfully constrains workload management.
- Add AI features only outside the checkout critical path until the core
  commerce system is stable and observable.

---

## Portfolio Deliverables

To maximize GitHub and employer signal, the repo should eventually include:

- Architecture diagrams
- ADRs with tradeoff reasoning
- Threat model notes
- Runbooks for critical incidents
- Example dashboards or screenshots
- Load test results and bottleneck analysis
- A clear roadmap showing how the architecture evolved

---

## Key Principle

Build complexity progressively.

```text
Simple architecture
    ->
Operational pain
    ->
Measured learning
    ->
Deliberate evolution
    ->
Production-grade maturity
```

That sequence teaches better engineering judgment than starting with every
advanced tool on day one.
