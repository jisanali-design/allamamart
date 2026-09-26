import React from 'react';
import { Plus, Minus, Flame, Clock, Star, ShieldCheck, Ban } from 'lucide-react';
import { FoodItem } from '../types';
import { useCart } from '../context/CartContext';
import { useStoreStatus } from '../context/StoreStatusContext';
import { soundFx } from '../utils/sound';

interface ProductCardProps {
  product: FoodItem;
  onOpenDetails: (product: FoodItem) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onOpenDetails }) => {
  const { getItemQuantity, addToCart, updateQuantity } = useCart();
  const { isTakingOrders } = useStoreStatus();
  const quantity = getItemQuantity(product.id);
  const isInStock = product.inStock;

  const handleAddClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isInStock) return;
    if (!isTakingOrders) {
      soundFx.playDoorKnock();
      return;
    }
    soundFx.playPop();
    addToCart(product, 1);
  };

  return (
    <div className={`group relative flex flex-col rounded-2xl bg-[#1e293b] border ${
      isInStock 
        ? 'border-white/[0.08] hover:border-amber-500/35 hover:shadow-xl hover:shadow-black/50' 
        : 'border-white/[0.04] opacity-75'
    } overflow-hidden transition-all duration-200`}>
      
      {/* Image container */}
      <div 
        onClick={() => onOpenDetails(product)}
        className="relative aspect-4/3 w-full bg-[#0b0f19] overflow-hidden cursor-pointer"
      >
        <img 
          src={product.image} 
          alt={product.name}
          referrerPolicy="no-referrer"
          className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${
            !isInStock ? 'grayscale-40 contrast-75 brightness-75' : ''
          }`}
          loading="lazy"
        />
        
        {/* Dark subtle overlay for legibility in dim lighting */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0f19]/80 via-transparent to-black/20" />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 items-center">
          {/* Veg / Non-Veg Indicator */}
          <div className="bg-[#0b0f19]/85 backdrop-blur-xs p-1 rounded-md border border-white/[0.08] flex items-center justify-center">
            <span className={`w-3.5 h-3.5 rounded-xs border flex items-center justify-center ${
              product.isVeg ? 'border-emerald-500' : 'border-rose-500'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${
                product.isVeg ? 'bg-emerald-500' : 'bg-rose-500'
              }`} />
            </span>
          </div>

          {/* Tag or Out of stock badge */}
          {isInStock ? (
            product.tag && (
              <span className="px-2 py-0.5 rounded-md bg-[#f59e0b] text-slate-950 text-[10px] font-black tracking-wide shadow-xs">
                {product.tag}
              </span>
            )
          ) : (
            <span className="px-2 py-0.5 rounded-md bg-rose-600 text-white text-[10px] font-black tracking-wider uppercase flex items-center gap-1 shadow-xs">
              <Ban className="w-2.5 h-2.5" />
              Sold Out Tonight
            </span>
          )}
        </div>

        {/* Out of Stock Centered Overlay Banner */}
        {!isInStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#0b0f19]/60 backdrop-blur-[2px]">
            <span className="px-3 py-1 rounded-xl bg-rose-600/90 text-white text-xs font-black tracking-wide uppercase shadow-lg border border-rose-400/30">
              Sold Out Tonight
            </span>
          </div>
        )}

        {/* Bottom image stats */}
        <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-[11px] text-[#94a3b8]">
          <span className="flex items-center gap-1 bg-[#0b0f19]/85 backdrop-blur-xs px-2 py-0.5 rounded-md border border-white/[0.08] text-slate-300">
            <Clock className="w-3 h-3 text-[#f59e0b]" />
            <span>{product.prepTime}</span>
          </span>

          <span className="flex items-center gap-1 bg-[#0b0f19]/85 backdrop-blur-xs px-2 py-0.5 rounded-md border border-white/[0.08] text-amber-300 font-semibold">
            <Star className="w-3 h-3 fill-[#f59e0b] text-[#f59e0b]" />
            <span>{product.rating}</span>
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Weight & Spicy info */}
          <div className="flex items-center justify-between text-[11px] text-[#94a3b8] mb-1">
            <span>{product.weight}</span>
            {product.spicyLevel && product.spicyLevel > 0 ? (
              <span className="flex items-center gap-0.5 text-amber-500 font-medium">
                {Array.from({ length: product.spicyLevel }).map((_, i) => (
                  <Flame key={i} className="w-3 h-3 fill-amber-500 text-amber-500" />
                ))}
                <span className="text-[10px] ml-0.5">Spicy</span>
              </span>
            ) : null}
          </div>

          {/* Title */}
          <h3 
            onClick={() => onOpenDetails(product)}
            className="text-sm font-bold text-[#f8fafc] group-hover:text-amber-300 transition-colors line-clamp-2 cursor-pointer leading-snug"
          >
            {product.name}
          </h3>

          {/* Description */}
          <p className="mt-1 text-xs text-[#94a3b8] line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Price & Action Row */}
        <div className="pt-2 border-t border-white/[0.08] flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className={`text-base font-extrabold ${isInStock ? 'text-[#f59e0b]' : 'text-[#94a3b8]'}`}>
                ₹{product.price}
              </span>
              {product.originalPrice && (
                <span className="text-xs text-[#94a3b8] line-through">₹{product.originalPrice}</span>
              )}
            </div>
            <span className="text-[10px] text-emerald-400 flex items-center gap-0.5 font-medium">
              <ShieldCheck className="w-2.5 h-2.5 text-emerald-400" />
              {isInStock ? 'Sealed • Free Drop' : 'Unavailable'}
            </span>
          </div>

          {/* Add or Counter Button */}
          {!isInStock ? (
            <button
              disabled
              className="px-3 py-1.5 rounded-xl bg-slate-800/80 border border-white/[0.05] text-[#94a3b8] text-xs font-bold cursor-not-allowed"
            >
              Sold Out Tonight
            </button>
          ) : !isTakingOrders ? (
            <button
              onClick={handleAddClick}
              className="px-3 py-1.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-bold cursor-not-allowed"
              title="Shop is closed now, Please check later"
            >
              Closed
            </button>
          ) : quantity === 0 ? (
            <button
              onClick={handleAddClick}
              className="flex items-center justify-center gap-1 px-3.5 py-1.5 rounded-xl bg-[#f59e0b] hover:bg-amber-400 text-slate-950 text-xs font-black transition-all transform active:scale-95 shadow-sm shadow-amber-500/15 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>ADD</span>
            </button>
          ) : (
            <div className="flex items-center gap-1 bg-[#0b0f19] border border-amber-500/35 rounded-xl p-0.5 text-amber-300">
              <button
                onClick={() => {
                  soundFx.playPop();
                  updateQuantity(product.id, quantity - 1);
                }}
                className="w-6 h-6 flex items-center justify-center rounded-lg bg-[#1e293b] hover:bg-slate-700 text-[#f59e0b] text-xs font-bold transition-colors cursor-pointer"
                aria-label="Decrease quantity"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="w-5 text-center text-xs font-black text-[#f8fafc]">
                {quantity}
              </span>
              <button
                onClick={() => {
                  soundFx.playPop();
                  updateQuantity(product.id, quantity + 1);
                }}
                className="w-6 h-6 flex items-center justify-center rounded-lg bg-[#f59e0b] hover:bg-amber-400 text-slate-950 text-xs font-bold transition-colors cursor-pointer"
                aria-label="Increase quantity"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
