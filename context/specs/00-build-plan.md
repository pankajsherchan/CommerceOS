# CommerceOS Build Plan

## Recommended Delivery Track

CommerceOS should follow the default modular-monolith architecture from
`context/architecture.md` through the early and middle phases. The advanced
distributed design in `phase2/architecture-advanced.md` should be treated as a
later learning track, not the starting point.

This keeps the project aligned with the core goals:

- ship a reliable browse-to-pay flow first
- learn production operations without premature service sprawl
- evolve complexity only when a decision gate is met

## Current Planning Baseline

- Context hardening is complete.
- The repo still needs its actual app, service, and infrastructure skeletons.
- The first simplified repo-foundation specs now exist under
  `context/specs/phase-0/`.
- The next execution pass should run those Phase 0 specs in order instead of
  reopening top-level architecture unless a blocking decision appears.

## How Phases and Milestones Should Work

Use a three-level planning model:

1. `Phase`: a major outcome such as foundation, core commerce, or reliability
2. `Milestone`: a demoable slice inside the phase with a clear exit gate
3. `Unit Spec`: the implementation-sized task for one focused build session

Each milestone should be split into one or more spec files in
`context/specs/`. Every spec should follow the project methodology:

- Goal
- Design
- Implementation
- Dependencies
- Verify when done

## Planning Rules

- Finish dependencies before dependents.
- Lock unresolved foundation decisions before scaffolding work that depends on
  them.
- Build backend capabilities before wiring frontend to live data.
- Build UI shells before full data integration when that reduces ambiguity.
- Put auth before protected admin and account workflows.
- Treat Stripe webhooks, order snapshots, and idempotency as core correctness,
  not polish.
- Do not introduce advanced infrastructure until the current phase exit
  criteria are met and measured.

## Phase 0 - Foundation

### Goal

Create the repo, local environment, delivery pipeline, and documentation guard
rails that every later feature will rely on.

### Status

- `M0.1 Context Hardening` is complete.
- The remaining work in Phase 0 should now be expressed as small unit specs
  that can be implemented and verified independently.

### Milestones

#### M0.1 Context Hardening (Complete)

- Replace placeholders in `ui-context.md`, `code-standards.md`, and
  `ai-workflow-rules.md` with project-specific decisions.
- Confirm which architecture track is active by default.
- Define the first implementation units clearly enough that feature work does
  not require guessing.

#### M0.2 Foundation Decisions Lock

- Choose the JavaScript package-manager and repo-shape approach.
- Choose the frontend test baseline for the first frontend surface.
- Standardize the FastAPI persistence model on `Session` or `AsyncSession`
  before the API skeleton is created.
- Lock baseline runtime assumptions such as Node, Python, Docker, and shared
  environment-file conventions so bootstrap work does not fork.

#### M0.3 Repo Bootstrap and Surface Skeletons

- Create `apps/storefront`, `apps/admin`, `services/commerce-api`,
  `services/worker`, `platform/keycloak`, `platform/jenkins`,
  `infra/terraform`, and `docs/`.
- Bootstrap the first runnable frontend and backend surfaces without repo-wide
  workspace orchestration.
- Add root repo hygiene, onboarding docs, and only the shared config that the
  active surfaces actually need.

#### M0.4 Storefront Theme and Frontend Shell Baseline

- Create the first theme-token and typography foundation in the storefront.
- Add a minimal `apps/storefront` shell that proves the approved visual
  language can be wired cleanly.
- Keep the shell static or mocked; do not block it on live backend data.
- Extract shared UI structure later only if the admin app reaches real reuse.

#### M0.5 API, Contracts, Worker, and Observability Skeletons

- Create `services/commerce-api` with app bootstrap, health endpoint, settings,
  dependency seams, and domain-module layout.
- Create the initial contract and versioning conventions close to the API and
  storefront boundaries.
- Create `services/worker` and the first observability seams with local logging,
  correlation, and worker bootstrap support.

#### M0.6 Local Platform Runtime

- Add Docker Compose for PostgreSQL, Redis, Keycloak, and supporting local
  services.
- Add bootstrap scripts and a contributor setup path.
- Ensure the app shells and backend skeletons can boot against local
  dependencies even before domain features exist.

