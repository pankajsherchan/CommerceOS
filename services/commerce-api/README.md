# Commerce API Skeleton

`services/commerce-api` is the first Python service scaffold for CommerceOS.

## Current Scope

This package currently provides only:

- `pyproject.toml` with service-local `uv` metadata
- a `src/commerce_api` package that imports cleanly

FastAPI app bootstrap, routers, database access, and service modules are
deliberately deferred to later units.

## Commands

```bash
uv sync
uv run python -c "import commerce_api"
```
