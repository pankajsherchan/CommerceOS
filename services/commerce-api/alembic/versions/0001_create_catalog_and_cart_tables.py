"""create catalog and cart tables

Revision ID: 0001_catalog_cart
Revises:
Create Date: 2026-05-26 00:00:00.000000
"""

from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa

revision: str = "0001_catalog_cart"
down_revision: str | Sequence[str] | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "catalog_categories",
        sa.Column("slug", sa.String(length=80), nullable=False),
        sa.Column("name", sa.String(length=120), nullable=False),
        sa.Column("description", sa.String(length=500), nullable=False),
        sa.Column("sort_order", sa.Integer(), nullable=False),
        sa.PrimaryKeyConstraint("slug", name=op.f("pk_catalog_categories")),
    )
    op.create_table(
        "catalog_products",
        sa.Column("slug", sa.String(length=120), nullable=False),
        sa.Column("badge", sa.String(length=80), nullable=True),
        sa.Column("category_slug", sa.String(length=80), nullable=False),
        sa.Column("compare_at_amount", sa.Integer(), nullable=True),
        sa.Column("compare_at_currency", sa.String(length=3), nullable=True),
        sa.Column("description", sa.String(length=1000), nullable=False),
        sa.Column("details", sa.JSON(), nullable=False),
        sa.Column("featured", sa.Boolean(), nullable=False),
        sa.Column("inventory_label", sa.String(length=80), nullable=False),
        sa.Column("inventory_message", sa.String(length=300), nullable=False),
        sa.Column("inventory_status", sa.String(length=20), nullable=False),
        sa.Column("name", sa.String(length=160), nullable=False),
        sa.Column("price_amount", sa.Integer(), nullable=False),
        sa.Column("price_currency", sa.String(length=3), nullable=False),
        sa.Column("short_description", sa.String(length=300), nullable=False),
        sa.Column("sizes", sa.JSON(), nullable=False),
        sa.Column("sort_order", sa.Integer(), nullable=False),
        sa.Column("tone", sa.String(length=20), nullable=False),
        sa.CheckConstraint(
            "compare_at_amount is null or compare_at_amount >= 0",
            name=op.f("ck_catalog_products_compare_at_amount"),
        ),
        sa.CheckConstraint(
            "inventory_status in ('in-stock', 'low-stock', 'preorder', 'sold-out')",
            name=op.f("ck_catalog_products_inventory_status"),
        ),
        sa.CheckConstraint(
            "price_amount >= 0",
            name=op.f("ck_catalog_products_price_amount"),
        ),
        sa.CheckConstraint(
            "tone in ('clay', 'sage', 'ocean', 'sand', 'ink')",
            name=op.f("ck_catalog_products_tone"),
        ),
        sa.ForeignKeyConstraint(
            ["category_slug"],
            ["catalog_categories.slug"],
            name=op.f("fk_catalog_products_category_slug"),
        ),
        sa.PrimaryKeyConstraint("slug", name=op.f("pk_catalog_products")),
    )
    op.create_index(
        op.f("ix_catalog_products_category_slug"),
        "catalog_products",
        ["category_slug"],
        unique=False,
    )
    op.create_table(
        "cart_items",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("cart_key", sa.String(length=120), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=False,
        ),
        sa.Column("product_slug", sa.String(length=120), nullable=False),
        sa.Column("quantity", sa.Integer(), nullable=False),
        sa.Column("size", sa.String(length=80), nullable=False),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("CURRENT_TIMESTAMP"),
            nullable=False,
        ),
        sa.CheckConstraint(
            "quantity between 1 and 99",
            name=op.f("ck_cart_items_quantity"),
        ),
        sa.ForeignKeyConstraint(
            ["product_slug"],
            ["catalog_products.slug"],
            name=op.f("fk_cart_items_product_slug"),
        ),
        sa.PrimaryKeyConstraint("id", name=op.f("pk_cart_items")),
        sa.UniqueConstraint(
            "cart_key",
            "product_slug",
            "size",
            name=op.f("uq_cart_items_cart_product_size"),
        ),
    )
    op.create_index(op.f("ix_cart_items_cart_key"), "cart_items", ["cart_key"])
    seed_starter_data()


