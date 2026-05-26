"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { useCart } from "@/components/cart-provider";
import { formatMoney } from "@/lib/money";

export function CheckoutPageView() {
  const router = useRouter();
  const {
    cartErrorMessage,
    clearCart,
    isUpdating,
    lineCount,
    lines,
    shippingAmount,
    subtotalAmount,
    totalAmount,
  } = useCart();

  if (lineCount === 0) {
    return (
      <div className="empty-state">
        <p className="eyebrow">Checkout</p>
        <h1 className="section-title">Add something to the cart before checkout.</h1>
        <p className="body-copy">
          This mock checkout reads the local cart provider, so it needs an item in
          memory before it can render a believable order summary.
        </p>
        <Link className="button-primary" href="/products">
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="checkout-layout">
      <form
        className="storefront-stack"
        onSubmit={async (event) => {
          event.preventDefault();
          const wasCleared = await clearCart();

          if (wasCleared) {
            router.push("/order/confirmation");
          }
        }}
      >
        <div>
          <p className="eyebrow">Checkout</p>
          <h1 className="section-title">Complete the mocked purchase flow.</h1>
          {cartErrorMessage ? (
            <p aria-live="polite" className="inventory-copy is-error">
              {cartErrorMessage}
            </p>
          ) : null}
        </div>

        <section className="checkout-section">
          <p className="eyebrow">Contact</p>
          <div className="checkout-grid">
            <label className="field-stack">
              <span>Email</span>
              <input className="text-input" defaultValue="shopper@example.com" required />
            </label>
            <label className="field-stack">
              <span>Phone</span>
              <input className="text-input" defaultValue="(415) 555-0182" required />
            </label>
          </div>
        </section>

        <section className="checkout-section">
          <p className="eyebrow">Shipping</p>
          <div className="checkout-grid">
            <label className="field-stack">
              <span>Full name</span>
              <input className="text-input" defaultValue="Morgan Lee" required />
            </label>
            <label className="field-stack">
              <span>Address</span>
              <input className="text-input" defaultValue="123 Market Street" required />
            </label>
            <label className="field-stack">
              <span>City</span>
              <input className="text-input" defaultValue="San Francisco" required />
            </label>
            <label className="field-stack">
              <span>Postal code</span>
              <input className="text-input" defaultValue="94105" required />
            </label>
          </div>
        </section>

        <section className="checkout-section">
          <p className="eyebrow">Delivery</p>
          <div className="filter-row">
            <button className="chip-button is-active" type="button">
              Standard delivery
            </button>
            <button className="chip-button" type="button">
              White-glove drop-off
            </button>
          </div>
          <p className="field-hint">Delivery options are illustrative placeholders in this unit.</p>
        </section>

        <section className="checkout-section">
          <p className="eyebrow">Payment</p>
          <div className="checkout-grid">
            <label className="field-stack">
              <span>Cardholder name</span>
              <input className="text-input" defaultValue="Morgan Lee" required />
            </label>
            <label className="field-stack">
              <span>Card ending in</span>
              <input className="text-input" defaultValue="4242" required />
            </label>
          </div>
          <p className="field-hint">
            Real payment intents, taxes, shipping quotes, and submission side effects
            are intentionally deferred.
          </p>
        </section>

        <button className="submit-button" disabled={isUpdating} type="submit">
          {isUpdating ? "Placing sample order..." : "Place sample order"}
        </button>
      </form>

      <aside className="summary-panel">
        <p className="eyebrow">Order summary</p>
        <ul className="line-list">
          {lines.map((line) => (
            <li key={`${line.product.slug}-${line.size}`} className="summary-line">
              <span className="meta-copy">
                {line.product.name} x {line.quantity}
              </span>
              <span>{formatMoney(line.lineTotal)}</span>
            </li>
          ))}
        </ul>
        <div className="summary-line">
          <span className="meta-copy">Subtotal</span>
          <span>{formatMoney({ amount: subtotalAmount, currency: "USD" })}</span>
        </div>
        <div className="summary-line">
          <span className="meta-copy">Shipping</span>
          <span>{formatMoney({ amount: shippingAmount, currency: "USD" })}</span>
        </div>
        <div className="summary-line total">
          <span>Total</span>
          <span>{formatMoney({ amount: totalAmount, currency: "USD" })}</span>
        </div>
      </aside>
    </div>
  );
}
