# API Documentation - Sistema de Gestão de Restaurantes

## Base URL
```
https://your-api-domain.com/api/v1
```

## Autenticação

Todas as requisições (exceto login/registro) devem incluir o header:
```
Authorization: Bearer {token}
X-Tenant-ID: {restaurant_id}
```

### POST /auth/login
Login de usuário

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "Nome do Usuário",
    "restaurantId": "restaurant_id",
    "role": "admin"
  }
}
```

### POST /auth/register
Registro de novo restaurante

**Request:**
```json
{
  "restaurantName": "Restaurante Exemplo",
  "email": "admin@example.com",
  "password": "password123",
  "phone": "+5511999999999"
}
```

---

## Dashboard

### GET /dashboard/stats
Retorna estatísticas do dashboard

**Response:**
```json
{
  "todayOrders": 28,
  "todayRevenue": 1847.50,
  "activeOrders": 12,
  "activeConversations": 8,
  "ordersInProgress": 5,
  "ordersReady": 3
}
```

### GET /dashboard/revenue
Retorna dados de faturamento para gráficos

**Query params:**
- `period`: "daily" | "weekly" | "monthly"
- `startDate`: ISO date string
- `endDate`: ISO date string

**Response:**
```json
{
  "data": [
    { "date": "2024-01-01", "revenue": 850.00 },
    { "date": "2024-01-02", "revenue": 1200.00 }
  ]
}
```

---

## Pedidos (Orders)

### GET /orders
Lista todos os pedidos

**Query params:**
- `status`: "new" | "preparing" | "ready" | "delivered" (opcional)
- `date`: ISO date string (opcional)

**Response:**
```json
{
  "orders": [
    {
      "id": "order_id",
      "customerName": "João Silva",
      "customerPhone": "+5511999999999",
      "items": [
        {
          "id": "item_id",
          "name": "Pizza Margherita",
          "quantity": 1,
          "price": 45.00,
          "notes": "Sem cebola"
        }
      ],
      "total": 57.00,
      "status": "new",
      "createdAt": "2024-01-01T10:00:00Z",
      "updatedAt": "2024-01-01T10:00:00Z"
    }
  ]
}
```

### PATCH /orders/:id/status
Atualiza o status de um pedido

**Request:**
```json
{
  "status": "preparing"
}
```

**Response:**
```json
{
  "success": true,
  "order": { /* objeto do pedido atualizado */ },
  "whatsappSent": true
}
```

**Nota:** Ao atualizar o status, o backend deve disparar uma mensagem via WhatsApp para o cliente informando a mudança.

---

## Conversas (WhatsApp)

### GET /conversations
Lista todas as conversas

**Query params:**
- `status`: "active" | "closed" (opcional)

**Response:**
```json
{
  "conversations": [
    {
      "id": "conversation_id",
      "customerName": "João Silva",
      "customerPhone": "+5511999999999",
      "lastMessage": "Obrigado! Aguardando o pedido.",
      "lastMessageTime": "2024-01-01T10:30:00Z",
      "unreadCount": 0,
      "status": "active"
    }
  ]
}
```

### GET /conversations/:id/messages
Lista mensagens de uma conversa

**Response:**
```json
{
  "messages": [
    {
      "id": "message_id",
      "conversationId": "conversation_id",
      "text": "Olá! Gostaria de fazer um pedido.",
      "sender": "customer",
      "timestamp": "2024-01-01T10:25:00Z",
      "status": "read"
    }
  ]
}
```

### POST /conversations/:id/messages
Envia uma mensagem para o cliente

**Request:**
```json
{
  "text": "Seu pedido está pronto para retirada!"
}
```

**Response:**
```json
{
  "success": true,
  "message": { /* objeto da mensagem */ }
}
```

---

## Cardápio (Menu)

### GET /menu
Lista todos os itens do cardápio

**Query params:**
- `category`: string (opcional)
- `available`: boolean (opcional)

**Response:**
```json
{
  "items": [
    {
      "id": "item_id",
      "name": "Pizza Margherita",
      "description": "Molho de tomate, muçarela, manjericão",
      "price": 45.00,
      "category": "Pizzas",
      "image": "https://...",
      "available": true
    }
  ]
}
```

### GET /menu/categories
Lista todas as categorias

**Response:**
```json
{
  "categories": ["Pizzas", "Hambúrgueres", "Saladas", "Bebidas"]
}
```

### POST /menu
Cria um novo item no cardápio

**Request:**
```json
{
  "name": "Pizza Margherita",
  "description": "Molho de tomate, muçarela, manjericão",
  "price": 45.00,
  "category": "Pizzas",
  "image": "base64_or_url",
  "available": true
}
```

### PUT /menu/:id
Atualiza um item do cardápio

**Request:**
```json
{
  "name": "Pizza Margherita",
  "price": 48.00,
  "available": true
}
```

### DELETE /menu/:id
Remove um item do cardápio

---

## Promoções

### GET /promotions
Lista todas as promoções

**Query params:**
- `active`: boolean (opcional)

**Response:**
```json
{
  "promotions": [
    {
      "id": "promotion_id",
      "name": "Pizza + Refri",
      "description": "20% de desconto no refrigerante",
      "discount": 20,
      "discountType": "percentage",
      "validFrom": "2024-01-01T00:00:00Z",
      "validUntil": "2024-01-31T23:59:59Z",
      "active": true
    }
  ]
}
```

### POST /promotions
Cria uma nova promoção

**Request:**
```json
{
  "name": "Pizza + Refri",
  "description": "20% de desconto no refrigerante",
  "discount": 20,
  "discountType": "percentage",
  "validFrom": "2024-01-01T00:00:00Z",
  "validUntil": "2024-01-31T23:59:59Z",
  "active": true
}
```

### PUT /promotions/:id
Atualiza uma promoção

### DELETE /promotions/:id
Remove uma promoção

### PATCH /promotions/:id/toggle
Ativa/desativa uma promoção

**Request:**
```json
{
  "active": false
}
```

---

## Financeiro

### GET /financial/summary
Retorna resumo financeiro

**Query params:**
- `period`: "daily" | "weekly" | "monthly"
- `startDate`: ISO date string
- `endDate`: ISO date string

**Response:**
```json
{
  "totalRevenue": 15847.50,
  "totalOrders": 234,
  "averageTicket": 67.72,
  "topSellingItems": [
    {
      "itemName": "Pizza Margherita",
      "quantity": 45,
      "revenue": 2025.00
    }
  ]
}
```

---

## WebSocket Events (Realtime)

### Connection
```
ws://your-api-domain.com/ws?token={jwt_token}&tenantId={restaurant_id}
```

### Events Received

#### new_order
```json
{
  "event": "new_order",
  "data": { /* objeto do pedido */ }
}
```

#### order_updated
```json
{
  "event": "order_updated",
  "data": { /* objeto do pedido atualizado */ }
}
```

#### new_message
```json
{
  "event": "new_message",
  "data": { /* objeto da mensagem */ }
}
```

---

## Códigos de Status HTTP

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden (tenant mismatch)
- `404` - Not Found
- `500` - Internal Server Error

---

## Notas Importantes

1. **Multi-tenancy**: Todas as requisições devem incluir o `X-Tenant-ID` header para garantir isolamento de dados entre restaurantes.

2. **WhatsApp Integration**: O backend deve estar integrado com a Evolution API (ou similar) para:
   - Receber mensagens dos clientes
   - Enviar notificações de status de pedidos
   - Permitir envio manual de mensagens pelo atendente

3. **Realtime**: Implementar WebSocket para atualizações em tempo real de:
   - Novos pedidos
   - Mudanças de status
   - Novas mensagens

4. **Rate Limiting**: Implementar rate limiting apropriado para evitar abuso da API.

5. **Validação**: Todas as entradas devem ser validadas no backend.
