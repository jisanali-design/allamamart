import React, { useState, useMemo } from 'react';
import { 
  ClipboardList, 
  PackageCheck, 
  ArrowLeft, 
  Search, 
  Phone, 
  MessageSquare, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Truck, 
  DoorClosed, 
  RotateCcw, 
  LogOut, 
  Layers, 
  DollarSign, 
  Flame, 
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Check,
  Ban,
  Trash2,
  Plus,
  AlertTriangle,
  QrCode,
  Banknote,
  Landmark,
  Copy
} from 'lucide-react';
import { useOrders } from '../context/OrderContext';
import { useInventory } from '../context/InventoryContext';
import { useCart } from '../context/CartContext';
import { Order, OrderStatus, Category, FoodItem } from '../types';
import { getWhatsAppCustomerChatUrl } from '../utils/whatsapp';
import { soundFx } from '../utils/sound';
import { AddProductModal } from './AddProductModal';
import { STORE_UPI_CONFIG } from '../utils/upi';
import { UpiQrCode } from './UpiQrCode';

interface AdminDashboardProps {
  onBackToStore: () => void;
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onBackToStore,
  onLogout,
}) => {
  const { orders, updateOrderStatus, resetDemoOrders } = useOrders();
  const { 
    products, 
    toggleStock, 
    restockAll, 
    addProduct,
    removeProduct,
    resetToDefaultMenu,
    inStockCount, 
    outOfStockCount 
  } = useInventory();
  const { removeFromCart } = useCart();

  const [activeTab, setActiveTab] = useState<'orders' | 'inventory' | 'upi'>('orders');
  
  // Add / Remove item modal & dialog states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<FoodItem | null>(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };
  
  // Orders filters
  const [statusFilter, setStatusFilter] = useState<'ALL' | OrderStatus>('ALL');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [selectedBlock, setSelectedBlock] = useState<'ALL' | 'Block A' | 'Block B'>('ALL');

  // Inventory filters
  const [inventorySearch, setInventorySearch] = useState('');
  const [inventoryCategory, setInventoryCategory] = useState<Category>('all');

  // Stats calculation
  const stats = useMemo(() => {
    const totalOrders = orders.length;
    const pendingOrders = orders.filter((o) => o.status === 'Pending').length;
    const outForDeliveryOrders = orders.filter((o) => o.status === 'Out for Delivery').length;
    const deliveredOrders = orders.filter((o) => o.status === 'Delivered').length;
    const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);

    return {
      totalOrders,
      pendingOrders,
      outForDeliveryOrders,
      deliveredOrders,
      totalRevenue,
    };
  }, [orders]);

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Status filter
      if (statusFilter !== 'ALL' && order.status !== statusFilter) {
        return false;
      }
      // Block filter
      if (selectedBlock !== 'ALL' && order.address.block !== selectedBlock) {
        return false;
      }
      // Search
      if (orderSearchQuery.trim()) {
        const q = orderSearchQuery.toLowerCase().trim();
        const matchesRoom = order.address.roomNumber.toLowerCase().includes(q);
        const matchesName = order.address.studentName.toLowerCase().includes(q);
        const matchesOrderNo = order.orderNumber.toLowerCase().includes(q);
        const matchesPhone = order.address.whatsappNumber.includes(q);
        if (!matchesRoom && !matchesName && !matchesOrderNo && !matchesPhone) {
          return false;
        }
      }
      return true;
    });
  }, [orders, statusFilter, selectedBlock, orderSearchQuery]);

  // Filtered inventory
  const filteredInventory = useMemo(() => {
    return products.filter((item) => {
      if (inventoryCategory !== 'all' && item.category !== inventoryCategory) {
        return false;
      }
      if (inventorySearch.trim()) {
        const q = inventorySearch.toLowerCase().trim();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesDesc = item.description.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc) {
          return false;
        }
      }
      return true;
    });
  }, [products, inventoryCategory, inventorySearch]);

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    updateOrderStatus(orderId, newStatus);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500/30 selection:text-amber-200">
      
      {/* Top Admin Navigation Bar */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 flex items-center justify-center text-slate-950 font-black shadow-md shadow-amber-500/20">
              <DoorClosed className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black text-white font-['Outfit']">
                  Allama<span className="text-amber-400">Admin</span>
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                  Ground Hub Live
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Hostel Pantry & Runner Dispatch Dashboard • Blocks A & B
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Switch to Customer Store View */}
            <button
              onClick={onBackToStore}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-amber-400" />
              <span>Customer Store View</span>
            </button>

            {/* Logout */}
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-semibold border border-rose-500/30 transition-colors cursor-pointer"
              title="Logout from admin session"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>

        </div>

        {/* View Switcher Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-800/80 flex items-center gap-2">
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 font-bold text-xs transition-colors cursor-pointer ${
              activeTab === 'orders'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            <span>Live Order Board</span>
            {stats.pendingOrders > 0 && (
              <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] flex items-center justify-center animate-pulse">
                {stats.pendingOrders}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('inventory')}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 font-bold text-xs transition-colors cursor-pointer ${
              activeTab === 'inventory'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <PackageCheck className="w-4 h-4" />
            <span>Food Items & Inventory</span>
            {outOfStockCount > 0 ? (
              <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold text-[10px]">
                {outOfStockCount} Sold Out
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold text-[10px]">
                All In Stock
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('upi')}
            className={`flex items-center gap-2 py-3 px-4 border-b-2 font-bold text-xs transition-colors cursor-pointer ${
              activeTab === 'upi'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>Store UPI QR & Bank Settings</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono font-bold text-[10px]">
              9749528677@ibl
            </span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full space-y-6">

        {/* TAB 1: LIVE ORDER BOARD */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            
            {/* Top Stat Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                <div className="text-[11px] font-semibold text-slate-400">Total Orders</div>
                <div className="text-2xl font-black text-white">{stats.totalOrders}</div>
                <div className="text-[10px] text-slate-500">Tonight's Cravings</div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-1">
                <div className="text-[11px] font-semibold text-amber-300 flex items-center justify-between">
                  <span>Pending</span>
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                </div>
                <div className="text-2xl font-black text-amber-400">{stats.pendingOrders}</div>
                <div className="text-[10px] text-amber-300/80">Needs packing / dispatch</div>
              </div>

              <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30 space-y-1">
                <div className="text-[11px] font-semibold text-blue-300 flex items-center justify-between">
                  <span>Out for Delivery</span>
                  <Truck className="w-3.5 h-3.5 text-blue-400" />
                </div>
                <div className="text-2xl font-black text-blue-400">{stats.outForDeliveryOrders}</div>
                <div className="text-[10px] text-blue-300/80">In Block A/B corridors</div>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-1">
                <div className="text-[11px] font-semibold text-emerald-300 flex items-center justify-between">
                  <span>Delivered</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div className="text-2xl font-black text-emerald-400">{stats.deliveredOrders}</div>
                <div className="text-[10px] text-emerald-300/80">Completed to door</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1 col-span-2 sm:col-span-1">
                <div className="text-[11px] font-semibold text-slate-400 flex items-center justify-between">
                  <span>Total Revenue</span>
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div className="text-2xl font-black text-emerald-400">₹{stats.totalRevenue}</div>
                <div className="text-[10px] text-slate-500">₹0 Delivery Fee waiver</div>
              </div>

            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900 border border-slate-800">
              
              {/* Status Filter Buttons */}
              <div className="flex flex-wrap items-center gap-1.5">
                {(['ALL', 'Pending', 'Out for Delivery', 'Delivered'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      statusFilter === status
                        ? 'bg-amber-500 text-slate-950 shadow-sm'
                        : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {status === 'ALL' ? 'All Orders' : status}
                    {status === 'Pending' && stats.pendingOrders > 0 && ` (${stats.pendingOrders})`}
                  </button>
                ))}
              </div>

              {/* Block & Search Controls */}
              <div className="flex items-center gap-2">
                <select
                  value={selectedBlock}
                  onChange={(e) => setSelectedBlock(e.target.value as any)}
                  className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value="ALL">All Blocks</option>
                  <option value="Block A">Block A Only</option>
                  <option value="Block B">Block B Only</option>
                </select>

                <div className="relative flex-1 sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                  <input
                    type="text"
                    value={orderSearchQuery}
                    onChange={(e) => setOrderSearchQuery(e.target.value)}
                    placeholder="Search Room #, Name, ID..."
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <button
                  onClick={resetDemoOrders}
                  title="Reset sample orders for testing"
                  className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>

            {/* Orders List */}
            {filteredOrders.length === 0 ? (
              <div className="py-16 text-center space-y-3 rounded-3xl bg-slate-900/50 border border-slate-800 p-8">
                <ClipboardList className="w-12 h-12 text-slate-600 mx-auto" />
                <h3 className="text-base font-bold text-white">No orders matching this filter</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Try changing your status filter, block selection, or search query.
                </p>
                <button
                  onClick={() => {
                    setStatusFilter('ALL');
                    setSelectedBlock('ALL');
                    setOrderSearchQuery('');
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold hover:bg-amber-400 cursor-pointer"
                >
                  Reset Order Filters
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order) => {
                  const statusColors = {
                    Pending: 'bg-amber-500/15 border-amber-500/40 text-amber-300',
                    'Out for Delivery': 'bg-blue-500/15 border-blue-500/40 text-blue-300',
                    Delivered: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300',
                  };

                  return (
                    <div
                      key={order.id}
                      className="rounded-3xl bg-slate-900/90 border border-slate-800 p-5 space-y-4 hover:border-slate-700 transition-all shadow-lg"
                    >
                      {/* Top Header Row */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-800">
                        <div className="flex items-center gap-3">
                          {/* Room Number Badge in bold high contrast */}
                          <div className="px-3.5 py-1.5 rounded-2xl bg-amber-500 text-slate-950 font-black text-sm tracking-wide shadow-md shadow-amber-500/20">
                            ROOM {order.address.roomNumber}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white text-sm">
                                {order.address.block}, {order.address.floor}
                              </span>
                              <span className="text-xs text-slate-500">•</span>
                              <span className="font-mono text-xs text-slate-400">
                                #{order.orderNumber}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                              <Clock className="w-3 h-3 text-slate-500" />
                              <span>{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              <span>•</span>
                              <span>Handover PIN: <strong className="text-amber-400 font-mono">{order.deliveryCode}</strong></span>
                            </div>
                          </div>
                        </div>

                        {/* Current Status Badge */}
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-xl border text-xs font-extrabold flex items-center gap-1.5 ${statusColors[order.status]}`}>
                            {order.status === 'Pending' && <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />}
                            {order.status === 'Out for Delivery' && <Truck className="w-3.5 h-3.5" />}
                            {order.status === 'Delivered' && <CheckCircle2 className="w-3.5 h-3.5" />}
                            <span>{order.status}</span>
                          </span>
                        </div>
                      </div>

                      {/* Middle Grid: Customer details + Items breakdown */}
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-xs">
                        
                        {/* Customer & Corridor Notes */}
                        <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2.5">
                          <div className="font-bold text-slate-300 uppercase tracking-wider text-[10px]">
                            Student Recipient
                          </div>
                          <div className="space-y-1">
                            <div className="text-sm font-extrabold text-white">
                              {order.address.studentName}
                            </div>
                            <div className="text-slate-400 text-xs font-mono">
                              WhatsApp: {order.address.whatsappNumber}
                            </div>
                          </div>

                          {/* Quick WhatsApp & Call Actions */}
                          <div className="flex items-center gap-2 pt-1">
                            <a
                              href={getWhatsAppCustomerChatUrl(order.address.whatsappNumber, order.address.studentName, order.orderNumber)}
                              target="_blank"
                              rel="noreferrer"
                              className="flex-1 py-1.5 px-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>WhatsApp</span>
                              <ExternalLink className="w-3 h-3 opacity-60" />
                            </a>

                            <a
                              href={`tel:${order.address.whatsappNumber}`}
                              className="py-1.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                            >
                              <Phone className="w-3.5 h-3.5" />
                              <span>Call</span>
                            </a>
                          </div>

                          {order.address.deliveryInstructions && (
                            <div className="mt-2 p-2 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-amber-300/90 leading-tight">
                              <span className="font-semibold text-slate-400">Note: </span>
                              "{order.address.deliveryInstructions}"
                            </div>
                          )}
                        </div>

                        {/* Items Breakdown */}
                        <div className="lg:col-span-2 p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2.5">
                          <div className="flex items-center justify-between text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                            <span>Packaged Food Items ({order.items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                            <span className="text-amber-400 font-mono">Total: ₹{order.totalAmount} ({order.payment.method})</span>
                          </div>

                          <div className="space-y-1.5 divide-y divide-slate-800/60 max-h-36 overflow-y-auto pr-1">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="pt-1.5 first:pt-0 flex items-center justify-between text-xs">
                                <div className="flex items-center gap-2">
                                  <span className="w-5 h-5 rounded-md bg-amber-500/15 text-amber-400 font-black text-[11px] flex items-center justify-center shrink-0">
                                    {item.quantity}x
                                  </span>
                                  <span className="text-slate-200 font-medium">
                                    {item.item.name}
                                  </span>
                                </div>
                                <span className="font-mono text-slate-400 font-semibold shrink-0">
                                  ₹{item.item.price * item.quantity}
                                </span>
                              </div>
                            ))}
                          </div>

                          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
                            <span className="text-slate-400">
                              Payment: <strong className="text-white">{order.payment.method === 'COD' ? 'Cash on Delivery (Collect at door)' : `Paid Online via UPI (${STORE_UPI_CONFIG.upiId})`}</strong>
                            </span>
                            <span className="text-emerald-400 font-bold">
                              ₹0 Free Room Drop
                            </span>
                          </div>
                        </div>

                      </div>

                      {/* BOTTOM ACTION ROW: ORDER STATUS CONTROLS */}
                      <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                        <div className="text-xs text-slate-400 flex items-center gap-1.5">
                          <span className="font-semibold text-slate-300">Set Order Status:</span>
                          <span className="text-[11px] text-slate-500">(Updates customer room tracker in real-time)</span>
                        </div>

                        {/* 3 Status Switch Buttons */}
                        <div className="grid grid-cols-3 gap-2 sm:w-auto">
                          
                          {/* Pending Button */}
                          <button
                            onClick={() => handleStatusChange(order.id, 'Pending')}
                            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                              order.status === 'Pending'
                                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/25 ring-2 ring-amber-400/50'
                                : 'bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400'
                            }`}
                          >
                            <Clock className="w-3.5 h-3.5" />
                            <span>Pending</span>
                          </button>

                          {/* Out for Delivery Button */}
                          <button
                            onClick={() => handleStatusChange(order.id, 'Out for Delivery')}
                            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                              order.status === 'Out for Delivery'
                                ? 'bg-blue-500 text-white shadow-md shadow-blue-500/25 ring-2 ring-blue-400/50'
                                : 'bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400'
                            }`}
                          >
                            <Truck className="w-3.5 h-3.5" />
                            <span>Dispatched</span>
                          </button>

                          {/* Delivered Button */}
                          <button
                            onClick={() => handleStatusChange(order.id, 'Delivered')}
                            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                              order.status === 'Delivered'
                                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/25 ring-2 ring-emerald-400/50'
                                : 'bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-400'
                            }`}
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Delivered</span>
                          </button>

                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}

          </div>
        )}

        {/* TAB 2: INVENTORY & STOCK MANAGER */}
        {activeTab === 'inventory' && (
          <div className="space-y-6">
            
            {/* Inventory Overview Banner */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-5 rounded-3xl bg-slate-900 border border-slate-800">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg font-black text-white font-['Outfit']">
                    Packaged Food Inventory & Menu Manager
                  </h2>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30">
                    {products.length} Total Items
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Add new snacks or drinks, remove discontinued items, or toggle real-time stock availability.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-2xl border border-slate-800 text-xs">
                  <span className="text-emerald-400 font-bold">{inStockCount} In Stock</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-rose-400 font-bold">{outOfStockCount} Sold Out</span>
                </div>

                {/* Primary Action: Add Food Item */}
                <button
                  onClick={() => {
                    setIsAddModalOpen(true);
                    soundFx.playTap();
                  }}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs font-black shadow-md shadow-amber-500/20 flex items-center gap-1.5 transition-all transform active:scale-95 cursor-pointer"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>+ Add Food Item</span>
                </button>

                <button
                  onClick={() => {
                    restockAll();
                    soundFx.playSuccess();
                    showToast('All menu items marked as In Stock!');
                  }}
                  className="px-3 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition-all cursor-pointer"
                  title="Mark all items as in stock"
                >
                  Restock All
                </button>

                <button
                  onClick={() => setIsResetConfirmOpen(true)}
                  className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 text-xs font-semibold transition-colors cursor-pointer"
                  title="Restore standard default catalog"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Inventory Search & Category Filter */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900 border border-slate-800">
              
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                <input
                  type="text"
                  value={inventorySearch}
                  onChange={(e) => setInventorySearch(e.target.value)}
                  placeholder="Search item name (e.g. Maggi, Buldak, Red Bull)..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
                {(['all', 'combos', 'noodles', 'chips', 'drinks', 'sweets', 'quick-bites'] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setInventoryCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      inventoryCategory === cat
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {cat === 'all' ? 'All Items' : cat}
                  </button>
                ))}
              </div>

            </div>

            {/* Inventory Grid with Switch Toggles & Remove Action */}
            {filteredInventory.length === 0 ? (
              <div className="p-12 text-center rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-500 mx-auto">
                  <Search className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-white">No food items found</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  No food items match the current search or category filter. You can add a new item or reset the filter.
                </p>
                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add First Item</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredInventory.map((item) => {
                  const inStock = item.inStock;

                  return (
                    <div
                      key={item.id}
                      className={`p-4 rounded-3xl bg-slate-900 border transition-all ${
                        inStock
                          ? 'border-slate-800 hover:border-slate-700'
                          : 'border-rose-500/30 bg-rose-500/5'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          referrerPolicy="no-referrer"
                          className={`w-16 h-16 rounded-2xl object-cover bg-slate-950 shrink-0 ${
                            !inStock ? 'grayscale-40 contrast-75' : ''
                          }`}
                        />

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                              {item.category}
                            </span>
                            <span className="text-xs font-black text-white">
                              ₹{item.price}
                            </span>
                          </div>

                          <h4 className="text-xs font-bold text-white truncate mt-0.5" title={item.name}>
                            {item.name}
                          </h4>
                          <div className="text-[11px] text-slate-400">{item.weight}</div>
                        </div>

                        {/* Remove Food Item Button */}
                        <button
                          type="button"
                          onClick={() => {
                            setItemToDelete(item);
                            soundFx.playTap();
                          }}
                          className="p-1.5 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/15 border border-transparent hover:border-rose-500/30 transition-colors shrink-0 cursor-pointer"
                          title={`Remove ${item.name} from menu`}
                          aria-label={`Remove ${item.name}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Stock Toggle Switch */}
                      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                        <span className={`text-xs font-bold flex items-center gap-1.5 ${
                          inStock ? 'text-emerald-400' : 'text-rose-400'
                        }`}>
                          {inStock ? (
                            <>
                              <span className="w-2 h-2 rounded-full bg-emerald-400" />
                              <span>In Stock (Available)</span>
                            </>
                          ) : (
                            <>
                              <Ban className="w-3.5 h-3.5" />
                              <span>Out of Stock (Sold Out)</span>
                            </>
                          )}
                        </span>

                        {/* Interactive Toggle Switch */}
                        <button
                          type="button"
                          onClick={() => {
                            toggleStock(item.id);
                            soundFx.playTap();
                          }}
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            inStock ? 'bg-emerald-500' : 'bg-slate-700'
                          }`}
                          role="switch"
                          aria-checked={inStock}
                          aria-label={`Toggle stock for ${item.name}`}
                        >
                          <span
                            aria-hidden="true"
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                              inStock ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}

          </div>
        )}

        {/* TAB 3: STORE UPI QR & BANK SETTINGS */}
        {activeTab === 'upi' && (
          <div className="space-y-6">
            
            {/* Header info card */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Landmark className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-white font-['Outfit']">
                      Store UPI & Bank Settlement Details
                    </h2>
                    <p className="text-xs text-slate-400">
                      All online payments made by hostel students transfer directly into this bank account without intermediary delays.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Direct Bank Routing Active</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="text-xs text-slate-400 flex items-center gap-1.5">
                  <QrCode className="w-4 h-4 text-amber-400" />
                  <span>Configured Store UPI ID</span>
                </div>
                <div className="font-mono text-xl font-black text-amber-400 select-all">
                  {STORE_UPI_CONFIG.upiId}
                </div>
                <p className="text-[11px] text-slate-400">
                  Transfers credit directly to the primary bank account linked to this ID.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="text-xs text-slate-400 flex items-center gap-1.5">
                  <Landmark className="w-4 h-4 text-emerald-400" />
                  <span>Merchant / Payee Name</span>
                </div>
                <div className="text-xl font-extrabold text-white font-['Outfit']">
                  {STORE_UPI_CONFIG.merchantName}
                </div>
                <p className="text-[11px] text-slate-400">
                  Displayed on student payment screens (Google Pay, PhonePe, Paytm).
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="text-xs text-slate-400 flex items-center gap-1.5">
                  <Banknote className="w-4 h-4 text-blue-400" />
                  <span>Settlement Fee & Platform Cut</span>
                </div>
                <div className="text-xl font-black text-emerald-400">
                  0% (Zero Platform Fee)
                </div>
                <p className="text-[11px] text-slate-400">
                  100% of order totals transfer instantly peer-to-merchant.
                </p>
              </div>
            </div>

            {/* Live QR Generator Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Live Interactive QR Test */}
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div>
                    <h3 className="text-sm font-bold text-white font-['Outfit'] flex items-center gap-2">
                      <QrCode className="w-4 h-4 text-amber-400" />
                      <span>Live Storefront QR Code Preview</span>
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      This is the actual dynamic QR code generated at student checkout
                    </p>
                  </div>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    Live NPCI Spec
                  </span>
                </div>

                <UpiQrCode amount={150} />
              </div>

              {/* Instructions and Runner SOP for UPI */}
              <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-white font-['Outfit'] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Hostel Delivery Payment Verification SOP</span>
                </h3>

                <div className="space-y-3 text-xs text-slate-300">
                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                    <div className="font-bold text-amber-300 flex items-center gap-1.5">
                      <span>1. Student Places Online Order</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Checkout displays the dynamic QR code encoded with <strong className="text-white">pa={STORE_UPI_CONFIG.upiId}</strong> and <strong className="text-white">pn={STORE_UPI_CONFIG.merchantName}</strong>. Students scan with any app.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                    <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                      <span>2. Direct Bank Credit Alert</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      You receive an instant SMS or bank notification for the incoming transfer to your bank account with order reference.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                    <div className="font-bold text-blue-400 flex items-center gap-1.5">
                      <span>3. Runner Room Delivery & PIN Verification</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      The runner delivers the sealed snacks to Room A/B and checks the 4-digit handover PIN to confirm completion.
                    </p>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(STORE_UPI_CONFIG.upiId);
                      showToast(`Copied store UPI ID: ${STORE_UPI_CONFIG.upiId}`);
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-2 border border-slate-700 transition-colors cursor-pointer"
                  >
                    <Copy className="w-4 h-4 text-amber-400" />
                    <span>Copy Store UPI ID ({STORE_UPI_CONFIG.upiId})</span>
                  </button>
                </div>
              </div>

            </div>

          </div>
        )}

      </main>

      {/* Add Food Item Modal */}
      <AddProductModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddProduct={(newItem) => {
          addProduct(newItem);
          showToast(`Added "${newItem.name}" to menu!`);
        }}
      />

      {/* Delete / Remove Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-150">
          <div 
            className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white font-['Outfit']">
                  Remove Item from Menu?
                </h3>
                <p className="text-xs text-slate-400">
                  Confirm item removal from hostel inventory
                </p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-3">
              <img 
                src={itemToDelete.image} 
                alt={itemToDelete.name} 
                className="w-14 h-14 rounded-xl object-cover bg-slate-900 border border-slate-800 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-white truncate">
                  {itemToDelete.name}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  {itemToDelete.weight} • ₹{itemToDelete.price}
                </div>
                <span className="inline-block mt-1 text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-800 text-amber-400">
                  {itemToDelete.category}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              This item will be removed from customer view and cannot be ordered by students in Block A & B. You can re-add it or restore the catalog anytime.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const name = itemToDelete.name;
                  removeProduct(itemToDelete.id);
                  removeFromCart(itemToDelete.id);
                  setItemToDelete(null);
                  soundFx.playPop();
                  showToast(`Removed "${name}" from menu.`);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/20 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Yes, Remove Item</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Catalog Confirmation Modal */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-150">
          <div 
            className="relative w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white font-['Outfit']">
                  Restore Default Menu?
                </h3>
                <p className="text-xs text-slate-400">
                  Reload original packaged foods catalog
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              This will reload all standard packaged food items (Maggi, Buldak, Red Bull, Chips, etc.) back to default stock.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  resetToDefaultMenu();
                  setIsResetConfirmOpen(false);
                  soundFx.playSuccess();
                  showToast('Restored default hostel catalog.');
                }}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-lg shadow-amber-500/20 transition-colors cursor-pointer"
              >
                Confirm Restore
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Feedback Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl bg-slate-900 border border-amber-500/40 shadow-2xl text-xs font-bold text-white flex items-center gap-2.5 animate-in slide-in-from-bottom-3 duration-200">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
};
