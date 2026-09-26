import React, { useState, useMemo } from 'react';
import { InventoryProvider, useInventory } from './context/InventoryContext';
import { CartProvider, useCart } from './context/CartContext';
import { OrderProvider } from './context/OrderContext';
import { StoreStatusProvider, useStoreStatus } from './context/StoreStatusContext';
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
import { useOrders } from './context/OrderContext';
import { 
  Flame, 
  Search,
  ArrowRight,
  Zap,
  CheckCircle2,
  Clock,
  Truck,
  DoorClosed
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
  const { isTakingOrders } = useStoreStatus();
  const { activeCustomerOrder, setActiveTrackingOrder, clearActiveOrder } = useOrders();
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
    <div className="min-h-screen flex flex-col bg-[#0b0f19] text-[#f8fafc] selection:bg-amber-500/30 selection:text-amber-200">
      
      {/* Top Header with subtle operating status pill */}
      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenOrders={() => setOrderHistoryOpen(true)}
        isAdminLoggedIn={isAdminLoggedIn}
        onOpenAdminDashboard={onGoToAdminDashboard}
        onOpenAdminLogin={onOpenAdminLogin}
      />

      {/* Hero with headline, subtext, search bar & highlight strip */}
      <MidnightHero
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        categoryCounts={categoryCounts}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 w-full space-y-6">
        
        {/* Customer Active Order Tracking Card (Only displayed for customer's own active order) */}
        {activeCustomerOrder && (
          <section className="p-4 sm:p-5 rounded-3xl bg-[#1e293b] border border-amber-500/30 shadow-xl space-y-3.5 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/[0.08]">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                  activeCustomerOrder.status === 'Delivered'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : activeCustomerOrder.status === 'Out for Delivery'
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                    : 'bg-amber-500/20 text-[#f59e0b] border border-amber-500/30'
                }`}>
                  {activeCustomerOrder.status === 'Delivered' ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : activeCustomerOrder.status === 'Out for Delivery' ? (
                    <Truck className="w-5 h-5 animate-bounce" />
                  ) : (
                    <Clock className="w-5 h-5 animate-pulse" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase font-black tracking-wider text-[#94a3b8]">
                      Your Active Order
                    </span>
                    <span className="text-xs font-mono font-bold text-[#f59e0b] bg-[#0b0f19] px-2 py-0.5 rounded border border-white/[0.08]">
                      #{activeCustomerOrder.orderNumber}
                    </span>
                  </div>
                  <h3 className="text-sm sm:text-base font-extrabold text-[#f8fafc] font-['Outfit'] mt-0.5">
                    {activeCustomerOrder.status === 'Delivered'
                      ? 'Delivered to Your Room Door'
                      : activeCustomerOrder.status === 'Out for Delivery'
                      ? 'Runner Out for Room Delivery'
                      : 'Prepping at Allama Pantry Hub'}
                  </h3>
                </div>
              </div>

              {/* Status badge & Dismiss Button */}
              <div className="flex flex-wrap items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-bold border inline-flex items-center gap-1.5 ${
                  activeCustomerOrder.status === 'Delivered'
                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                    : activeCustomerOrder.status === 'Out for Delivery'
                    ? 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                    : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${
                    activeCustomerOrder.status === 'Delivered' 
                      ? 'bg-emerald-400' 
                      : activeCustomerOrder.status === 'Out for Delivery'
                      ? 'bg-blue-400 animate-ping'
                      : 'bg-amber-400 animate-ping'
                  }`} />
                  <span>{activeCustomerOrder.status}</span>
                </span>

                {activeCustomerOrder.status === 'Delivered' && (
                  <button
                    onClick={clearActiveOrder}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-all active:scale-95 shadow-md shadow-emerald-500/20 cursor-pointer"
                  >
                    Dismiss / Order Again
                  </button>
                )}
              </div>
            </div>

            {/* Room delivery details & Handover PIN */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-[#0b0f19] border border-white/[0.08]">
                <div className="text-[11px] text-[#94a3b8]">Room Destination</div>
                <div className="font-bold text-[#f8fafc] mt-0.5">
                  {activeCustomerOrder.address.block}, {activeCustomerOrder.address.floor} • Room {activeCustomerOrder.address.roomNumber}
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-[#0b0f19] border border-white/[0.08]">
                <div className="text-[11px] text-[#94a3b8]">Room Handover PIN</div>
                <div className="font-mono text-base font-black text-[#f59e0b] mt-0.5">
                  {activeCustomerOrder.deliveryCode}
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-[#0b0f19] border border-white/[0.08]">
                <div className="text-[11px] text-[#94a3b8]">Items & Total</div>
                <div className="font-bold text-[#f8fafc] mt-0.5 truncate">
                  {activeCustomerOrder.items.length} {activeCustomerOrder.items.length === 1 ? 'item' : 'items'} • <span className="text-[#f59e0b]">₹{activeCustomerOrder.totalAmount}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-[#94a3b8] flex items-center gap-1.5">
                <DoorClosed className="w-3.5 h-3.5 text-emerald-400" />
                <span>Runner: <strong className="text-slate-200">{activeCustomerOrder.runner.name}</strong></span>
              </span>

              <button
                onClick={() => {
                  soundFx.playPop();
                  setActiveTrackingOrder(activeCustomerOrder);
                }}
                className="text-xs font-bold text-[#f59e0b] hover:text-amber-300 flex items-center gap-1 hover:underline cursor-pointer"
              >
                <span>Live Tracker & Delivery Notes</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </section>
        )}

        {/* Immediate Above-The-Fold: Quick Cravings / Top Picks */}
        {!searchQuery && selectedCategory === 'all' && (
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-[#1e293b] border border-white/[0.08] text-[#f59e0b]">
                  <Zap className="w-4 h-4 fill-[#f59e0b]" />
                </span>
                <div>
                  <h2 className="text-base sm:text-lg font-black text-[#f8fafc] font-['Outfit'] flex items-center gap-2">
                    Quick Cravings / Top Picks
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#1e293b] text-[#f59e0b] border border-white/[0.08]">
                      Hostel Favorites
                    </span>
                  </h2>
                </div>
              </div>
              <span className="text-xs text-amber-400 font-semibold hidden sm:inline">
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
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[#1e293b] border border-white/[0.08]">
          
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#94a3b8]">
              Showing:
            </span>
            <span className="text-sm font-extrabold text-[#f8fafc]">
              {filteredProducts.length} late-night {filteredProducts.length === 1 ? 'snack' : 'snacks'}
            </span>
            {searchQuery && (
              <span className="text-xs text-[#f59e0b] bg-[#0b0f19] px-2 py-0.5 rounded border border-white/[0.08]">
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
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                  : 'bg-[#0b0f19] border-white/[0.08] text-[#94a3b8] hover:text-[#f8fafc]'
              } border`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Veg Only</span>
            </button>

            {/* Spicy Only */}
            <button
              onClick={() => setSpicyOnly(!spicyOnly)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                spicyOnly
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                  : 'bg-[#0b0f19] border-white/[0.08] text-[#94a3b8] hover:text-[#f8fafc]'
              } border`}
            >
              <Flame className="w-3.5 h-3.5 text-amber-500" />
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
                className="text-xs text-[#94a3b8] hover:text-amber-400 underline pl-1 cursor-pointer"
              >
                Reset Filters
              </button>
            )}
          </div>

        </div>

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="py-16 text-center space-y-4 rounded-3xl bg-[#1e293b]/50 border border-white/[0.08] p-8">
            <div className="w-16 h-16 rounded-3xl bg-[#0b0f19] flex items-center justify-center text-[#94a3b8] mx-auto border border-white/[0.08]">
              <Search className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#f8fafc]">No packaged snacks found</h3>
              <p className="text-xs text-[#94a3b8] max-w-sm mx-auto mt-1">
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
              className="px-4 py-2 rounded-xl bg-[#f59e0b] text-slate-950 text-xs font-black hover:bg-amber-400 cursor-pointer shadow-md"
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

      {/* Requirement 2: Sticky Floating Cart Bar:
          When cart item count > 0, show a sleek floating bar at the bottom:
          "[X] Items • ₹[Total] | View Cart →" with a green tag showing free delivery status. */}
      {totalItems > 0 && (
        <div className="fixed bottom-5 inset-x-4 max-w-lg mx-auto z-40 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div className="bg-[#1e293b] border border-white/[0.08] shadow-2xl shadow-black/80 rounded-2xl p-2.5 sm:p-3 flex items-center justify-between gap-3 backdrop-blur-md">
            
            {/* Left: [X] Items • ₹[Total] and green tag showing free delivery status */}
            <div className="flex items-center gap-2 sm:gap-3 pl-1.5 min-w-0">
              <div className="flex items-baseline gap-1.5 text-xs sm:text-sm font-bold text-[#f8fafc] whitespace-nowrap">
                <span>{totalItems} {totalItems === 1 ? 'Item' : 'Items'}</span>
                <span className="text-[#94a3b8] font-normal">•</span>
                <span className="text-[#f59e0b] font-black text-sm sm:text-base font-mono">₹{subtotal}</span>
              </div>

              {/* Green tag showing free delivery status */}
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold inline-flex items-center gap-1 shrink-0 whitespace-nowrap">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Free Delivery</span>
              </span>
            </div>

            {/* Right: View Cart → */}
            <button
              onClick={() => {
                soundFx.playPop();
                setIsCartDrawerOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-[#f59e0b] hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-md shadow-amber-500/15 transition-all transform active:scale-95 cursor-pointer shrink-0"
            >
              <span>View Cart</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>
      )}

      {/* Modals & Drawers */}
      <ProductDetailModal
        product={activeModalProduct ? (products.find((p) => p.id === activeModalProduct.id) || activeModalProduct) : null}
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
  const { setIsAdminMode } = useOrders();
  const [viewMode, setViewMode] = useState<'customer' | 'admin'>('customer');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    try {
      return localStorage.getItem('allama_admin_auth') === 'true';
    } catch {
      return false;
    }
  });
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Sync admin mode in OrderContext
  React.useEffect(() => {
    setIsAdminMode(isAdminLoggedIn);
  }, [isAdminLoggedIn, setIsAdminMode]);

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
    setIsAdminMode(true);
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
    setIsAdminMode(false);
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
      <StoreStatusProvider>
        <OrderProvider>
          <CartProvider>
            <MainApp />
          </CartProvider>
        </OrderProvider>
      </StoreStatusProvider>
    </InventoryProvider>
  );
}
