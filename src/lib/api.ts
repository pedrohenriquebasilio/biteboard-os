/**
 * API Integration Layer
 * 
 * Este arquivo contém todas as funções para integração com o backend.
 * Substitua as implementações mock pelas chamadas reais à API quando o backend estiver pronto.
 * 
 * Base URL: Defina a URL base da API nas variáveis de ambiente
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

// Tipos de resposta da API
interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

// Helper para fazer requisições
async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const token = localStorage.getItem('auth_token');
    const tenantId = localStorage.getItem('tenant_id');

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...(tenantId && { 'X-Tenant-ID': tenantId }),
      ...options?.headers,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Erro na requisição');
    }

    return { data };
  } catch (error) {
    console.error('API Error:', error);
    return { error: error instanceof Error ? error.message : 'Erro desconhecido' };
  }
}

// ============= AUTH =============

export async function login(email: string, password: string) {
  return apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function register(data: {
  restaurantName: string;
  email: string;
  password: string;
  phone: string;
}) {
  return apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ============= DASHBOARD =============

export async function getDashboardStats() {
  return apiRequest('/dashboard/stats');
}

export async function getRevenueData(params: {
  period: 'daily' | 'weekly' | 'monthly';
  startDate: string;
  endDate: string;
}) {
  const queryParams = new URLSearchParams(params).toString();
  return apiRequest(`/dashboard/revenue?${queryParams}`);
}

// ============= ORDERS =============

export async function getOrders(filters?: {
  status?: string;
  date?: string;
}) {
  const queryParams = filters ? new URLSearchParams(filters).toString() : '';
  return apiRequest(`/orders${queryParams ? `?${queryParams}` : ''}`);
}

export async function updateOrderStatus(orderId: string, status: string) {
  return apiRequest(`/orders/${orderId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

// ============= CONVERSATIONS =============

export async function getConversations(status?: 'active' | 'closed') {
  const queryParams = status ? `?status=${status}` : '';
  return apiRequest(`/conversations${queryParams}`);
}

export async function getConversationMessages(conversationId: string) {
  return apiRequest(`/conversations/${conversationId}/messages`);
}

export async function sendMessage(conversationId: string, text: string) {
  return apiRequest(`/conversations/${conversationId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ text }),
  });
}

// ============= MENU =============

export async function getMenuItems(filters?: {
  category?: string;
  available?: boolean;
}) {
  const queryParams = filters ? new URLSearchParams(filters as any).toString() : '';
  return apiRequest(`/menu${queryParams ? `?${queryParams}` : ''}`);
}

export async function getMenuCategories() {
  return apiRequest('/menu/categories');
}

export async function createMenuItem(data: any) {
  return apiRequest('/menu', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateMenuItem(id: string, data: any) {
  return apiRequest(`/menu/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteMenuItem(id: string) {
  return apiRequest(`/menu/${id}`, {
    method: 'DELETE',
  });
}

// ============= PROMOTIONS =============

export async function getPromotions(active?: boolean) {
  const queryParams = active !== undefined ? `?active=${active}` : '';
  return apiRequest(`/promotions${queryParams}`);
}

export async function createPromotion(data: any) {
  return apiRequest('/promotions', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updatePromotion(id: string, data: any) {
  return apiRequest(`/promotions/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deletePromotion(id: string) {
  return apiRequest(`/promotions/${id}`, {
    method: 'DELETE',
  });
}

export async function togglePromotion(id: string, active: boolean) {
  return apiRequest(`/promotions/${id}/toggle`, {
    method: 'PATCH',
    body: JSON.stringify({ active }),
  });
}

// ============= FINANCIAL =============

export async function getFinancialSummary(params: {
  period: 'daily' | 'weekly' | 'monthly';
  startDate: string;
  endDate: string;
}) {
  const queryParams = new URLSearchParams(params).toString();
  return apiRequest(`/financial/summary?${queryParams}`);
}

// ============= WEBSOCKET =============

/**
 * Conecta ao WebSocket para receber atualizações em tempo real
 * 
 * Exemplo de uso:
 * 
 * const ws = connectWebSocket();
 * ws.onmessage = (event) => {
 *   const data = JSON.parse(event.data);
 *   if (data.event === 'new_order') {
 *     // Atualizar lista de pedidos
 *   }
 * };
 */
export function connectWebSocket() {
  const token = localStorage.getItem('auth_token');
  const tenantId = localStorage.getItem('tenant_id');
  
  const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:3000/ws';
  const ws = new WebSocket(`${wsUrl}?token=${token}&tenantId=${tenantId}`);
  
  ws.onopen = () => {
    console.log('WebSocket conectado');
  };
  
  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
  };
  
  ws.onclose = () => {
    console.log('WebSocket desconectado');
    // Reconectar após 3 segundos
    setTimeout(() => {
      connectWebSocket();
    }, 3000);
  };
  
  return ws;
}
