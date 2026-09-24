export type Category = 
  | 'all'
  | 'noodles'
  | 'chips'
  | 'sweets'
  | 'drinks'
  | 'combos'
  | 'quick-bites';

export interface FoodItem {
  id: string;
  name: string;
  category: Category;
  price: number;
  originalPrice?: number;
  description: string;
  image: string;
  weight: string;
  isVeg: boolean;
  spicyLevel?: 0 | 1 | 2 | 3; // 0 none, 3 extreme
  prepTime: string; // e.g. "Ready to Eat", "Hot Water / 2 mins"
  tag?: string; // "Bestseller", "2 AM Hit", "High Energy", "Hot & Spicy", "Budget Pick"
  rating: number;
  reviewsCount: number;
  inStock: boolean;
}

export interface CartItem {
  item: FoodItem;
  quantity: number;
}

export type HostelBlock = 'Block A' | 'Block B';
export type HostelFloor = 'Ground Floor' | '1st Floor' | '2nd Floor' | '3rd Floor' | '4th Floor' | '5th Floor';

export interface HostelAddress {
  studentName: string;
  whatsappNumber: string;
  phone?: string;
  block: HostelBlock;
  floor: HostelFloor;
  roomNumber: string;
  deliveryInstructions: string;
}

export type PaymentMethod = 'COD' | 'ONLINE_UPI';

export interface PaymentDetails {
  method: PaymentMethod;
  upiApp?: 'gpay' | 'phonepe' | 'paytm' | 'bhim' | 'qr' | null;
  transactionId?: string | null;
  isPaid: boolean;
}

export type OrderStatus = 'Pending' | 'Out for Delivery' | 'Delivered';

export interface DeliveryRunner {
  name: string;
  phone: string;
  rating: number;
  deliveriesCount: number;
  avatar: string;
  currentLocationDesc: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: 0;
  totalAmount: number;
  address: HostelAddress;
  payment: PaymentDetails;
  status: OrderStatus;
  deliveryCode: string; // 4-digit verification code to show runner
  estimatedMinutes: number;
  estimatedDeliveryTime: string;
  runner: DeliveryRunner;
  statusUpdates: {
    status: OrderStatus;
    title: string;
    description: string;
    timestamp: string;
  }[];
}
