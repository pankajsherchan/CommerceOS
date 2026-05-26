import { z } from "zod";

import {
  type CartLine,
  type Category,
  type Product,
} from "@/lib/storefront-data";

const moneySchema = z.object({
  amount: z.number().int().nonnegative(),
  currency: z.literal("USD"),
});

const categorySchema = z.object({
  name: z.string(),
  slug: z.string(),
}) satisfies z.ZodType<Category>;

const productSchema = z.object({
  badge: z.string().optional().nullable().transform((value) => value ?? undefined),
  categoryName: z.string(),
  categorySlug: z.string(),
  compareAtPrice: moneySchema.optional().nullable().transform((value) => value ?? undefined),
  description: z.string(),
  details: z.array(z.string()),
  featured: z.boolean(),
  inventoryLabel: z.string(),
  inventoryMessage: z.string(),
  inventoryStatus: z.enum(["in-stock", "low-stock", "preorder", "sold-out"]),
  name: z.string(),
  price: moneySchema,
  shortDescription: z.string(),
  sizes: z.array(z.string()).min(1),
  slug: z.string(),
  tone: z.enum(["clay", "sage", "ocean", "sand", "ink"]),
}) satisfies z.ZodType<Product>;

const cartLineSchema = z.object({
  productSlug: z.string(),
  quantity: z.number().int().min(1).max(99),
  size: z.string(),
}) satisfies z.ZodType<CartLine>;

export const cartResponseSchema = z.object({
  lines: z.array(cartLineSchema),
});

export class CommerceApiError extends Error {
  constructor(readonly status: number) {
    super(`Commerce API request failed with status ${status}`);
  }
}

function getCommerceApiBaseUrl() {
  return process.env.COMMERCE_API_BASE_URL ?? "http://localhost:8000";
}

async function fetchCommerceApi<T>(
  path: string,
  schema: z.ZodType<T>,
  init?: RequestInit,
) {
  const response = await fetch(new URL(path, getCommerceApiBaseUrl()), init);

  if (!response.ok) {
    throw new CommerceApiError(response.status);
  }

  return schema.parse(await response.json());
}

export async function getStorefrontCategories() {
  try {
    return await fetchCommerceApi("/api/catalog/categories", z.array(categorySchema), {
      next: { revalidate: 60 },
    });
  } catch {
    return [];
  }
}

export async function getStorefrontProducts(category?: string) {
  try {
    const params = category ? `?category=${encodeURIComponent(category)}` : "";

    return await fetchCommerceApi(`/api/catalog/products${params}`, z.array(productSchema), {
      next: { revalidate: 60 },
    });
  } catch {
    return [];
  }
}

export async function getStorefrontProductBySlug(slug: string) {
  try {
    return await fetchCommerceApi(`/api/catalog/products/${encodeURIComponent(slug)}`, productSchema, {
      next: { revalidate: 60 },
    });
  } catch {
    return null;
  }
}

export async function getStorefrontFeaturedProducts() {
  const products = await getStorefrontProducts();

  return products.filter((product) => product.featured);
}

export async function getStorefrontRelatedProducts(product: Product) {
  const products = await getStorefrontProducts();

  return products.filter((candidate) => candidate.slug !== product.slug).slice(0, 3);
}

export async function getStorefrontCartLines() {
  try {
    const cart = await fetchCommerceApi("/api/cart", cartResponseSchema, {
      cache: "no-store",
    });

    return cart.lines;
  } catch {
    return [];
  }
}

const placeholderAuthHeaders = {
  Authorization: "Bearer placeholder",
  "Content-Type": "application/json",
};

export async function addStorefrontCartItem(item: CartLine) {
  const cart = await fetchCommerceApi("/api/cart/items", cartResponseSchema, {
    body: JSON.stringify(item),
    cache: "no-store",
    headers: placeholderAuthHeaders,
    method: "POST",
  });

  return cart.lines;
}

export async function updateStorefrontCartItem(item: CartLine) {
  const cart = await fetchCommerceApi("/api/cart/items", cartResponseSchema, {
    body: JSON.stringify(item),
    cache: "no-store",
    headers: placeholderAuthHeaders,
    method: "PATCH",
  });

  return cart.lines;
}

export async function removeStorefrontCartItem(item: Omit<CartLine, "quantity">) {
  const params = new URLSearchParams({
    productSlug: item.productSlug,
    size: item.size,
  });
  const cart = await fetchCommerceApi(`/api/cart/items?${params}`, cartResponseSchema, {
    cache: "no-store",
    headers: {
      Authorization: placeholderAuthHeaders.Authorization,
    },
    method: "DELETE",
  });

  return cart.lines;
}

export async function clearStorefrontCart() {
  const cart = await fetchCommerceApi("/api/cart", cartResponseSchema, {
    cache: "no-store",
    headers: {
      Authorization: placeholderAuthHeaders.Authorization,
    },
    method: "DELETE",
  });

  return cart.lines;
}
