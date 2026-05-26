"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  addCartItem,
  clearCart as clearRemoteCart,
  removeCartItem,
  updateCartItem,
} from "@/lib/cart-api";
import {
  buildCartSummary,
  createEnrichedCartLines,
  type CartLine,
  type EnrichedCartLine,
  type Product,
} from "@/lib/storefront-data";

type AddItemInput = {
  product: Product;
  size: string;
};

type CartContextValue = {
  lineCount: number;
  lines: EnrichedCartLine[];
  subtotalAmount: number;
  shippingAmount: number;
  totalAmount: number;
  addItem: (input: AddItemInput) => Promise<boolean>;
  cartErrorMessage: string | null;
  clearCart: () => Promise<boolean>;
  isUpdating: boolean;
  lastAddedProductName: string | null;
  removeItem: (productSlug: string, size: string) => Promise<boolean>;
  updateQuantity: (
    productSlug: string,
    size: string,
    quantity: number,
  ) => Promise<boolean>;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProviderInner({
  children,
  initialLines,
  initialProducts,
}: {
  children: ReactNode;
  initialLines: CartLine[];
  initialProducts: Product[];
}) {
  const [lines, setLines] = useState<CartLine[]>(initialLines);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [cartErrorMessage, setCartErrorMessage] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastAddedProductName, setLastAddedProductName] = useState<string | null>(
    null,
  );

  const lineItems = useMemo(
    () => createEnrichedCartLines(lines, products),
    [lines, products],
  );
  const summary = useMemo(() => buildCartSummary(lineItems), [lineItems]);

  const runCartMutation = useCallback(
    async (
      mutation: () => Promise<CartLine[]>,
      onSuccess?: () => void,
    ) => {
      setIsUpdating(true);
      setCartErrorMessage(null);

      try {
        const nextLines = await mutation();
        setLines(nextLines);
        onSuccess?.();
        return true;
      } catch {
        setCartErrorMessage("Cart update failed. Make sure the commerce API is running.");
        return false;
      } finally {
        setIsUpdating(false);
      }
    },
    [],
  );

  const value = useMemo<CartContextValue>(
    () => ({
      addItem: async ({ product, size }) => {
        return runCartMutation(
          () =>
            addCartItem({
              productSlug: product.slug,
              quantity: 1,
              size,
            }),
          () => {
            setLastAddedProductName(product.name);
            setProducts((currentProducts) => {
              if (currentProducts.some((currentProduct) => currentProduct.slug === product.slug)) {
                return currentProducts;
              }

              return [...currentProducts, product];
            });
          },
        );
      },
      cartErrorMessage,
      clearCart: async () => {
        return runCartMutation(() => clearRemoteCart());
      },
      isUpdating,
      lastAddedProductName,
      lineCount: summary.lineCount,
      lines: lineItems,
      removeItem: async (productSlug, size) => {
        return runCartMutation(() => removeCartItem({ productSlug, size }));
      },
      shippingAmount: summary.shippingAmount,
      subtotalAmount: summary.subtotalAmount,
      totalAmount: summary.totalAmount,
      updateQuantity: async (productSlug, size, quantity) => {
        if (quantity <= 0) {
          return runCartMutation(() => removeCartItem({ productSlug, size }));
        }

        return runCartMutation(() =>
          updateCartItem({ productSlug, quantity, size }),
        );
      },
    }),
    [
      cartErrorMessage,
      isUpdating,
      lastAddedProductName,
      lineItems,
      runCartMutation,
      summary,
    ],
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
