# Sistema de Gestão de Restaurante

Sistema completo de gestão para restaurantes com integração WhatsApp, gerenciamento de pedidos em tempo real, cardápio digital, promoções e relatórios financeiros.

## 🚀 Tecnologias Frontend

- **React 18** - Interface moderna e reativa
- **TypeScript** - Tipagem estática para maior segurança
- **Vite** - Build rápido e dev server otimizado
- **Tailwind CSS** - Estilização com design system customizado
- **shadcn/ui** - Componentes UI acessíveis e customizáveis
- **React Router** - Navegação entre páginas
- **@dnd-kit** - Drag and drop para gerenciamento de pedidos
- **Recharts** - Gráficos e visualizações de dados

## 📋 Requisitos do Backend

### Stack Recomendada

- **Node.js 18+** ou **Bun**
- **Banco de Dados**: PostgreSQL, MySQL ou MongoDB
- **WebSocket**: Socket.io ou ws
- **API REST**: Express, Fastify, Hono ou similar
- **Autenticação**: JWT (JSON Web Tokens)
- **WhatsApp API**: Evolution API ou similar

### Variáveis de Ambiente

Crie um arquivo `.env` baseado no `.env.example`:

```bash
# API Backend
VITE_API_BASE_URL=http://localhost:3000/api/v1

# WebSocket
VITE_WS_URL=ws://localhost:3000

# Evolution API (WhatsApp)
EVOLUTION_API_URL=https://sua-instancia.evolutionapi.com
EVOLUTION_API_KEY=sua-chave-api
```

## 🔌 APIs Necessárias

### 1. Autenticação

```typescript
POST   /api/v1/auth/login
POST   /api/v1/auth/logout
POST   /api/v1/auth/refresh
GET    /api/v1/auth/me
```

**Modelo de Dados - Usuario:**
```json
{
  "id": "string",
  "email": "string",
  "name": "string",
  "role": "admin | manager | staff",
  "restaurantId": "string",
  "createdAt": "timestamp"
}
```

### 2. Dashboard

```typescript
GET    /api/v1/dashboard/stats
GET    /api/v1/dashboard/revenue?period=today|week|month
```

**Resposta - Stats:**
```json
{
  "totalRevenue": 15420.00,
  "totalOrders": 127,
  "averageTicket": 121.42,
  "activeOrders": 8,
  "pendingConversations": 5
}
```

### 3. Pedidos (Orders)

```typescript
GET    /api/v1/orders
GET    /api/v1/orders/:id
POST   /api/v1/orders
PATCH  /api/v1/orders/:id/status
DELETE /api/v1/orders/:id
```

