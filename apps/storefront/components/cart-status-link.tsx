"use client";

import Link from "next/link";

import { useCart } from "@/components/cart-provider";

export function CartStatusLink() {
  const { lineCount } = useCart();

  return (
    <Link className="cart-link" href="/cart">
      Cart <span className="cart-count">{lineCount}</span>
    </Link>
  );
}
