import Link from "next/link";

export default function OrderConfirmationPage() {
  return (
    <main className="storefront-section">
      <section className="shell-container">
        <div className="confirmation-panel">
          <span className="status-badge">Mock order confirmed</span>
          <h1 className="section-title">Thanks for stepping through the sample checkout.</h1>
          <p className="body-copy">
            No payment was processed and no backend order was created. This page
            exists to make the intended storefront flow visible before live cart,
            checkout, and Stripe units arrive.
          </p>
          <div className="surface-panel">
            <p className="eyebrow">What this proves</p>
            <ul className="surface-list">
              <li>Catalog, product detail, cart, and checkout routes are wired.</li>
              <li>Cart interactions work locally across navigation.</li>
              <li>Confirmation UX is ready to swap over to a real order result later.</li>
            </ul>
          </div>
          <div className="confirmation-actions">
            <Link className="button-primary" href="/products">
              Continue browsing
            </Link>
            <Link className="button-secondary" href="/">
              Return home
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
