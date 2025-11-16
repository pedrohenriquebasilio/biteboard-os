import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const initWebSocket = () => {
  const WS_URL = import.meta.env.VITE_WS_URL;
  
  // Não conectar se a URL não estiver configurada
  if (!WS_URL || WS_URL === 'WEBSOCKET_HERE') {
    console.warn('⚠️ [WebSocket] URL não configurada. Configure VITE_WS_URL no arquivo .env');
    return null;
  }
  
  console.log('🔵 [WebSocket] Initializing connection to:', WS_URL);
  
  if (socket?.connected) {
    console.log('🟢 [WebSocket] Already connected');
    return socket;
  }

  socket = io(WS_URL, {
    transports: ['websocket'],
    autoConnect: true,
  });

  socket.on('connect', () => {
    console.log('🟢 [WebSocket] Connected successfully');
  });

  socket.on('disconnect', (reason) => {
    console.log('🔴 [WebSocket] Disconnected:', reason);
  });

  socket.on('connect_error', (error) => {
    console.error('🔴 [WebSocket] Connection error:', error);
  });

  return socket;
};

export const getSocket = () => {
  if (!socket) {
    return initWebSocket();
  }
  return socket;
};

export const disconnectWebSocket = () => {
  if (socket) {
    console.log('🔵 [WebSocket] Disconnecting...');
    socket.disconnect();
    socket = null;
  }
};

// Event listeners para mensagens
export const onNewMessage = (callback: (message: any) => void) => {
  const ws = getSocket();
  if (!ws) {
    console.warn('⚠️ [WebSocket] Não foi possível registrar listener - WebSocket não conectado');
    return;
  }
  console.log('🔵 [WebSocket] Registering listener for message:new');
  ws.on('message:new', (data) => {
    console.log('📨 [WebSocket] New message received:', data);
    callback(data);
  });
};

export const onOrderUpdate = (callback: (order: any) => void) => {
  const ws = getSocket();
  if (!ws) {
    console.warn('⚠️ [WebSocket] Não foi possível registrar listener - WebSocket não conectado');
    return;
  }
  console.log('🔵 [WebSocket] Registering listener for order_updated');
  ws.on('order_updated', (data) => {
    console.log('📦 [WebSocket] Order updated:', data);
    callback(data);
  });
};

export const onNewOrder = (callback: (order: any) => void) => {
  const ws = getSocket();
  if (!ws) {
    console.warn('⚠️ [WebSocket] Não foi possível registrar listener - WebSocket não conectado');
    return;
  }
  console.log('🔵 [WebSocket] Registering listener for new_order');
  ws.on('new_order', (data) => {
    console.log('📦 [WebSocket] New order:', data);
    callback(data);
  });
};

export const onOrderStatusChanged = (callback: (data: any) => void) => {
  const ws = getSocket();
  if (!ws) {
    console.warn('⚠️ [WebSocket] Não foi possível registrar listener - WebSocket não conectado');
    return;
  }
  console.log('🔵 [WebSocket] Registering listener for order_status_changed');
  ws.on('order_status_changed', (data) => {
    console.log('📦 [WebSocket] Order status changed:', data);
    callback(data);
  });
};

// Remove listeners
export const removeListener = (event: string) => {
  const ws = getSocket();
  if (!ws) return;
  ws.off(event);
  console.log(`🔵 [WebSocket] Removed listener for ${event}`);
};
