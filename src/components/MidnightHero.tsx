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
  Layers,
  AlertCircle
} from 'lucide-react';
import { Category } from '../types';
import { useStoreStatus } from '../context/StoreStatusContext';

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
  const { isTakingOrders } = useStoreStatus();

  const categories: { id: Category; label: string; icon: React.ReactNode }[] = [
    { id: 'all', label: 'All Items', icon: <Sparkles className="w-3.5 h-3.5" /> },
    { id: 'combos', label: 'Combos', icon: <Flame className="w-3.5 h-3.5 text-amber-500" /> },
    { id: 'noodles', label: 'Noodles & Soups', icon: <Utensils className="w-3.5 h-3.5 text-amber-400" /> },
    { id: 'drinks', label: 'Chilled Drinks', icon: <Zap className="w-3.5 h-3.5 text-amber-300" /> },
    { id: 'chips', label: 'Chips & Savories', icon: <Layers className="w-3.5 h-3.5 text-amber-400" /> },
    { id: 'sweets', label: 'Chocolates', icon: <Cookie className="w-3.5 h-3.5 text-amber-300" /> },
    { id: 'quick-bites', label: 'Biscuits', icon: <Coffee className="w-3.5 h-3.5 text-amber-400" /> },
  ];

  return (
    <section className="relative pt-4 pb-2 border-b border-white/[0.08] bg-gradient-to-b from-[#0f172a] via-[#0b0f19] to-[#0b0f19]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        
        {/* Closed Store Alert Banner */}
        {!isTakingOrders && (
          <div className="p-3 sm:p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-200 text-xs sm:text-sm font-semibold flex items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-2">
              <span className="text-base shrink-0">🔴</span>
              <span>Shop is closed now, Please check later. Allama Mart pantry hub is temporarily paused for new orders.</span>
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 shrink-0">
              Orders Paused
            </span>
          </div>
        )}

        {/* Modern Headline & Subtext */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2.5">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-[#f8fafc] font-['Outfit'] leading-tight">
              Midnight Cravings, Right to Your Room.
            </h1>
            <p className="text-xs sm:text-sm text-[#94a3b8] font-medium mt-1">
              Delivering directly to Block A & B hostel rooms in <strong className="text-amber-400">10–12 mins</strong>.
            </p>
          </div>

          {/* Clean highlight strip */}
          <div className="flex flex-wrap items-center gap-2 pt-1 sm:pt-0">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#1e293b] border border-white/[0.08] text-amber-300 text-xs font-semibold whitespace-nowrap shadow-xs">
              <Zap className="w-3.5 h-3.5 text-[#f59e0b] fill-[#f59e0b]" />
              <span>10-12 Min Drop</span>
            </span>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#1e293b] border border-white/[0.08] text-emerald-400 text-xs font-semibold whitespace-nowrap shadow-xs">
              <DoorClosed className="w-3.5 h-3.5 text-emerald-400" />
              <span>Zero Delivery Fee</span>
            </span>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#1e293b] border border-white/[0.08] text-slate-300 text-xs font-semibold whitespace-nowrap shadow-xs">
              <Banknote className="w-3.5 h-3.5 text-[#f59e0b]" />
              <span>Pay on Delivery</span>
            </span>
          </div>
        </div>

        {/* Clean, Prominent Search Bar */}
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8] pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search 'Maggi', 'Buldak 2x', 'Red Bull', 'Kurkure', 'Combos'..."
            className="w-full bg-[#1e293b] hover:bg-[#1e293b]/90 text-sm text-[#f8fafc] placeholder:text-[#94a3b8] rounded-2xl pl-10 pr-10 py-2.5 border border-white/[0.08] focus:outline-none focus:border-[#f59e0b] focus:ring-1 focus:ring-[#f59e0b]/50 shadow-inner transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#94a3b8] hover:text-[#f8fafc] bg-[#0b0f19] px-2 py-0.5 rounded cursor-pointer"
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
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-[#f59e0b] text-slate-950 shadow-md shadow-amber-500/15'
                    : 'bg-[#1e293b] text-[#94a3b8] hover:text-[#f8fafc] hover:bg-slate-700/60 border border-white/[0.08]'
                }`}
              >
                {cat.icon}
                <span>{cat.label}</span>
                <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono ${
                  isSelected ? 'bg-slate-950/20 text-slate-950 font-black' : 'bg-[#0b0f19] text-[#94a3b8]'
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
