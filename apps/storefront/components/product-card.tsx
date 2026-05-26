import Link from "next/link";

import { formatMoney } from "@/lib/money";
import type { Product } from "@/lib/storefront-data";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link className="product-card" href={`/products/${product.slug}`}>
      <div className="product-card-inner">
        <div className={`product-media product-tone-${product.tone}`} aria-hidden="true">
          <div className="product-object product-object-main" />
          <div className="product-object product-object-rail" />
        </div>
        <div className="product-meta">
          <div className="badge-row">
            <span className="pill">{product.categoryName}</span>
            {product.badge ? <span className="pill">{product.badge}</span> : null}
          </div>
          <div>
            <h3 className="card-title">{product.name}</h3>
            <p className="body-copy">{product.shortDescription}</p>
          </div>
          <div className="price-row">
            <span className="price-copy">{formatMoney(product.price)}</span>
            <span className="meta-copy">{product.inventoryLabel}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
