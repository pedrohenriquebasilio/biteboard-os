export interface LoginResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    restaurantId: string;
  };
}

export interface DashboardStats {
  todayOrders: number;
  todayRevenue: number;
  activeOrders: number;
  activeConversations: number;
  ordersInProgress: number;
  ordersReady: number;
}

export interface RevenueData {
  date: string;
  revenue: number;
}

export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  items: OrderItem[];
  total: number;
  status: "new" | "preparing" | "ready" | "delivered";
  createdAt: Date;
  updatedAt: Date;
  deliveryAddress?: string;
}

export interface Conversation {
  id: string;
  customerName: string;
  customerPhone: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  status: "active" | "closed";
}

export interface Message {
  id: string;
  conversationId: string;
  text: string;
  sender: "customer" | "restaurant";
  timestamp: Date;
  status: "sent" | "delivered" | "read";
}

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  available: boolean;
  imageUrl?: string;
}

export interface Promotion {
  id: string;
  name: string;
  description?: string;
  discount: number;
  discountType: "percentage" | "fixed";
  validFrom: Date;
  validUntil: Date;
  active: boolean;
}
