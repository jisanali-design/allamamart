import React from 'react';
import { 
  DoorClosed, 
  Zap, 
  ShieldCheck, 
  Banknote, 
  Sparkles 
} from 'lucide-react';

export const HostelPerks: React.FC = () => {
  const perks = [
    {
      icon: <DoorClosed className="w-5 h-5 text-emerald-400" />,
      title: 'Free Room Drop',
      desc: 'Delivered directly to your room door in Block A & B (Floors G–5). Absolutely ₹0 delivery fee.',
      badge: '₹0 Delivery',
    },
    {
      icon: <Zap className="w-5 h-5 text-[#f59e0b]" />,
      title: '10–12 Mins Dispatch',
      desc: 'Dedicated hostel corridor runners stationed inside Allama. Fast dispatch while you study or chill.',
      badge: 'Speed Dispatch',
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />,
      title: '100% Sealed Packaged Foods',
      desc: 'Factory-sealed Maggi packets, imported Buldak ramen, chips, chocolates and chilled canned drinks.',
      badge: 'Fresh & Sealed',
    },
    {
      icon: <Banknote className="w-5 h-5 text-[#f59e0b]" />,
      title: 'COD & Scan UPI at Door',
      desc: 'Pay cash to runner at your door or scan the UPI QR via GPay, PhonePe, or Paytm upon drop.',
      badge: 'Pay on Drop',
    }
  ];

  return (
    <section className="py-10 border-t border-white/[0.08] bg-[#0b0f19]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1e293b] border border-white/[0.08] text-[#f59e0b] text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Hostel Late-Night Guarantees</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#f8fafc] font-['Outfit']">
            Crafted Exclusively for Allama Hostel
          </h2>
          <p className="text-xs sm:text-sm text-[#94a3b8] mt-1.5">
            Operating every night for Block A & B with zero delivery charges.
          </p>
        </div>

        {/* Perks Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {perks.map((perk, index) => (
            <div 
              key={index}
              className="p-5 rounded-2xl bg-[#1e293b] border border-white/[0.08] hover:border-amber-500/30 transition-all space-y-3 group shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-[#0b0f19] flex items-center justify-center border border-white/[0.08] group-hover:scale-105 transition-transform">
                  {perk.icon}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#0b0f19] text-[#94a3b8] border border-white/[0.06]">
                  {perk.badge}
                </span>
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#f8fafc] group-hover:text-amber-300 transition-colors">
                  {perk.title}
                </h3>
                <p className="text-xs text-[#94a3b8] mt-1 leading-relaxed">
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
