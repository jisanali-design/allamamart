import React from 'react';
import { Plus, Minus, Flame, Clock, Star, ShieldCheck, Ban } from 'lucide-react';
import { FoodItem } from '../types';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: FoodItem;
  onOpenDetails: (product: FoodItem) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onOpenDetails }) => {
  const { getItemQuantity, addToCart, updateQuantity } = useCart();
  const quantity = getItemQuantity(product.id);
  const isInStock = product.inStock;

  return (
    <div className={`group relative flex flex-col rounded-2xl bg-slate-900/90 border ${
      isInStock ? 'border-slate-800/90 hover:border-amber-500/40 hover:shadow-xl hover:shadow-amber-500/5' : 'border-slate-800/50 opacity-80'
    } overflow-hidden transition-all duration-200`}>
      
      {/* Image container */}
      <div 
        onClick={() => onOpenDetails(product)}
        className="relative aspect-4/3 w-full bg-slate-950 overflow-hidden cursor-pointer"
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
        
        {/* Dark subtle overlay for legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20" />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 items-center">
          {/* Veg / Non-Veg Dot */}
          <div className="bg-slate-950/80 backdrop-blur-xs p-1 rounded-md border border-slate-800 flex items-center justify-center">
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
              <span className="px-2 py-0.5 rounded-md bg-amber-500/90 text-slate-950 text-[10px] font-black tracking-wide shadow-sm">
                {product.tag}
              </span>
            )
          ) : (
            <span className="px-2 py-0.5 rounded-md bg-rose-600 text-white text-[10px] font-black tracking-wider uppercase flex items-center gap-1 shadow-sm">
              <Ban className="w-2.5 h-2.5" />
              Sold Out
            </span>
          )}
        </div>

        {/* Out of Stock Centered Overlay Banner */}
        {!isInStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-950/60 backdrop-blur-[2px]">
            <span className="px-3 py-1 rounded-xl bg-rose-500/90 text-white text-xs font-black tracking-wide uppercase shadow-lg border border-rose-400/40">
              Out of Stock
            </span>
          </div>
        )}

        {/* Bottom image stats */}
        <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-[11px] text-slate-300">
          <span className="flex items-center gap-1 bg-slate-950/85 backdrop-blur-xs px-2 py-0.5 rounded-md border border-slate-800">
            <Clock className="w-3 h-3 text-amber-400" />
            <span>{product.prepTime}</span>
          </span>

          <span className="flex items-center gap-1 bg-slate-950/85 backdrop-blur-xs px-2 py-0.5 rounded-md border border-slate-800 text-amber-300 font-semibold">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span>{product.rating}</span>
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Weight & Spicy info */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
            <span>{product.weight}</span>
            {product.spicyLevel && product.spicyLevel > 0 ? (
              <span className="flex items-center gap-0.5 text-orange-400">
                {Array.from({ length: product.spicyLevel }).map((_, i) => (
                  <Flame key={i} className="w-3 h-3 fill-orange-400" />
                ))}
                <span className="text-[10px] ml-0.5 font-medium">Spicy</span>
              </span>
            ) : null}
          </div>

          {/* Title */}
          <h3 
            onClick={() => onOpenDetails(product)}
            className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-2 cursor-pointer"
          >
            {product.name}
          </h3>

          {/* Description */}
          <p className="mt-1 text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Price & Action Row */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className={`text-base font-extrabold ${isInStock ? 'text-amber-400' : 'text-slate-500'}`}>
                ₹{product.price}
              </span>
              {product.originalPrice && (
                <span className="text-xs text-slate-500 line-through">₹{product.originalPrice}</span>
              )}
            </div>
            <span className="text-[10px] text-emerald-400 flex items-center gap-0.5 font-medium">
              <ShieldCheck className="w-2.5 h-2.5" />
              {isInStock ? 'Sealed • Free Drop' : 'Currently Unavailable'}
            </span>
          </div>

          {/* Add or Counter Button */}
          {!isInStock ? (
            <button
              disabled
              className="px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/50 text-slate-500 text-xs font-bold cursor-not-allowed"
            >
              Sold Out
            </button>
          ) : quantity === 0 ? (
            <button
              onClick={() => addToCart(product, 1)}
              className="flex items-center justify-center gap-1 px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition-all transform active:scale-95 shadow-sm shadow-amber-500/20 cursor-pointer border border-amber-400/40"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>ADD</span>
            </button>
          ) : (
            <div className="flex items-center gap-1 bg-amber-500/15 border border-amber-500/40 rounded-xl p-0.5 text-amber-300">
              <button
                onClick={() => updateQuantity(product.id, quantity - 1)}
                className="w-6 h-6 flex items-center justify-center rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-400 text-xs font-bold transition-colors cursor-pointer"
                aria-label="Decrease quantity"
              >
                <Minus className="w-3 h-3" />
              </button>
              <span className="w-5 text-center text-xs font-black text-white">
                {quantity}
              </span>
              <button
                onClick={() => updateQuantity(product.id, quantity + 1)}
                className="w-6 h-6 flex items-center justify-center rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-colors cursor-pointer"
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
