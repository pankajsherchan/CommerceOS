export default function Home() {
  return (
    <main className="page-shell">
      <section className="surface">
        <p className="eyebrow">Phase 0 bootstrap</p>
        <h1 className="title">CommerceOS storefront</h1>
        <p className="body-copy">
          The first runnable frontend surface is in place. This placeholder app
          proves the repository structure, local tooling, and testing baseline
          without introducing real commerce behavior yet.
        </p>
        <div className="command-list" aria-label="Initial storefront commands">
          <code>pnpm dev</code>
          <code>pnpm lint</code>
          <code>pnpm typecheck</code>
          <code>pnpm test</code>
        </div>
      </section>
    </main>
  );
}