#### M0.7 Delivery and Docs Baseline

- Add Jenkins pipeline-as-code, ADR template, and initial runbook structure.
- Ensure local build and CI validation paths are defined.
- Make verification commands explicit for every Phase 0 unit so future work can
  reuse them.

#### M0.8 AWS Bootstrap

- Add Terraform foundations for networking, ECR, ECS, RDS, Redis, S3, secrets,
  and environment separation.
- Keep the Terraform layout modular and independently valid before application
  deployment logic is added.

### Exit Criteria

- A new contributor can install dependencies and run the local stack.
- A new contributor can boot the storefront, admin, API, and worker skeletons
  with documented commands.
- Repo boundaries match the architecture document.
- CI and local build rules are documented and runnable.
- The Phase 0 foundation decisions are locked in specs instead of being left as
  open repo-wide assumptions.

## Phase 1 - Core Commerce

### Goal

Ship the end-to-end commerce flow with a storefront, admin console, auth,
checkout, payments, and order visibility.

### Milestones

#### M1.1 Contracts and Data Foundation

- Define shared API contracts, domain vocabulary, and initial schemas.
- Create base migrations for catalog, pricing, inventory, carts, orders,
  payments, audit, and outbox tables.

#### M1.2 Catalog Admin and Storefront Browse

- Build admin CRUD for products, categories, prices, and inventory.
- Build storefront home, category, and product listing pages backed by the API.

#### M1.3 Product Detail and Search

- Build product detail pages and initial search/filter behavior.
- Start with PostgreSQL-backed search in line with the current architecture.

#### M1.4 Cart Flow

- Build guest cart and authenticated cart persistence.
- Support add, update, remove, and cart review flows.

#### M1.5 Identity and Account Foundation

- Integrate Keycloak for customer and operator login.
- Add role-gated admin access and account/order-history access for customers.

#### M1.6 Checkout and Stripe Payments

- Build checkout validation, shipping/billing capture, and payment intent
  creation.
- Process Stripe redirect UX, but treat webhook confirmation as authoritative.

#### M1.7 Orders and Admin Operations

- Create immutable order snapshots after successful payment confirmation.
- Build customer order history and admin order inspection/support views.

#### M1.8 Deployment and End-to-End Demo

- Deploy to staging or a production-like environment.
- Prove the full browse-to-pay-to-order-confirmation flow works end to end.

### Exit Criteria

- A shopper can browse, add to cart, check out, pay, and see order
  confirmation.
- An operator can manage catalog data and inspect orders.
- The application is deployable from source with documented steps.

## Phase 2 - Reliability and Async Work

### Goal

Add the operational patterns that make the core commerce flow safe and
recoverable.

### Milestones

#### M2.1 Worker Service and Queue Runtime

- Stand up `services/worker` and shared async execution patterns.
- Add queue contracts, retries, and dead-letter handling.

#### M2.2 Outbox and Event Publication

- Implement the outbox pattern in the commerce API.
- Publish idempotent domain events after successful writes.

#### M2.3 Webhook Hardening

- Make Stripe webhook processing idempotent and replay-safe.
- Add reconciliation paths for partial failure cases.

#### M2.4 Notifications

- Add async email or event notifications for order milestones.
- Ensure notification failure does not break core order correctness.

#### M2.5 Observability Baseline

- Add structured logs, traces, metrics, dashboards, and alerts for checkout and
  payment flows.

#### M2.6 Recovery Procedures

- Add backup, restore, rollback, and queue replay runbooks.

### Exit Criteria

- Duplicate async messages do not create duplicate business outcomes.
- Failed background work is visible and recoverable.
- Critical flows are observable enough to debug quickly.

## Phase 3 - Projections and Evolution

### Goal

Improve read performance and introduce rebuildable projections without breaking
the modular-monolith core.

### Milestones

#### M3.1 Search and Read Models

- Improve search and browse performance through Postgres tuning or projection
  tables first.
- Introduce OpenSearch only if the project can show a real limitation.

#### M3.2 Redis Performance Work

- Add targeted caching, rate-limit primitives, or session acceleration where
  measurement justifies it.

#### M3.3 Rebuildable Projection Tooling

- Add projection replay/rebuild flows and operational documentation.

