export const MAX_ITEM_QUANTITY = 10;
export const MAX_DISTINCT_ITEMS = 10;
export const MAX_TOTAL_QUANTITY = 50;

export type CartItem = {
  productId: number;
  name: string;
  price: number;
  size: string | null;
  quantity: number;
};

export type CheckoutItem = Pick<CartItem, "productId" | "quantity">;
