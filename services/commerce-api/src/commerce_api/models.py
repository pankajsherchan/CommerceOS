from datetime import datetime
from typing import Any

from sqlalchemy import (
    CheckConstraint,
    DateTime,
    ForeignKey,
    Integer,
    String,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
from sqlalchemy.types import JSON


class Base(DeclarativeBase):
    pass


class CategoryModel(Base):
    __tablename__ = "catalog_categories"

    slug: Mapped[str] = mapped_column(String(80), primary_key=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    description: Mapped[str] = mapped_column(String(500), nullable=False)
    sort_order: Mapped[int] = mapped_column(Integer, nullable=False)

    products: Mapped[list["ProductModel"]] = relationship(back_populates="category")


class ProductModel(Base):
    __tablename__ = "catalog_products"
    __table_args__ = (
        CheckConstraint(
            "inventory_status in ('in-stock', 'low-stock', 'preorder', 'sold-out')",
            name="ck_catalog_products_inventory_status",
        ),
        CheckConstraint(
            "tone in ('clay', 'sage', 'ocean', 'sand', 'ink')",
            name="ck_catalog_products_tone",
        ),
        CheckConstraint("price_amount >= 0", name="ck_catalog_products_price_amount"),
        CheckConstraint(
            "compare_at_amount is null or compare_at_amount >= 0",
            name="ck_catalog_products_compare_at_amount",
        ),
    )

    slug: Mapped[str] = mapped_column(String(120), primary_key=True)
    badge: Mapped[str | None] = mapped_column(String(80))
    category_slug: Mapped[str] = mapped_column(
        ForeignKey("catalog_categories.slug", name="fk_catalog_products_category_slug"),
        nullable=False,
        index=True,
    )
    compare_at_amount: Mapped[int | None] = mapped_column(Integer)
    compare_at_currency: Mapped[str | None] = mapped_column(String(3))
    description: Mapped[str] = mapped_column(String(1000), nullable=False)
    details: Mapped[list[str]] = mapped_column(JSON, nullable=False)
    featured: Mapped[bool] = mapped_column(nullable=False)
    inventory_label: Mapped[str] = mapped_column(String(80), nullable=False)
    inventory_message: Mapped[str] = mapped_column(String(300), nullable=False)
    inventory_status: Mapped[str] = mapped_column(String(20), nullable=False)
    name: Mapped[str] = mapped_column(String(160), nullable=False)
    price_amount: Mapped[int] = mapped_column(Integer, nullable=False)
    price_currency: Mapped[str] = mapped_column(String(3), nullable=False)
    short_description: Mapped[str] = mapped_column(String(300), nullable=False)
    sizes: Mapped[list[str]] = mapped_column(JSON, nullable=False)
    sort_order: Mapped[int] = mapped_column(Integer, nullable=False)
    tone: Mapped[str] = mapped_column(String(20), nullable=False)

    category: Mapped[CategoryModel] = relationship(back_populates="products")


class CartItemModel(Base):
    __tablename__ = "cart_items"
    __table_args__ = (
        UniqueConstraint(
            "cart_key",
            "product_slug",
            "size",
            name="uq_cart_items_cart_product_size",
        ),
        CheckConstraint("quantity between 1 and 99", name="ck_cart_items_quantity"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    cart_key: Mapped[str] = mapped_column(String(120), nullable=False, index=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )
    product_slug: Mapped[str] = mapped_column(
        ForeignKey("catalog_products.slug", name="fk_cart_items_product_slug"),
        nullable=False,
    )
    quantity: Mapped[int] = mapped_column(Integer, nullable=False)
    size: Mapped[str] = mapped_column(String(80), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )

    product: Mapped[ProductModel] = relationship()


def json_string_list(value: Any) -> list[str]:
    if not isinstance(value, list):
        return []

    return [item for item in value if isinstance(item, str)]
