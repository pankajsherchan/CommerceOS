from sqlalchemy import select
from sqlalchemy.orm import Session

from commerce_api.cart.schemas import AddCartItemRequest, CartLine, UpdateCartItemRequest
from commerce_api.models import CartItemModel
from commerce_api.seed import STARTER_CART_KEY


def list_lines(session: Session, cart_key: str = STARTER_CART_KEY) -> list[CartLine]:
    rows = session.scalars(cart_statement(cart_key)).all()

    return [to_cart_line(row) for row in rows]


def add_or_update_item(
    session: Session,
    item: AddCartItemRequest,
    cart_key: str = STARTER_CART_KEY,
) -> list[CartLine]:
    row = session.scalar(
        cart_statement(cart_key)
        .where(CartItemModel.product_slug == item.product_slug)
        .where(CartItemModel.size == item.size),
    )

    if row is None:
        session.add(
            CartItemModel(
                cart_key=cart_key,
                product_slug=item.product_slug,
                quantity=item.quantity,
                size=item.size,
            ),
        )
    else:
        row.quantity = min(row.quantity + item.quantity, 99)

    session.flush()
    return list_lines(session, cart_key)


def set_item_quantity(
    session: Session,
    item: UpdateCartItemRequest,
    cart_key: str = STARTER_CART_KEY,
) -> list[CartLine] | None:
    row = session.scalar(
        cart_statement(cart_key)
        .where(CartItemModel.product_slug == item.product_slug)
        .where(CartItemModel.size == item.size),
    )

    if row is None:
        return None

    row.quantity = item.quantity
    session.flush()

    return list_lines(session, cart_key)


def remove_item(
    session: Session,
    product_slug: str,
    size: str,
    cart_key: str = STARTER_CART_KEY,
) -> list[CartLine] | None:
    row = session.scalar(
        cart_statement(cart_key)
        .where(CartItemModel.product_slug == product_slug)
        .where(CartItemModel.size == size),
    )

    if row is None:
        return None

    session.delete(row)
    session.flush()

    return list_lines(session, cart_key)


def clear(session: Session, cart_key: str = STARTER_CART_KEY) -> list[CartLine]:
    rows = session.scalars(cart_statement(cart_key)).all()

    for row in rows:
        session.delete(row)

    session.flush()
    return []


def cart_statement(cart_key: str):
    return (
        select(CartItemModel)
        .where(CartItemModel.cart_key == cart_key)
        .order_by(CartItemModel.id)
    )


def to_cart_line(row: CartItemModel) -> CartLine:
    return CartLine(
        product_slug=row.product_slug,
        quantity=row.quantity,
        size=row.size,
    )
