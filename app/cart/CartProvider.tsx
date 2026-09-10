"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  CartItem,
  MAX_DISTINCT_ITEMS,
  MAX_ITEM_QUANTITY,
  MAX_TOTAL_QUANTITY,
} from "@/lib/cart";

const STORAGE_KEY = "my-ec-site-cart-v1";

type NewCartItem = Omit<CartItem, "quantity">;

type CartContextValue = {
  items: CartItem[];
  isReady: boolean;
  itemCount: number;
  subtotal: number;
  addItem: (item: NewCartItem, quantity: number) => void;
  removeItem: (productId: number) => void;
  setQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function isCartItem(value: unknown): value is CartItem {
  if (!value || typeof value !== "object") {
    return false;
  }

  const item = value as Partial<CartItem>;

  return (
    Number.isSafeInteger(item.productId) &&
    Number(item.productId) > 0 &&
    typeof item.name === "string" &&
    item.name.trim().length > 0 &&
    Number.isSafeInteger(item.price) &&
    Number(item.price) > 0 &&
    (typeof item.size === "string" || item.size === null) &&
    Number.isInteger(item.quantity) &&
    Number(item.quantity) >= 1 &&
    Number(item.quantity) <= MAX_ITEM_QUANTITY
  );
}

function readStoredItems(): CartItem[] {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return [];
    }

    const parsed: unknown = JSON.parse(stored);

    if (!Array.isArray(parsed)) {
      return [];
    }

    let remainingQuantity = MAX_TOTAL_QUANTITY;

    return parsed
      .filter(isCartItem)
      .slice(0, MAX_DISTINCT_ITEMS)
      .flatMap((item) => {
        if (remainingQuantity === 0) {
          return [];
        }

        const quantity = Math.min(item.quantity, remainingQuantity);
        remainingQuantity -= quantity;

        return [{ ...item, quantity }];
      });
  } catch {
    return [];
  }
}

export default function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setItems(readStoredItems());
      setIsReady(true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isReady) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  }, [isReady, items]);

  const addItem = useCallback(
    (newItem: NewCartItem, requestedQuantity: number) => {
      const safeRequestedQuantity = Number.isFinite(requestedQuantity)
        ? requestedQuantity
        : 1;
      const quantity = Math.min(
        MAX_ITEM_QUANTITY,
        Math.max(1, Math.floor(safeRequestedQuantity))
      );

      setItems((currentItems) => {
        const existing = currentItems.find(
          (item) => item.productId === newItem.productId
        );
        const currentTotal = currentItems.reduce(
          (total, item) => total + item.quantity,
          0
        );
        const availableTotal = Math.max(0, MAX_TOTAL_QUANTITY - currentTotal);

        if (existing) {
          const addedQuantity = Math.min(
            quantity,
            MAX_ITEM_QUANTITY - existing.quantity,
            availableTotal
          );

          return currentItems.map((item) =>
            item.productId === newItem.productId
              ? { ...item, quantity: item.quantity + addedQuantity }
              : item
          );
        }

        if (
          currentItems.length >= MAX_DISTINCT_ITEMS ||
          availableTotal === 0
        ) {
          return currentItems;
        }

        return [
          ...currentItems,
          { ...newItem, quantity: Math.min(quantity, availableTotal) },
        ];
      });
    },
    []
  );

  const removeItem = useCallback((productId: number) => {
    setItems((currentItems) =>
      currentItems.filter((item) => item.productId !== productId)
    );
  }, []);

  const setQuantity = useCallback(
    (productId: number, requestedQuantity: number) => {
      setItems((currentItems) => {
        const safeRequestedQuantity = Number.isFinite(requestedQuantity)
          ? requestedQuantity
          : 1;
        const currentTotal = currentItems.reduce(
          (total, item) => total + item.quantity,
          0
        );
        const currentItem = currentItems.find(
          (item) => item.productId === productId
        );

        if (!currentItem) {
          return currentItems;
        }

        const remainingForItem = Math.max(
          1,
          MAX_TOTAL_QUANTITY - (currentTotal - currentItem.quantity)
        );
        const quantity = Math.min(
          MAX_ITEM_QUANTITY,
          remainingForItem,
          Math.max(1, Math.floor(safeRequestedQuantity))
        );

        return currentItems.map((item) =>
          item.productId === productId ? { ...item, quantity } : item
        );
      });
    },
    []
  );

  const clearCart = useCallback(() => setItems([]), []);

  const value = useMemo<CartContextValue>(() => {
    const itemCount = items.reduce((total, item) => total + item.quantity, 0);
    const subtotal = items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );

    return {
      items,
      isReady,
      itemCount,
      subtotal,
      addItem,
      removeItem,
      setQuantity,
      clearCart,
    };
  }, [addItem, clearCart, isReady, items, removeItem, setQuantity]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }

  return context;
}
