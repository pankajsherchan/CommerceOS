import Link from "next/link";

import { CartStatusLink } from "@/components/cart-status-link";
import { getCurrentSession } from "@/lib/auth/session";

type StorefrontShellProps = {
  children: React.ReactNode;
};

export async function StorefrontShell({ children }: StorefrontShellProps) {
  const session = await getCurrentSession();

  return (
    <div className="app-shell">
      <div className="announcement-bar">
        <div className="shell-container">
          <p className="announcement-copy">
            Phase 1 storefront preview with mocked catalog, cart, checkout, and auth flow.
          </p>
          <p className="meta-copy">API and payment integration are still deferred.</p>
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
            {session ? (
              <Link className="nav-link" href="/account">
                Account
              </Link>
            ) : null}
          </nav>

          <div className="nav-actions">
            <CartStatusLink />
            {session ? (
              <form action="/auth/sign-out" method="post">
                <button className="nav-link auth-action-button" type="submit">
                  Sign out
                </button>
              </form>
            ) : (
              <>
                <Link className="nav-link" href="/auth/sign-in">
                  Sign in
                </Link>
                <Link className="button-secondary nav-button" href="/auth/sign-up">
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {children}
    </div>
  );
}
