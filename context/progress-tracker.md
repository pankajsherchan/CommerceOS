# Progress Tracker

Update this file after every meaningful implementation
change.

## Current Phase

- Phase 0 - Foundation

## Current Goal

- Execute Unit 02 repo bootstrap using the locked Phase 0 foundation
  decisions and establish the first runnable project skeletons.

## Completed

- Read the required context files and aligned the project with the default
  modular-monolith track in `context/architecture.md`.
- Added `context/specs/00-build-plan.md` with phased delivery guidance,
  milestone sequencing, decision gates, and the first suggested unit order.
- Replaced placeholder content in `ui-context.md`, `code-standards.md`, and
  `ai-workflow-rules.md` with project-specific decisions based on the selected
  stack and official framework or vendor documentation.
- Synced `architecture.md` with additional concrete stack choices and made the
  Payment Intents decision explicit as a deliberate learning tradeoff.
- Revisited `context/specs/00-build-plan.md` after context hardening and
  refined Phase 0 into a concrete spec queue aligned to the one-unit-at-a-time
  workflow.
- Clarified that `phase2/architecture-advanced.md` is the optional advanced
  track reference used later in the project, not the active default path.
- Authored the first Phase 0 execution specs in
  `context/specs/phase-0/01-foundation-decisions.md` and
  `context/specs/phase-0/02-repo-bootstrap.md`.
- Synced `context/specs/00-build-plan.md` so the Phase 0 queue now points at
  the new `context/specs/phase-0/` paths.
- Revised the Phase 0 foundation plan to avoid managed monorepo or workspace
  tooling for now, favoring a simpler single-repository start with app-local
  and service-local tooling.
- Locked the Phase 0 foundation decisions for package management, testing,
  Python service setup, and runtime conventions as the baseline for repo
  bootstrap.

## In Progress

- Executing `context/specs/phase-0/02-repo-bootstrap.md`.

## Next Up

- Author `context/specs/phase-0/03-storefront-theme-foundation.md` after the
  repo skeleton is in place.
- Bootstrap the local platform runtime after the first app and service
  skeletons are in place.

## Open Questions

- Confirm whether `phase2/architecture-advanced.md` remains a pure capstone
  track or whether any reliability patterns should be pulled forward earlier.
- Decide in the later shell units whether the first Playwright browser smoke
  test should become blocking immediately or land as a non-blocking baseline
  until more real UI exists.

## Architecture Decisions

- Use the modular-monolith architecture in `context/architecture.md` as the
  default implementation path through the early phases because it matches the
  product goals and avoids premature distributed complexity.
- Treat `phase2/architecture-advanced.md` as an optional later evolution path
  gated by measured need and learning goals.
- Use a shared dual-persona token system: a light storefront theme and a dark
  admin theme backed by one semantic CSS variable model.
- Keep Stripe Payment Intents plus webhooks as the payment architecture for
  CommerceOS even though Stripe recommends Checkout Sessions for many simpler
  integrations, because this project explicitly values deeper payment lifecycle
  and reconciliation learning.
- Start with a simple single repository and plain app-local `pnpm` usage rather
  than `pnpm` workspaces or `turbo`.
- Standardize the frontend test baseline on `Vitest` plus React Testing
  Library for unit/component coverage and `Playwright` for browser coverage.
- Standardize Python service setup on `uv` without a repo-level workspace and
  synchronous SQLAlchemy `Session` for the initial modular-monolith phases.

## Session Notes

- The build plan now reflects the real repo starting point: context hardening
  is done, but implementation specs and project skeletons still need to be
  created.
- Unit 01 is treated as settled guidance for the repo baseline; the active
  implementation focus is now Unit 02 repo bootstrap.
