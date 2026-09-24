import React from 'react';
import { 
  Zap, 
  DoorClosed, 
  Banknote, 
  Search,
  Sparkles,
  Flame,
  Utensils,
  Coffee,
  Cookie,
  Layers
} from 'lucide-react';
import { Category } from '../types';

interface MidnightHeroProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: Category;
  setSelectedCategory: (cat: Category) => void;
  categoryCounts: Record<Category, number>;
}

export const MidnightHero: React.FC<MidnightHeroProps> = ({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  categoryCounts
}) => {
  const categories: { id: Category; label: string; icon: React.ReactNode }[] = [
    { id: 'all', label: 'All Items', icon: <Sparkles className="w-3.5 h-3.5" /> },
    { id: 'combos', label: 'Combos', icon: <Flame className="w-3.5 h-3.5 text-orange-400" /> },
    { id: 'noodles', label: 'Noodles & Soups', icon: <Utensils className="w-3.5 h-3.5 text-amber-400" /> },
    { id: 'drinks', label: 'Chilled Drinks', icon: <Zap className="w-3.5 h-3.5 text-cyan-400" /> },
    { id: 'chips', label: 'Chips & Savories', icon: <Layers className="w-3.5 h-3.5 text-yellow-400" /> },
    { id: 'sweets', label: 'Chocolates', icon: <Cookie className="w-3.5 h-3.5 text-pink-400" /> },
    { id: 'quick-bites', label: 'Biscuits', icon: <Coffee className="w-3.5 h-3.5 text-amber-300" /> },
  ];

  return (
    <section className="relative pt-4 pb-2 border-b border-slate-900/60 bg-gradient-to-b from-slate-900/50 via-slate-950 to-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3.5">
        
        {/* Modern Headline & Subtext */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white font-['Outfit'] leading-tight">
              Midnight Cravings, Right to Your Room.
            </h1>
            <p className="text-xs sm:text-sm text-amber-300/90 font-semibold mt-0.5">
              Delivering to Block A & B in 10–12 mins.
            </p>
          </div>

          {/* Single-line horizontal highlight strip */}
          <div className="flex flex-wrap items-center gap-2 pt-1 sm:pt-0">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs font-bold whitespace-nowrap shadow-xs">
              <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>⚡ 10-12 Min Drop</span>
            </span>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-bold whitespace-nowrap shadow-xs">
              <DoorClosed className="w-3.5 h-3.5 text-emerald-400" />
              <span>🚪 Zero Delivery Fee</span>
            </span>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-500/10 border border-blue-500/25 text-blue-300 text-xs font-bold whitespace-nowrap shadow-xs">
              <Banknote className="w-3.5 h-3.5 text-blue-400" />
              <span>📲 UPI / Cash on Delivery</span>
            </span>
          </div>
        </div>

        {/* Zepto/Blinkit-style Prominent Search Bar */}
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search 'Maggi', 'Buldak 2x', 'Red Bull', 'Kurkure', 'Combos'..."
            className="w-full bg-slate-900/90 hover:bg-slate-900 text-sm text-slate-100 placeholder:text-slate-500 rounded-2xl pl-10 pr-10 py-2.5 border border-slate-800 focus:outline-none focus:border-amber-500/70 focus:ring-2 focus:ring-amber-500/20 shadow-inner transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-white bg-slate-800 px-1.5 py-0.5 rounded cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        {/* Category Filter Chips Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            const count = categoryCounts[cat.id] || 0;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800/90'
                }`}
              >
                {cat.icon}
                <span>{cat.label}</span>
                <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono ${
                  isSelected ? 'bg-slate-950/20 text-slate-950 font-black' : 'bg-slate-800 text-slate-400'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

      </div>
    </section>
  );
};
