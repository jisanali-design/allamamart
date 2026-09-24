import React, { useState, useEffect } from 'react';
import { 
  X, 
  CheckCircle2, 
  Clock, 
  DoorClosed, 
  MessageSquare, 
  Send, 
  Truck, 
  ShieldCheck, 
  ExternalLink,
  Copy,
  Package,
  Check
} from 'lucide-react';
import { useOrders } from '../context/OrderContext';
import { OrderStatus } from '../types';
import { soundFx } from '../utils/sound';
import { getWhatsAppOrderUrl, PANTRY_WHATSAPP_NUMBER } from '../utils/whatsapp';

export const OrderTrackerModal: React.FC = () => {
  const { activeTrackingOrder, setActiveTrackingOrder } = useOrders();

  const [chatMessage, setChatMessage] = useState('');
  const [messagesList, setMessagesList] = useState<{ sender: 'user' | 'runner'; text: string; time: string }[]>([]);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);

  useEffect(() => {
    if (!activeTrackingOrder) return;

    setMessagesList([
      {
        sender: 'runner',
        text: `Order #${activeTrackingOrder.orderNumber} is assigned for delivery to ${activeTrackingOrder.address.block}, Room #${activeTrackingOrder.address.roomNumber}. You can leave any corridor delivery notes here!`,
        time: 'Just now'
      }
    ]);

    // Handle Escape key to close modal back to catalog
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        soundFx.playTap();
        setActiveTrackingOrder(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTrackingOrder?.id]);

  if (!activeTrackingOrder) return null;

  const handleClose = () => {
    soundFx.playTap();
    setActiveTrackingOrder(null);
  };

  const statuses: { status: OrderStatus; label: string; desc: string; icon: React.ReactNode }[] = [
    { 
      status: 'Pending', 
      label: 'Order Confirmed (Pending)', 
      desc: 'Received at Allama Pantry Hub, packed & verified',
      icon: <Package className="w-4 h-4" /> 
    },
    { 
      status: 'Out for Delivery', 
      label: 'Out for Delivery', 
      desc: `Runner is on the way to ${activeTrackingOrder.address.block} Floor ${activeTrackingOrder.address.floor}`,
      icon: <Truck className="w-4 h-4" /> 
    },
    { 
      status: 'Delivered', 
      label: 'Delivered to Room Door', 
      desc: `Successfully delivered to Room #${activeTrackingOrder.address.roomNumber}`,
      icon: <CheckCircle2 className="w-4 h-4" /> 
    },
  ];

  const currentStatusIndex = statuses.findIndex(s => s.status === activeTrackingOrder.status);

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(activeTrackingOrder.deliveryCode);
    setCopiedCode(true);
    soundFx.playPop();
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleOpenWhatsAppSummary = () => {
    const url = getWhatsAppOrderUrl(activeTrackingOrder, PANTRY_WHATSAPP_NUMBER);
    window.open(url, '_blank');
  };

  const handleSendMessage = (textToSend?: string) => {
    const msg = textToSend || chatMessage;
    if (!msg.trim()) return;

    const userTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessagesList(prev => [
      ...prev,
      { sender: 'user', text: msg.trim(), time: userTime }
    ]);
    setChatMessage('');
    soundFx.playPop();

    // Simulated runner response
    setTimeout(() => {
      let reply = "Got it! Reaching your room door in a few moments.";
      if (msg.toLowerCase().includes('knock') || msg.toLowerCase().includes('sleep')) {
        reply = "Understood! I will knock very softly so your roommate stays asleep.";
      } else if (msg.toLowerCase().includes('whatsapp') || msg.toLowerCase().includes('message')) {
        reply = "Sure, I will ping your WhatsApp as soon as I enter the corridor.";
      }
      setMessagesList(prev => [
        ...prev,
        { sender: 'runner', text: reply, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
      ]);
      soundFx.playPing();
    }, 1200);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-150"
      onClick={handleClose}
    >
      <div 
        className="relative w-full max-w-2xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden my-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/90 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-white font-['Outfit']">
                  Live Room Tracker
                </h2>
                <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  #{activeTrackingOrder.orderNumber}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Delivering to {activeTrackingOrder.address.block}, {activeTrackingOrder.address.floor} • Room {activeTrackingOrder.address.roomNumber}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            aria-label="Close Live Room Tracker and return to store"
            title="Close tracker & return to store catalog"
            className="p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Container */}
        <div className="p-5 sm:p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* Status Alert Banner */}
          <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
            activeTrackingOrder.status === 'Delivered'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : activeTrackingOrder.status === 'Out for Delivery'
              ? 'bg-blue-500/10 border-blue-500/30 text-blue-300'
              : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
          }`}>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-current animate-ping" />
              <div>
                <div className="text-xs uppercase font-bold tracking-wider opacity-80">Current Status</div>
                <div className="text-base font-black text-white">{activeTrackingOrder.status}</div>
              </div>
            </div>

            {/* WhatsApp Summary Link Button */}
            <button
              onClick={handleOpenWhatsAppSummary}
              className="py-1.5 px-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp Summary</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </button>
          </div>

          {/* 3 Step Status Timeline */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Delivery Progress
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {statuses.map((step, idx) => {
                const isPassed = currentStatusIndex > idx;
                const isCurrent = currentStatusIndex === idx;

                return (
                  <div
                    key={step.status}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      isCurrent
                        ? 'bg-amber-500/10 border-amber-500/50 shadow-md shadow-amber-500/10'
                        : isPassed
                        ? 'bg-emerald-500/5 border-emerald-500/30'
                        : 'bg-slate-950 border-slate-800 opacity-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold ${
                        isCurrent
                          ? 'bg-amber-500 text-slate-950'
                          : isPassed
                          ? 'bg-emerald-500 text-slate-950'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {isPassed ? <Check className="w-4 h-4 stroke-[3]" /> : step.icon}
                      </div>
                      <span className={`text-xs font-bold ${isCurrent ? 'text-amber-300' : isPassed ? 'text-emerald-400' : 'text-slate-400'}`}>
                        {step.label}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-tight">
                      {step.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Handover PIN */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-slate-300">Room Door Handover PIN</span>
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Show to delivery person
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="font-mono text-3xl font-black text-amber-400 tracking-widest">
                {activeTrackingOrder.deliveryCode}
              </div>
              <button
                onClick={handleCopyCode}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5 text-amber-400" />
                <span>{copiedCode ? 'Copied' : 'Copy PIN'}</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-500">
              Share this 4-digit security code with the runner at your room door to verify and complete handover.
            </p>
          </div>

          {/* Quick Corridor Notes */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                <span>Corridor Delivery Instructions</span>
              </span>
              <span className="text-[11px] text-slate-500">Hostel room delivery</span>
            </div>

            <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
              {messagesList.map((m, i) => (
                <div
                  key={i}
                  className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div className={`p-2.5 rounded-2xl text-xs max-w-[85%] ${
                    m.sender === 'user'
                      ? 'bg-amber-500 text-slate-950 font-medium rounded-tr-none'
                      : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
                  }`}>
                    {m.text}
                  </div>
                  <span className="text-[9px] text-slate-500 mt-0.5 px-1">{m.time}</span>
                </div>
              ))}
            </div>

            {/* Quick chips */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {['Knock softly, roommate sleeping', 'Message on WhatsApp when at door', 'Room door is unlatched'].map((chip) => (
                <button
                  key={chip}
                  onClick={() => handleSendMessage(chip)}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Input bar */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type delivery note (e.g. Leave outside room door)..."
                className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
              />
              <button
                onClick={() => handleSendMessage()}
                className="p-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Items In Order Summary */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="text-xs font-bold text-slate-300">Items in this Delivery</div>
            <div className="space-y-1.5 divide-y divide-slate-800">
              {activeTrackingOrder.items.map((i, idx) => (
                <div key={idx} className="pt-1.5 first:pt-0 flex items-center justify-between text-xs">
                  <span className="text-slate-300">{i.quantity}x {i.item.name}</span>
                  <span className="font-mono text-amber-400">₹{i.item.price * i.quantity}</span>
                </div>
              ))}
            </div>
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs font-bold">
              <span className="text-white">Total Amount</span>
              <span className="text-emerald-400">₹{activeTrackingOrder.totalAmount}</span>
            </div>
            <div className="pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Payment: {activeTrackingOrder.payment.method === 'COD' ? 'Cash on Delivery' : 'Online UPI'}</span>
              {activeTrackingOrder.payment.method === 'ONLINE_UPI' ? (
                activeTrackingOrder.payment.isPaid ? (
                  <span className="font-bold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded border border-emerald-500/30">
                    ✓ Verified Paid
                  </span>
                ) : (
                  <span className="font-bold text-amber-300 bg-amber-500/15 px-2 py-0.5 rounded border border-amber-500/30">
                    ⏳ Awaiting Admin Verification
                  </span>
                )
              ) : (
                <span className="text-slate-300">Pay cash to runner at door</span>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
