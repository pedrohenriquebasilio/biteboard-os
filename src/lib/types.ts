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
