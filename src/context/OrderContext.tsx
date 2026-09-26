import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../supabase';
import { Order, OrderStatus, HostelAddress, CartItem, PaymentDetails, DeliveryRunner } from '../types';
import { soundFx } from '../utils/sound';
import { triggerNewOrderAlert } from '../utils/orderAlerts';

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

interface OrderContextType {
  orders: Order[];
  isLoading: boolean;
  firestoreError: string | null; // Kept as database error state for banner compatibility
  clearFirestoreError: () => void;
  activeTrackingOrder: Order | null;
  setActiveTrackingOrder: (order: Order | null) => void;
  createOrder: (items: CartItem[], address: HostelAddress, payment: PaymentDetails) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  toggleOrderPaidStatus: (orderId: string, isPaid: boolean) => Promise<void>;
  deleteOrder: (orderId: string) => Promise<void>;
  resetDemoOrders: () => void;
  refreshOrders: () => Promise<void>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [firestoreError, setFirestoreError] = useState<string | null>(null);
  const [activeTrackingOrder, setActiveTrackingOrder] = useState<Order | null>(null);

  // Track known order IDs to prevent duplicate alerts and detect new incoming orders
  const isInitialFetch = useRef(true);
  const knownOrderIds = useRef<Set<string>>(new Set());
  const alertedOrderIds = useRef<Set<string>>(new Set());

  const clearFirestoreError = () => {
    setFirestoreError(null);
  };

  // Fetch all orders directly from Supabase 'orders' table
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

      const loadedOrders: Order[] = (data || []).map((row: any) => {
        const p = row.data && typeof row.data === 'object' ? row.data : row;
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
        } as Order;
      });

      // Handle alerts for any new orders detected during fetch
      if (isInitialFetch.current) {
        loadedOrders.forEach((o) => {
          knownOrderIds.current.add(o.id);
          alertedOrderIds.current.add(o.id);
        });
        isInitialFetch.current = false;
      } else {
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
  }, []);

  // Supabase real-time sync via postgres_changes channel
  useEffect(() => {
    // Purge any old localStorage orders cache to guarantee Supabase is the sole source of truth
    try {
      localStorage.removeItem('allama_orders_v2');
      localStorage.removeItem('allama_user_orders_v3');
      localStorage.removeItem('allama_orders');
    } catch {
      // Ignore
    }

    // Initial load
    fetchOrders();

    // Subscribe to live postgres changes so orders placed from ANY device appear on the board instantly
    const channel = supabase
      .channel('orders-live')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload: any) => {
          // Instantly trigger loud audio & push notification when new order INSERT event arrives
          if (payload?.eventType === 'INSERT' && payload.new) {
            const row = payload.new;
            const rowId = String(row.id || '');
            if (rowId && !alertedOrderIds.current.has(rowId)) {
              alertedOrderIds.current.add(rowId);
              knownOrderIds.current.add(rowId);
              const p = row.data && typeof row.data === 'object' ? row.data : row;
              const roomNumber = p.roomNumber || p.room_number || p.address?.roomNumber || 'Unknown Room';
              const totalAmount = p.totalAmount ?? 0;
              const orderNumber = p.orderNumber || (rowId ? `ALM-${rowId}` : undefined);
              triggerNewOrderAlert({ roomNumber, totalAmount, orderNumber });
            }
          }
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchOrders]);

  // Keep activeTrackingOrder in sync with real-time updates
  useEffect(() => {
    if (activeTrackingOrder) {
      const current = orders.find(
        (o) => o.id === activeTrackingOrder.id || o.orderNumber === activeTrackingOrder.orderNumber
      );
      if (current) {
        if (
          current.status !== activeTrackingOrder.status ||
          current.payment?.isPaid !== activeTrackingOrder.payment?.isPaid ||
          current.statusUpdates.length !== activeTrackingOrder.statusUpdates.length
        ) {
          setActiveTrackingOrder(current);
        }
      }
    }
  }, [orders, activeTrackingOrder]);

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    const existing = orders.find((o) => o.id === orderId);
    if (!existing || existing.status === newStatus) return;

    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    let title = '';
    let description = '';

    if (newStatus === 'Pending') {
      title = 'Order Set to Pending';
      description = 'Order is in the pantry queue awaiting packing & runner assignment.';
      soundFx.playTap();
    } else if (newStatus === 'Out for Delivery') {
      title = 'Runner Dispatched (Out for Delivery)';
      description = `Runner is on their way to ${existing.address.block} Room #${existing.address.roomNumber}.`;
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
      setFirestoreError(null);
    } catch (err: any) {
      console.error('Failed to update order status in Supabase:', err);
      const errMsg = err?.message || 'Failed to update order status.';
      setFirestoreError(`Supabase Update Error (Order #${existing.orderNumber}): ${errMsg}`);
      throw err;
    }
  };

  const toggleOrderPaidStatus = async (orderId: string, isPaid: boolean) => {
    const existing = orders.find((o) => o.id === orderId);
    if (!existing) return;

    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const updateItem = {
      status: existing.status,
      title: isPaid ? 'Payment Verified by Admin' : 'Payment Status: Unverified',
      description: isPaid
        ? `Admin verified incoming UPI bank credit for ₹${existing.totalAmount}. Order marked Paid.`
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
      setFirestoreError(null);
    } catch (err: any) {
      console.error('Failed to toggle paid status in Supabase:', err);
      const errMsg = err?.message || 'Failed to update payment status.';
      setFirestoreError(`Supabase Payment Update Error: ${errMsg}`);
      throw err;
    }
  };

  const createOrder = async (
    items: CartItem[], 
    address: HostelAddress, 
    payment: PaymentDetails
  ): Promise<Order> => {
    const subtotal = items.reduce((acc, curr) => acc + curr.item.price * curr.quantity, 0);
    const orderNumber = `ALM-${Math.floor(1000 + Math.random() * 9000)}`;
    
    // Generate a secure random 4-digit PIN (1000-9999)
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

    // Clean payment details: pass paymentMode ("Cash on Delivery" or "UPI on Delivery")
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

    // Clean address fields
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

    // Build the complete orderPayload including all required fields explicitly requested:
    // customer name, whatsapp/contact, hostel block, floor, room number, delivery note, payment mode, items list, total amount, status ("Pending"), and timestamp
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

    // Insert directly into Supabase 'orders' table. NO fallback to localStorage.
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
      setFirestoreError(null);
    } catch (err: any) {
      console.error('Failed to delete order from Supabase:', err);
      const errMsg = err?.message || 'Failed to delete order document.';
      setFirestoreError(`Supabase Delete Error: ${errMsg}`);
      throw err;
    }

    if (activeTrackingOrder?.id === orderId) {
      setActiveTrackingOrder(null);
    }
  };

  const resetDemoOrders = () => {
    // Strictly no mock data or local fallback
  };

  return (
    <OrderContext.Provider
      value={{
        orders,
        isLoading,
        firestoreError,
        clearFirestoreError,
        activeTrackingOrder,
        setActiveTrackingOrder,
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
