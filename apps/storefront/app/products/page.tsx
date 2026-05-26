import { CatalogBrowser } from "@/components/catalog-browser";
import {
  getStorefrontCategories,
  getStorefrontProducts,
} from "@/lib/commerce-api";

export default async function ProductsPage() {
  const [categories, products] = await Promise.all([
    getStorefrontCategories(),
    getStorefrontProducts(),
  ]);

  return (
    <main className="storefront-section">
      <section className="shell-container storefront-stack">
        <div className="catalog-intro">
          <p className="eyebrow">Catalog</p>
          <h1 className="section-title">Browse the mocked storefront assortment.</h1>
          <p className="body-copy">
            Filter by collection, sort the grid, and explore product detail views
            backed by the CommerceOS API.
          </p>
        </div>
        <CatalogBrowser categories={categories} products={products} />
      </section>
    </main>
  );
}
