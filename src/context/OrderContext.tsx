import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase';
import { Order, OrderStatus, HostelAddress, CartItem, PaymentDetails, DeliveryRunner } from '../types';
import { soundFx } from '../utils/sound';

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
  firestoreError: string | null;
  clearFirestoreError: () => void;
  activeTrackingOrder: Order | null;
  setActiveTrackingOrder: (order: Order | null) => void;
  createOrder: (items: CartItem[], address: HostelAddress, payment: PaymentDetails) => Promise<Order>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  toggleOrderPaidStatus: (orderId: string, isPaid: boolean) => Promise<void>;
  deleteOrder: (orderId: string) => Promise<void>;
  resetDemoOrders: () => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [firestoreError, setFirestoreError] = useState<string | null>(null);
  const [activeTrackingOrder, setActiveTrackingOrder] = useState<Order | null>(null);

  const clearFirestoreError = () => {
    setFirestoreError(null);
  };

  // Real-time Firestore sync on 'orders' collection
  useEffect(() => {
    // Purge any residual legacy localStorage cache
    try {
      localStorage.removeItem('allama_orders_v2');
      localStorage.removeItem('allama_user_orders_v3');
      localStorage.removeItem('allama_orders');
    } catch {
      // Ignore
    }

    const ordersCol = collection(db, 'orders');
    // Listen to all orders in Firestore, ordered by createdAt descending
    const q = query(ordersCol, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const loadedOrders: Order[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          loadedOrders.push({
            id: docSnap.id,
            orderNumber: data.orderNumber || docSnap.id,
            createdAt: data.createdAt || new Date().toISOString(),
            items: data.items || [],
            subtotal: data.subtotal || data.totalAmount || 0,
            deliveryFee: 0,
            totalAmount: data.totalAmount || 0,
            address: data.address || {
              studentName: data.studentName || data.customerName || '',
              whatsappNumber: data.whatsappNumber || '',
              block: data.block || 'Block A',
              floor: data.floor || 'Ground Floor',
              roomNumber: data.roomNumber || '',
              deliveryInstructions: data.deliveryInstructions || '',
            },
            payment: data.payment || {
              method: 'COD',
              isPaid: false,
            },
            status: data.status || 'Pending',
            deliveryCode: data.deliveryCode || '0000',
            estimatedMinutes: data.estimatedMinutes ?? (data.status === 'Delivered' ? 0 : 12),
            estimatedDeliveryTime: data.estimatedDeliveryTime || '',
            runner: data.runner || RUNNERS[0],
            statusUpdates: data.statusUpdates || [],
          } as Order);
        });

        setOrders(loadedOrders);
        setIsLoading(false);
        // Clear previous listener error if successfully synced
        setFirestoreError(null);
      },
      (error) => {
        console.error('Firestore listener error (reading orders):', error);
        const errMsg = error?.message || error?.code || 'Permission or connection error reading Firestore collection "orders".';
        setFirestoreError(`Firestore Read Error: ${errMsg}`);
        setIsLoading(false);
        // CRITICAL: Do NOT fall back to localStorage. Only Firestore is used.
      }
    );

    return () => unsubscribe();
  }, []);

  // Keep activeTrackingOrder in sync with real-time updates
  useEffect(() => {
    if (activeTrackingOrder) {
      const current = orders.find((o) => o.id === activeTrackingOrder.id);
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

    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, {
        status: newStatus,
        estimatedMinutes: newEstimatedMinutes,
        statusUpdates: [newUpdate, ...existing.statusUpdates],
      });
      setFirestoreError(null);
    } catch (err: any) {
      console.error('Failed to update order status in Firestore:', err);
      const errMsg = err?.message || err?.code || 'Permission or network failure updating order.';
      setFirestoreError(`Firestore Update Error (Order #${existing.orderNumber}): ${errMsg}`);
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

    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, {
        'payment.isPaid': isPaid,
        statusUpdates: [updateItem, ...existing.statusUpdates],
      });
      setFirestoreError(null);
    } catch (err: any) {
      console.error('Failed to toggle paid status in Firestore:', err);
      const errMsg = err?.message || err?.code || 'Failed to update payment status.';
      setFirestoreError(`Firestore Payment Update Error: ${errMsg}`);
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
    const orderDocId = 'ord_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);

    const newOrder: Order = {
      id: orderDocId,
      orderNumber,
      createdAt: now.toISOString(),
      items: [...items],
      subtotal,
      deliveryFee: 0,
      totalAmount: subtotal,
      address: { ...address },
      payment: { ...payment },
      status: 'Pending',
      deliveryCode: randomPin,
      estimatedMinutes: 12,
      estimatedDeliveryTime: new Date(Date.now() + 12 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      runner: { ...runner },
      statusUpdates: [
        {
          status: 'Pending',
          title: 'Order Placed (Pending)',
          description: `Order received at Allama Pantry Hub for Room #${address.roomNumber} (${address.block}). Awaiting runner dispatch.`,
          timestamp: nowStr,
        }
      ]
    };

    // Save directly to shared Firestore 'orders' collection. NO fallback to localStorage.
    try {
      const orderRef = doc(db, 'orders', orderDocId);
      await setDoc(orderRef, {
        orderNumber: newOrder.orderNumber,
        createdAt: newOrder.createdAt,
        items: newOrder.items,
        subtotal: newOrder.subtotal,
        deliveryFee: newOrder.deliveryFee,
        totalAmount: newOrder.totalAmount,
        customerName: newOrder.address.studentName,
        roomNumber: newOrder.address.roomNumber,
        address: newOrder.address,
        payment: newOrder.payment,
        status: 'Pending',
        deliveryCode: newOrder.deliveryCode,
        estimatedMinutes: newOrder.estimatedMinutes,
        estimatedDeliveryTime: newOrder.estimatedDeliveryTime,
        runner: newOrder.runner,
        statusUpdates: newOrder.statusUpdates,
        serverCreatedAt: serverTimestamp(),
      });

      // Clear any prior error
      setFirestoreError(null);
    } catch (err: any) {
      console.error('Firestore write failure on placeOrder:', err);
      const errMsg = err?.message || err?.code || 'Failed to connect or save to Firestore database.';
      const detailedError = `Firestore Order Placement Error: ${errMsg}`;
      setFirestoreError(detailedError);
      // Re-throw error so checkout UI knows placing failed and displays the diagnostic
      throw new Error(detailedError);
    }

    soundFx.playSuccess();
    return newOrder;
  };

  const deleteOrder = async (orderId: string) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      await deleteDoc(orderRef);
      setFirestoreError(null);
    } catch (err: any) {
      console.error('Failed to delete order from Firestore:', err);
      const errMsg = err?.message || err?.code || 'Failed to delete order document.';
      setFirestoreError(`Firestore Delete Error: ${errMsg}`);
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