**Modelo de Dados - Order:**
```json
{
  "id": "string",
  "customerName": "string",
  "customerPhone": "string",
  "items": [
    {
      "id": "string",
      "name": "string",
      "quantity": 1,
      "price": 25.00,
      "observations": "string"
    }
  ],
  "total": 25.00,
  "status": "new | preparing | ready | delivered",
  "paymentMethod": "pix | card | cash",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

### 4. Conversas WhatsApp

```typescript
GET    /api/v1/conversations
GET    /api/v1/conversations/:id
POST   /api/v1/conversations/:id/messages
PATCH  /api/v1/conversations/:id/status
```

**Modelo de Dados - Conversation:**
```json
{
  "id": "string",
  "customerName": "string",
  "customerPhone": "string",
  "lastMessage": "string",
  "unreadCount": 0,
  "status": "active | archived",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

**Modelo de Dados - Message:**
```json
{
  "id": "string",
  "conversationId": "string",
  "content": "string",
  "sender": "customer | restaurant",
  "timestamp": "timestamp",
  "read": false
}
```

### 5. Cardápio (Menu)

```typescript
GET    /api/v1/menu/items
GET    /api/v1/menu/items/:id
POST   /api/v1/menu/items
PATCH  /api/v1/menu/items/:id
DELETE /api/v1/menu/items/:id
```

**Modelo de Dados - MenuItem:**
```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "price": 25.00,
  "category": "string",
  "image": "url",
  "available": true,
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

### 6. Promoções

```typescript
GET    /api/v1/promotions
GET    /api/v1/promotions/:id
POST   /api/v1/promotions
PATCH  /api/v1/promotions/:id
DELETE /api/v1/promotions/:id
```

**Modelo de Dados - Promotion:**
```json
{
  "id": "string",
  "title": "string",
  "description": "string",
  "discountType": "percentage | fixed",
  "discountValue": 15,
  "validFrom": "timestamp",
  "validUntil": "timestamp",
  "active": true,
  "createdAt": "timestamp"
}
```

### 7. Financeiro

```typescript
GET    /api/v1/financial/summary?period=today|week|month
GET    /api/v1/financial/revenue?period=today|week|month
GET    /api/v1/financial/top-items?limit=5
```

**Resposta - Summary:**
```json
{
  "totalRevenue": 15420.00,
  "totalOrders": 127,
  "averageTicket": 121.42,
  "topItems": [
    {
      "name": "Pizza Margherita",
      "quantity": 45,
      "revenue": 1350.00
    }
  ]
}
```

## 🔄 WebSocket Events

### Cliente → Servidor

```typescript
// Conectar ao WebSocket
socket.connect()

// Enviar mensagem
socket.emit('send_message', {
  conversationId: 'conv-123',
  content: 'Olá!',
  sender: 'restaurant'
})

// Atualizar status do pedido
socket.emit('update_order_status', {
  orderId: 'order-123',
  status: 'preparing'
})
```

### Servidor → Cliente

```typescript
// Nova mensagem recebida
socket.on('new_message', (message: Message) => {
  // Atualizar UI com nova mensagem
})

// Novo pedido criado
socket.on('new_order', (order: Order) => {
  // Adicionar pedido na lista
})

// Status do pedido atualizado
socket.on('order_updated', (order: Order) => {
  // Atualizar pedido na lista
})

// Nova conversa iniciada
socket.on('new_conversation', (conversation: Conversation) => {
  // Adicionar conversa na lista
})
```

## 📱 Integração WhatsApp - Evolution API

### Configuração

1. **Instalar Evolution API**
```bash
# Via Docker
docker run -d \
  --name evolution-api \
  -p 8080:8080 \
  -e AUTHENTICATION_API_KEY=sua-chave-segura \
  atendai/evolution-api:latest
```

2. **Criar Instância**
```bash
curl -X POST http://localhost:8080/instance/create \
  -H "apikey: sua-chave-segura" \
  -H "Content-Type: application/json" \
  -d '{
    "instanceName": "restaurante-123",
    "qrcode": true
  }'
```

3. **Conectar WhatsApp**
- Escanear QR Code gerado
- Aguardar conexão

### Webhooks Necessários

Configure os webhooks no Evolution API para:

```typescript
// Receber mensagens
POST /webhook/messages
{
  "event": "messages.upsert",
  "instance": "restaurante-123",
  "data": {
    "key": {
      "remoteJid": "5511999999999@s.whatsapp.net"
    },
    "message": {
      "conversation": "Olá, quero fazer um pedido"
    }
  }
}

// Status de envio
POST /webhook/status
{
  "event": "messages.update",
  "instance": "restaurante-123",
  "data": {
    "status": "delivered"
  }
}
```

### Enviar Mensagens via Backend

```typescript
// Enviar mensagem de texto
await fetch(`${EVOLUTION_API_URL}/message/sendText/${instanceName}`, {
  method: 'POST',
  headers: {
    'apikey': EVOLUTION_API_KEY,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    number: '5511999999999',
    text: 'Seu pedido #123 está pronto para retirada!'
  })
})

// Enviar mensagem com botões
await fetch(`${EVOLUTION_API_URL}/message/sendButtons/${instanceName}`, {
  method: 'POST',
  headers: {
    'apikey': EVOLUTION_API_KEY,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    number: '5511999999999',
    title: 'Status do Pedido',
    description: 'Seu pedido #123 está pronto!',
    buttons: [
      { buttonText: 'Ver Pedido', buttonId: 'view-123' },
      { buttonText: 'Novo Pedido', buttonId: 'new-order' }
    ]
  })
})
```

## 🗄️ Estrutura do Banco de Dados

### Tabelas Principais

```sql
-- Usuários
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL,
  restaurant_id UUID NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Pedidos
CREATE TABLE orders (
  id UUID PRIMARY KEY,
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) NOT NULL,
  payment_method VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Itens do Pedido
