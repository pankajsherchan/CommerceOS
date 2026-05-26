"use client";

import Link from "next/link";

import { useCart } from "@/components/cart-provider";
import { formatMoney } from "@/lib/money";

export function CartPageView() {
  const {
    lineCount,
    lines,
    removeItem,
    shippingAmount,
    subtotalAmount,
    totalAmount,
    updateQuantity,
  } = useCart();

  if (lineCount === 0) {
    return (
      <div className="empty-state">
        <p className="eyebrow">Cart</p>
        <h1 className="section-title">Your mocked cart is empty.</h1>
        <p className="body-copy">
          Add a product from the catalog to test quantity updates, removal, and
          the path into checkout.
        </p>
        <Link className="button-primary" href="/products">
          Start browsing
        </Link>
      </div>
    );
  }

  return (
    <div className="cart-layout">
      <div className="storefront-stack">
        <div>
          <p className="eyebrow">Cart</p>
          <h1 className="section-title">Review your selected items.</h1>
        </div>

        <div className="surface-panel">
          <ul className="line-list">
            {lines.map((line) => (
              <li key={`${line.product.slug}-${line.size}`} className="cart-line">
                <div className="line-grid">
                  <div
                    className={`line-visual product-tone-${line.product.tone}`}
                    aria-hidden="true"
                  />
                  <div className="storefront-stack">
                    <div className="cart-line-header">
                      <div>
                        <h2>{line.product.name}</h2>
                        <p className="body-copy">
                          {line.product.categoryName} / Size {line.size}
                        </p>
                      </div>
                      <p className="price-copy">{formatMoney(line.lineTotal)}</p>
                    </div>

                    <div className="quantity-controls">
                      <button
                        aria-label={`Decrease quantity for ${line.product.name}`}
                        className="quantity-button"
                        onClick={() =>
                          updateQuantity(
                            line.product.slug,
                            line.size,
                            Math.max(0, line.quantity - 1),
                          )
                        }
                        type="button"
                      >
                        -
                      </button>
                      <span>Qty {line.quantity}</span>
                      <button
                        aria-label={`Increase quantity for ${line.product.name}`}
                        className="quantity-button"
                        onClick={() =>
                          updateQuantity(line.product.slug, line.size, line.quantity + 1)
                        }
                        type="button"
                      >
                        +
                      </button>
                      <button
                        className="button-secondary"
                        onClick={() => removeItem(line.product.slug, line.size)}
                        type="button"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <aside className="summary-panel">
        <p className="eyebrow">Summary</p>
        <div className="summary-row">
          <span className="meta-copy">Subtotal</span>
          <span>{formatMoney({ amount: subtotalAmount, currency: "USD" })}</span>
        </div>
        <div className="summary-row">
          <span className="meta-copy">Shipping</span>
          <span>{formatMoney({ amount: shippingAmount, currency: "USD" })}</span>
        </div>
        <div className="summary-row total">
          <span>Total</span>
          <span>{formatMoney({ amount: totalAmount, currency: "USD" })}</span>
        </div>
        <Link className="button-primary" href="/checkout">
          Continue to checkout
        </Link>
      </aside>
    </div>
  );
}
