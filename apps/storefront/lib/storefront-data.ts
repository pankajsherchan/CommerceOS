export type Money = {
  amount: number;
  currency: "USD";
};

export type Category = {
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

export type EnrichedCartLine = {
  lineTotal: Money;
  product: Product;
  quantity: number;
  size: string;
};

export const storefrontMerch = {
  description:
    "A premium catalog for writing desks, shelves, and spaces that need more focus and less visual noise.",
  eyebrow: "Spring collection",
  title: "Objects for a calm, high-output desk.",
};

export function createEnrichedCartLines(
  lines: CartLine[],
  products: Product[],
): EnrichedCartLine[] {
  const productBySlug = new Map(
    products.map((product) => [product.slug, product]),
  );

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

export function buildCartSummary(lines: EnrichedCartLine[]) {
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
