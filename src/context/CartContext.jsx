import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('sweet_delights_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('sweet_delights_cart', JSON.stringify(cartItems));
    } catch (e) {
      console.warn('Could not save cart to localStorage', e);
    }
  }, [cartItems]);

  const addToCart = (cake, options = {}, quantity = 1) => {
    const size = options.size || cake.sizes?.[0] || { name: '1.0 KG', weightKg: 1.0, priceAdjustment: 0 };
    const flavour = options.flavour || cake.flavours?.[0] || { name: 'Classic Vanilla', priceAdjustment: 0 };
    const filling = options.filling || cake.fillings?.[0] || { name: 'Vanilla Buttercream', priceAdjustment: 0 };
    const decoration = options.decoration || cake.decorationOptions?.[0] || { name: 'Standard Piping', priceAdjustment: 0 };
    const customMessage = options.customMessage || '';
    const specialInstructions = options.specialInstructions || '';

    const unitPrice =
      (cake.basePrice || 0) +
      (size.priceAdjustment || 0) +
      (flavour.priceAdjustment || 0) +
      (filling.priceAdjustment || 0) +
      (decoration.priceAdjustment || 0);

    const cartKey = `${cake._id}_${size.name}_${flavour.name}_${filling.name}_${decoration.name}_${customMessage.trim()}`;

    setCartItems((prevItems) => {
      const existingIdx = prevItems.findIndex((item) => item.cartKey === cartKey);
      if (existingIdx > -1) {
        const updated = [...prevItems];
        updated[existingIdx].quantity += quantity;
        updated[existingIdx].totalPrice = updated[existingIdx].unitPrice * updated[existingIdx].quantity;
        return updated;
      } else {
        return [
          ...prevItems,
          {
            cartKey,
            cakeId: cake._id,
            cakeName: cake.name,
            cakeSlug: cake.slug,
            cakeImage: cake.images?.[0] || '',
            categoryName: cake.categoryName || cake.category?.name || 'Cake',
            size,
            flavour,
            filling,
            decoration,
            customMessage,
            specialInstructions,
            unitPrice,
            quantity,
            totalPrice: unitPrice * quantity
          }
        ];
      }
    });

    setIsCartOpen(true);
  };

  const updateQuantity = (cartKey, newQty) => {
    if (newQty <= 0) {
      removeFromCart(cartKey);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.cartKey === cartKey
          ? { ...item, quantity: newQty, totalPrice: item.unitPrice * newQty }
          : item
      )
    );
  };

  const removeFromCart = (cartKey) => {
    setCartItems((prev) => prev.filter((item) => item.cartKey !== cartKey));
  };

  const clearCart = () => {
    setCartItems([]);
    try {
      localStorage.removeItem('sweet_delights_cart');
    } catch {}
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
  const totalItemCount = cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        subtotal,
        totalItemCount,
        isCartOpen,
        setIsCartOpen
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;
