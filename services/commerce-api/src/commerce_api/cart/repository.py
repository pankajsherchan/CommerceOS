from threading import RLock

from commerce_api.cart.schemas import AddCartItemRequest, CartLine, UpdateCartItemRequest


class InMemoryCartRepository:
    def __init__(self, initial_lines: list[CartLine]) -> None:
        self._initial_lines = [line.model_copy() for line in initial_lines]
        self._lines = [line.model_copy() for line in initial_lines]
        self._lock = RLock()

    def reset(self) -> None:
        with self._lock:
            self._lines = [line.model_copy() for line in self._initial_lines]

    def list_lines(self) -> list[CartLine]:
        with self._lock:
            return [line.model_copy() for line in self._lines]

    def add_or_update_item(self, item: AddCartItemRequest) -> list[CartLine]:
        with self._lock:
            for index, line in enumerate(self._lines):
                if line.product_slug == item.product_slug and line.size == item.size:
                    next_quantity = min(line.quantity + item.quantity, 99)
                    self._lines[index] = line.model_copy(
                        update={"quantity": next_quantity},
                    )
                    break
            else:
                self._lines.append(
                    CartLine(
                        product_slug=item.product_slug,
                        quantity=item.quantity,
                        size=item.size,
                    ),
                )

            return [line.model_copy() for line in self._lines]

    def set_item_quantity(self, item: UpdateCartItemRequest) -> list[CartLine] | None:
        with self._lock:
            for index, line in enumerate(self._lines):
                if line.product_slug == item.product_slug and line.size == item.size:
                    self._lines[index] = line.model_copy(
                        update={"quantity": item.quantity},
                    )
                    return [line.model_copy() for line in self._lines]

            return None

    def remove_item(self, product_slug: str, size: str) -> list[CartLine] | None:
        with self._lock:
            next_lines = [
                line
                for line in self._lines
                if not (line.product_slug == product_slug and line.size == size)
            ]

            if len(next_lines) == len(self._lines):
                return None

            self._lines = next_lines
            return [line.model_copy() for line in self._lines]

    def clear(self) -> list[CartLine]:
        with self._lock:
            self._lines = []
            return []


cart_repository = InMemoryCartRepository(
    initial_lines=[
        CartLine(product_slug="harbor-monitor-stand", quantity=1, size="Standard"),
        CartLine(product_slug="draft-paper-tower", quantity=2, size="One size"),
    ],
)
