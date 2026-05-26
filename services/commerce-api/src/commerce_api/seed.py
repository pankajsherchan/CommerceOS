from sqlalchemy.orm import Session

from commerce_api.models import CartItemModel, CategoryModel, ProductModel

STARTER_CATEGORIES = [
    {
        "description": "Warm desk objects with tactile finishes and everyday utility.",
        "name": "Desk Objects",
        "slug": "desk-objects",
        "sort_order": 10,
    },
    {
        "description": "Shelf accents that bring texture without crowding the room.",
        "name": "Shelving",
        "slug": "shelving",
        "sort_order": 20,
    },
    {
        "description": "Lighting and atmosphere pieces for late focus sessions.",
        "name": "Lighting",
        "slug": "lighting",
        "sort_order": 30,
    },
    {
        "description": "Small storage pieces that keep essentials visible and tidy.",
        "name": "Storage",
        "slug": "storage",
        "sort_order": 40,
    },
    {
        "description": "An intentionally empty mock collection to exercise no-result states.",
        "name": "Archive",
        "slug": "archive",
        "sort_order": 50,
    },
]

STARTER_PRODUCTS = [
    {
        "badge": "Best seller",
        "category_slug": "desk-objects",
        "compare_at_amount": 16800,
        "compare_at_currency": "USD",
        "description": (
            "A solid walnut riser with a soft edge profile for laptops, notebooks, "
            "and the one thing you never want buried under cables."
        ),
        "details": [
            "Solid walnut with cork footings and concealed cable channel.",
            "Raises the display plane by 3 inches for a calmer line of sight.",
            "Ships in recyclable protective wrap.",
        ],
        "featured": True,
        "inventory_label": "Ready to ship",
        "inventory_message": "In stock and ready to add to your mock cart.",
        "inventory_status": "in-stock",
        "name": "Harbor Monitor Stand",
        "price_amount": 14200,
        "price_currency": "USD",
        "short_description": "Walnut riser for monitors, notebooks, and clean cable runs.",
        "sizes": ["Standard", "Wide"],
        "slug": "harbor-monitor-stand",
        "sort_order": 10,
        "tone": "clay",
    },
    {
        "badge": "Low stock",
        "category_slug": "lighting",
        "compare_at_amount": None,
        "compare_at_currency": None,
        "description": (
            "A dimmable task lamp with a linen shade and a cast base that grounds "
            "evening work without glare."
        ),
        "details": [
            "Three warmth settings and braided fabric power cord.",
            "Weighted iron base with linen shade.",
            "Designed for sideboards, bedside tables, and desks.",
        ],
        "featured": True,
        "inventory_label": "Few left",
        "inventory_message": "Low stock in the mock catalog. Great for quantity edit testing.",
        "inventory_status": "low-stock",
        "name": "North Table Lamp",
        "price_amount": 9800,
        "price_currency": "USD",
        "short_description": "Soft task lighting with warm dimming and compact footprint.",
        "sizes": ["One size"],
        "slug": "north-table-lamp",
        "sort_order": 20,
        "tone": "sand",
    },
    {
        "badge": "New finish",
        "category_slug": "storage",
        "compare_at_amount": None,
        "compare_at_currency": None,
        "description": (
            "A stackable set of paper and tool trays for daily carry items, cables, "
            "pens, and the inevitable notebook rotation."
        ),
        "details": [
            "Powder-coated steel with felt inserts.",
            "Nests cleanly or stacks in two tiers.",
            "Built to hold chargers, paper, and writing tools.",
        ],
        "featured": True,
        "inventory_label": "Preorder",
        "inventory_message": "Available for preorder in this mocked storefront flow.",
        "inventory_status": "preorder",
        "name": "Axis Catchall Trays",
        "price_amount": 7600,
        "price_currency": "USD",
        "short_description": "Stackable trays for papers, chargers, and desktop clutter.",
        "sizes": ["Set of 2", "Set of 3"],
        "slug": "axis-catchall-trays",
        "sort_order": 30,
        "tone": "ocean",
    },
    {
        "badge": None,
        "category_slug": "shelving",
        "compare_at_amount": None,
        "compare_at_currency": None,
        "description": (
            "A narrow floating shelf for books, framed notes, and quiet merchandising "
            "moments around the workspace."
        ),
        "details": [
            "Oak veneer with hidden bracket system.",
            "Designed for lightweight books and decor.",
            "Simple two-point mounting hardware included.",
        ],
        "featured": False,
        "inventory_label": "Ships next week",
        "inventory_message": "Next shipment opens soon for the mocked shelf collection.",
        "inventory_status": "preorder",
        "name": "Line Floating Shelf",
        "price_amount": 6400,
        "price_currency": "USD",
        "short_description": "Slim shelf for books, sketches, and small display moments.",
        "sizes": ['24"', '36"'],
        "slug": "line-floating-shelf",
        "sort_order": 40,
        "tone": "sage",
    },
    {
        "badge": "Back soon",
        "category_slug": "desk-objects",
        "compare_at_amount": None,
        "compare_at_currency": None,
        "description": (
            "A sculpted valet tray for cards, earbuds, keys, and tiny desk essentials "
            "that usually vanish at the worst moment."
        ),
        "details": [
            "Vegetable-tanned leather over a molded base.",
            "Small footprint for entry tables and desks.",
            "Soft-lined pocket keeps metal objects from scratching.",
        ],
        "featured": False,
        "inventory_label": "Sold out",
        "inventory_message": "Currently sold out in the mock data to exercise status rendering.",
        "inventory_status": "sold-out",
        "name": "Porter Valet Dish",
        "price_amount": 5200,
        "price_currency": "USD",
        "short_description": "Leather catchall for keys, earbuds, and pocket essentials.",
        "sizes": ["One size"],
        "slug": "porter-valet-dish",
        "sort_order": 50,
        "tone": "ink",
    },
    {
        "badge": None,
        "category_slug": "storage",
        "compare_at_amount": None,
        "compare_at_currency": None,
        "description": (
            "A felt-lined file tower that keeps current project documents visible "
            "while preserving a clear horizon line on the desk."
        ),
        "details": [
            "Three-tier paper storage with ash veneer.",
            "Felt-lined surfaces soften paper edges and protect finishes.",
            "Sized for letter notebooks and project folders.",
        ],
        "featured": False,
        "inventory_label": "Ready to ship",
        "inventory_message": "In stock and included in the starter cart fixture.",
        "inventory_status": "in-stock",
        "name": "Draft Paper Tower",
        "price_amount": 11200,
        "price_currency": "USD",
        "short_description": "Tiered document storage for active projects and note stacks.",
        "sizes": ["One size"],
        "slug": "draft-paper-tower",
        "sort_order": 60,
        "tone": "sage",
    },
]

STARTER_CART_KEY = "phase-0-storefront"
STARTER_CART_ITEMS = [
    {
        "cart_key": STARTER_CART_KEY,
        "product_slug": "harbor-monitor-stand",
        "quantity": 1,
        "size": "Standard",
    },
    {
        "cart_key": STARTER_CART_KEY,
        "product_slug": "draft-paper-tower",
        "quantity": 2,
        "size": "One size",
    },
]


def seed_starter_data(session: Session) -> None:
    session.add_all(CategoryModel(**category) for category in STARTER_CATEGORIES)
    session.add_all(ProductModel(**product) for product in STARTER_PRODUCTS)
    session.flush()
    session.add_all(CartItemModel(**item) for item in STARTER_CART_ITEMS)
