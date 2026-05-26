import Link from "next/link";

export default function NotFound() {
  return (
    <main className="storefront-section">
      <section className="shell-container">
        <div className="empty-state">
          <p className="eyebrow">Not found</p>
          <h1 className="section-title">That product view is not part of the mock catalog.</h1>
          <p className="body-copy">
            Try the full catalog or return to the storefront home to continue the
            sample shopping flow.
          </p>
          <div className="button-row">
            <Link className="button-primary" href="/products">
              Browse products
            </Link>
            <Link className="button-secondary" href="/">
              Back to home
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
