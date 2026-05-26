"use client";

import { useMemo, useState } from "react";

import { useCart } from "@/components/cart-provider";
import type { Product } from "@/lib/storefront-data";

export function AddToCartForm({ product }: { product: Product }) {
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] ?? "Standard");
  const [showAddedMessage, setShowAddedMessage] = useState(false);
  const { addItem, lastAddedProductName } = useCart();

  const isSoldOut = product.inventoryStatus === "sold-out";

  const feedbackMessage = useMemo(() => {
    if (!showAddedMessage || lastAddedProductName !== product.name) {
      return null;
    }

    return `${product.name} added to cart.`;
  }, [lastAddedProductName, product.name, showAddedMessage]);

  return (
    <div className="surface-panel">
      <p className="eyebrow">Purchase options</p>
      <div className="storefront-stack">
        <div>
          <p className="meta-copy">Select size</p>
          <div className="size-grid">
            {product.sizes.map((size) => (
              <button
                key={size}
                className={`chip-button size-button${selectedSize === size ? " is-active" : ""}`}
                onClick={() => setSelectedSize(size)}
                type="button"
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        <div className="detail-actions">
          <button
            className="button-primary"
            disabled={isSoldOut}
            onClick={() => {
              addItem({ product, size: selectedSize });
              setShowAddedMessage(true);
            }}
            type="button"
          >
            {isSoldOut ? "Sold out" : "Add to cart"}
          </button>
        </div>

        <p aria-live="polite" className="inventory-copy is-success">
          {feedbackMessage ?? "Local cart state only for this phase."}
        </p>
      </div>
    </div>
  );
}
