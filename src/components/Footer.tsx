import React from 'react';
import { Moon, DoorClosed, Lock, Clock, ShieldCheck } from 'lucide-react';

interface FooterProps {
  onOpenAdminLogin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAdminLogin }) => {
  return (
    <footer className="border-t border-white/[0.08] bg-[#0b0f19] text-[#94a3b8] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Clean, Minimal Top Row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-white/[0.06]">
          
          {/* Logo & Service Badge */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#f59e0b] flex items-center justify-center text-slate-950 font-bold shadow-md shadow-amber-500/10">
              <Moon className="w-4 h-4 fill-slate-950 text-slate-950" />
            </div>
            <span className="text-base font-extrabold text-[#f8fafc] tracking-tight font-['Outfit']">
              Allama <span className="text-[#f59e0b]">Mart™</span>
            </span>
            <span className="text-xs text-[#94a3b8] hidden md:inline">
              • Allama Hostel Late-Night Cravings
            </span>
          </div>

          {/* Minimal info pills & discreet admin link */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#1e293b] border border-white/[0.08] text-[#f8fafc]">
              <DoorClosed className="w-3.5 h-3.5 text-[#f59e0b]" />
              <span>Block A & B (Floors G–5)</span>
            </span>

            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>₹0 Room Drop</span>
            </span>

            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#1e293b] border border-white/[0.08] text-[#94a3b8]">
              <Clock className="w-3.5 h-3.5 text-[#f59e0b]" />
              <span>Late-Night Hub</span>
            </span>

            {/* Discrete Admin Login Button */}
            <button
              onClick={onOpenAdminLogin}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#1e293b] hover:bg-slate-700 text-[#94a3b8] hover:text-[#f8fafc] border border-white/[0.08] transition-colors cursor-pointer text-xs ml-1"
              title="Delivery Runner & Pantry Admin Portal"
            >
              <Lock className="w-3 h-3 text-[#f59e0b]" />
              <span>Admin Login</span>
            </button>
          </div>
        </div>

        {/* Clean Minimal Legal Notice Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#94a3b8]">
          <p className="font-medium text-[#94a3b8] text-center sm:text-left">
            © 2026 Allama Mart™. Sealed packaged foods delivered to your room.
          </p>
          <div className="flex items-center gap-4 text-[11px] text-[#94a3b8]">
            <span>100% Sealed Items</span>
            <span className="inline-block w-1 h-1 rounded-full bg-slate-700"></span>
            <span>Pay on Delivery (COD & UPI)</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
