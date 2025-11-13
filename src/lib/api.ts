/**
 * API Integration Layer
 * 
 * Este arquivo contém todas as funções para integração com o backend.
 * Todas as requisições incluem autenticação JWT e tenant ID.
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
  const fullUrl = `${API_BASE_URL}${endpoint}`;
  console.log('🔵 [API Request] Starting request to:', fullUrl);
  console.log('🔵 [API Request] Method:', options?.method || 'GET');
  console.log('🔵 [API Request] Body:', options?.body);
  
  try {
    const token = localStorage.getItem('auth_token');
    const tenantId = localStorage.getItem('tenant_id');

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...(tenantId && { 'X-Tenant-ID': tenantId }),
      ...options?.headers,
    };

    console.log('🔵 [API Request] Headers:', headers);

    const response = await fetch(fullUrl, {
      ...options,
      headers,
    });

    console.log('🟢 [API Response] Status:', response.status, response.statusText);
    
    const contentType = response.headers.get('content-type');
    console.log('🟢 [API Response] Content-Type:', contentType);
    
    let data;
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
      console.log('🟢 [API Response] Data:', data);
    } else {
      const text = await response.text();
      console.log('🟢 [API Response] Text:', text);
      data = { message: text };
    }

    if (!response.ok) {
      const errorMessage = data.error || data.message || 'Erro na requisição';
      console.error('🔴 [API Error] Response not OK:', errorMessage);
      throw new Error(errorMessage);
    }

    return { data };
  } catch (error) {
    console.error('🔴 [API Error] Exception caught:', error);
    console.error('🔴 [API Error] Error details:', {
      message: error instanceof Error ? error.message : 'Erro desconhecido',
      name: error instanceof Error ? error.name : 'Unknown',
      stack: error instanceof Error ? error.stack : undefined
    });
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return { 
        error: `Erro de conexão: Não foi possível conectar ao servidor em ${API_BASE_URL}. Verifique se o backend está rodando.` 
      };
    }
    
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
  name: string;
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
  startDate?: string;
  endDate?: string;
}) {
  const queryParams = new URLSearchParams(
    Object.entries(params).filter(([_, v]) => v !== undefined) as [string, string][]
  ).toString();
  return apiRequest(`/dashboard/revenue?${queryParams}`);
}

// ============= ORDERS =============

export async function getOrders(filters?: {
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  customerPhone?: string;
}) {
  const queryParams = filters 
    ? new URLSearchParams(Object.entries(filters).filter(([_, v]) => v !== undefined) as [string, string][]).toString() 
    : '';
  return apiRequest(`/orders${queryParams ? `?${queryParams}` : ''}`);
}

export async function updateOrderStatus(orderId: string, status: string) {
  return apiRequest(`/orders/${orderId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

// ============= CONVERSATIONS =============

export async function getConversations(params?: {
  status?: 'active' | 'closed';
  page?: number;
  limit?: number;
}) {
  const queryParams = params 
    ? new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)])).toString()
    : '';
  return apiRequest(`/conversations${queryParams ? `?${queryParams}` : ''}`);
}

export async function getConversationMessages(phone: string, params?: {
  limit?: number;
  before?: string;
  after?: string;
}) {
  const queryParams = params 
    ? new URLSearchParams(Object.entries(params).filter(([_, v]) => v !== undefined).map(([k, v]) => [k, String(v)])).toString()
    : '';
  return apiRequest(`/conversations/${encodeURIComponent(phone)}/messages${queryParams ? `?${queryParams}` : ''}`);
}

export async function sendMessage(phone: string, text: string) {
  return apiRequest(`/conversations/${encodeURIComponent(phone)}/messages`, {
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
  startDate?: string;
  endDate?: string;
}) {
  const queryParams = new URLSearchParams(
    Object.entries(params).filter(([_, v]) => v !== undefined) as [string, string][]
  ).toString();
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
