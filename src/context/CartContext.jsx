import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext();
const STORAGE_KEY = "freshlink_cart";

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addToCart = (product, quantity = 1) => {
    const productId = product._id || product.id;
    const available = Number(product.quantity ?? product.stock ?? 12);
    setItems((current) => {
      const existing = current.find((item) => item._id === productId);
      const requestedQty = Number(quantity) || 1;
      const nextQty = existing ? existing.quantity + requestedQty : requestedQty;

      if (nextQty > available) {
        return current;
      }

      if (existing) {
        return current.map((item) =>
          item._id === productId ? { ...item, quantity: nextQty } : item
        );
      }

      return [
        ...current,
        {
          _id: productId,
          name: product.name,
          price: Number(product.price),
          unit: product.unit || "unit",
          photo: product.photo,
          farmerName: product.farmerName || "FreshLink Farmer",
          quantity: requestedQty,
          available,
        },
      ];
    });
  };

  const updateQuantity = (productId, quantity) => {
    setItems((current) =>
      current
        .map((item) => {
          if (item._id !== productId) return item;
          const nextQty = Number(quantity);
          return nextQty <= 0 ? null : { ...item, quantity: Math.min(nextQty, item.available || nextQty) };
        })
        .filter(Boolean)
    );
  };

  const removeFromCart = (productId) => {
    setItems((current) => current.filter((item) => item._id !== productId));
  };

  const clearCart = () => setItems([]);

  const itemCount = useMemo(
    () => items.reduce((total, item) => total + Number(item.quantity || 0), 0),
    [items]
  );

  const subtotal = useMemo(
    () => items.reduce((total, item) => total + Number(item.price || 0) * Number(item.quantity || 0), 0),
    [items]
  );

  const value = {
    items,
    itemCount,
    subtotal,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  return useContext(CartContext);
}
