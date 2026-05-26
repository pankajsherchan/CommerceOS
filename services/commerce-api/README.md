# Commerce API

`services/commerce-api` owns the first FastAPI-backed CommerceOS API slice.
Phase 0 stores catalog and cart state in PostgreSQL through SQLAlchemy and
Alembic.

## Current Scope

This service currently provides:

- `GET /health`
- `GET /api/catalog/categories`
- `GET /api/catalog/products`
- `GET /api/catalog/products/{slug}`
- `GET /api/cart`
- `POST /api/cart/items`
- `PATCH /api/cart/items`
- `DELETE /api/cart/items`
- `DELETE /api/cart`

Catalog and cart data are database-backed repositories. The local database is
PostgreSQL from the root `compose.yaml`. Cart writes require a placeholder
bearer token so the protected boundary is explicit before real JWT validation
arrives.

## Environment

- `COMMERCE_API_ALLOWED_ORIGINS` defaults to
  `http://localhost:3000,http://localhost:3001`
- `COMMERCE_API_DATABASE_URL` defaults to
  `postgresql+psycopg://commerce_os:commerce_os@localhost:5432/commerce_os`

## Commands

```bash
uv sync --dev
cd ../..
docker compose up -d postgres
cd services/commerce-api
uv run alembic upgrade head
uv run uvicorn commerce_api.main:app --reload
uv run pytest
uv run python -c "from commerce_api.main import app; print(app.title)"
```
