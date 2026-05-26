from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from commerce_api.catalog import repository
from commerce_api.catalog.schemas import Category, Product
from commerce_api.db import get_db_session

router = APIRouter(prefix="/api/catalog", tags=["catalog"])


@router.get("/categories", response_model=list[Category])
def get_categories(session: Session = Depends(get_db_session)) -> list[Category]:
    return repository.list_categories(session)


@router.get("/products", response_model=list[Product])
def get_products(
    category: Annotated[str | None, Query(min_length=1)] = None,
    session: Session = Depends(get_db_session),
) -> list[Product]:
    return repository.list_products(session, category=category)


@router.get("/products/{slug}", response_model=Product)
def get_product(slug: str, session: Session = Depends(get_db_session)) -> Product:
    product = repository.get_product(session, slug)

    if product is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found.",
        )

    return product
