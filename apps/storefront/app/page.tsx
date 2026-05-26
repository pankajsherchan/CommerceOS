import Link from "next/link";

import { ProductCard } from "@/components/product-card";
import { getFeaturedProducts, storefrontMerch } from "@/lib/storefront-data";

const featuredProducts = getFeaturedProducts();

export default function Home() {
  return (
    <main className="shell-container storefront-stack storefront-section">
      <section className="hero-grid">
        <div className="hero-copy">
          <p className="eyebrow">{storefrontMerch.eyebrow}</p>
          <h1 className="display-title">{storefrontMerch.title}</h1>
          <p className="lede">{storefrontMerch.description}</p>
          <div className="button-row">
            <Link className="button-primary" href="/products">
              Shop the catalog
            </Link>
            <Link className="button-secondary" href="/checkout">
              Preview checkout
            </Link>
          </div>
        </div>
        <div className="hero-showcase product-tone-sand" aria-hidden="true">
          <div className="hero-object hero-object-primary" />
          <div className="hero-object hero-object-secondary" />
          <div className="hero-object hero-object-accent" />
        </div>
      </section>

      <section className="storefront-stack">
        <div className="section-header">
          <div>
            <p className="eyebrow">Featured collection</p>
            <h2 className="section-title">Best-sellers for the mocked launch.</h2>
          </div>
          <Link className="text-link" href="/products">
            View all products
          </Link>
        </div>
        <div className="product-grid">
          {featuredProducts.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      </section>
    </main>
  );
}
