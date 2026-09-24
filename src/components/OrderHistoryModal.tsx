import React from 'react';
import { 
  X, 
  Clock, 
  DoorClosed, 
  RotateCcw, 
  ShoppingBag, 
  CheckCircle2, 
  MessageSquare,
  ExternalLink,
  Truck,
  Package
} from 'lucide-react';
import { useOrders } from '../context/OrderContext';
import { useCart } from '../context/CartContext';
import { Order } from '../types';
import { getWhatsAppOrderUrl, PANTRY_WHATSAPP_NUMBER } from '../utils/whatsapp';

interface OrderHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OrderHistoryModal: React.FC<OrderHistoryModalProps> = ({ isOpen, onClose }) => {
  const { orders, setActiveTrackingOrder } = useOrders();
  const { addToCart, setIsCartDrawerOpen } = useCart();

  if (!isOpen) return null;

  const handleTrackOrder = (order: Order) => {
    setActiveTrackingOrder(order);
    onClose();
  };

  const handleReorder = (order: Order) => {
    order.items.forEach((it) => {
      if (it.item.inStock) {
        addToCart(it.item, it.quantity);
      }
    });
    setIsCartDrawerOpen(true);
    onClose();
  };

  const handleWhatsApp = (order: Order) => {
    const url = getWhatsAppOrderUrl(order, PANTRY_WHATSAPP_NUMBER);
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-150">
      <div 
        className="relative w-full max-w-xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden my-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-['Outfit']">Allama Hostel Orders</h2>
              <p className="text-xs text-slate-400">Your midnight cravings order history & tracking</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {orders.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <div className="w-16 h-16 rounded-3xl bg-slate-800 flex items-center justify-center text-slate-500 mx-auto">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="text-sm font-bold text-white">No orders placed yet</h3>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Whenever you get 2 AM cravings, order Maggi, drinks or snacks and track them right to your room door!
              </p>
            </div>
          ) : (
            orders.map((ord) => {
              const isDelivered = ord.status === 'Delivered';
              const isOutForDelivery = ord.status === 'Out for Delivery';

              return (
                <div 
                  key={ord.id}
                  className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/90 space-y-3 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-amber-400">
                        #{ord.orderNumber}
                      </span>
                      <span className="text-[11px] text-slate-500">•</span>
                      <span className="text-xs text-slate-400">
                        {new Date(ord.createdAt).toLocaleDateString()} at {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 ${
                      isDelivered 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : isOutForDelivery
                        ? 'bg-blue-500/15 text-blue-300 border-blue-500/40'
                        : 'bg-amber-500/15 text-amber-300 border-amber-500/40 animate-pulse'
                    }`}>
                      {isDelivered && <CheckCircle2 className="w-3 h-3" />}
                      {isOutForDelivery && <Truck className="w-3 h-3" />}
                      {!isDelivered && !isOutForDelivery && <Package className="w-3 h-3" />}
                      <span>{ord.status}</span>
                    </span>
                  </div>

                  <div className="text-xs text-slate-300 space-y-1">
                    <div className="flex items-center gap-1.5 font-medium text-white">
                      <DoorClosed className="w-3.5 h-3.5 text-amber-400" />
                      <span>{ord.address.block}, {ord.address.floor} — Room #{ord.address.roomNumber}</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      {ord.items.map((i) => `${i.quantity}x ${i.item.name}`).join(', ')}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                    <div>
                      <span className="text-xs text-slate-400">Paid: </span>
                      <span className="text-xs font-bold text-slate-200">
                        {ord.payment.method === 'COD' ? 'Cash on Delivery' : 'Online UPI'}
                      </span>
                      <span className="text-sm font-black text-amber-400 ml-2">₹{ord.totalAmount}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleWhatsApp(ord)}
                        title="WhatsApp Order Summary"
                        className="p-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-bold transition-colors cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleTrackOrder(ord)}
                        className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200 hover:text-white transition-colors cursor-pointer"
                      >
                        {isDelivered ? 'View Receipt' : 'Live Track'}
                      </button>

                      <button
                        onClick={() => handleReorder(ord)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-colors cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Reorder</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
};
