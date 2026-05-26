export type Money = {
  amount: number;
  currency: "USD";
};

export type Category = {
  description: string;
  name: string;
  slug: string;
};

export type Product = {
  badge?: string;
  categoryName: string;
  categorySlug: string;
  compareAtPrice?: Money;
  description: string;
  details: string[];
  featured: boolean;
  inventoryLabel: string;
  inventoryMessage: string;
  inventoryStatus: "in-stock" | "low-stock" | "preorder" | "sold-out";
  name: string;
  price: Money;
  shortDescription: string;
  sizes: string[];
  slug: string;
  tone: "clay" | "sage" | "ocean" | "sand" | "ink";
};

export type CartLine = {
  productSlug: string;
  quantity: number;
  size: string;
};

export const storefrontMerch = {
  description:
    "A premium mock catalog for writing desks, shelves, and spaces that need more focus and less visual noise.",
  eyebrow: "Spring collection",
  title: "Objects for a calm, high-output desk.",
};

export const categories: Category[] = [
  {
    description: "Warm desk objects with tactile finishes and everyday utility.",
    name: "Desk Objects",
    slug: "desk-objects",
  },
  {
    description: "Shelf accents that bring texture without crowding the room.",
    name: "Shelving",
    slug: "shelving",
  },
  {
    description: "Lighting and atmosphere pieces for late focus sessions.",
    name: "Lighting",
    slug: "lighting",
  },
  {
    description: "Small storage pieces that keep essentials visible and tidy.",
    name: "Storage",
    slug: "storage",
  },
  {
    description: "An intentionally empty mock collection to exercise no-result states.",
    name: "Archive",
    slug: "archive",
  },
];

