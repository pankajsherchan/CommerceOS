"use client";

import { useMemo, useState } from "react";

import { ProductCard } from "@/components/product-card";
import type { Category, Product } from "@/lib/storefront-data";

type CatalogBrowserProps = {
  categories: Category[];
  products: Product[];
};

type SortMode = "featured" | "price-low" | "price-high";

export function CatalogBrowser({ categories, products }: CatalogBrowserProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortMode, setSortMode] = useState<SortMode>("featured");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const filteredProducts = useMemo(() => {
    const nextProducts =
      selectedCategory === "all"
        ? [...products]
        : products.filter((product) => product.categorySlug === selectedCategory);

    switch (sortMode) {
      case "price-low":
        return nextProducts.sort((left, right) => left.price.amount - right.price.amount);
      case "price-high":
        return nextProducts.sort((left, right) => right.price.amount - left.price.amount);
      default:
        return nextProducts.sort((left, right) => Number(right.featured) - Number(left.featured));
    }
  }, [products, selectedCategory, sortMode]);

  return (
    <div className="catalog-layout">
      <aside className="sidebar-panel">
        <div className="surface-panel filter-group">
          <p className="eyebrow">Collections</p>
          <div className="filter-row">
            <button
              className={`chip-button${selectedCategory === "all" ? " is-active" : ""}`}
              onClick={() => setSelectedCategory("all")}
              type="button"
            >
              All products
            </button>
            {categories.map((category) => (
              <button
                key={category.slug}
                className={`chip-button${selectedCategory === category.slug ? " is-active" : ""}`}
                onClick={() => setSelectedCategory(category.slug)}
                type="button"
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </aside>

      <div className="storefront-stack">
        <div className="catalog-toolbar">
          <div>
            <p className="eyebrow">Browse</p>
            <h2 className="section-title">
              {filteredProducts.length} product{filteredProducts.length === 1 ? "" : "s"}
            </h2>
          </div>
          <div className="inline-actions">
            <button
              className="button-secondary mobile-filter-toggle"
              onClick={() => setMobileFiltersOpen((current) => !current)}
              type="button"
            >
              {mobileFiltersOpen ? "Hide filters" : "Show filters"}
            </button>
            <label>
              <span className="sr-only">Sort products</span>
              <select
                className="sort-select"
                onChange={(event) => setSortMode(event.target.value as SortMode)}
                value={sortMode}
              >
                <option value="featured">Featured first</option>
                <option value="price-low">Price: low to high</option>
                <option value="price-high">Price: high to low</option>
              </select>
            </label>
          </div>
        </div>

        {mobileFiltersOpen ? (
          <div className="surface-panel mobile-filter-panel">
            <p className="eyebrow">Mobile filters</p>
            <div className="filter-row">
              <button
                className={`chip-button${selectedCategory === "all" ? " is-active" : ""}`}
                onClick={() => setSelectedCategory("all")}
                type="button"
              >
                All products
              </button>
              {categories.map((category) => (
                <button
                  key={category.slug}
                  className={`chip-button${selectedCategory === category.slug ? " is-active" : ""}`}
                  onClick={() => setSelectedCategory(category.slug)}
                  type="button"
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {filteredProducts.length > 0 ? (
          <div className="product-grid">
            {filteredProducts.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p className="eyebrow">No results</p>
            <h3 className="section-title">This filter is intentionally empty right now.</h3>
            <p className="body-copy">
              Reset to all products to continue the mocked browse and cart flow.
            </p>
            <button
              className="button-primary"
              onClick={() => setSelectedCategory("all")}
              type="button"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
