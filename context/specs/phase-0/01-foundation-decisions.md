# Unit 01: Foundation Decisions

## Goal

Lock the baseline tooling and runtime choices that the CommerceOS repository
will use during Phase 0 and Phase 1. When this unit is complete, later
bootstrap work should not need to guess about package management, frontend
testing, Python service setup, database session style, or local environment
conventions.

## Design

This is a repo-foundation unit, not a product feature or UI build. The output
should live in repo-level docs and bootstrap config, with the decisions easy
to discover from the root README and the Phase 0 spec folder.

- Keep the result documentation-first and config-first.
- Use short decision tables or bullet lists instead of long prose.
- Do not scaffold feature code, screens, API routes, or infrastructure in this
  unit.
- Keep every choice aligned with the modular-monolith architecture already
  locked in `context/architecture.md`.

## Implementation

### JavaScript App Tooling Decision

- Standardize frontend dependency management on `pnpm` through Corepack.
- Do not add `pnpm` workspaces or `turbo` in Phase 0.
- Let each JavaScript app own its own `package.json`, scripts, and
  dependencies until cross-app reuse justifies extraction.
- Do not create shared `packages/*` directories before at least two active
  surfaces need the same code.

### Frontend Test Baseline

- Standardize on `Vitest` for fast unit and component tests.
- Use React Testing Library as the default DOM testing layer for React
  components.
- Standardize on `Playwright` for browser and end-to-end coverage.
- Do not adopt Jest or Cypress as parallel test stacks in Phase 0.
- Keep the unit-versus-browser testing split explicit in docs and per-app
  scripts so later specs can wire test commands without ambiguity.

### Python Service Baseline

- Standardize Python dependency and virtual-environment management on `uv`.
- Do not require a repo-level `uv` workspace in Phase 0; each Python service
  may bootstrap independently.
- Standardize the initial SQLAlchemy data-access approach on synchronous
  `Session`, not `AsyncSession`.
- Treat one session per request or job as the default unit-of-work model for
  Phase 0 and Phase 1 services.
- Do not mix sync and async SQLAlchemy session models during the initial
  modular-monolith build.

### Runtime and Environment Conventions

- Lock the local baseline on Node.js 22 LTS, `pnpm` 10 via Corepack, Python
  3.12, Docker Compose V2, PostgreSQL 16, and Redis 7.
- Commit `.env.example` files for every runnable app or service.
- Use `.env.local` for Next.js local overrides and keep it out of source
  control.
- Use `.env` for local Python service overrides and keep it out of source
  control.
- Keep secrets out of committed files and use UTC as the default time
  convention everywhere.

### Documentation Sync

- Update the planning docs that still assume a managed monorepo or workspace
  setup.
- Make the next executable step explicit: `02-repo-bootstrap.md` should become
  the direct follow-on unit after these decisions are locked.
- Record the chosen tooling approach in `context/progress-tracker.md` so the
  next session starts from settled assumptions.

## Dependencies

- None. This unit locks decisions and documentation only; package installation
  belongs to Unit 02.

## Verify when done

- [ ] Plain `pnpm` without `pnpm` workspaces or `turbo` is the documented
      JavaScript baseline for Phase 0.
- [ ] `Vitest` plus Testing Library and `Playwright` are the only documented
      frontend test baseline for Phase 0.
- [ ] `uv` without a repo-level workspace and synchronous SQLAlchemy
      `Session` are the documented Python service baseline.
- [ ] Runtime and environment-file conventions are written down in a
      contributor-facing location.
- [ ] `context/progress-tracker.md` no longer lists these foundation choices
      as open questions.
- [ ] No application code, infrastructure code, or UI feature work is added in
      this unit.
