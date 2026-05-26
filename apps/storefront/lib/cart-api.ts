"use client";

import { z } from "zod";

import type { CartLine } from "@/lib/storefront-data";

const cartLineSchema = z.object({
  productSlug: z.string(),
  quantity: z.number().int().min(1).max(99),
  size: z.string(),
}) satisfies z.ZodType<CartLine>;

const cartResponseSchema = z.object({
  lines: z.array(cartLineSchema),
});

async function requestCartMutation(path: string, init: RequestInit) {
  const response = await fetch(path, init);

  if (!response.ok) {
    throw new Error(`Cart mutation failed with status ${response.status}`);
  }

  const cart = cartResponseSchema.parse(await response.json());

  return cart.lines;
}

export function addCartItem(item: CartLine) {
  return requestCartMutation("/api/cart/items", {
    body: JSON.stringify(item),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });
}

export function updateCartItem(item: CartLine) {
  return requestCartMutation("/api/cart/items", {
    body: JSON.stringify(item),
    headers: {
      "Content-Type": "application/json",
    },
    method: "PATCH",
  });
}

export function removeCartItem(item: Omit<CartLine, "quantity">) {
  return requestCartMutation("/api/cart/items", {
    body: JSON.stringify(item),
    headers: {
      "Content-Type": "application/json",
    },
    method: "DELETE",
  });
}

export function clearCart() {
  return requestCartMutation("/api/cart", {
    method: "DELETE",
  });
}
