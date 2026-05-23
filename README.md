# CommerceOS

CommerceOS is a production-grade e-commerce reference platform built as a
single repository with app-local JavaScript tooling and service-local Python
tooling.

## Current Status

Phase 0 foundation work is in progress. The repository currently includes:

- `apps/storefront` as the first runnable Next.js surface
- `services/commerce-api` as the first Python package skeleton
- Placeholder directories for the remaining planned platform surfaces

Shared libraries, workspace orchestration, and production feature
implementations are intentionally deferred until later units justify them.

## Prerequisites

- Node.js `22` with Corepack enabled
- `pnpm`
- Python `3.12`
- `uv`

## Repository Layout

- `apps/storefront` - customer-facing Next.js storefront skeleton
- `apps/admin` - future admin application placeholder
- `services/commerce-api` - future FastAPI service skeleton
- `services/worker` - future async worker placeholder
- `platform/keycloak` - future auth configuration placeholder
- `platform/jenkins` - future CI/CD configuration placeholder
- `infra/terraform` - future infrastructure placeholder
- `docs` - future long-lived project documentation
- `context` - product, architecture, workflow, and progress-tracking documents

## Getting Started

### Storefront

Install dependencies and run the app from its own directory:

```bash
cd apps/storefront
pnpm install
pnpm dev
```

Useful storefront commands:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

### Commerce API Skeleton

Set up the Python package from its own directory:

```bash
cd services/commerce-api
uv sync
uv run python -c "import commerce_api"
```

This service is intentionally only a package skeleton in Phase 0. It does not
include a FastAPI app, routes, or database wiring yet.

## Tooling Strategy

- Frontend tooling is app-local with `pnpm` inside each JavaScript surface.
- Python tooling is service-local with `uv` inside each Python surface.
- There is no repo-level `pnpm` workspace, `turbo`, or Python workspace in
  this phase.
- Shared code will move into `shared/` only after real cross-surface reuse
  exists.

## Testing Baseline

The storefront includes:

- ESLint for linting
- TypeScript strict mode for typechecking
- Vitest plus Testing Library for a minimal smoke-test baseline

Playwright is deliberately deferred until the first browser flow unit adds
enough UI to justify end-to-end coverage.