export const products: Product[] = [
  {
    badge: "Best seller",
    categoryName: "Desk Objects",
    categorySlug: "desk-objects",
    compareAtPrice: { amount: 16800, currency: "USD" },
    description:
      "A solid walnut riser with a soft edge profile for laptops, notebooks, and the one thing you never want buried under cables.",
    details: [
      "Solid walnut with cork footings and concealed cable channel.",
      "Raises the display plane by 3 inches for a calmer line of sight.",
      "Ships in recyclable protective wrap.",
    ],
    featured: true,
    inventoryLabel: "Ready to ship",
    inventoryMessage: "In stock and ready to add to your mock cart.",
    inventoryStatus: "in-stock",
    name: "Harbor Monitor Stand",
    price: { amount: 14200, currency: "USD" },
    shortDescription: "Walnut riser for monitors, notebooks, and clean cable runs.",
    sizes: ["Standard", "Wide"],
    slug: "harbor-monitor-stand",
    tone: "clay",
  },
  {
    badge: "Low stock",
    categoryName: "Lighting",
    categorySlug: "lighting",
    description:
      "A dimmable task lamp with a linen shade and a cast base that grounds evening work without glare.",
    details: [
      "Three warmth settings and braided fabric power cord.",
      "Weighted iron base with linen shade.",
      "Designed for sideboards, bedside tables, and desks.",
    ],
    featured: true,
    inventoryLabel: "Few left",
    inventoryMessage: "Low stock in the mock catalog. Great for quantity edit testing.",
    inventoryStatus: "low-stock",
    name: "North Table Lamp",
    price: { amount: 9800, currency: "USD" },
    shortDescription: "Soft task lighting with warm dimming and compact footprint.",
    sizes: ["One size"],
    slug: "north-table-lamp",
    tone: "sand",
  },
  {
    badge: "New finish",
    categoryName: "Storage",
    categorySlug: "storage",
    description:
      "A stackable set of paper and tool trays for daily carry items, cables, pens, and the inevitable notebook rotation.",
    details: [
      "Powder-coated steel with felt inserts.",
      "Nests cleanly or stacks in two tiers.",
      "Built to hold chargers, paper, and writing tools.",
    ],
    featured: true,
    inventoryLabel: "Preorder",
    inventoryMessage: "Available for preorder in this mocked storefront flow.",
    inventoryStatus: "preorder",
    name: "Axis Catchall Trays",
    price: { amount: 7600, currency: "USD" },
    shortDescription: "Stackable trays for papers, chargers, and desktop clutter.",
    sizes: ["Set of 2", "Set of 3"],
    slug: "axis-catchall-trays",
    tone: "ocean",
  },
  {
    categoryName: "Shelving",
    categorySlug: "shelving",
    description:
      "A narrow floating shelf for books, framed notes, and quiet merchandising moments around the workspace.",
    details: [
      "Oak veneer with hidden bracket system.",
      "Designed for lightweight books and decor.",
      "Simple two-point mounting hardware included.",
    ],
    featured: false,
    inventoryLabel: "Ships next week",
    inventoryMessage: "Next shipment opens soon for the mocked shelf collection.",
    inventoryStatus: "preorder",
    name: "Line Floating Shelf",
    price: { amount: 6400, currency: "USD" },
    shortDescription: "Slim shelf for books, sketches, and small display moments.",
    sizes: ['24"', '36"'],
    slug: "line-floating-shelf",
    tone: "sage",
  },
  {
    badge: "Back soon",
    categoryName: "Desk Objects",
    categorySlug: "desk-objects",
    description:
      "A sculpted valet tray for cards, earbuds, keys, and tiny desk essentials that usually vanish at the worst moment.",
    details: [
      "Vegetable-tanned leather over a molded base.",
      "Small footprint for entry tables and desks.",
      "Soft-lined pocket keeps metal objects from scratching.",
    ],
    featured: false,
    inventoryLabel: "Sold out",
    inventoryMessage: "Currently sold out in the mock data to exercise status rendering.",
    inventoryStatus: "sold-out",
    name: "Porter Valet Dish",
    price: { amount: 5200, currency: "USD" },
    shortDescription: "Leather catchall for keys, earbuds, and pocket essentials.",
    sizes: ["One size"],
    slug: "porter-valet-dish",
    tone: "ink",
  },
  {
    categoryName: "Storage",
    categorySlug: "storage",
    description:
      "A felt-lined file tower that keeps current project documents visible while preserving a clear horizon line on the desk.",
    details: [
      "Three-tier paper storage with ash veneer.",
      "Felt-lined surfaces soften paper edges and protect finishes.",
      "Sized for letter notebooks and project folders.",
    ],
    featured: false,
    inventoryLabel: "Ready to ship",
    inventoryMessage: "In stock and included in the starter cart fixture.",
    inventoryStatus: "in-stock",
    name: "Draft Paper Tower",
    price: { amount: 11200, currency: "USD" },
    shortDescription: "Tiered document storage for active projects and note stacks.",
    sizes: ["One size"],
    slug: "draft-paper-tower",
    tone: "sage",
  },
];

export const initialCartLines: CartLine[] = [
  { productSlug: "harbor-monitor-stand", quantity: 1, size: "Standard" },
  { productSlug: "draft-paper-tower", quantity: 2, size: "One size" },
];

const productBySlug = new Map(products.map((product) => [product.slug, product]));

export function getFeaturedProducts() {
  return products.filter((product) => product.featured);
}

export function getProductBySlug(slug: string) {
  return productBySlug.get(slug);
}

export function getRelatedProducts(product: Product) {
  return products.filter((candidate) => candidate.slug !== product.slug).slice(0, 3);
}

export function createEnrichedCartLines(lines: CartLine[]) {
  return lines.flatMap((line) => {
    const product = productBySlug.get(line.productSlug);

    if (!product) {
      return [];
    }

    return [
      {
        lineTotal: {
          amount: product.price.amount * line.quantity,
          currency: product.price.currency,
        },
        product,
        quantity: line.quantity,
        size: line.size,
      },
    ];
  });
}

export function buildCartSummary(lines: ReturnType<typeof createEnrichedCartLines>) {
  const subtotalAmount = lines.reduce(
    (runningTotal, line) => runningTotal + line.lineTotal.amount,
    0,
  );
  const shippingAmount = subtotalAmount >= 20000 ? 0 : 1800;

  return {
    lineCount: lines.reduce((runningTotal, line) => runningTotal + line.quantity, 0),
    shippingAmount,
    subtotalAmount,
    totalAmount: subtotalAmount + shippingAmount,
  };
}
