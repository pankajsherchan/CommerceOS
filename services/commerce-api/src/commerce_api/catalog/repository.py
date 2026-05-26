from sqlalchemy import Select, select
from sqlalchemy.orm import Session, joinedload

from commerce_api.catalog.schemas import Category, Product
from commerce_api.models import CategoryModel, ProductModel, json_string_list
from commerce_api.schemas import Money


def list_categories(session: Session) -> list[Category]:
    categories = session.scalars(
        select(CategoryModel).order_by(CategoryModel.sort_order),
    ).all()

    return [to_category(category) for category in categories]


def list_products(session: Session, category: str | None = None) -> list[Product]:
    statement = product_statement()

    if category is not None:
        statement = statement.where(ProductModel.category_slug == category)

    products = session.scalars(statement.order_by(ProductModel.sort_order)).all()

    return [to_product(product) for product in products]


def get_product(session: Session, slug: str) -> Product | None:
    product = session.scalar(product_statement().where(ProductModel.slug == slug))

    if product is None:
        return None

    return to_product(product)


def product_statement() -> Select[tuple[ProductModel]]:
    return select(ProductModel).options(joinedload(ProductModel.category))


def to_category(category: CategoryModel) -> Category:
    return Category(
        description=category.description,
        name=category.name,
        slug=category.slug,
    )


def to_product(product: ProductModel) -> Product:
    compare_at_price = None
    if product.compare_at_amount is not None and product.compare_at_currency is not None:
        compare_at_price = Money(
            amount=product.compare_at_amount,
            currency=product.compare_at_currency,
        )

    return Product(
        badge=product.badge,
        category_name=product.category.name,
        category_slug=product.category_slug,
        compare_at_price=compare_at_price,
        description=product.description,
        details=json_string_list(product.details),
        featured=product.featured,
        inventory_label=product.inventory_label,
        inventory_message=product.inventory_message,
        inventory_status=product.inventory_status,
        name=product.name,
        price=Money(amount=product.price_amount, currency=product.price_currency),
        short_description=product.short_description,
        sizes=json_string_list(product.sizes),
        slug=product.slug,
        tone=product.tone,
    )
