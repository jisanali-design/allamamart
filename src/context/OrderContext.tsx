import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../supabase';
import { Order, OrderStatus, HostelAddress, CartItem, PaymentDetails, DeliveryRunner } from '../types';
import { soundFx } from '../utils/sound';
import { triggerNewOrderAlert } from '../utils/orderAlerts';

export const ACTIVE_ORDER_STORAGE_KEY = 'allama_active_order_id';

const RUNNERS: DeliveryRunner[] = [
  {
    name: 'Tariq Ahmed',
    phone: '+91 98451 23098',
    rating: 4.9,
    deliveriesCount: 640,
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    currentLocationDesc: 'Hostel Ground Hub (Near Mess)',
  },
  {
    name: 'Farhan Sheikh',
    phone: '+91 97321 84512',
    rating: 4.8,
    deliveriesCount: 512,
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80',
    currentLocationDesc: 'Allama Block B Stairs',
  },
  {
    name: 'Bilal Khan',
    phone: '+91 91234 56789',
    rating: 4.9,
    deliveriesCount: 780,
    avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=200&q=80',
    currentLocationDesc: 'Allama Pantry Dispatch Desk',
  }
];

export function parseOrderRow(row: any): Order | null {
  if (!row) return null;
  const p = row.data && typeof row.data === 'object' ? row.data : row;
  if (p.isStoreSettings || p.type === 'store_status') return null;

  const studentName = p.customerName || p.studentName || p.customer_name || '';
  const whatsapp = p.whatsappNumber || p.whatsapp || p.contact || '';
  const block = p.hostelBlock || p.block || 'Block A';
  const floor = p.floor || 'Ground Floor';
  const roomNumber = p.roomNumber || p.room_number || '';
  const deliveryInstructions = p.deliveryNote || p.deliveryInstructions || '';

  const address: HostelAddress = p.address || {
    studentName,
    whatsappNumber: whatsapp,
    phone: whatsapp,
    block,
    floor,
    roomNumber,
    deliveryInstructions,
  };

  const rawMethod = p.paymentMode || (p.payment && (p.payment.paymentMode || p.payment.method)) || 'Cash on Delivery';
  const normalizedMethod: 'Cash on Delivery' | 'UPI on Delivery' = 
    (rawMethod === 'UPI on Delivery' || rawMethod === 'ONLINE_UPI')
      ? 'UPI on Delivery'
      : 'Cash on Delivery';

  const payment: PaymentDetails = {
    method: normalizedMethod,
    paymentMode: normalizedMethod,
    isPaid: Boolean(p.payment?.isPaid ?? p.isPaid),
    transactionId: p.payment?.transactionId || p.transactionId || null,
    upiApp: p.payment?.upiApp || p.upiApp || null,
  };

  return {
    id: String(row.id),
    orderNumber: p.orderNumber || `ALM-${row.id}`,
    createdAt: row.created_at || p.createdAt || p.timestamp || new Date().toISOString(),
    items: p.items || p.itemsList || [],
    subtotal: p.subtotal ?? p.totalAmount ?? 0,
    deliveryFee: p.deliveryFee ?? 0,
    totalAmount: p.totalAmount ?? 0,
    address,
    payment,
    status: (p.status as OrderStatus) || 'Pending',
    deliveryCode: p.deliveryCode || '0000',
    estimatedMinutes: p.estimatedMinutes ?? (p.status === 'Delivered' ? 0 : 12),
    estimatedDeliveryTime: p.estimatedDeliveryTime || '',
    runner: p.runner || RUNNERS[0],
    statusUpdates: p.statusUpdates || [],
  };
}

interface OrderContextType {
  // Customer-facing private active order
  activeOrderId: string | null;
  activeCustomerOrder: Order | null;
  clearActiveOrder: () => void;
  openCustomerOrderTracker: () => void;

  // Active tracking order (modal display)
  activeTrackingOrder: Order | null;
  setActiveTrackingOrder: (order: Order | null) => void;

  // Admin global order board (Protected by PIN: 0786)
  orders: Order[];
  isAdminMode: boolean;
  setIsAdminMode: (isAdmin: boolean) => void;
  isLoading: boolean;
  firestoreError: string | null;
  clearFirestoreError: () => void;

