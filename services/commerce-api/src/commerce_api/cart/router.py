from fastapi import APIRouter, Depends, HTTPException, Query, status

from commerce_api.auth import AuthContext, require_placeholder_auth
from commerce_api.cart.repository import cart_repository
from commerce_api.cart.schemas import (
    AddCartItemRequest,
    CartResponse,
    UpdateCartItemRequest,
)
from commerce_api.catalog.repository import get_product

router = APIRouter(prefix="/api/cart", tags=["cart"])


@router.get("", response_model=CartResponse)
def get_cart() -> CartResponse:
    return CartResponse(lines=cart_repository.list_lines())


@router.post("/items", response_model=CartResponse)
def add_cart_item(
    item: AddCartItemRequest,
    _: AuthContext = Depends(require_placeholder_auth),
) -> CartResponse:
    validate_cart_item_selection(item.product_slug, item.size)
    return CartResponse(lines=cart_repository.add_or_update_item(item))


@router.patch("/items", response_model=CartResponse)
def update_cart_item(
    item: UpdateCartItemRequest,
    _: AuthContext = Depends(require_placeholder_auth),
) -> CartResponse:
    validate_cart_item_selection(item.product_slug, item.size)
    lines = cart_repository.set_item_quantity(item)

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
    _: AuthContext = Depends(require_placeholder_auth),
) -> CartResponse:
    validate_cart_item_selection(product_slug, size)
    lines = cart_repository.remove_item(product_slug, size)

    if lines is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cart item not found.",
        )

    return CartResponse(lines=lines)


@router.delete("", response_model=CartResponse)
def clear_cart(_: AuthContext = Depends(require_placeholder_auth)) -> CartResponse:
    return CartResponse(lines=cart_repository.clear())


def validate_cart_item_selection(product_slug: str, size: str) -> None:
    product = get_product(product_slug)

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
