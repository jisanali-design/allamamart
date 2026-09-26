import React from 'react';
import { X, Plus, Minus, Flame, Clock, Star, ShieldCheck, ShoppingBag } from 'lucide-react';
import { FoodItem } from '../types';
import { useCart } from '../context/CartContext';
import { useStoreStatus } from '../context/StoreStatusContext';
import { soundFx } from '../utils/sound';

interface ProductDetailModalProps {
  product: FoodItem | null;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, onClose }) => {
  const { getItemQuantity, addToCart, updateQuantity, setIsCartDrawerOpen } = useCart();
  const { isTakingOrders } = useStoreStatus();

  if (!product) return null;

  const quantity = getItemQuantity(product.id);

  const handleAddAndOpenCart = () => {
    if (!isTakingOrders) {
      soundFx.playDoorKnock();
      return;
    }
    if (quantity === 0) {
      addToCart(product, 1);
    }
    soundFx.playSuccess();
    setIsCartDrawerOpen(true);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="relative w-full max-w-lg rounded-3xl bg-[#1e293b] border border-white/[0.08] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-[#f8fafc]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-[#0b0f19]/80 hover:bg-[#0b0f19] text-[#94a3b8] hover:text-white border border-white/[0.08] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Image */}
        <div className="relative aspect-16/9 w-full bg-[#0b0f19] shrink-0">
          <img
            src={product.image}
            alt={product.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1e293b] via-transparent to-black/30" />

          <div className="absolute bottom-3 left-4 flex flex-wrap gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-[#f59e0b] text-slate-950 text-xs font-black">
              {product.tag || 'Hostel Essential'}
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-[#0b0f19]/85 text-slate-200 text-xs border border-white/[0.08] flex items-center gap-1 font-semibold">
              <Star className="w-3.5 h-3.5 fill-[#f59e0b] text-[#f59e0b]" />
              {product.rating} ({product.reviewsCount} reviews)
            </span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`w-3.5 h-3.5 rounded-xs border flex items-center justify-center ${
                product.isVeg ? 'border-emerald-500' : 'border-rose-500'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${
                  product.isVeg ? 'bg-emerald-500' : 'bg-rose-500'
                }`} />
              </span>
              <span className="text-xs font-semibold text-[#94a3b8]">
                {product.isVeg ? '100% Vegetarian' : 'Non-Vegetarian'} • {product.weight}
              </span>
            </div>
            
            <h2 className="text-xl font-bold text-[#f8fafc] font-['Outfit']">
              {product.name}
            </h2>

            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-[#f59e0b]">₹{product.price}</span>
              {product.originalPrice && (
                <span className="text-sm text-[#94a3b8] line-through">₹{product.originalPrice}</span>
              )}
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                Free Room Delivery
              </span>
            </div>
          </div>

          <p className="text-sm text-[#94a3b8] leading-relaxed">
            {product.description}
          </p>

          {/* Quick Specifications */}
          <div className="grid grid-cols-2 gap-3 py-2">
            <div className="p-3 rounded-xl bg-[#0b0f19] border border-white/[0.08] space-y-1">
              <span className="text-[11px] text-[#94a3b8] font-medium">Preparation</span>
              <div className="flex items-center gap-1.5 text-xs text-[#f8fafc] font-semibold">
                <Clock className="w-3.5 h-3.5 text-[#f59e0b]" />
                <span>{product.prepTime}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#0b0f19] border border-white/[0.08] space-y-1">
              <span className="text-[11px] text-[#94a3b8] font-medium">Spiciness</span>
              <div className="flex items-center gap-1.5 text-xs text-[#f8fafc] font-semibold">
                {product.spicyLevel && product.spicyLevel > 0 ? (
                  <span className="flex items-center gap-0.5 text-amber-500">
                    {Array.from({ length: product.spicyLevel }).map((_, i) => (
                      <Flame key={i} className="w-3.5 h-3.5 fill-amber-500" />
                    ))}
                    <span className="text-xs ml-1">Level {product.spicyLevel}/3</span>
                  </span>
                ) : (
                  <span className="text-[#94a3b8]">Mild / Non-Spicy</span>
                )}
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#0b0f19] border border-white/[0.08] flex items-center gap-2.5 text-xs text-[#94a3b8]">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Exclusively for Allama Hostel Block A & B. Sealed packaged products.</span>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-white/[0.08] bg-[#0b0f19] flex items-center justify-between gap-3 shrink-0">
          <div>
            <div className="text-[11px] text-[#94a3b8]">Total Price</div>
            <div className="text-lg font-black text-[#f59e0b]">
              ₹{product.price * (quantity > 0 ? quantity : 1)}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!product.inStock ? (
              <button
                disabled
                className="px-5 py-2.5 rounded-xl bg-slate-800 border border-white/[0.06] text-[#94a3b8] font-bold text-sm cursor-not-allowed"
              >
                Currently Sold Out
              </button>
            ) : !isTakingOrders ? (
              <div className="text-xs font-semibold text-rose-300 bg-rose-500/10 border border-rose-500/25 px-3 py-2 rounded-xl">
                🔴 Shop is closed now, Please check later
              </div>
            ) : (
              <>
                {quantity > 0 && (
                  <div className="flex items-center gap-1 bg-[#1e293b] border border-white/[0.08] rounded-xl p-1">
                    <button
                      onClick={() => updateQuantity(product.id, quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-800 hover:bg-slate-700 text-white cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center text-sm font-bold text-[#f8fafc]">
                      {quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(product.id, quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#f59e0b] hover:bg-amber-400 text-slate-950 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                <button
                  onClick={handleAddAndOpenCart}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#f59e0b] hover:bg-amber-400 text-slate-950 font-black text-sm shadow-md shadow-amber-500/15 cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4 stroke-[2.5]" />
                  <span>{quantity > 0 ? 'View in Cart' : 'Add to Room Cart'}</span>
                </button>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
