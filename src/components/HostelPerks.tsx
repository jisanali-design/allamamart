import React from 'react';
import { 
  DoorClosed, 
  Zap, 
  ShieldCheck, 
  Clock, 
  Banknote, 
  Sparkles,
  Package
} from 'lucide-react';

export const HostelPerks: React.FC = () => {
  const perks = [
    {
      icon: <DoorClosed className="w-5 h-5 text-emerald-400" />,
      title: 'Free Room Drop',
      desc: 'Delivered directly to your room door in Block A & B (Floors G–5). Absolutely ₹0 delivery fee.',
      badge: '₹0 Delivery',
      color: 'emerald'
    },
    {
      icon: <Zap className="w-5 h-5 text-amber-400" />,
      title: '10–12 Mins Dispatch',
      desc: 'Dedicated hostel corridor runners stationed inside Allama. Fast dispatch while you study or chill.',
      badge: 'Lightning Quick',
      color: 'amber'
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-blue-400" />,
      title: '100% Sealed Packaged Foods',
      desc: 'Factory-sealed Maggi packets, imported Buldak ramen, chips, biscuits and chilled canned beverages.',
      badge: 'Hygienic & Fresh',
      color: 'blue'
    },
    {
      icon: <Banknote className="w-5 h-5 text-purple-400" />,
      title: 'COD & Instant UPI QR',
      desc: 'Pay runner with cash at door or scan UPI QR to transfer directly to Allama Mart (9749528677@ibl).',
      badge: 'Direct to Bank',
      color: 'purple'
    }
  ];

  return (
    <section className="py-10 border-t border-slate-900 bg-slate-950/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-400 text-xs font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Hostel Late-Night Guarantees</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white font-['Outfit']">
            Crafted Exclusively for Allama Hostel
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1.5">
            Operating every night from 10:00 PM to 4:30 AM with zero delivery charges.
          </p>
        </div>

        {/* Perks Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {perks.map((perk, index) => (
            <div 
              key={index}
              className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all space-y-3 group"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center border border-slate-700/80 group-hover:scale-105 transition-transform">
                  {perk.icon}
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700/50">
                  {perk.badge}
                </span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                  {perk.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {perk.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
