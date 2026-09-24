import React, { useState, useMemo } from 'react';
import { InventoryProvider, useInventory } from './context/InventoryContext';
import { CartProvider, useCart } from './context/CartContext';
import { OrderProvider, useOrders } from './context/OrderContext';
import { Category, FoodItem } from './types';
import { Header } from './components/Header';
import { MidnightHero } from './components/MidnightHero';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderTrackerModal } from './components/OrderTrackerModal';
import { OrderHistoryModal } from './components/OrderHistoryModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AdminDashboard } from './components/AdminDashboard';
import { HostelPerks } from './components/HostelPerks';
import { Footer } from './components/Footer';
import { DatabaseSyncErrorBanner } from './components/FirestoreErrorBanner';
import { 
  Flame, 
  Search,
  ShieldCheck,
  DoorClosed,
  Lock,
  ArrowRight,
  Zap
} from 'lucide-react';
import { soundFx } from './utils/sound';

function CustomerShop({
  isAdminLoggedIn,
  onOpenAdminLogin,
  onGoToAdminDashboard,
}: {
  isAdminLoggedIn: boolean;
  onOpenAdminLogin: () => void;
  onGoToAdminDashboard: () => void;
}) {
  const { products } = useInventory();
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [vegOnly, setVegOnly] = useState(false);
  const [spicyOnly, setSpicyOnly] = useState(false);
  const [activeModalProduct, setActiveModalProduct] = useState<FoodItem | null>(null);
  const [orderHistoryOpen, setOrderHistoryOpen] = useState(false);

  const { totalItems, subtotal, setIsCartDrawerOpen } = useCart();

  // Category item counts based on live products inventory
  const categoryCounts = useMemo(() => {
    const counts: Record<Category, number> = {
      all: products.length,
      noodles: 0,
      chips: 0,
      sweets: 0,
      drinks: 0,
      combos: 0,
      'quick-bites': 0,
    };

    products.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });

    return counts;
  }, [products]);

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      // Category filter
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }

      // Veg filter
      if (vegOnly && !item.isVeg) {
        return false;
      }

      // Spicy filter
      if (spicyOnly && (!item.spicyLevel || item.spicyLevel <= 0)) {
        return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesDesc = item.description.toLowerCase().includes(query);
        const matchesTag = item.tag ? item.tag.toLowerCase().includes(query) : false;
        const matchesCat = item.category.toLowerCase().includes(query);
        if (!matchesName && !matchesDesc && !matchesTag && !matchesCat) {
          return false;
        }
      }

      return true;
    });
  }, [products, selectedCategory, searchQuery, vegOnly, spicyOnly]);

  // Quick Cravings / Top Picks (highest-rated hostel midnight bestsellers)
  const topPicks = useMemo(() => {
    const priorityIds = [
      'noodle-maggi-masala',
      'noodle-buldak-2x',
      'drink-redbull',
      'chips-kurkure-munch',
      'sweet-dairy-milk-silk',
      'combo-exam-allnighter',
      'chips-lays-magic',
      'drink-sting'
    ];
    const picked = priorityIds
      .map(id => products.find(p => p.id === id))
      .filter((p): p is FoodItem => Boolean(p && p.inStock));

    if (picked.length >= 4) return picked.slice(0, 6);
    return products.filter(p => p.inStock).slice(0, 6);
  }, [products]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-amber-500/30 selection:text-amber-200">
      
      {/* Top Header */}
      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenOrders={() => setOrderHistoryOpen(true)}
        isAdminLoggedIn={isAdminLoggedIn}
        onOpenAdminDashboard={onGoToAdminDashboard}
        onOpenAdminLogin={onOpenAdminLogin}
      />

      {/* Hero with short punchy headline, subtext, search bar & highlight strip */}
      <MidnightHero
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        categoryCounts={categoryCounts}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 w-full space-y-6">
        
        {/* Immediate Above-The-Fold: Quick Cravings / Top Picks */}
        {!searchQuery && selectedCategory === 'all' && (
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400">
                  <Zap className="w-4 h-4 fill-amber-400" />
                </span>
                <div>
                  <h2 className="text-base sm:text-lg font-black text-white font-['Outfit'] flex items-center gap-2">
                    Quick Cravings / Top Picks
                    <span className="text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Hostel Favorites
                    </span>
                  </h2>
                </div>
              </div>
              <span className="text-xs text-amber-400/90 font-bold hidden sm:inline">
                ⚡ 10-12 Min Room Drop
              </span>
            </div>

            {/* Actual Product Cards visible without scrolling down */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
              {topPicks.map((product) => (
                <ProductCard
                  key={`top-${product.id}`}
                  product={product}
                  onOpenDetails={(p) => setActiveModalProduct(p)}
                />
              ))}
            </div>
          </section>
        )}

        {/* Controls and Secondary Filters Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
          
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Showing:
            </span>
            <span className="text-sm font-extrabold text-white">
              {filteredProducts.length} late-night {filteredProducts.length === 1 ? 'snack' : 'snacks'}
            </span>
            {searchQuery && (
              <span className="text-xs text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                Matching "{searchQuery}"
              </span>
            )}
          </div>

          {/* Quick Dietary and Taste Toggles */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Vegetarian Only */}
            <button
              onClick={() => setVegOnly(!vegOnly)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                vegOnly
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              } border`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Veg Only</span>
            </button>

            {/* Spicy Only */}
            <button
              onClick={() => setSpicyOnly(!spicyOnly)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                spicyOnly
                  ? 'bg-orange-500/20 border-orange-500/50 text-orange-300'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
              } border`}
            >
              <Flame className="w-3.5 h-3.5 text-orange-400" />
              <span>Spicy Craving</span>
            </button>

            {(vegOnly || spicyOnly || searchQuery) && (
              <button
                onClick={() => {
                  setVegOnly(false);
                  setSpicyOnly(false);
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="text-xs text-slate-400 hover:text-amber-400 underline pl-1 cursor-pointer"
              >
                Reset Filters
              </button>
            )}
          </div>

        </div>

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="py-16 text-center space-y-4 rounded-3xl bg-slate-900/40 border border-slate-800/80 p-8">
            <div className="w-16 h-16 rounded-3xl bg-slate-800 flex items-center justify-center text-slate-500 mx-auto">
              <Search className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">No packaged snacks found</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                We couldn't find any snacks matching your filter. Try clearing your search query or exploring our other categories!
              </p>
            </div>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setVegOnly(false);
                setSpicyOnly(false);
              }}
              className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold hover:bg-amber-400 cursor-pointer"
            >
              View All Snacks
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onOpenDetails={(p) => setActiveModalProduct(p)}
              />
            ))}
          </div>
        )}

      </main>

      {/* Hostel Perks & Guarantees Section */}
      <HostelPerks />

      {/* Footer with Discrete Admin Login button */}
      <Footer onOpenAdminLogin={onOpenAdminLogin} />

      {/* Floating Bottom Cart Bar on Mobile when items exist */}
      {totalItems > 0 && (
        <div className="fixed bottom-4 left-4 right-4 z-30 sm:hidden">
          <button
            onClick={() => setIsCartDrawerOpen(true)}
            className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-extrabold text-sm shadow-2xl shadow-amber-500/40 flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-slate-950 text-amber-400 text-xs flex items-center justify-center font-black">
                {totalItems}
              </span>
              <span>View Room Cart</span>
            </div>
            <div className="flex items-center gap-1.5 font-black text-base">
              <span>₹{subtotal}</span>
              <span className="text-xs font-bold text-slate-950/80">• Free Drop</span>
            </div>
          </button>
        </div>
      )}

      {/* Modals & Drawers */}
      <ProductDetailModal
        product={activeModalProduct}
        onClose={() => setActiveModalProduct(null)}
      />

      <CartDrawer />

      <CheckoutModal />

      <OrderTrackerModal />

      <OrderHistoryModal
        isOpen={orderHistoryOpen}
        onClose={() => setOrderHistoryOpen(false)}
      />

    </div>
  );
}

