# AI Workflow Rules

## Approach

Build CommerceOS incrementally using a spec-driven workflow.

The order of truth is:

1. `context/project-overview.md` for product intent
2. `context/architecture.md` for boundaries and invariants
3. `context/ui-context.md` for the visual system
4. `context/code-standards.md` for implementation rules
5. `context/specs/00-build-plan.md` for sequencing
6. The current unit spec in `context/specs/`
7. `context/progress-tracker.md` for the live state of the repo

Do not implement from a vague prompt alone when a unit is large or ambiguous.
Either work from an existing spec file or update the relevant context first so
the task becomes explicit.

## Scoping Rules

- Work on one feature unit at a time
- Prefer small, verifiable increments over large
  speculative changes
- Do not combine unrelated system boundaries in a
  single implementation step
- Default to one primary outcome per unit: one shell, one API slice, one data
  model slice, one async workflow, or one infra slice
- Split checkout, payments, auth, and deployment work more aggressively than
  ordinary browse UI because the risk is higher

## When to Split Work

Split an implementation step if it combines:

- UI shell work and backend mutation logic
- Schema migration work and multiple unrelated domain modules
- Auth or role-model changes and the product features they protect
- Synchronous API changes and asynchronous worker or queue-consumer changes
- Infrastructure provisioning and application behavior changes
- Behavior that is not clearly defined in the context files or current spec

If a change cannot be verified end to end quickly,
the scope is too broad — split it.

## Handling Missing Requirements

- Do not invent product behavior not defined in the
  context files
- If a requirement is ambiguous, resolve it in the
  relevant context file before implementing
- If a requirement is missing, add it as an open question
  in `progress-tracker.md` before continuing
- If external integration behavior is uncertain, check the
  primary vendor docs and record the chosen approach in the
  relevant context file or an ADR before coding against it

## Protected Files

Do not modify the following unless explicitly instructed:

- Generated shared UI primitives once they exist in an extracted shared UI
  module.
  Prefer wrapping or composing them rather than editing generated source.
- Applied migration history in `services/*/alembic/versions/` for shared
  environments. Prefer corrective follow-up migrations over rewriting history.
- Third-party library internals or vendored source.
- Tool-managed files such as lockfiles, exported Keycloak artifacts, or Jenkins
  config exports, except through the documented generation or update workflow.

## Keeping Docs in Sync

Update the relevant context file whenever implementation
changes:

- System architecture or boundaries
- Storage model decisions
- Code conventions or standards
- Feature scope
- Build ordering or milestone sequencing

Always update `progress-tracker.md` after every meaningful implementation or
documentation change so the next session starts from reality instead of memory.

## Before Moving to the Next Unit

1. The current unit works end to end within its defined scope
2. No invariant defined in `architecture.md` was violated
3. `progress-tracker.md` reflects the completed work
4. The relevant verification commands for the touched surface pass

Verification expectations by surface:

- Frontend: run the app-level typecheck, lint, and build commands for the
  touched frontend surface and any extracted shared module it depends on
- Backend: run the relevant tests and confirm the service imports and boots
  cleanly
- Database: confirm migrations apply cleanly and match the intended schema
- Infrastructure: run `terraform fmt -check` and `terraform validate` for
  touched modules
- Integrations: verify both the happy path and at least one failure or retry
  case when the unit touches payments, webhooks, queues, or auth

If a validation command does not exist yet, either add it as part of the unit
or record the gap explicitly in `progress-tracker.md` before moving on.
