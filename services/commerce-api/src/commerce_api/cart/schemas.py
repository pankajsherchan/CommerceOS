from pydantic import Field

from commerce_api.schemas import ApiModel


class CartLine(ApiModel):
    product_slug: str = Field(min_length=1)
    quantity: int = Field(ge=1, le=99)
    size: str = Field(min_length=1)


class CartResponse(ApiModel):
    lines: list[CartLine]


class AddCartItemRequest(ApiModel):
    product_slug: str = Field(min_length=1)
    quantity: int = Field(default=1, ge=1, le=99)
    size: str = Field(min_length=1)


class UpdateCartItemRequest(ApiModel):
    product_slug: str = Field(min_length=1)
    quantity: int = Field(ge=1, le=99)
    size: str = Field(min_length=1)
