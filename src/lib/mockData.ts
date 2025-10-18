export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  items: OrderItem[];
  total: number;
  status: 'new' | 'preparing' | 'ready' | 'delivered';
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  notes?: string;
}

export interface Conversation {
  id: string;
  customerName: string;
  customerPhone: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  status: 'active' | 'closed';
}

export interface Message {
  id: string;
  conversationId: string;
  text: string;
  sender: 'customer' | 'restaurant';
  timestamp: Date;
  status: 'sent' | 'delivered' | 'read';
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
  available: boolean;
}

export interface Promotion {
  id: string;
  name: string;
  description: string;
  discount: number;
  discountType: 'percentage' | 'fixed';
  validFrom: Date;
  validUntil: Date;
  active: boolean;
}

export interface DashboardStats {
  todayOrders: number;
  todayRevenue: number;
  activeOrders: number;
  activeConversations: number;
  ordersInProgress: number;
  ordersReady: number;
}

// Mock Data
export const mockOrders: Order[] = [
  {
    id: '1',
    customerName: 'João Silva',
    customerPhone: '+5511999999999',
    items: [
      { id: '1', name: 'Pizza Margherita', quantity: 1, price: 45.00 },
      { id: '2', name: 'Refrigerante 2L', quantity: 1, price: 12.00 }
    ],
    total: 57.00,
    status: 'new',
    createdAt: new Date(Date.now() - 5 * 60000),
    updatedAt: new Date(Date.now() - 5 * 60000)
  },
  {
    id: '2',
    customerName: 'Maria Santos',
    customerPhone: '+5511988888888',
    items: [
      { id: '3', name: 'Hambúrguer Clássico', quantity: 2, price: 35.00 },
      { id: '4', name: 'Batata Frita Grande', quantity: 1, price: 18.00 }
    ],
    total: 88.00,
    status: 'preparing',
    createdAt: new Date(Date.now() - 15 * 60000),
    updatedAt: new Date(Date.now() - 10 * 60000)
  },
  {
    id: '3',
    customerName: 'Pedro Oliveira',
    customerPhone: '+5511977777777',
    items: [
      { id: '5', name: 'Salada Caesar', quantity: 1, price: 28.00 }
    ],
    total: 28.00,
    status: 'ready',
    createdAt: new Date(Date.now() - 25 * 60000),
    updatedAt: new Date(Date.now() - 2 * 60000)
  },
  {
    id: '4',
    customerName: 'Ana Costa',
    customerPhone: '+5511966666666',
    items: [
      { id: '6', name: 'Sushi Combinado', quantity: 1, price: 65.00 },
      { id: '7', name: 'Suco Natural', quantity: 2, price: 15.00 }
    ],
    total: 95.00,
    status: 'preparing',
    createdAt: new Date(Date.now() - 20 * 60000),
    updatedAt: new Date(Date.now() - 18 * 60000)
  }
];

export const mockConversations: Conversation[] = [
  {
    id: '1',
    customerName: 'João Silva',
    customerPhone: '+5511999999999',
    lastMessage: 'Obrigado! Aguardando o pedido.',
    lastMessageTime: new Date(Date.now() - 5 * 60000),
    unreadCount: 0,
    status: 'active'
  },
  {
    id: '2',
    customerName: 'Maria Santos',
    customerPhone: '+5511988888888',
    lastMessage: 'Quanto tempo para ficar pronto?',
    lastMessageTime: new Date(Date.now() - 10 * 60000),
    unreadCount: 1,
    status: 'active'
  },
  {
    id: '3',
    customerName: 'Carlos Ferreira',
    customerPhone: '+5511955555555',
    lastMessage: 'Vocês fazem entrega no bairro X?',
    lastMessageTime: new Date(Date.now() - 30 * 60000),
    unreadCount: 2,
    status: 'active'
  }
];

