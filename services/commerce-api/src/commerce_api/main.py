from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from commerce_api.cart.router import router as cart_router
from commerce_api.catalog.router import router as catalog_router
from commerce_api.settings import get_settings


def create_app() -> FastAPI:
    settings = get_settings()
    app = FastAPI(title="CommerceOS Commerce API", version="0.1.0")

    app.add_middleware(
        CORSMiddleware,
        allow_credentials=True,
        allow_headers=["*"],
        allow_methods=["*"],
        allow_origins=settings.allowed_origins,
    )

    @app.get("/health", tags=["health"])
    def health() -> dict[str, str]:
        return {"status": "ok"}

    app.include_router(catalog_router)
    app.include_router(cart_router)

    return app


app = create_app()
