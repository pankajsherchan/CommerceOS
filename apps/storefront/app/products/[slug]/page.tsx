import Link from "next/link";
import { notFound } from "next/navigation";

import { AddToCartForm } from "@/components/add-to-cart-form";
import { ProductCard } from "@/components/product-card";
import { formatMoney } from "@/lib/money";
import { getProductBySlug, getRelatedProducts } from "@/lib/storefront-data";

type ProductDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = getRelatedProducts(product);
  const inventoryClassName = {
    "in-stock": "inventory-copy is-success",
    "low-stock": "inventory-copy is-warning",
    preorder: "inventory-copy",
    "sold-out": "inventory-copy is-error",
  }[product.inventoryStatus];

  return (
    <main className="storefront-section">
      <section className="shell-container storefront-stack">
        <div className="topline-row">
          <Link className="text-link" href="/products">
            Back to catalog
          </Link>
          <p className="meta-copy">{product.categoryName}</p>
        </div>

        <section className="detail-layout">
          <div className={`detail-media product-tone-${product.tone}`} aria-hidden="true">
            <div className="detail-object detail-object-primary" />
            <div className="detail-object detail-object-secondary" />
          </div>

          <div className="detail-copy">
            <div className="storefront-stack">
              <div className="badge-row">
                <span className="pill">{product.categoryName}</span>
                {product.badge ? <span className="pill">{product.badge}</span> : null}
              </div>
              <h1 className="product-title">{product.name}</h1>
              <p className="body-copy">{product.description}</p>
            </div>

            <div className="price-row">
              <div className="inline-actions">
                <span className="price-copy">{formatMoney(product.price)}</span>
                {product.compareAtPrice ? (
                  <span className="compare-price">
                    {formatMoney(product.compareAtPrice)}
                  </span>
                ) : null}
              </div>
              <p className={inventoryClassName}>{product.inventoryMessage}</p>
            </div>

            <AddToCartForm product={product} />

            <div className="surface-panel">
              <p className="eyebrow">Details</p>
              <ul className="surface-list">
                {product.details.map((detail) => (
                  <li key={detail}>{detail}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="storefront-stack">
          <div className="section-header">
            <div>
              <p className="eyebrow">Continue browsing</p>
              <h2 className="section-title">Related mock products</h2>
            </div>
          </div>
          <div className="product-grid">
            {relatedProducts.map((relatedProduct) => (
              <ProductCard key={relatedProduct.slug} product={relatedProduct} />
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