export const mockMessages: Record<string, Message[]> = {
  '1': [
    {
      id: '1',
      conversationId: '1',
      text: 'Olá! Gostaria de fazer um pedido.',
      sender: 'customer',
      timestamp: new Date(Date.now() - 8 * 60000),
      status: 'read'
    },
    {
      id: '2',
      conversationId: '1',
      text: 'Olá! Claro, por favor me informe o que deseja.',
      sender: 'restaurant',
      timestamp: new Date(Date.now() - 7 * 60000),
      status: 'read'
    },
    {
      id: '3',
      conversationId: '1',
      text: 'Quero uma Pizza Margherita e um Refrigerante 2L.',
      sender: 'customer',
      timestamp: new Date(Date.now() - 6 * 60000),
      status: 'read'
    },
    {
      id: '4',
      conversationId: '1',
      text: 'Perfeito! Seu pedido foi registrado. Total: R$ 57,00. Tempo estimado: 40 minutos.',
      sender: 'restaurant',
      timestamp: new Date(Date.now() - 5 * 60000),
      status: 'read'
    },
    {
      id: '5',
      conversationId: '1',
      text: 'Obrigado! Aguardando o pedido.',
      sender: 'customer',
      timestamp: new Date(Date.now() - 5 * 60000),
      status: 'read'
    }
  ],
  '2': [
    {
      id: '6',
      conversationId: '2',
      text: 'Fiz um pedido há 15 minutos. Quanto tempo para ficar pronto?',
      sender: 'customer',
      timestamp: new Date(Date.now() - 10 * 60000),
      status: 'delivered'
    }
  ]
};

export const mockMenuItems: MenuItem[] = [
  {
    id: '1',
    name: 'Pizza Margherita',
    description: 'Molho de tomate, muçarela, manjericão e azeite',
    price: 45.00,
    category: 'Pizzas',
    available: true
  },
  {
    id: '2',
    name: 'Hambúrguer Clássico',
    description: 'Pão, hambúrguer 180g, queijo, alface, tomate',
    price: 35.00,
    category: 'Hambúrgueres',
    available: true
  },
  {
    id: '3',
    name: 'Salada Caesar',
    description: 'Alface romana, frango grelhado, croutons, parmesão',
    price: 28.00,
    category: 'Saladas',
    available: true
  },
  {
    id: '4',
    name: 'Sushi Combinado',
    description: '20 peças variadas de sushi e sashimi',
    price: 65.00,
    category: 'Japonês',
    available: true
  },
  {
    id: '5',
    name: 'Batata Frita Grande',
    description: 'Batatas fritas crocantes, porção grande',
    price: 18.00,
    category: 'Acompanhamentos',
    available: true
  },
  {
    id: '6',
    name: 'Refrigerante 2L',
    description: 'Refrigerante 2 litros, várias opções',
    price: 12.00,
    category: 'Bebidas',
    available: true
  },
  {
    id: '7',
    name: 'Suco Natural',
    description: 'Suco natural 500ml, várias frutas',
    price: 15.00,
    category: 'Bebidas',
    available: true
  }
];

export const mockPromotions: Promotion[] = [
  {
    id: '1',
    name: 'Pizza + Refri',
    description: 'Compre qualquer pizza grande e ganhe 20% de desconto no refrigerante',
    discount: 20,
    discountType: 'percentage',
    validFrom: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    active: true
  },
  {
    id: '2',
    name: 'Combo Família',
    description: 'R$ 15,00 de desconto em pedidos acima de R$ 100,00',
    discount: 15,
    discountType: 'fixed',
    validFrom: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    validUntil: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    active: true
  },
  {
    id: '3',
    name: 'Happy Hour',
    description: '30% de desconto em bebidas de segunda a sexta, das 17h às 19h',
    discount: 30,
    discountType: 'percentage',
    validFrom: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    active: false
  }
];

export const mockDashboardStats: DashboardStats = {
  todayOrders: 28,
  todayRevenue: 1847.50,
  activeOrders: 12,
  activeConversations: 8,
  ordersInProgress: 5,
  ordersReady: 3
};

export const mockRevenueData = [
  { date: '01/01', revenue: 850 },
  { date: '02/01', revenue: 1200 },
  { date: '03/01', revenue: 980 },
  { date: '04/01', revenue: 1450 },
  { date: '05/01', revenue: 1680 },
  { date: '06/01', revenue: 1320 },
  { date: '07/01', revenue: 1847 }
];
