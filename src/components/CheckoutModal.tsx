import React, { useState } from 'react';
import { 
  X, 
  DoorClosed, 
  Sparkles, 
  ShieldCheck, 
  QrCode, 
  CheckCircle2, 
  ArrowRight, 
  AlertCircle,
  Copy,
  ExternalLink,
  MessageSquare,
  Clock,
  Navigation,
  Banknote,
  Smartphone
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useOrders } from '../context/OrderContext';
import { useStoreStatus } from '../context/StoreStatusContext';
import { HostelBlock, HostelFloor, PaymentMode, PaymentDetails, HostelAddress, Order } from '../types';
import { soundFx } from '../utils/sound';
import { getWhatsAppOrderUrl, generateWhatsAppOrderMessage, PANTRY_WHATSAPP_NUMBER } from '../utils/whatsapp';
import confetti from 'canvas-confetti';

export const CheckoutModal: React.FC = () => {
  const { 
    items, 
    subtotal, 
    clearCart, 
    isCheckoutModalOpen, 
    setIsCheckoutModalOpen 
  } = useCart();
  const { createOrder, setActiveTrackingOrder } = useOrders();
  const { isTakingOrders } = useStoreStatus();

  // Form State
  const [studentName, setStudentName] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [block, setBlock] = useState<HostelBlock>('Block A');
  const [floor, setFloor] = useState<HostelFloor>('2nd Floor');
  const [roomNumber, setRoomNumber] = useState('');
  const [deliveryInstructions, setDeliveryInstructions] = useState('Knock softly (Roommate is sleeping)');
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('Cash on Delivery');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Placed Order state for showing confirmation & WhatsApp link
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isCheckoutModalOpen) return null;

  const quickInstructions = [
    'Knock softly (Roommate is sleeping)',
    'Message on WhatsApp when in corridor',
    'Leave on table outside room',
    'Door is unlatched, just push gently'
  ];

  const blocks: HostelBlock[] = [
    'Block A',
    'Block B'
  ];

  const floors: HostelFloor[] = [
    'Ground Floor',
    '1st Floor',
    '2nd Floor',
    '3rd Floor',
    '4th Floor',
    '5th Floor'
  ];

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setErrorMsg('');

    if (!isTakingOrders) {
      setErrorMsg('🔴 Shop is closed now, Please check later. Orders are temporarily paused.');
      return;
    }

    if (!studentName.trim()) {
      setErrorMsg('Please enter your full name so our hostel runner knows who to deliver to.');
      return;
    }
    if (!whatsappNumber.trim() || whatsappNumber.trim().length < 8) {
      setErrorMsg('Please enter a valid WhatsApp number for real-time corridor delivery alerts.');
      return;
    }
    if (!roomNumber.trim()) {
      setErrorMsg('Please provide your Allama Hostel room number (e.g. A-214 or B-105).');
      return;
    }

    const address: HostelAddress = {
      studentName: studentName.trim(),
      whatsappNumber: whatsappNumber.trim(),
      phone: whatsappNumber.trim(),
      block,
      floor,
      roomNumber: roomNumber.trim(),
      deliveryInstructions: deliveryInstructions.trim(),
    };

    const paymentDetails: PaymentDetails = {
      method: paymentMode,
      paymentMode: paymentMode,
      transactionId: null,
      upiApp: null,
      isPaid: false,
    };

    setIsSubmitting(true);
    try {
      // Create Order with status 'Pending' directly in Supabase
      const newOrder = await createOrder(items, address, paymentDetails);

      // Save this order ID into the customer's localStorage
      try {
        localStorage.setItem('allama_active_order_id', newOrder.id);
      } catch (e) {
        console.error('Failed to store active order ID in localStorage', e);
      }

      // Trigger celebration
      try {
        confetti({
          particleCount: 90,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {
        // Safe fallback
      }

      clearCart();
      setPlacedOrder(newOrder);
    } catch (err: any) {
      console.error('Failed placing order:', err);
      setErrorMsg(err?.message || 'Failed to place order in Supabase database. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setPlacedOrder(null);
    setIsCheckoutModalOpen(false);
  };

  const handleOpenWhatsApp = () => {
    if (!placedOrder) return;
    const url = getWhatsAppOrderUrl(placedOrder, PANTRY_WHATSAPP_NUMBER);
    window.open(url, '_blank');
  };

  const handleCopySummary = () => {
    if (!placedOrder) return;
    const text = generateWhatsAppOrderMessage(placedOrder);
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleTrackLive = () => {
    if (placedOrder) {
      setActiveTrackingOrder(placedOrder);
    }
    setIsCheckoutModalOpen(false);
    setPlacedOrder(null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm p-3 sm:p-6 animate-in fade-in duration-150">
      <div className="min-h-full flex items-start sm:items-center justify-center py-4 sm:py-6">
        <div 
          className="relative w-full max-w-2xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden my-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <DoorClosed className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white font-['Outfit']">Allama Hostel (Block A & B) Delivery</h2>
                <p className="text-[11px] sm:text-xs text-slate-400">100% Sealed Packaged Foods • Free Room Drop • COD & UPI at Door</p>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* IF ORDER HAS BEEN PLACED -> SHOW SUCCESS & WHATSAPP SUMMARY LINK */}
          {placedOrder ? (
            <div className="p-6 sm:p-8 space-y-6 text-center">
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto animate-bounce">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold">
                  <Clock className="w-3.5 h-3.5" />
                  Status: Pending (Saved in Live Pantry Board)
                </div>
                <h3 className="text-2xl font-black text-white font-['Outfit']">
                  Order Placed Successfully!
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
                  Your midnight order <span className="text-amber-400 font-bold font-mono">#{placedOrder.orderNumber}</span> has been dispatched to the Allama Hostel pantry queue.
                </p>
              </div>

              {/* Required Door Drop Readiness Notice */}
              <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/35 text-amber-200 text-xs sm:text-sm font-semibold max-w-lg mx-auto flex items-center justify-center gap-2.5 text-center shadow-lg shadow-amber-500/5">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  Order Received! Your runner is prepping your snacks. Keep your{' '}
                  <strong className="text-amber-100 font-bold underline underline-offset-2">
                    {placedOrder.payment.method === 'Cash on Delivery' ? 'Cash' : 'UPI app'}
                  </strong>{' '}
                  ready for door drop.
                </span>
              </div>

              {/* Room delivery summary card */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-left space-y-3">
                <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800">
                  <span className="text-slate-400">Deliver To:</span>
                  <span className="font-bold text-white">
                    {placedOrder.address.block}, {placedOrder.address.floor} • Room {placedOrder.address.roomNumber}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800">
                  <span className="text-slate-400">Customer & WhatsApp:</span>
                  <span className="font-semibold text-amber-300">
                    {placedOrder.address.studentName} ({placedOrder.address.whatsappNumber})
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800">
                  <span className="text-slate-400">Room Handover PIN:</span>
                  <span className="font-mono text-sm font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    {placedOrder.deliveryCode}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Payment:</span>
                  <div className="text-right">
                    <div className="font-bold text-white flex items-center justify-end gap-1.5">
                      <span className="text-emerald-400 font-black text-sm">₹{placedOrder.totalAmount}</span>
                      <span className="text-slate-300 font-semibold">
                        ({placedOrder.payment.method === 'Cash on Delivery' ? 'Cash on Delivery (COD)' : 'UPI at Door (Scan & Pay)'})
                      </span>
                    </div>
                    <div className="text-[11px] text-amber-400 font-medium mt-0.5">
                      {placedOrder.payment.method === 'Cash on Delivery'
                        ? 'Keep exact change ready at door'
                        : 'Pay via GPay, PhonePe, or Paytm QR to the runner when delivered'}
                    </div>
                  </div>
                </div>
              </div>

              {/* WHATSAPP ORDER SUMMARY BUTTONS */}
              <div className="space-y-3">
                <button
                  onClick={handleOpenWhatsApp}
                  className="w-full py-3.5 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-emerald-500/25 transition-all cursor-pointer"
                >
                  <MessageSquare className="w-5 h-5 fill-slate-950" />
                  <span>Open WhatsApp Order Summary</span>
                  <ExternalLink className="w-4 h-4 opacity-75" />
                </button>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={handleCopySummary}
                    className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-2 border border-slate-700 transition-colors cursor-pointer"
                  >
                    <Copy className="w-4 h-4 text-amber-400" />
                    <span>{copiedLink ? 'Copied Summary!' : 'Copy Order Text'}</span>
                  </button>

                  <button
                    onClick={handleTrackLive}
                    className="py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
                  >
                    <Navigation className="w-4 h-4" />
                    <span>Track Live Room Delivery</span>
                  </button>
                </div>
              </div>

              <p className="text-[11px] text-slate-500">
                Free room-to-room delivery in Block A & B. Our pantry staff will update your status as your snacks move through the corridors.
              </p>
            </div>
          ) : (
            /* CHECKOUT FORM */
            <form onSubmit={handlePlaceOrder} className="p-4 sm:p-6 space-y-6">
              
              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Hostel Room Details */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
                  <DoorClosed className="w-4 h-4 shrink-0" />
                  <span>1. Room & WhatsApp Details</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {/* Student Name */}
                  <div className="w-full">
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Student Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      placeholder="e.g. Adil Khan"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  {/* WhatsApp Number */}
                  <div className="w-full">
                    <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                      <span>WhatsApp Number *</span>
                      <span className="text-[10px] text-emerald-400 font-normal">For Room Alerts</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={whatsappNumber}
                      onChange={(e) => setWhatsappNumber(e.target.value)}
                      placeholder="e.g. +91 98450 11223"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Block Selection (A or B) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Hostel Wing / Block *
                  </label>
                  <select
                    value={block}
                    onChange={(e) => setBlock(e.target.value as HostelBlock)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    {blocks.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                {/* Floor Selection */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Floor *
                  </label>
                  <select
                    value={floor}
                    onChange={(e) => setFloor(e.target.value as HostelFloor)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    {floors.map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>

                {/* Room Number */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Room Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    placeholder="e.g. A-214 or B-102"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Delivery Instructions */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Corridor Delivery Note / Quiet Hours Instruction
                </label>
                <input
                  type="text"
                  value={deliveryInstructions}
                  onChange={(e) => setDeliveryInstructions(e.target.value)}
                  placeholder="e.g. Knock softly (Roommate is sleeping)"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
                />

                {/* Quick Presets */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {quickInstructions.map((qi, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setDeliveryInstructions(qi)}
                      className={`text-[11px] px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                        deliveryInstructions === qi
                          ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-300'
                      }`}
                    >
                      {qi}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Payment Method Selection - Streamlined Pay on Delivery */}
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                <span>2. Payment Mode (Pay on Delivery)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Option A: Cash on Delivery (COD) */}
                <div 
                  onClick={() => setPaymentMode('Cash on Delivery')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    paymentMode === 'Cash on Delivery'
                      ? 'bg-amber-500/10 border-amber-500/50 shadow-md shadow-amber-500/10 ring-1 ring-amber-500/30'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-bold text-sm text-white flex items-center gap-1.5">
                        <Banknote className="w-4 h-4 text-emerald-400" />
                        <span>Cash on Delivery (COD)</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        Keep exact change ready at door
                      </p>
                    </div>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center mt-1 shrink-0 ${
                      paymentMode === 'Cash on Delivery' ? 'border-amber-400 bg-amber-400' : 'border-slate-600'
                    }`}>
                      {paymentMode === 'Cash on Delivery' && <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                    </div>
                  </div>
                  <div className="mt-3 text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Pay cash directly to runner
                  </div>
                </div>

                {/* Option B: UPI at Door (Scan & Pay on Drop) */}
                <div 
                  onClick={() => setPaymentMode('UPI on Delivery')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    paymentMode === 'UPI on Delivery'
                      ? 'bg-amber-500/10 border-amber-500/50 shadow-md shadow-amber-500/10 ring-1 ring-amber-500/30'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-bold text-sm text-white flex items-center gap-1.5">
                        <Smartphone className="w-4 h-4 text-amber-400" />
                        <span>UPI at Door (Scan & Pay on Drop)</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        Pay via GPay, PhonePe, or Paytm QR to the runner when delivered
                      </p>
                    </div>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center mt-1 shrink-0 ${
                      paymentMode === 'UPI on Delivery' ? 'border-amber-400 bg-amber-400' : 'border-slate-600'
                    }`}>
                      {paymentMode === 'UPI on Delivery' && <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                    </div>
                  </div>
                  <div className="mt-3 text-[11px] text-amber-300 font-semibold flex items-center gap-1">
                    <QrCode className="w-3.5 h-3.5" />
                    Runner carries UPI scanner QR
                  </div>
                </div>
              </div>
            </div>

            {/* Bill Summary */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span>Items Subtotal ({items.length} packaged items):</span>
                <span className="text-white font-semibold">₹{subtotal}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Allama Hostel Room Delivery:</span>
                <span className="text-emerald-400 font-bold">₹0 (Free of Cost)</span>
              </div>
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-sm">
                <span className="font-bold text-white">Total Amount:</span>
                <span className="font-black text-amber-400 text-base">₹{subtotal}</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || !isTakingOrders}
              className={`w-full py-4 px-6 rounded-2xl font-black text-sm tracking-wide shadow-xl flex items-center justify-center gap-2 transition-transform active:scale-[0.99] ${
                !isTakingOrders
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 cursor-not-allowed'
                  : isSubmitting
                  ? 'bg-[#f59e0b] opacity-75 text-slate-950 cursor-not-allowed'
                  : 'bg-[#f59e0b] hover:bg-amber-400 text-slate-950 shadow-amber-500/15 cursor-pointer'
              }`}
            >
              <span>
                {!isTakingOrders
                  ? '🔴 Shop is closed now, Please check later'
                  : isSubmitting
                  ? 'Submitting Order to Pantry...'
                  : 'Place Order (Status: Pending)'}
              </span>
              {isTakingOrders && <ArrowRight className="w-4 h-4 stroke-[2.5]" />}
            </button>

            <p className="text-[11px] text-center text-slate-500">
              By placing order, you agree to receive room corridor updates via WhatsApp.
            </p>
          </form>
        )}

        </div>
      </div>
    </div>
  );
};