#### M3.4 Fulfillment, Refunds, or Post-Purchase Expansion

- Add one realistic post-purchase workflow that exercises the order model.

#### M3.5 Service Extraction Decision Gate

- Evaluate whether any module deserves extraction based on deployment,
  ownership, or scaling evidence.

### Exit Criteria

- Search, cache, and projection layers remain disposable and rebuildable.
- Performance work is backed by measurement.
- Any extracted service has a documented reason to exist.

## Phase 4 - Scale and Resilience

### Goal

Practice operating the system under stress, abuse, and failure.

### Milestones

#### M4.1 Rate Limiting and Abuse Controls

- Add route-sensitive throttling for login, search, checkout, and admin flows.

#### M4.2 Load Testing and Profiling

- Define traffic scenarios, run load tests, and capture bottlenecks.

#### M4.3 Read Scaling and Capacity Tuning

- Tune queries, indexes, caches, and infrastructure using observed data.

#### M4.4 Failure Injection and Recovery Drills

- Simulate queue failures, webhook retries, dependency degradation, and deploy
  rollback scenarios.

#### M4.5 Cost and Architecture Review

- Document what the platform costs, where it strains, and what would justify
  the next architecture move.

### Exit Criteria

- Degradation behavior is understood and documented.
- Highest-risk failure modes have recovery playbooks.
- Scale decisions are evidence-based.

## Phase 5 - Kubernetes and Platform Capstone

### Goal

Add Kubernetes and GitOps only after the application and ECS path are already
understood.

### Milestones

#### M5.1 Packaging for Cluster Runtime

- Create Helm charts and deployment values.

#### M5.2 EKS Foundation

- Provision the cluster, ingress, secrets strategy, and workload policies.

#### M5.3 GitOps Delivery

- Add ArgoCD and compare deployment ergonomics with Jenkins-to-ECS.

#### M5.4 Comparative Platform Review

- Write down when ECS is enough, when EKS is justified, and what changed in
  operability.

### Exit Criteria

- Kubernetes is added for learning value, not as a reset.
- The repo can explain ECS versus EKS with evidence from this project.

## Suggested Next Spec Queue

These are the next Phase 0 unit specs, with the first two now authored:

1. `phase-0/01-foundation-decisions.md`
   Lock package manager, frontend test baseline, Python session model, and
   runtime assumptions.
2. `phase-0/02-repo-bootstrap.md`
   Create the initial repo skeleton, first runnable surfaces, and canonical
   directory structure without workspace orchestration.
3. `phase-0/03-storefront-theme-foundation.md`
   Create semantic tokens, font wiring, and the first storefront theme
   foundation, with shared extraction deferred.
4. `phase-0/04-storefront-shell.md`
   Create the customer-facing app shell with static placeholder routes and the
   approved visual language.
5. `phase-0/05-admin-shell.md`
   Create the operator app shell with the admin theme and route/layout
   scaffolding.
6. `phase-0/06-contracts-and-boundary-conventions.md`
   Create the initial contract structure and schema/versioning conventions near
   the owning surfaces.
7. `phase-0/07-commerce-api-skeleton.md`
   Create FastAPI bootstrap, settings, health route, router composition, and a
   minimal test baseline.
8. `phase-0/08-worker-and-observability-skeleton.md`
   Create the worker entrypoint plus logging, metrics, and correlation seams.
9. `phase-0/09-local-platform-runtime.md`
   Add Docker Compose, local bootstrap scripts, and developer setup
   instructions for PostgreSQL, Redis, and Keycloak.
10. `phase-0/10-ci-and-docs-baseline.md`
   Add Jenkins skeleton, repo quality gates, ADR template, and runbook
   scaffolding.
11. `phase-0/11-terraform-foundation.md`
   Add the initial Terraform module/environment layout and validation path.

## Decision Gates

- Do not adopt the advanced distributed architecture before Phase 2 exit
  criteria are met.
- Do not add OpenSearch before measured search requirements exceed PostgreSQL
  full-text or projection-table approaches.
- Do not extract services before module boundaries, observability, and async
  correctness are already strong inside the monolith.
- Do not add Kubernetes before the ECS path is running reliably and its limits
  are understood.
