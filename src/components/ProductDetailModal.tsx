import React from 'react';
import { X, Plus, Minus, Flame, Clock, Star, ShieldCheck, Check, ShoppingBag } from 'lucide-react';
import { FoodItem } from '../types';
import { useCart } from '../context/CartContext';

interface ProductDetailModalProps {
  product: FoodItem | null;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, onClose }) => {
  const { getItemQuantity, addToCart, updateQuantity, setIsCartDrawerOpen } = useCart();

  if (!product) return null;

  const quantity = getItemQuantity(product.id);

  const handleAddAndOpenCart = () => {
    if (quantity === 0) {
      addToCart(product, 1);
    }
    setIsCartDrawerOpen(true);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div 
        className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-slate-950/80 hover:bg-slate-950 text-slate-300 hover:text-white border border-slate-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Image */}
        <div className="relative aspect-16/9 w-full bg-slate-950 shrink-0">
          <img
            src={product.image}
            alt={product.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-black/30" />

          <div className="absolute bottom-3 left-4 flex flex-wrap gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 text-xs font-black">
              {product.tag || '2 AM Essential'}
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-950/80 text-slate-200 text-xs border border-slate-800 flex items-center gap-1 font-semibold">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              {product.rating} ({product.reviewsCount} student reviews)
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
              <span className="text-xs font-semibold text-slate-400">
                {product.isVeg ? '100% Vegetarian' : 'Non-Vegetarian'} • {product.weight}
              </span>
            </div>
            
            <h2 className="text-xl font-bold text-white font-['Outfit']">
              {product.name}
            </h2>

            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-amber-400">₹{product.price}</span>
              {product.originalPrice && (
                <span className="text-sm text-slate-500 line-through">₹{product.originalPrice}</span>
              )}
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                Free Room Delivery
              </span>
            </div>
          </div>

          <p className="text-sm text-slate-300 leading-relaxed">
            {product.description}
          </p>

          {/* Quick Specifications */}
          <div className="grid grid-cols-2 gap-3 py-2">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-500 font-medium">Preparation</span>
              <div className="flex items-center gap-1.5 text-xs text-slate-200 font-semibold">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>{product.prepTime}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-500 font-medium">Spiciness Level</span>
              <div className="flex items-center gap-1 text-xs text-slate-200 font-semibold">
                {product.spicyLevel && product.spicyLevel > 0 ? (
                  <>
                    <Flame className="w-3.5 h-3.5 fill-orange-400 text-orange-400" />
                    <span>Level {product.spicyLevel}/3</span>
                  </>
                ) : (
                  <span className="text-slate-400">Mild / Non-spicy</span>
                )}
              </div>
            </div>
          </div>

          {/* Hostel Delivery Promise */}
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-1 text-xs text-slate-300">
            <div className="font-bold text-amber-300 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              100% Sealed Factory Pack • Delivered to Your Door
            </div>
            <p className="text-[11px] text-slate-400">
              Dispatched straight from the Ground Floor Allama Pantry in raw, unopened factory-sealed pouches with seasoning sachets inside. Easy to prepare in your room electric kettle in 2–4 minutes. Our runner drops it right at your door in Block A &amp; B!
            </p>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between gap-3 shrink-0">
          <div>
            <div className="text-[11px] text-slate-400">Total Price</div>
            <div className="text-lg font-black text-amber-400">
              ₹{product.price * (quantity > 0 ? quantity : 1)}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!product.inStock ? (
              <button
                disabled
                className="px-5 py-2.5 rounded-xl bg-slate-800 border border-slate-700/60 text-slate-500 font-bold text-sm cursor-not-allowed"
              >
                Currently Sold Out
              </button>
            ) : (
              <>
                {quantity > 0 && (
                  <div className="flex items-center gap-1 bg-slate-900 border border-slate-700 rounded-xl p-1">
                    <button
                      onClick={() => updateQuantity(product.id, quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-800 hover:bg-slate-700 text-white cursor-pointer"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center text-sm font-bold text-white">
                      {quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(product.id, quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                <button
                  onClick={handleAddAndOpenCart}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-extrabold text-sm shadow-lg shadow-amber-500/20 cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
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
