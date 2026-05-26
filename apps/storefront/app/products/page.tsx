import { CatalogBrowser } from "@/components/catalog-browser";
import { categories, products } from "@/lib/storefront-data";

export default function ProductsPage() {
  return (
    <main className="storefront-section">
      <section className="shell-container storefront-stack">
        <div className="catalog-intro">
          <p className="eyebrow">Catalog</p>
          <h1 className="section-title">Browse the mocked storefront assortment.</h1>
          <p className="body-copy">
            Filter by collection, sort the grid, and explore product detail views
            backed by app-local fixture data only.
          </p>
        </div>
        <CatalogBrowser categories={categories} products={products} />
      </section>
    </main>
  );
}