def downgrade() -> None:
    op.drop_index(op.f("ix_cart_items_cart_key"), table_name="cart_items")
    op.drop_table("cart_items")
    op.drop_index(
        op.f("ix_catalog_products_category_slug"),
        table_name="catalog_products",
    )
    op.drop_table("catalog_products")
    op.drop_table("catalog_categories")


def seed_starter_data() -> None:
    categories = sa.table(
        "catalog_categories",
        sa.column("slug", sa.String),
        sa.column("name", sa.String),
        sa.column("description", sa.String),
        sa.column("sort_order", sa.Integer),
    )
    products = sa.table(
        "catalog_products",
        sa.column("slug", sa.String),
        sa.column("badge", sa.String),
        sa.column("category_slug", sa.String),
        sa.column("compare_at_amount", sa.Integer),
        sa.column("compare_at_currency", sa.String),
        sa.column("description", sa.String),
        sa.column("details", sa.JSON),
        sa.column("featured", sa.Boolean),
        sa.column("inventory_label", sa.String),
        sa.column("inventory_message", sa.String),
        sa.column("inventory_status", sa.String),
        sa.column("name", sa.String),
        sa.column("price_amount", sa.Integer),
        sa.column("price_currency", sa.String),
        sa.column("short_description", sa.String),
        sa.column("sizes", sa.JSON),
        sa.column("sort_order", sa.Integer),
        sa.column("tone", sa.String),
    )
    cart_items = sa.table(
        "cart_items",
        sa.column("cart_key", sa.String),
        sa.column("product_slug", sa.String),
        sa.column("quantity", sa.Integer),
        sa.column("size", sa.String),
    )

    op.bulk_insert(
        categories,
        [
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
                "description": (
                    "An intentionally empty mock collection to exercise no-result states."
                ),
                "name": "Archive",
                "slug": "archive",
                "sort_order": 50,
            },
        ],
    )
    op.bulk_insert(
        products,
        [
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
                "short_description": (
                    "Walnut riser for monitors, notebooks, and clean cable runs."
                ),
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
                "inventory_message": (
                    "Low stock in the mock catalog. Great for quantity edit testing."
                ),
                "inventory_status": "low-stock",
                "name": "North Table Lamp",
                "price_amount": 9800,
                "price_currency": "USD",
                "short_description": (
                    "Soft task lighting with warm dimming and compact footprint."
                ),
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
                "short_description": (
                    "Stackable trays for papers, chargers, and desktop clutter."
                ),
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
                "inventory_message": (
                    "Next shipment opens soon for the mocked shelf collection."
                ),
                "inventory_status": "preorder",
                "name": "Line Floating Shelf",
                "price_amount": 6400,
                "price_currency": "USD",
                "short_description": (
                    "Slim shelf for books, sketches, and small display moments."
                ),
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
                "inventory_message": (
                    "Currently sold out in the mock data to exercise status rendering."
                ),
                "inventory_status": "sold-out",
                "name": "Porter Valet Dish",
                "price_amount": 5200,
                "price_currency": "USD",
                "short_description": (
                    "Leather catchall for keys, earbuds, and pocket essentials."
                ),
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
                "short_description": (
                    "Tiered document storage for active projects and note stacks."
                ),
                "sizes": ["One size"],
                "slug": "draft-paper-tower",
                "sort_order": 60,
                "tone": "sage",
            },
        ],
    )
    op.bulk_insert(
        cart_items,
        [
            {
                "cart_key": "phase-0-storefront",
                "product_slug": "harbor-monitor-stand",
                "quantity": 1,
                "size": "Standard",
            },
            {
                "cart_key": "phase-0-storefront",
                "product_slug": "draft-paper-tower",
                "quantity": 2,
                "size": "One size",
            },
        ],
    )
