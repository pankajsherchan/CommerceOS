"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  buildCartSummary,
  createEnrichedCartLines,
  initialCartLines,
  type CartLine,
  type Product,
} from "@/lib/storefront-data";

type AddItemInput = {
  product: Product;
  size: string;
};

type CartContextValue = {
  lineCount: number;
  lines: ReturnType<typeof createEnrichedCartLines>;
  subtotalAmount: number;
  shippingAmount: number;
  totalAmount: number;
  addItem: (input: AddItemInput) => void;
  clearCart: () => void;
  lastAddedProductName: string | null;
  removeItem: (productSlug: string, size: string) => void;
  updateQuantity: (productSlug: string, size: string, quantity: number) => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>(initialCartLines);
  const [lastAddedProductName, setLastAddedProductName] = useState<string | null>(
    null,
  );

  const lineItems = useMemo(() => createEnrichedCartLines(lines), [lines]);
  const summary = useMemo(() => buildCartSummary(lineItems), [lineItems]);

  const value = useMemo<CartContextValue>(
    () => ({
      addItem: ({ product, size }) => {
        setLines((currentLines) => {
          const existingLine = currentLines.find(
            (line) => line.productSlug === product.slug && line.size === size,
          );

          if (!existingLine) {
            return [...currentLines, { productSlug: product.slug, quantity: 1, size }];
          }

          return currentLines.map((line) =>
            line.productSlug === product.slug && line.size === size
              ? { ...line, quantity: line.quantity + 1 }
              : line,
          );
        });
        setLastAddedProductName(product.name);
      },
      clearCart: () => setLines([]),
      lastAddedProductName,
      lineCount: summary.lineCount,
      lines: lineItems,
      removeItem: (productSlug, size) => {
        setLines((currentLines) =>
          currentLines.filter(
            (line) => !(line.productSlug === productSlug && line.size === size),
          ),
        );
      },
      shippingAmount: summary.shippingAmount,
      subtotalAmount: summary.subtotalAmount,
      totalAmount: summary.totalAmount,
      updateQuantity: (productSlug, size, quantity) => {
        if (quantity <= 0) {
          setLines((currentLines) =>
            currentLines.filter(
              (line) => !(line.productSlug === productSlug && line.size === size),
            ),
          );

          return;
        }

        setLines((currentLines) =>
          currentLines.map((line) =>
            line.productSlug === productSlug && line.size === size
              ? { ...line, quantity }
              : line,
          ),
        );
      },
    }),
    [lastAddedProductName, lineItems, summary],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }

  return context;
}
