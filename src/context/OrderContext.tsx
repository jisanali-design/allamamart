import React, { createContext, useContext, useState, useEffect } from 'react';
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

// Default empty orders list for new sessions.
// Pre-existing mock orders (e.g. #ALM-8192) will not load on app launch.
const INITIAL_DEMO_ORDERS: Order[] = [];

interface OrderContextType {
  orders: Order[];
  activeTrackingOrder: Order | null;
  setActiveTrackingOrder: (order: Order | null) => void;
  createOrder: (items: CartItem[], address: HostelAddress, payment: PaymentDetails) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  toggleOrderPaidStatus: (orderId: string, isPaid: boolean) => void;
  deleteOrder: (orderId: string) => void;
  resetDemoOrders: () => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

const STORAGE_KEY = 'allama_user_orders_v3';

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      // Clear out any old v2 mock orders from previous versions
      localStorage.removeItem('allama_orders_v2');

      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Filter out any legacy demo orders with id starting with 'ord_demo'
          const realOrders = parsed.filter((o: Order) => !o.id?.startsWith('ord_demo'));
          return realOrders;
        }
      }
    } catch (e) {
      console.error('Failed to load orders', e);
    }
    return [];
  });

  const [activeTrackingOrder, setActiveTrackingOrder] = useState<Order | null>(null);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
    } catch (e) {
      console.error('Failed to save orders', e);
    }
  }, [orders]);

  // Keep activeTrackingOrder in sync with orders list
  useEffect(() => {
    if (activeTrackingOrder) {
      const current = orders.find((o) => o.id === activeTrackingOrder.id);
      if (current && (current.status !== activeTrackingOrder.status || current.statusUpdates.length !== activeTrackingOrder.statusUpdates.length)) {
        setActiveTrackingOrder(current);
      }
    }
  }, [orders, activeTrackingOrder]);

  const updateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setOrders((prevOrders) =>
      prevOrders.map((order) => {
        if (order.id !== orderId) return order;

        if (order.status === newStatus) return order;

        let title = '';
        let description = '';

        if (newStatus === 'Pending') {
          title = 'Order Set to Pending';
          description = 'Order is in the pantry queue awaiting packing & runner assignment.';
          soundFx.playTap();
        } else if (newStatus === 'Out for Delivery') {
          title = 'Runner Dispatched (Out for Delivery)';
          description = `Runner ${order.runner.name} is on their way to ${order.address.block} Room #${order.address.roomNumber}.`;
          soundFx.playChime();
        } else if (newStatus === 'Delivered') {
          title = 'Delivered to Room Door';
          description = `Package successfully handed over at ${order.address.block} Room #${order.address.roomNumber}. Enjoy your midnight meal!`;
          soundFx.playSuccess();
        }

        const newUpdate = {
          status: newStatus,
          title,
          description,
          timestamp: nowStr,
        };

        const updatedOrder: Order = {
          ...order,
          status: newStatus,
          statusUpdates: [newUpdate, ...order.statusUpdates],
          estimatedMinutes: newStatus === 'Delivered' ? 0 : newStatus === 'Out for Delivery' ? 5 : 12,
        };

        return updatedOrder;
      })
    );
  };

  const toggleOrderPaidStatus = (orderId: string, isPaid: boolean) => {
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setOrders((prevOrders) =>
      prevOrders.map((order) => {
        if (order.id !== orderId) return order;

        const updatedPayment = {
          ...order.payment,
          isPaid,
        };

        const updateItem = {
          status: order.status,
          title: isPaid ? 'Payment Verified by Admin' : 'Payment Status: Unverified',
          description: isPaid
            ? `Admin verified incoming UPI bank credit for ₹${order.totalAmount}. Order marked Paid.`
            : `Payment status updated to Unverified / Pending.`,
          timestamp: nowStr,
        };

        if (isPaid) {
          soundFx.playSuccess();
        } else {
          soundFx.playTap();
        }

        return {
          ...order,
          payment: updatedPayment,
          statusUpdates: [updateItem, ...order.statusUpdates],
        };
      })
    );
  };

  const createOrder = (items: CartItem[], address: HostelAddress, payment: PaymentDetails): Order => {
    const subtotal = items.reduce((acc, curr) => acc + curr.item.price * curr.quantity, 0);
    const orderNumber = `ALM-${Math.floor(1000 + Math.random() * 9000)}`;
    
    // Generate a secure, truly random 4-digit PIN (1000-9999) that is distinct for every order
    let randomPin: string;
    try {
      const cryptoArray = new Uint32Array(1);
      window.crypto.getRandomValues(cryptoArray);
      randomPin = (1000 + (cryptoArray[0] % 9000)).toString();
    } catch {
      randomPin = Math.floor(1000 + Math.random() * 9000).toString();
    }

    // Ensure it doesn't collide with the immediate previous order's pin
    if (orders.length > 0 && orders[0].deliveryCode === randomPin) {
      randomPin = ((parseInt(randomPin, 10) + 137) % 9000 + 1000).toString();
    }

    const runner = RUNNERS[Math.floor(Math.random() * RUNNERS.length)];
    const now = new Date();
    const nowStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newOrder: Order = {
      id: 'ord_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
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

    setOrders((prev) => [newOrder, ...prev]);
    soundFx.playSuccess();
    return newOrder;
  };

  const deleteOrder = (orderId: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
    if (activeTrackingOrder?.id === orderId) {
      setActiveTrackingOrder(null);
    }
  };

  const resetDemoOrders = () => {
    setOrders(INITIAL_DEMO_ORDERS);
  };

  return (
    <OrderContext.Provider
      value={{
        orders,
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
