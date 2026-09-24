import React, { useState } from 'react';
import { 
  Moon, 
  ShoppingBag, 
  Clock, 
  Volume2, 
  VolumeX, 
  ShieldCheck
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useOrders } from '../context/OrderContext';
import { soundFx } from '../utils/sound';

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onOpenOrders: () => void;
  isAdminLoggedIn?: boolean;
  onOpenAdminDashboard?: () => void;
  onOpenAdminLogin?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  onOpenOrders,
  isAdminLoggedIn,
  onOpenAdminDashboard
}) => {
  const { totalItems, subtotal, setIsCartDrawerOpen } = useCart();
  const { orders, setActiveTrackingOrder } = useOrders();
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Active in-flight orders that are not delivered yet
  const activeOrders = orders.filter(o => o.status !== 'Delivered');

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundFx.enabled = next;
    if (next) soundFx.playPop();
  };

  const handleActiveOrderClick = () => {
    if (activeOrders.length > 0) {
      setActiveTrackingOrder(activeOrders[0]);
    } else if (orders.length > 0) {
      setActiveTrackingOrder(orders[0]);
    } else {
      onOpenOrders();
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800/80 pt-3">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Logo */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <div className="relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-md shadow-amber-500/20 text-slate-950 font-bold shrink-0">
              <Moon className="w-5 h-5 fill-slate-950 text-slate-950" />
            </div>

            <span className="text-lg sm:text-2xl font-black tracking-tight text-white font-['Outfit'] select-none whitespace-nowrap">
              Allama&nbsp;<span className="text-amber-400">Mart™</span>
            </span>
          </div>

          {/* Right Action buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Sound Effects Toggle */}
            <button
              onClick={toggleSound}
              title={soundEnabled ? "Mute sound cues" : "Unmute sound cues"}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-slate-800/80 transition-colors cursor-pointer"
              aria-label="Toggle sound"
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-amber-400" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-500" />
              )}
            </button>

            {/* Admin Board Button (if logged in) */}
            {isAdminLoggedIn && onOpenAdminDashboard && (
              <button
                onClick={onOpenAdminDashboard}
                className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 hover:bg-amber-500/25 text-xs font-bold transition-all cursor-pointer"
                title="Switch to Delivery & Pantry Admin Dashboard"
              >
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>Admin Portal</span>
              </button>
            )}

            {/* Orders Tracker / History Button */}
            {orders.length > 0 && (
              <button
                onClick={handleActiveOrderClick}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  activeOrders.length > 0
                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 hover:bg-amber-500/25 animate-pulse'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
                title="Live Tracking & Order History"
              >
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">
                  {activeOrders.length > 0 ? `Tracking (${activeOrders.length})` : 'Orders'}
                </span>
                <span className="sm:hidden font-mono">
                  {activeOrders.length > 0 ? `${activeOrders.length}` : '•'}
                </span>
              </button>
            )}

            {/* Floating / Prominent Cart Button with Count Badge */}
            <button
              id="cart-drawer-toggle"
              onClick={() => {
                soundFx.playPop();
                setIsCartDrawerOpen(true);
              }}
              className="relative flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-500/20 transition-all transform active:scale-95 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4 text-slate-950 stroke-[2.5]" />
              <span className="hidden xs:inline">Cart</span>
              
              {totalItems > 0 ? (
                <div className="flex items-center gap-1.5 ml-0.5">
                  <span className="w-5 h-5 flex items-center justify-center text-[11px] font-black bg-slate-950 text-amber-400 rounded-full shadow-inner">
                    {totalItems}
                  </span>
                  <span className="font-extrabold text-xs hidden sm:inline text-slate-950">
                    ₹{subtotal}
                  </span>
                </div>
              ) : (
                <span className="w-5 h-5 flex items-center justify-center text-[10px] font-bold bg-slate-950/20 text-slate-950 rounded-full">
                  0
                </span>
              )}
            </button>

          </div>
        </div>
      </div>
    </header>
  );
};
