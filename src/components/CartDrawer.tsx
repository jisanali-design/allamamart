import React from 'react';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ArrowRight, 
  DoorClosed,
  Clock,
  AlertCircle
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useStoreStatus } from '../context/StoreStatusContext';
import { soundFx } from '../utils/sound';

export const CartDrawer: React.FC = () => {
  const { 
    items, 
    totalItems, 
    subtotal, 
    updateQuantity, 
    clearCart,
    isCartDrawerOpen, 
    setIsCartDrawerOpen,
    setIsCheckoutModalOpen
  } = useCart();
  const { isTakingOrders } = useStoreStatus();

  if (!isCartDrawerOpen) return null;

  const handleProceedToCheckout = () => {
    if (!isTakingOrders) {
      soundFx.playDoorKnock();
      return;
    }
    soundFx.playSuccess();
    setIsCartDrawerOpen(false);
    setIsCheckoutModalOpen(true);
  };

  const handleClose = () => {
    soundFx.playPop();
    setIsCartDrawerOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        onClick={handleClose}
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-md bg-[#1e293b] border-l border-white/[0.08] shadow-2xl flex flex-col text-[#f8fafc]">
          
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-white/[0.08] flex items-center justify-between bg-[#0b0f19]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#f59e0b] flex items-center justify-center text-slate-950 shadow-xs">
                <ShoppingBag className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div>
                <h2 className="text-base font-black text-[#f8fafc] font-['Outfit']">
                  Your Room Cart
                </h2>
                <p className="text-[11px] text-[#94a3b8]">
                  {totalItems} {totalItems === 1 ? 'packaged item' : 'packaged items'} selected
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {items.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-xs text-[#94a3b8] hover:text-rose-400 px-2 py-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Clear all items"
                >
                  Clear
                </button>
              )}
              <button
                onClick={handleClose}
                className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-[#94a3b8] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Close cart"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Guarantee Micro-Banner */}
          <div className="bg-[#0b0f19]/80 border-b border-white/[0.06] px-4 py-2 text-xs text-emerald-300 flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-medium">
              <DoorClosed className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Block A & B Room Drop</span>
            </div>
            <span className="font-extrabold text-[11px] bg-emerald-500/15 border border-emerald-500/25 px-2 py-0.5 rounded text-emerald-300">
              ₹0 Delivery Fee
            </span>
          </div>

          {/* Closed Alert Banner in Cart */}
          {!isTakingOrders && (
            <div className="bg-rose-500/15 border-b border-rose-500/30 p-3 text-xs text-rose-200 flex items-center gap-2">
              <span className="text-sm">🔴</span>
              <span><strong>Shop is closed now, Please check later.</strong> Orders cannot be submitted while closed.</span>
            </div>
          )}

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 bg-[#0b0f19]/40">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-[#1e293b] border border-white/[0.08] flex items-center justify-center text-[#94a3b8]">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#f8fafc]">Your cart is empty</h3>
                  <p className="text-xs text-[#94a3b8] mt-1 max-w-xs mx-auto leading-relaxed">
                    Exam all-nighter or late-night hunger? Add instant noodles, chilled drinks, or chips directly to your room cart!
                  </p>
                </div>
                <button
                  onClick={handleClose}
                  className="px-5 py-2.5 rounded-xl bg-[#f59e0b] hover:bg-amber-400 text-slate-950 text-xs font-black transition-transform active:scale-95 shadow-md shadow-amber-500/15 cursor-pointer"
                >
                  Browse Snacks
                </button>
              </div>
            ) : (
              items.map(({ item, quantity }) => (
                <div 
                  key={item.id}
                  className="p-3 rounded-2xl bg-[#0b0f19] border border-white/[0.08] flex gap-3 items-center group hover:border-amber-500/30 transition-colors"
                >
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-16 h-16 rounded-xl object-cover bg-slate-900 border border-white/[0.06] shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-[#f8fafc] truncate group-hover:text-amber-300 transition-colors">
                      {item.name}
                    </h4>
                    <p className="text-[11px] text-[#94a3b8] mt-0.5">
                      {item.weight}
                    </p>
                    <div className="mt-1 flex items-baseline gap-1.5">
                      <span className="text-xs font-extrabold text-[#f59e0b]">
                        ₹{item.price}
                      </span>
                      {item.originalPrice && (
                        <span className="text-[10px] text-[#94a3b8] line-through">
                          ₹{item.originalPrice}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quantity Controller */}
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <div className="flex items-center gap-1 bg-[#1e293b] border border-white/[0.08] rounded-xl p-0.5">
                      <button
                        onClick={() => {
                          soundFx.playPop();
                          updateQuantity(item.id, quantity - 1);
                        }}
                        className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-[#94a3b8] hover:text-[#f8fafc] flex items-center justify-center transition-colors cursor-pointer"
                        aria-label="Decrease quantity"
                      >
                        {quantity === 1 ? (
                          <Trash2 className="w-3 h-3 text-rose-400" />
                        ) : (
                          <Minus className="w-3 h-3" />
                        )}
                      </button>
                      <span className="w-5 text-center text-xs font-black text-[#f8fafc]">
                        {quantity}
                      </span>
                      <button
                        onClick={() => {
                          soundFx.playPop();
                          updateQuantity(item.id, quantity + 1);
                        }}
                        className="w-6 h-6 rounded-lg bg-[#f59e0b] hover:bg-amber-400 text-slate-950 font-bold flex items-center justify-center transition-colors cursor-pointer"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <span className="text-xs font-black text-slate-300">
                      ₹{item.price * quantity}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout Area */}
          {items.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-white/[0.08] bg-[#0b0f19] space-y-3.5">
              
              {/* Bill Details */}
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-[#94a3b8]">
                  <span>Item Total</span>
                  <span className="font-semibold text-[#f8fafc]">₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-[#94a3b8]">
                  <span>Room Delivery Fee</span>
                  <span className="font-bold text-emerald-400">FREE (₹0)</span>
                </div>
                <div className="pt-2 border-t border-white/[0.08] flex justify-between items-baseline">
                  <span className="text-sm font-black text-[#f8fafc] font-['Outfit']">To Pay</span>
                  <span className="text-lg font-black text-[#f59e0b] font-['Outfit']">₹{subtotal}</span>
                </div>
              </div>

              {/* Delivery ETA pill */}
              <div className="p-2.5 rounded-xl bg-[#1e293b] border border-white/[0.08] flex items-center gap-2 text-xs text-amber-300">
                <Clock className="w-3.5 h-3.5 text-[#f59e0b] shrink-0" />
                <span>Corridor runner delivery in <strong>10–12 mins</strong></span>
              </div>

              {/* Proceed to Checkout CTA */}
              <button
                disabled={!isTakingOrders}
                onClick={handleProceedToCheckout}
                className={`w-full py-3.5 px-4 rounded-2xl font-black text-sm shadow-xl flex items-center justify-between transition-all transform active:scale-98 ${
                  isTakingOrders
                    ? 'bg-[#f59e0b] hover:bg-amber-400 text-slate-950 shadow-amber-500/15 cursor-pointer'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30 cursor-not-allowed'
                }`}
              >
                <span>{isTakingOrders ? 'Proceed to Checkout' : '🔴 Shop is closed now, Please check later'}</span>
                <div className="flex items-center gap-1.5">
                  <span>₹{subtotal}</span>
                  {isTakingOrders && <ArrowRight className="w-4 h-4 stroke-[2.5]" />}
                </div>
              </button>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