  // Actions
  createOrder: (items: CartItem[], address: HostelAddress, payment: PaymentDetails) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  toggleOrderPaidStatus: (orderId: string, isPaid: boolean) => Promise<void>;
  deleteOrder: (orderId: string) => Promise<void>;
  resetDemoOrders: () => void;
  refreshOrders: () => Promise<void>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Customer-facing: active order ID stored in localStorage
  const [activeOrderId, setActiveOrderId] = useState<string | null>(() => {
    try {
      return localStorage.getItem(ACTIVE_ORDER_STORAGE_KEY) || null;
    } catch {
      return null;
    }
  });
  const [activeCustomerOrder, setActiveCustomerOrder] = useState<Order | null>(null);

  // Active tracking order being viewed in OrderTrackerModal
  const [activeTrackingOrder, setActiveTrackingOrder] = useState<Order | null>(null);

  // 2. Admin-facing: global list of all orders
  const [orders, setOrders] = useState<Order[]>([]);
  const [isAdminMode, setIsAdminMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('allama_admin_auth') === 'true';
    } catch {
      return false;
    }
  });

  const [isLoading, setIsLoading] = useState(true);
  const [firestoreError, setFirestoreError] = useState<string | null>(null);

  // Track known order IDs for admin alerts
  const isInitialFetch = useRef(true);
  const knownOrderIds = useRef<Set<string>>(new Set());
  const alertedOrderIds = useRef<Set<string>>(new Set());

  const clearFirestoreError = () => {
    setFirestoreError(null);
  };

  // Clear customer active order from localStorage and state
  const clearActiveOrder = useCallback(() => {
    try {
      localStorage.removeItem(ACTIVE_ORDER_STORAGE_KEY);
    } catch (err) {
      console.error('Failed to clear active order from localStorage:', err);
    }
    setActiveOrderId(null);
    setActiveCustomerOrder(null);
    setActiveTrackingOrder(null);
    soundFx.playPop();
  }, []);

  const openCustomerOrderTracker = useCallback(() => {
    if (activeCustomerOrder) {
      setActiveTrackingOrder(activeCustomerOrder);
      soundFx.playPop();
    }
  }, [activeCustomerOrder]);

  // ==========================================
  // CUSTOMER-FACING TRACKER: Query & Subscribe ONLY to activeOrderId
  // ==========================================
  useEffect(() => {
    if (!activeOrderId) {
      setActiveCustomerOrder(null);
      return;
    }

    let isMounted = true;

    async function fetchCustomerOrder() {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('id', activeOrderId)
          .single();

        if (error) {
          console.warn('Customer active order not found:', error.message);
          return;
        }

        if (data && isMounted) {
          const parsed = parseOrderRow(data);
          if (parsed) {
            setActiveCustomerOrder(parsed);
            // If user has the tracker modal open, keep it updated
            setActiveTrackingOrder((prev) => (prev?.id === parsed.id ? parsed : prev));
          }
        }
      } catch (err) {
        console.error('Failed to fetch customer active order:', err);
      }
    }

    fetchCustomerOrder();

    // Listen in real-time ONLY to status changes for that specific order ID
    const channelName = `customer-order-${activeOrderId}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${activeOrderId}`,
        },
        (payload: any) => {
          if (!isMounted) return;
          const updatedRow = payload.new;
          const parsed = parseOrderRow(updatedRow);
          if (parsed) {
            setActiveCustomerOrder(parsed);
            setActiveTrackingOrder((prev) => (prev?.id === parsed.id ? parsed : prev));

            if (parsed.status === 'Out for Delivery') {
              soundFx.playChime();
            } else if (parsed.status === 'Delivered') {
              soundFx.playSuccess();
            }
          }
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, [activeOrderId]);

  // ==========================================
  // ADMIN-FACING BOARD: Global list of all orders
  // ==========================================
  const fetchOrders = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error reading orders from Supabase:', error);
        setFirestoreError(`Supabase Read Error: ${error.message}`);
        setIsLoading(false);
        return;
      }

      const loadedOrders: Order[] = (data || [])
        .map((row: any) => parseOrderRow(row))
        .filter((o): o is Order => o !== null);

      // Handle alerts for admin
      if (isInitialFetch.current) {
        loadedOrders.forEach((o) => {
          knownOrderIds.current.add(o.id);
          alertedOrderIds.current.add(o.id);
        });
        isInitialFetch.current = false;
      } else if (isAdminMode) {
        loadedOrders.forEach((o) => {
          if (!knownOrderIds.current.has(o.id) && !alertedOrderIds.current.has(o.id) && o.status === 'Pending') {
            knownOrderIds.current.add(o.id);
            alertedOrderIds.current.add(o.id);
            triggerNewOrderAlert({
              roomNumber: o.address.roomNumber,
              totalAmount: o.totalAmount,
              orderNumber: o.orderNumber,
            });
          }
        });
      }

      setOrders(loadedOrders);
      setIsLoading(false);
      setFirestoreError(null);
    } catch (err: any) {
      console.error('Unexpected failure fetching Supabase orders:', err);
      setFirestoreError(err?.message || 'Failed to connect to Supabase database.');
      setIsLoading(false);
    }
  }, [isAdminMode]);

  // Global subscription for Admin Dashboard
  useEffect(() => {
    fetchOrders();

    const channel = supabase
      .channel('orders-admin-global')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload: any) => {
          // Trigger audio & push notification ONLY if in Admin mode
          if (payload?.eventType === 'INSERT' && payload.new) {
            const row = payload.new;
            const rowId = String(row.id || '');
            if (rowId && !alertedOrderIds.current.has(rowId)) {
              alertedOrderIds.current.add(rowId);
              knownOrderIds.current.add(rowId);
              const p = row.data && typeof row.data === 'object' ? row.data : row;
              if (isAdminMode && !p.isStoreSettings && p.type !== 'store_status') {
                const roomNumber = p.roomNumber || p.room_number || p.address?.roomNumber || 'Unknown Room';
                const totalAmount = p.totalAmount ?? 0;
                const orderNumber = p.orderNumber || (rowId ? `ALM-${rowId}` : undefined);
                triggerNewOrderAlert({ roomNumber, totalAmount, orderNumber });
              }
            }
          }
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchOrders, isAdminMode]);

  // Keep activeTrackingOrder synced if updated in orders list
  useEffect(() => {
    if (activeTrackingOrder) {
      const current = orders.find(
        (o) => o.id === activeTrackingOrder.id || o.orderNumber === activeTrackingOrder.orderNumber
      );
      if (current && (current.status !== activeTrackingOrder.status || current.payment.isPaid !== activeTrackingOrder.payment.isPaid)) {
        setActiveTrackingOrder(current);
      }
    }
  }, [orders, activeTrackingOrder]);

  // Status updates by Admin runner
  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    const existing = orders.find((o) => o.id === orderId) || (activeCustomerOrder?.id === orderId ? activeCustomerOrder : null);
    if (!existing) return;

    const now = new Date();
    const nowStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    let title = `Status: ${newStatus}`;
    let description = `Order status updated to ${newStatus}`;

    if (newStatus === 'Out for Delivery') {
      title = 'Runner Out for Room Delivery';
      description = `${existing.runner.name} is heading to ${existing.address.block}, ${existing.address.floor} Room #${existing.address.roomNumber}.`;
      soundFx.playChime();
    } else if (newStatus === 'Delivered') {
      title = 'Delivered to Room Door';
      description = `Package successfully handed over at ${existing.address.block} Room #${existing.address.roomNumber}. Enjoy your midnight meal!`;
      soundFx.playSuccess();
    }

    const newUpdate = {
      status: newStatus,
      title,
      description,
      timestamp: nowStr,
    };

    const newEstimatedMinutes = newStatus === 'Delivered' ? 0 : newStatus === 'Out for Delivery' ? 5 : 12;

    const updatedPayload = {
      ...existing,
      status: newStatus,
      estimatedMinutes: newEstimatedMinutes,
      statusUpdates: [newUpdate, ...existing.statusUpdates],
    };

    try {
      const { error } = await supabase
        .from('orders')
        .update({ data: updatedPayload })
        .eq('id', orderId);

      if (error) {
        throw new Error(error.message);
      }

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? (updatedPayload as Order) : o))
      );
      if (activeCustomerOrder?.id === orderId) {
        setActiveCustomerOrder(updatedPayload as Order);
      }
      if (activeTrackingOrder?.id === orderId) {
        setActiveTrackingOrder(updatedPayload as Order);
      }
      setFirestoreError(null);
    } catch (err: any) {
      console.error('Failed to update order status in Supabase:', err);
      const errMsg = err?.message || 'Failed to update order status.';
      setFirestoreError(`Supabase Update Error (Order #${existing.orderNumber}): ${errMsg}`);
      throw err;
    }
  };

  const toggleOrderPaidStatus = async (orderId: string, isPaid: boolean) => {
    const existing = orders.find((o) => o.id === orderId) || (activeCustomerOrder?.id === orderId ? activeCustomerOrder : null);
    if (!existing) return;

    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const updateItem = {
      status: existing.status,
      title: isPaid ? 'Payment Verified by Admin' : 'Payment Status: Unverified',
      description: isPaid
        ? `Admin verified incoming UPI payment for ₹${existing.totalAmount}. Order marked Paid.`
        : `Payment status updated to Unverified / Pending.`,
      timestamp: nowStr,
    };

    if (isPaid) {
      soundFx.playSuccess();
    } else {
      soundFx.playTap();
    }

    const updatedPayload = {
      ...existing,
      payment: {
        ...existing.payment,
        isPaid,
      },
      statusUpdates: [updateItem, ...existing.statusUpdates],
    };

    try {
      const { error } = await supabase
        .from('orders')
        .update({ data: updatedPayload })
        .eq('id', orderId);

      if (error) {
        throw new Error(error.message);
      }

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? (updatedPayload as Order) : o))
      );
      if (activeCustomerOrder?.id === orderId) {
        setActiveCustomerOrder(updatedPayload as Order);
      }
      if (activeTrackingOrder?.id === orderId) {
        setActiveTrackingOrder(updatedPayload as Order);
      }
      setFirestoreError(null);
    } catch (err: any) {
      console.error('Failed to toggle paid status in Supabase:', err);
      const errMsg = err?.message || 'Failed to update payment status.';
      setFirestoreError(`Supabase Payment Update Error: ${errMsg}`);
      throw err;
    }
  };

  // Create order & save active order ID to localStorage
  const createOrder = async (
    items: CartItem[], 
    address: HostelAddress, 
    payment: PaymentDetails
  ): Promise<Order> => {
    const subtotal = items.reduce((acc, curr) => acc + curr.item.price * curr.quantity, 0);
    const orderNumber = `ALM-${Math.floor(1000 + Math.random() * 9000)}`;
    
    let randomPin: string;
    try {
      const cryptoArray = new Uint32Array(1);
      window.crypto.getRandomValues(cryptoArray);
      randomPin = (1000 + (cryptoArray[0] % 9000)).toString();
    } catch {
      randomPin = Math.floor(1000 + Math.random() * 9000).toString();
    }

    const runner = RUNNERS[Math.floor(Math.random() * RUNNERS.length)];
    const now = new Date();
    const nowStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const paymentMode: 'Cash on Delivery' | 'UPI on Delivery' = 
      (payment.method === 'UPI on Delivery' || payment.method === 'ONLINE_UPI' || payment.paymentMode === 'UPI on Delivery')
        ? 'UPI on Delivery'
        : 'Cash on Delivery';

    const cleanPayment: PaymentDetails = {
      method: paymentMode,
      paymentMode,
      transactionId: null,
      upiApp: null,
      isPaid: Boolean(payment.isPaid),
    };

    const cleanAddress: HostelAddress = {
      studentName: address.studentName?.trim() || '',
      whatsappNumber: address.whatsappNumber?.trim() || '',
      phone: address.phone?.trim() || address.whatsappNumber?.trim() || '',
      block: address.block || 'Block A',
      floor: address.floor || 'Ground Floor',
      roomNumber: address.roomNumber?.trim() || '',
      deliveryInstructions: address.deliveryInstructions?.trim() || '',
    };

    const initialUpdate = {
      status: 'Pending' as OrderStatus,
      title: 'Order Placed (Pending)',
      description: `Order received at Allama Pantry Hub for Room #${cleanAddress.roomNumber} (${cleanAddress.block}). Awaiting runner dispatch.`,
      timestamp: nowStr,
    };

    const orderPayload = {
      customerName: cleanAddress.studentName,
      whatsapp: cleanAddress.whatsappNumber,
      contact: cleanAddress.whatsappNumber,
      whatsappNumber: cleanAddress.whatsappNumber,
      hostelBlock: cleanAddress.block,
      block: cleanAddress.block,
      floor: cleanAddress.floor,
      roomNumber: cleanAddress.roomNumber,
      deliveryNote: cleanAddress.deliveryInstructions,
      deliveryInstructions: cleanAddress.deliveryInstructions,
      paymentMode: cleanPayment.method,
      payment: cleanPayment,
      itemsList: items,
      items: items,
      totalAmount: subtotal,
      subtotal,
      deliveryFee: 0,
      status: 'Pending' as OrderStatus,
      timestamp: now.toISOString(),
      createdAt: now.toISOString(),
      orderNumber,
      deliveryCode: randomPin,
      estimatedMinutes: 12,
      estimatedDeliveryTime: new Date(Date.now() + 12 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      runner,
      statusUpdates: [initialUpdate],
      address: cleanAddress,
    };

    try {
      const { data, error } = await supabase
        .from('orders')
        .insert([{ data: orderPayload }])
        .select();

      if (error) {
        console.error('Supabase order insert error:', error);
        const errMsg = error.message || 'Failed to insert order into Supabase.';
        const detailedError = `Supabase Order Placement Error: ${errMsg}`;
        setFirestoreError(detailedError);
        throw new Error(detailedError);
      }

      const assignedId = data?.[0]?.id ? String(data[0].id) : `ord_${Date.now()}`;

      const newOrder: Order = {
        id: assignedId,
        orderNumber,
        createdAt: now.toISOString(),
        items: [...items],
        subtotal,
        deliveryFee: 0,
        totalAmount: subtotal,
        address: cleanAddress,
        payment: cleanPayment,
        status: 'Pending',
        deliveryCode: randomPin,
        estimatedMinutes: 12,
        estimatedDeliveryTime: new Date(Date.now() + 12 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        runner: { ...runner },
        statusUpdates: [initialUpdate],
      };

      // 1. Save Active Order ID Locally for customer privacy
      try {
        localStorage.setItem(ACTIVE_ORDER_STORAGE_KEY, assignedId);
      } catch (err) {
        console.error('Could not save active order ID to localStorage:', err);
      }

      setActiveOrderId(assignedId);
      setActiveCustomerOrder(newOrder);
      setActiveTrackingOrder(newOrder);

      setOrders((prev) => [newOrder, ...prev.filter((o) => o.id !== assignedId)]);
      setFirestoreError(null);
      soundFx.playSuccess();
      return newOrder;
    } catch (err: any) {
      console.error('Supabase write failure on placeOrder:', err);
      throw err;
    }
  };

  const deleteOrder = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId);

      if (error) {
        throw new Error(error.message);
      }

      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      if (activeOrderId === orderId) {
        clearActiveOrder();
      }
      setFirestoreError(null);
    } catch (err: any) {
      console.error('Failed to delete order in Supabase:', err);
      const errMsg = err?.message || 'Failed to delete order.';
      setFirestoreError(`Supabase Delete Error: ${errMsg}`);
      throw err;
    }
  };

  const resetDemoOrders = () => {
    fetchOrders();
  };

  return (
    <OrderContext.Provider
      value={{
        activeOrderId,
        activeCustomerOrder,
        clearActiveOrder,
        openCustomerOrderTracker,
        activeTrackingOrder,
        setActiveTrackingOrder,
        orders,
        isAdminMode,
        setIsAdminMode,
        isLoading,
        firestoreError,
        clearFirestoreError,
        createOrder,
        updateOrderStatus,
        toggleOrderPaidStatus,
        deleteOrder,
        resetDemoOrders,
        refreshOrders: fetchOrders,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
};
