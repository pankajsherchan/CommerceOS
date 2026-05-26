from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from commerce_api.auth import AuthContext, require_placeholder_auth
from commerce_api.cart import repository
from commerce_api.cart.schemas import (
    AddCartItemRequest,
    CartResponse,
    UpdateCartItemRequest,
)
from commerce_api.catalog.repository import get_product
from commerce_api.db import get_db_session

router = APIRouter(prefix="/api/cart", tags=["cart"])


@router.get("", response_model=CartResponse)
def get_cart(session: Session = Depends(get_db_session)) -> CartResponse:
    return CartResponse(lines=repository.list_lines(session))


@router.post("/items", response_model=CartResponse)
def add_cart_item(
    item: AddCartItemRequest,
    session: Session = Depends(get_db_session),
    _: AuthContext = Depends(require_placeholder_auth),
) -> CartResponse:
    validate_cart_item_selection(session, item.product_slug, item.size)
    return CartResponse(lines=repository.add_or_update_item(session, item))


@router.patch("/items", response_model=CartResponse)
def update_cart_item(
    item: UpdateCartItemRequest,
    session: Session = Depends(get_db_session),
    _: AuthContext = Depends(require_placeholder_auth),
) -> CartResponse:
    validate_cart_item_selection(session, item.product_slug, item.size)
    lines = repository.set_item_quantity(session, item)

    if lines is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cart item not found.",
        )

    return CartResponse(lines=lines)


@router.delete("/items", response_model=CartResponse)
def remove_cart_item(
    product_slug: str = Query(alias="productSlug", min_length=1),
    size: str = Query(min_length=1),
    session: Session = Depends(get_db_session),
    _: AuthContext = Depends(require_placeholder_auth),
) -> CartResponse:
    validate_cart_item_selection(session, product_slug, size)
    lines = repository.remove_item(session, product_slug, size)

    if lines is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cart item not found.",
        )

    return CartResponse(lines=lines)


@router.delete("", response_model=CartResponse)
def clear_cart(
    session: Session = Depends(get_db_session),
    _: AuthContext = Depends(require_placeholder_auth),
) -> CartResponse:
    return CartResponse(lines=repository.clear(session))


def validate_cart_item_selection(session: Session, product_slug: str, size: str) -> None:
    product = get_product(session, product_slug)

    if product is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found.",
        )

    if size not in product.sizes:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="Selected size is not available for this product.",
        )
