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
import { useStoreStatus } from '../context/StoreStatusContext';
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
  isAdminLoggedIn,
  onOpenAdminDashboard
}) => {
  const { totalItems, subtotal, setIsCartDrawerOpen } = useCart();
  const { activeCustomerOrder, setActiveTrackingOrder } = useOrders();
  const { isTakingOrders } = useStoreStatus();
  const [soundEnabled, setSoundEnabled] = useState(true);

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundFx.enabled = next;
    if (next) soundFx.playPop();
  };

  const handleActiveOrderClick = () => {
    if (activeCustomerOrder) {
      soundFx.playPop();
      setActiveTrackingOrder(activeCustomerOrder);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0b0f19]/95 backdrop-blur-md border-b border-white/[0.08]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between min-h-[4rem] sm:min-h-[4.25rem] py-1.5 sm:py-2 gap-2 sm:gap-4">
          
          {/* Logo & Operating Status Below Heading */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <div className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#f59e0b] shadow-md shadow-amber-500/15 text-slate-950 font-bold shrink-0">
              <Moon className="w-5 h-5 fill-slate-950 text-slate-950" />
            </div>

            <div className="flex flex-col justify-center">
              <span className="text-base sm:text-lg font-black tracking-tight text-[#f8fafc] font-['Outfit'] select-none whitespace-nowrap leading-tight">
                Allama&nbsp;<span className="text-[#f59e0b]">Mart™</span>
              </span>

              {/* Status placed directly below Allama Mart heading */}
              <div className="mt-0.5 flex items-center">
                {isTakingOrders ? (
                  <span className="inline-flex items-center text-[10px] sm:text-[11px] font-semibold text-emerald-400 select-none whitespace-nowrap leading-none">
                    🟢 Taking orders now
                  </span>
                ) : (
                  <span className="inline-flex items-center text-[10px] sm:text-[11px] font-semibold text-rose-400 select-none whitespace-nowrap leading-none">
                    🔴 Shop is closed now, Please check later
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right Action buttons */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            
            {/* Sound Effects Toggle */}
            <button
              onClick={toggleSound}
              title={soundEnabled ? "Mute sound cues" : "Unmute sound cues"}
              className="p-2 rounded-xl text-[#94a3b8] hover:text-[#f8fafc] hover:bg-[#1e293b] border border-white/[0.08] transition-colors cursor-pointer"
              aria-label="Toggle sound"
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-[#f59e0b]" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-500" />
              )}
            </button>

            {/* Admin Board Button (if logged in) */}
            {isAdminLoggedIn && onOpenAdminDashboard && (
              <button
                onClick={onOpenAdminDashboard}
                className="hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#1e293b] border border-white/[0.08] text-[#f8fafc] hover:border-amber-500/40 text-xs font-bold transition-all cursor-pointer"
                title="Switch to Delivery & Pantry Admin Dashboard"
              >
                <ShieldCheck className="w-4 h-4 text-[#f59e0b]" />
                <span>Admin Portal</span>
              </button>
            )}

            {/* Customer's Own Active Order Tracker Button */}
            {activeCustomerOrder && (
              <button
                onClick={handleActiveOrderClick}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  activeCustomerOrder.status !== 'Delivered'
                    ? 'bg-[#1e293b] border-amber-500/40 text-amber-300 hover:bg-slate-800'
                    : 'bg-[#1e293b] border-emerald-500/40 text-emerald-300 hover:bg-slate-800'
                }`}
                title={`Track your order: Room #${activeCustomerOrder.address.roomNumber}`}
              >
                <Clock className="w-3.5 h-3.5 text-[#f59e0b]" />
                <span className="hidden sm:inline">
                  {activeCustomerOrder.status === 'Delivered' 
                    ? 'Delivered' 
                    : `Track Order (${activeCustomerOrder.status})`}
                </span>
                <span className="sm:hidden font-mono">
                  {activeCustomerOrder.status === 'Delivered' ? 'Done' : 'Track'}
                </span>
              </button>
            )}

            {/* Prominent Cart Button with Count Badge */}
            <button
              id="cart-drawer-toggle"
              onClick={() => {
                soundFx.playPop();
                setIsCartDrawerOpen(true);
              }}
              className="relative flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl bg-[#f59e0b] hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm shadow-md shadow-amber-500/15 transition-all transform active:scale-95 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4 text-slate-950 stroke-[2.5]" />
              <span className="hidden xs:inline">Cart</span>
              
              {totalItems > 0 ? (
                <div className="flex items-center gap-1.5 ml-0.5">
                  <span className="w-5 h-5 flex items-center justify-center text-[11px] font-black bg-slate-950 text-[#f59e0b] rounded-full">
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
