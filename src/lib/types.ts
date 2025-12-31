export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: string;
  restaurant: {
    id: string;
    name: string;
    email: string;
    phone: string;
    createdAt: string;
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
  status: "NEW" | "PREPARING" | "READY" | "DELIVERED";
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
  sender: "customer" | "server";
  timestamp: string;
  status: "sent" | "delivered" | "read";
  messageType?: string;
  whatsappMessageId?: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  priceReal: number;
  priceCurrent: number;
  category: string;
  image?: string;
  available: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface OrderItemDetail {
  id: string;
  menuItemId: string;
  quantity: number;
  price: number;
  notes?: string;
  name: string;
  menuItem?: MenuItem;
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  items: OrderItemDetail[];
  total: number;
  status: "NEW" | "PREPARING" | "READY" | "DELIVERED";
  createdAt: string;
  updatedAt: string;
  deliveryAddress?: string;
}

export interface Promotion {
  id: string;
  menuItemId: string;
  priceCurrent: number;
  validFrom: string;
  validUntil: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
  menuItem?: MenuItem;
}
