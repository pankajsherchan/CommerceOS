import { requireAuth } from "@/lib/auth/guards";

export default async function AccountPage() {
  const session = await requireAuth("/account");
  const displayName = session.name ?? session.preferredUsername ?? session.email ?? "Shopper";

  return (
    <main className="storefront-section">
      <section className="shell-container">
        <div className="account-layout">
          <div className="storefront-stack">
            <div>
              <p className="eyebrow">Account</p>
              <h1 className="section-title">Welcome back, {displayName}.</h1>
            </div>

            <div className="surface-panel account-panel">
              <div>
                <p className="eyebrow">Signed in as</p>
                <p className="account-primary">{displayName}</p>
                {session.email ? <p className="body-copy">{session.email}</p> : null}
              </div>

              <dl className="account-details">
                <div>
                  <dt>Identity provider</dt>
                  <dd>Keycloak</dd>
                </div>
                <div>
                  <dt>Subject</dt>
                  <dd>{session.subject}</dd>
                </div>
              </dl>
            </div>
          </div>

          <aside className="summary-panel">
            <p className="eyebrow">Next steps</p>
            <p className="body-copy">
              Order history and saved customer profile data will appear here after
              the backend account model is introduced.
            </p>
          </aside>
        </div>
      </section>
    </main>
  );
}
