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

const INITIAL_DEMO_ORDERS: Order[] = [
  {
    id: 'ord_demo_1',
    orderNumber: 'ALM-8192',
    createdAt: new Date(Date.now() - 14 * 60 * 1000).toISOString(),
    items: [
      {
        item: {
          id: 'noodle-maggi-masala',
          name: 'Maggi 2-Minute Masala Instant Noodles (Sealed Pack of 2)',
          category: 'noodles',
          price: 35,
          description: 'Factory-sealed dual pack.',
          image: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=800&q=80',
          weight: '140g',
          isVeg: true,
          prepTime: '2 mins',
          rating: 4.9,
          reviewsCount: 384,
          inStock: true
        },
        quantity: 2
      },
      {
        item: {
          id: 'drink-red-bull',
          name: 'Red Bull Energy Drink (Factory Sealed Chilled 250ml Can)',
          category: 'drinks',
          price: 125,
          description: 'Factory-sealed can.',
          image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=800&q=80',
          weight: '250ml',
          isVeg: true,
          prepTime: 'Chilled',
          rating: 4.9,
          reviewsCount: 540,
          inStock: true
        },
        quantity: 1
      }
    ],
    subtotal: 195,
    deliveryFee: 0,
    totalAmount: 195,
    address: {
      studentName: 'Zubair Qureshi',
      whatsappNumber: '+91 98450 11223',
      phone: '+91 98450 11223',
      block: 'Block A',
      floor: '2nd Floor',
      roomNumber: 'A-214',
      deliveryInstructions: 'Roommate sleeping, please knock softly twice.'
    },
    payment: {
      method: 'COD',
      isPaid: false
    },
    status: 'Pending',
    deliveryCode: '4821',
    estimatedMinutes: 10,
    estimatedDeliveryTime: new Date(Date.now() + 10 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    runner: RUNNERS[0],
    statusUpdates: [
      {
        status: 'Pending',
        title: 'Order Placed (Pending Dispatch)',
        description: 'Order received at Allama Pantry Hub. Awaiting packing.',
        timestamp: new Date(Date.now() - 14 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]
  },
  {
    id: 'ord_demo_2',
    orderNumber: 'ALM-6743',
    createdAt: new Date(Date.now() - 32 * 60 * 1000).toISOString(),
    items: [
      {
        item: {
          id: 'noodle-buldak-2x',
          name: 'Samyang Buldak 2x Spicy Hot Chicken Ramen',
          category: 'noodles',
          price: 135,
          description: 'Imported spicy ramen.',
          image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80',
          weight: '140g',
          isVeg: false,
          prepTime: '4 mins',
          rating: 4.8,
          reviewsCount: 242,
          inStock: true
        },
        quantity: 1
      },
      {
        item: {
          id: 'chips-lays-magic',
          name: "Lay's India's Magic Masala Potato Chips",
          category: 'chips',
          price: 40,
          description: 'Crispy potato chips.',
          image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=800&q=80',
          weight: '90g',
          isVeg: true,
          prepTime: 'Ready to eat',
          rating: 4.9,
          reviewsCount: 430,
          inStock: true
        },
        quantity: 2
      }
    ],
    subtotal: 215,
    deliveryFee: 0,
    totalAmount: 215,
    address: {
      studentName: 'Hamza Malik',
      whatsappNumber: '+91 97120 44556',
      phone: '+91 97120 44556',
      block: 'Block B',
      floor: '3rd Floor',
      roomNumber: 'B-309',
      deliveryInstructions: 'Call on WhatsApp when reached 3rd floor.'
    },
    payment: {
      method: 'ONLINE_UPI',
      upiApp: 'gpay',
      transactionId: 'UPI-774910284',
      isPaid: true
    },
    status: 'Out for Delivery',
    deliveryCode: '7294',
    estimatedMinutes: 4,
    estimatedDeliveryTime: new Date(Date.now() + 4 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    runner: RUNNERS[1],
    statusUpdates: [
      {
        status: 'Pending',
        title: 'Order Placed',
        description: 'Order received at Allama Pantry.',
        timestamp: new Date(Date.now() - 32 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      },
      {
        status: 'Out for Delivery',
        title: 'Runner Dispatched',
        description: 'Runner Farhan is climbing Block B staircase with your snacks.',
        timestamp: new Date(Date.now() - 6 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]
  },
  {
    id: 'ord_demo_3',
    orderNumber: 'ALM-4519',
    createdAt: new Date(Date.now() - 75 * 60 * 1000).toISOString(),
    items: [
      {
        item: {
          id: 'combo-all-nighter',
          name: 'The 3 AM Exam Survival Pack (100% Sealed Food Bundle)',
          category: 'combos',
          price: 199,
          description: 'Exam survival combo.',
          image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
          weight: '4-Item Bundle',
          isVeg: true,
          prepTime: 'Ready',
          rating: 5.0,
          reviewsCount: 510,
          inStock: true
        },
        quantity: 1
      }
    ],
    subtotal: 199,
    deliveryFee: 0,
    totalAmount: 199,
    address: {
      studentName: 'Rehan Siddiqui',
      whatsappNumber: '+91 99001 88776',
      phone: '+91 99001 88776',
      block: 'Block A',
      floor: '4th Floor',
      roomNumber: 'A-412',
      deliveryInstructions: 'Leave on shoe rack outside room if door is shut.'
    },
    payment: {
      method: 'COD',
      isPaid: true
    },
    status: 'Delivered',
    deliveryCode: '1934',
    estimatedMinutes: 0,
    estimatedDeliveryTime: 'Delivered',
    runner: RUNNERS[2],
    statusUpdates: [
      {
        status: 'Pending',
        title: 'Order Placed',
        description: 'Order received at Allama Pantry.',
        timestamp: new Date(Date.now() - 75 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      },
      {
        status: 'Out for Delivery',
        title: 'Dispatched to Room',
        description: 'Runner dispatched with snacks.',
        timestamp: new Date(Date.now() - 55 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      },
      {
        status: 'Delivered',
        title: 'Delivered to Room Door',
        description: 'Handed over at Room A-412. Enjoy your late-night food!',
        timestamp: new Date(Date.now() - 40 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]
  }
];

interface OrderContextType {
  orders: Order[];
  activeTrackingOrder: Order | null;
  setActiveTrackingOrder: (order: Order | null) => void;
  createOrder: (items: CartItem[], address: HostelAddress, payment: PaymentDetails) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  deleteOrder: (orderId: string) => void;
  resetDemoOrders: () => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

const STORAGE_KEY = 'allama_orders_v2';

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load orders', e);
    }
    return INITIAL_DEMO_ORDERS;
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

  const createOrder = (items: CartItem[], address: HostelAddress, payment: PaymentDetails): Order => {
    const subtotal = items.reduce((acc, curr) => acc + curr.item.price * curr.quantity, 0);
    const orderNumber = `ALM-${Math.floor(1000 + Math.random() * 9000)}`;
    const randomCode = Math.floor(1000 + Math.random() * 9000).toString();
    const runner = RUNNERS[Math.floor(Math.random() * RUNNERS.length)];
    const now = new Date();
    const nowStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newOrder: Order = {
      id: 'ord_' + Date.now(),
      orderNumber,
      createdAt: now.toISOString(),
      items: [...items],
      subtotal,
      deliveryFee: 0,
      totalAmount: subtotal,
      address: { ...address },
      payment: { ...payment },
      status: 'Pending',
      deliveryCode: randomCode,
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
    setActiveTrackingOrder(newOrder);
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
