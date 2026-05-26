from commerce_api.catalog.schemas import Category, Product


_CATEGORIES = [
    Category(
        description="Warm desk objects with tactile finishes and everyday utility.",
        name="Desk Objects",
        slug="desk-objects",
    ),
    Category(
        description="Shelf accents that bring texture without crowding the room.",
        name="Shelving",
        slug="shelving",
    ),
    Category(
        description="Lighting and atmosphere pieces for late focus sessions.",
        name="Lighting",
        slug="lighting",
    ),
    Category(
        description="Small storage pieces that keep essentials visible and tidy.",
        name="Storage",
        slug="storage",
    ),
    Category(
        description="An intentionally empty mock collection to exercise no-result states.",
        name="Archive",
        slug="archive",
    ),
]

_PRODUCTS = [
    Product(
        badge="Best seller",
        category_name="Desk Objects",
        category_slug="desk-objects",
        compare_at_price={"amount": 16800, "currency": "USD"},
        description=(
            "A solid walnut riser with a soft edge profile for laptops, notebooks, "
            "and the one thing you never want buried under cables."
        ),
        details=[
            "Solid walnut with cork footings and concealed cable channel.",
            "Raises the display plane by 3 inches for a calmer line of sight.",
            "Ships in recyclable protective wrap.",
        ],
        featured=True,
        inventory_label="Ready to ship",
        inventory_message="In stock and ready to add to your mock cart.",
        inventory_status="in-stock",
        name="Harbor Monitor Stand",
        price={"amount": 14200, "currency": "USD"},
        short_description="Walnut riser for monitors, notebooks, and clean cable runs.",
        sizes=["Standard", "Wide"],
        slug="harbor-monitor-stand",
        tone="clay",
    ),
    Product(
        badge="Low stock",
        category_name="Lighting",
        category_slug="lighting",
        description=(
            "A dimmable task lamp with a linen shade and a cast base that grounds "
            "evening work without glare."
        ),
        details=[
            "Three warmth settings and braided fabric power cord.",
            "Weighted iron base with linen shade.",
            "Designed for sideboards, bedside tables, and desks.",
        ],
        featured=True,
        inventory_label="Few left",
        inventory_message="Low stock in the mock catalog. Great for quantity edit testing.",
        inventory_status="low-stock",
        name="North Table Lamp",
        price={"amount": 9800, "currency": "USD"},
        short_description="Soft task lighting with warm dimming and compact footprint.",
        sizes=["One size"],
        slug="north-table-lamp",
        tone="sand",
    ),
    Product(
        badge="New finish",
        category_name="Storage",
        category_slug="storage",
        description=(
            "A stackable set of paper and tool trays for daily carry items, cables, "
            "pens, and the inevitable notebook rotation."
        ),
        details=[
            "Powder-coated steel with felt inserts.",
            "Nests cleanly or stacks in two tiers.",
            "Built to hold chargers, paper, and writing tools.",
        ],
        featured=True,
        inventory_label="Preorder",
        inventory_message="Available for preorder in this mocked storefront flow.",
        inventory_status="preorder",
        name="Axis Catchall Trays",
        price={"amount": 7600, "currency": "USD"},
        short_description="Stackable trays for papers, chargers, and desktop clutter.",
        sizes=["Set of 2", "Set of 3"],
        slug="axis-catchall-trays",
        tone="ocean",
    ),
    Product(
        category_name="Shelving",
        category_slug="shelving",
        description=(
            "A narrow floating shelf for books, framed notes, and quiet merchandising "
            "moments around the workspace."
        ),
        details=[
            "Oak veneer with hidden bracket system.",
            "Designed for lightweight books and decor.",
            "Simple two-point mounting hardware included.",
        ],
        featured=False,
        inventory_label="Ships next week",
        inventory_message="Next shipment opens soon for the mocked shelf collection.",
        inventory_status="preorder",
        name="Line Floating Shelf",
        price={"amount": 6400, "currency": "USD"},
        short_description="Slim shelf for books, sketches, and small display moments.",
        sizes=['24"', '36"'],
        slug="line-floating-shelf",
        tone="sage",
    ),
    Product(
        badge="Back soon",
        category_name="Desk Objects",
        category_slug="desk-objects",
        description=(
            "A sculpted valet tray for cards, earbuds, keys, and tiny desk essentials "
            "that usually vanish at the worst moment."
        ),
        details=[
            "Vegetable-tanned leather over a molded base.",
            "Small footprint for entry tables and desks.",
            "Soft-lined pocket keeps metal objects from scratching.",
        ],
        featured=False,
        inventory_label="Sold out",
        inventory_message="Currently sold out in the mock data to exercise status rendering.",
        inventory_status="sold-out",
        name="Porter Valet Dish",
        price={"amount": 5200, "currency": "USD"},
        short_description="Leather catchall for keys, earbuds, and pocket essentials.",
        sizes=["One size"],
        slug="porter-valet-dish",
        tone="ink",
    ),
    Product(
        category_name="Storage",
        category_slug="storage",
        description=(
            "A felt-lined file tower that keeps current project documents visible "
            "while preserving a clear horizon line on the desk."
        ),
        details=[
            "Three-tier paper storage with ash veneer.",
            "Felt-lined surfaces soften paper edges and protect finishes.",
            "Sized for letter notebooks and project folders.",
        ],
        featured=False,
        inventory_label="Ready to ship",
        inventory_message="In stock and included in the starter cart fixture.",
        inventory_status="in-stock",
        name="Draft Paper Tower",
        price={"amount": 11200, "currency": "USD"},
        short_description="Tiered document storage for active projects and note stacks.",
        sizes=["One size"],
        slug="draft-paper-tower",
        tone="sage",
    ),
]

_PRODUCT_BY_SLUG = {product.slug: product for product in _PRODUCTS}


def list_categories() -> list[Category]:
    return list(_CATEGORIES)


def list_products(category: str | None = None) -> list[Product]:
    if category is None:
        return list(_PRODUCTS)

    return [product for product in _PRODUCTS if product.category_slug == category]


def get_product(slug: str) -> Product | None:
    return _PRODUCT_BY_SLUG.get(slug)
