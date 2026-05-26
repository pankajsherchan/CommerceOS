import Link from "next/link";

import { CartStatusLink } from "@/components/cart-status-link";

type StorefrontShellProps = {
  children: React.ReactNode;
};

export function StorefrontShell({ children }: StorefrontShellProps) {
  return (
    <div className="app-shell">
      <div className="announcement-bar">
        <div className="shell-container">
          <p className="announcement-copy">
            Phase 1 storefront preview with mocked catalog, cart, and checkout flow.
          </p>
          <p className="meta-copy">No auth, API, or payment integration yet.</p>
        </div>
      </div>

      <header className="top-nav">
        <div className="shell-container">
          <div className="brand-lockup">
            <Link className="brand-mark" href="/">
              CommerceOS
            </Link>
            <span className="brand-tagline">Storefront preview</span>
          </div>

          <nav className="nav-links" aria-label="Storefront navigation">
            <Link className="nav-link" href="/">
              Home
            </Link>
            <Link className="nav-link" href="/products">
              Catalog
            </Link>
            <Link className="nav-link" href="/checkout">
              Checkout
            </Link>
          </nav>

          <div className="nav-actions">
            <CartStatusLink />
          </div>
        </div>
      </header>

      {children}
    </div>
  );
}
