import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

export default function CartDrawer() {
  const { cartItems, updateQuantity, removeFromCart, subtotal, isCartOpen, setIsCartOpen } = useCart();
  const navigate = useNavigate();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fadeIn">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Drawer Header */}
          <div className="p-6 border-b border-[#E8DFD3] flex items-center justify-between bg-[#FAF7F2]">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[#C85A32] text-2xl">shopping_bag</span>
              <h2 className="font-serif-display text-xl font-bold text-[#2C2420]">Your Cake Basket</h2>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 rounded-full text-stone-500 hover:text-stone-800 hover:bg-stone-200/60 transition-colors"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cartItems.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[#FAECE5] flex items-center justify-center text-[#C85A32]">
                  <span className="material-symbols-outlined text-4xl">cake</span>
                </div>
                <h3 className="font-serif-display text-lg font-bold text-[#2C2420] mb-2">Your basket is empty</h3>
                <p className="text-sm text-stone-500 mb-6">Discover our handcrafted artisanal cakes and sweet treats.</p>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    navigate('/cakes');
                  }}
                  className="px-6 py-2.5 rounded-full bg-[#C85A32] text-white font-semibold text-sm hover:bg-[#B04B25] transition-all shadow-md shadow-orange-900/10"
                >
                  Browse Cake Catalog
                </button>
              </div>
            ) : (
              cartItems.map((item) => (
                <div
                  key={item.cartKey}
                  className="p-4 rounded-2xl border border-[#EFE8DE] bg-[#FAF7F2]/60 hover:bg-[#FAF7F2] transition-colors relative"
                >
                  <div className="flex gap-4">
                    <img
                      src={item.cakeImage || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=300&q=80'}
                      alt={item.cakeName}
                      className="w-20 h-20 rounded-xl object-cover border border-[#E8DFD3]"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-serif-display font-bold text-base text-[#2C2420] truncate">{item.cakeName}</h4>
                      <p className="text-xs text-[#C85A32] font-semibold mb-1">{item.size?.name || '1.0 KG'} • {item.flavour?.name || 'Vanilla'}</p>
                      
                      {item.customMessage && (
                        <p className="text-xs text-stone-600 italic truncate bg-white/80 px-2 py-0.5 rounded border border-stone-200/60 mb-2">
                          "{item.customMessage}"
                        </p>
                      )}

                      <div className="flex items-center justify-between mt-2">
                        <span className="font-bold text-sm text-[#2C2420]">
                          KES {item.totalPrice?.toLocaleString()}
                        </span>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2 bg-white rounded-lg border border-[#E8DFD3] p-0.5">
                          <button
                            onClick={() => updateQuantity(item.cartKey, item.quantity - 1)}
                            className="w-6 h-6 flex items-center justify-center rounded text-stone-600 hover:bg-stone-100"
                          >
                            <span className="material-symbols-outlined text-sm">remove</span>
                          </button>
                          <span className="text-xs font-bold px-1">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.cartKey, item.quantity + 1)}
                            className="w-6 h-6 flex items-center justify-center rounded text-stone-600 hover:bg-stone-100"
                          >
                            <span className="material-symbols-outlined text-sm">add</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.cartKey)}
                    className="absolute top-3 right-3 text-stone-400 hover:text-rose-600 transition-colors"
                  >
                    <span className="material-symbols-outlined text-base">delete</span>
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Drawer Footer */}
          {cartItems.length > 0 && (
            <div className="p-6 border-t border-[#E8DFD3] bg-[#FAF7F2] space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-stone-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-[#2C2420]">KES {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs text-stone-500">
                  <span>Delivery Fee</span>
                  <span>Calculated at checkout</span>
                </div>
                <div className="border-t border-[#E8DFD3] pt-2 flex justify-between items-center">
                  <span className="font-serif-display font-bold text-lg text-[#2C2420]">Estimated Total</span>
                  <span className="font-serif-display font-extrabold text-xl text-[#C85A32]">KES {subtotal.toLocaleString()}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setIsCartOpen(false);
                  navigate('/checkout');
                }}
                className="w-full py-3.5 rounded-full bg-[#C85A32] text-white font-bold text-center hover:bg-[#B04B25] transition-all shadow-lg shadow-orange-900/15 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Proceed to Checkout</span>
                <span className="material-symbols-outlined text-lg">arrow_forward</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
