from typing import Literal

from pydantic import Field

from commerce_api.schemas import ApiModel, Money


class Category(ApiModel):
    description: str
    name: str
    slug: str


class Product(ApiModel):
    badge: str | None = None
    category_name: str
    category_slug: str
    compare_at_price: Money | None = None
    description: str
    details: list[str]
    featured: bool
    inventory_label: str
    inventory_message: str
    inventory_status: Literal["in-stock", "low-stock", "preorder", "sold-out"]
    name: str
    price: Money
    short_description: str
    sizes: list[str] = Field(min_length=1)
    slug: str
    tone: Literal["clay", "sage", "ocean", "sand", "ink"]