function MainApp() {
  const [viewMode, setViewMode] = useState<'customer' | 'admin'>('customer');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    try {
      return localStorage.getItem('allama_admin_auth') === 'true';
    } catch {
      return false;
    }
  });
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const handleOpenAdminLogin = () => {
    if (isAdminLoggedIn) {
      soundFx.playChime();
      setViewMode('admin');
    } else {
      setIsLoginModalOpen(true);
    }
  };

  const handleAdminLoginSuccess = () => {
    setIsAdminLoggedIn(true);
    try {
      localStorage.setItem('allama_admin_auth', 'true');
    } catch {
      // ignore
    }
    setIsLoginModalOpen(false);
    setViewMode('admin');
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    try {
      localStorage.removeItem('allama_admin_auth');
    } catch {
      // ignore
    }
    setViewMode('customer');
    soundFx.playTap();
  };

  return (
    <>
      <DatabaseSyncErrorBanner />

      {viewMode === 'admin' ? (
        <AdminDashboard
          onBackToStore={() => {
            soundFx.playTap();
            setViewMode('customer');
          }}
          onLogout={handleAdminLogout}
        />
      ) : (
        <CustomerShop
          isAdminLoggedIn={isAdminLoggedIn}
          onOpenAdminLogin={handleOpenAdminLogin}
          onGoToAdminDashboard={() => setViewMode('admin')}
        />
      )}

      {/* Admin Login Modal Protected by 4-digit PIN */}
      <AdminLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={handleAdminLoginSuccess}
      />
    </>
  );
}

export default function App() {
  return (
    <InventoryProvider>
      <OrderProvider>
        <CartProvider>
          <MainApp />
        </CartProvider>
      </OrderProvider>
    </InventoryProvider>
  );
}
