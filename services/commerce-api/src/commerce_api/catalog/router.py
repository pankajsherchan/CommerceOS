from typing import Annotated

from fastapi import APIRouter, HTTPException, Query, status

from commerce_api.catalog import repository
from commerce_api.catalog.schemas import Category, Product

router = APIRouter(prefix="/api/catalog", tags=["catalog"])


@router.get("/categories", response_model=list[Category])
def get_categories() -> list[Category]:
    return repository.list_categories()


@router.get("/products", response_model=list[Product])
def get_products(
    category: Annotated[str | None, Query(min_length=1)] = None,
) -> list[Product]:
    return repository.list_products(category=category)


@router.get("/products/{slug}", response_model=Product)
def get_product(slug: str) -> Product:
    product = repository.get_product(slug)

    if product is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found.",
        )

    return product