CREATE TABLE order_items (
  id UUID PRIMARY KEY,
  order_id UUID REFERENCES orders(id),
  menu_item_id UUID REFERENCES menu_items(id),
  name VARCHAR(255) NOT NULL,
  quantity INT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  observations TEXT
);

-- Conversas WhatsApp
CREATE TABLE conversations (
  id UUID PRIMARY KEY,
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  last_message TEXT,
  unread_count INT DEFAULT 0,
  status VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Mensagens
CREATE TABLE messages (
  id UUID PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id),
  content TEXT NOT NULL,
  sender VARCHAR(50) NOT NULL,
  timestamp TIMESTAMP DEFAULT NOW(),
  read BOOLEAN DEFAULT FALSE
);

-- Itens do Cardápio
CREATE TABLE menu_items (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category VARCHAR(100) NOT NULL,
  image VARCHAR(500),
  available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Promoções
CREATE TABLE promotions (
  id UUID PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  discount_type VARCHAR(50) NOT NULL,
  discount_value DECIMAL(10,2) NOT NULL,
  valid_from TIMESTAMP NOT NULL,
  valid_until TIMESTAMP NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 📦 Instalação e Execução

### Frontend

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas configurações

# Executar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview
```

### Exemplo de Backend (Node.js + Express)

```javascript
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

app.use(cors());
app.use(express.json());

// Rotas de autenticação
app.post('/api/v1/auth/login', async (req, res) => {
  // Implementar login
});

// Rotas de pedidos
app.get('/api/v1/orders', async (req, res) => {
  // Listar pedidos
});

app.patch('/api/v1/orders/:id/status', async (req, res) => {
  const { status } = req.body;
  
  // Atualizar status do pedido no banco
  
  // Emitir evento via WebSocket
  io.emit('order_updated', updatedOrder);
  
  res.json(updatedOrder);
});

// WebSocket
io.on('connection', (socket) => {
  console.log('Cliente conectado');
  
  socket.on('send_message', async (data) => {
    // Salvar mensagem no banco
    // Enviar via Evolution API
    // Emitir para todos os clientes
    io.emit('new_message', message);
  });
});

server.listen(3000, () => {
  console.log('Servidor rodando na porta 3000');
});
```

## 🔐 Autenticação JWT

```javascript
import jwt from 'jsonwebtoken';

// Gerar token
const token = jwt.sign(
  { 
    userId: user.id,
    restaurantId: user.restaurantId,
    role: user.role 
  },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);

// Middleware de autenticação
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido' });
  }
};

// Usar em rotas protegidas
app.get('/api/v1/orders', authMiddleware, async (req, res) => {
  // Acessar dados do usuário via req.user
});
```

## 📊 Multi-tenancy (Multi-restaurante)

O sistema está preparado para suportar múltiplos restaurantes:

```javascript
// Filtrar dados por restaurante
app.get('/api/v1/orders', authMiddleware, async (req, res) => {
  const orders = await db.orders.findMany({
    where: {
      restaurantId: req.user.restaurantId
    }
  });
  
  res.json(orders);
});

// Criar pedido vinculado ao restaurante
app.post('/api/v1/orders', authMiddleware, async (req, res) => {
  const order = await db.orders.create({
    data: {
      ...req.body,
      restaurantId: req.user.restaurantId
    }
  });
  
  res.json(order);
});
```

## 🎨 Design System

O projeto utiliza um design system completo com tokens semânticos:

- **Cores**: Primary, secondary, accent, success, warning, error
- **Tipografia**: Inter font com escala modular
- **Espaçamento**: Sistema baseado em 8px
- **Componentes**: shadcn/ui totalmente customizados
- **Dark Mode**: Suporte completo com variáveis CSS

## 📝 Documentação Adicional

- [API_README.md](./API_README.md) - Documentação completa das APIs
- [INTEGRATION.md](./INTEGRATION.md) - Guia de integração backend
- `.env.example` - Exemplo de variáveis de ambiente

## 🚀 Deploy

### Frontend (Lovable)

Acesse [Lovable](https://lovable.dev/projects/a07dc48c-c466-473f-86b0-6d31fb268fe0) e clique em Share → Publish.

### Backend (Recomendações)

- **Railway**: Deploy automático com Git
- **Render**: Free tier disponível
- **Fly.io**: Global edge deployment
- **DigitalOcean**: VPS tradicional
- **AWS/GCP**: Infraestrutura completa

## 📄 Licença

MIT
