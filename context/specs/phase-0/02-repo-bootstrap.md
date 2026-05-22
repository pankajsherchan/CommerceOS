# Unit 02: Repo Bootstrap

## Goal

Create the initial CommerceOS repository skeleton using the locked Phase 0
foundation choices. When this unit is complete, the repo has its canonical
directory structure, first runnable surfaces, and contributor-facing setup docs
without managed workspace orchestration.

## Design

This unit is structure-first and toolchain-first. The result should prove that
the repo can grow cleanly without prematurely introducing shared packages,
workspace tooling, or full implementations for every planned surface.

- Match the top-level boundaries in `context/architecture.md` exactly.
- Keep the first runnable surfaces intentionally minimal and unbranded in this
  unit.
- Keep shared repo config in obvious root files, but let app or service tool
  config live with the owning surface.
- Use Next.js App Router for the first frontend app bootstrap.
- Do not introduce the real dual-theme system, extracted shared libraries,
  FastAPI routes, worker consumers, or Terraform resources yet.

## Implementation

### Root Repo Baseline

- Add root onboarding and repo hygiene files such as `README.md`,
  `.editorconfig`, `.gitignore`, and Node version pinning.
- Do not add `pnpm-workspace.yaml`, `turbo.json`, or a repo-level JavaScript
  orchestration layer in this unit.
- Add root shared config only when multiple active surfaces need it; otherwise
  keep tool config with the owning app or service.

### Storefront App Skeleton

- Create `apps/storefront` as a Next.js App Router + TypeScript application.
- Include only the minimal files needed to boot: app layout, home page,
  metadata, and global styles.
- Use neutral placeholder content that clearly identifies the storefront app.
- Do not add navigation, commerce flows, auth, API integration, or final
  visual styling in this unit.
- The app must be runnable from its own directory with app-local commands.

### Planned Surface Placeholders

- Create lightweight placeholder directories or `README.md` markers for
  `apps/admin`, `services/worker`, `platform/keycloak`, `platform/jenkins`,
  `infra/terraform`, and `docs/`.
- Keep these placeholders intentional and clearly scoped so the roadmap remains
  visible without bootstrapping everything at once.

### Commerce API Skeleton

- Create `services/commerce-api` as the first Python service skeleton with its
  own `pyproject.toml`, import-safe `src/` package directory, and minimal
  placeholder module only.
- Use `uv` locally from the service directory instead of a repo-level Python
  workspace.
- Do not add FastAPI app bootstrap, database sessions, worker logic, or queue
  handling in this unit.
- Add only the smallest amount of Python tool metadata needed to make the API
  skeleton coherent for later units.

### Shared Code Strategy

- Do not create `packages/ui`, `packages/contracts`, or
  `packages/observability` in this unit.
- Keep theme tokens, contracts, and observability helpers local to the owning
  surface until reuse justifies extraction into `shared/`.

### Testing and Quality Baseline

- Add app-local lint, typecheck, build, and test commands for `apps/storefront`.
- Implement the `Vitest` baseline with at least one minimal smoke test so the
  storefront test command proves the setup is wired correctly.
- Add `Playwright` only if it can be introduced without significant friction at
  this stage; otherwise document the deliberate deferral in repo docs and the
  progress tracker.

### Documentation and Onboarding

- Update the root README with prerequisites, install steps, repo layout,
  and first commands for booting the initial runnable surfaces.
- Document how JavaScript and Python tooling are split across app-local `pnpm`
  usage and service-local `uv` usage.
- Explain that shared libraries are intentionally deferred until real reuse
  exists.
- Update `context/progress-tracker.md` when the repo skeleton is in place and
  point the next unit at the storefront theme foundation.

## Dependencies

- `pnpm` via Corepack (frontend package manager)
- `next`, `react`, `react-dom` (storefront scaffold)
- `typescript`, `@types/node`, `@types/react`, `@types/react-dom` (TypeScript
  support)
- `eslint`, `@typescript-eslint/parser`, `@typescript-eslint/eslint-plugin`,
  `eslint-config-next` (linting baseline)
- `prettier` (formatting baseline if needed for the active surface)
- `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`
  (storefront unit and component test baseline)
- `@playwright/test` (browser and end-to-end baseline if introduced now)
- `uv` (Python dependency and virtual-environment management)

## Verify when done

- [ ] Root repo docs and hygiene files exist without `pnpm` workspace or
      `turbo` config.
- [ ] `apps/storefront` boots as a minimal placeholder Next.js app with
      app-local commands.
- [ ] `services/commerce-api` exists as an import-safe Python package skeleton
      only, with no API behavior added yet.
- [ ] `apps/admin`, `services/worker`, `platform/keycloak`,
      `platform/jenkins`, `infra/terraform`, and `docs/` all exist with
      intentional placeholders.
- [ ] `apps/storefront` local lint, typecheck, test, and build commands
      succeed.
- [ ] Root docs explain prerequisites, per-surface commands, and the deliberate
      absence of workspace orchestration.
- [ ] `context/progress-tracker.md` is updated to reflect completion of this
      unit and the next queued unit.
