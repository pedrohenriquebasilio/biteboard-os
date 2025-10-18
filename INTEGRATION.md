# Guia de Integração Backend

## Visão Geral

Este documento detalha como integrar o frontend com o backend. O sistema está completamente funcional com dados mockados e pronto para ser conectado à API real.

## Arquivos Importantes

- **`API_README.md`** - Especificação completa da API backend
- **`src/lib/api.ts`** - Funções de integração prontas para uso
- **`src/lib/mockData.ts`** - Dados mockados (remover após integração)
- **`.env.example`** - Template de variáveis de ambiente

## Passo a Passo da Integração

### 1. Configurar Variáveis de Ambiente

```bash
# Copie o arquivo de exemplo
cp .env.example .env

# Configure as URLs
VITE_API_BASE_URL=http://sua-api.com/api/v1
VITE_WS_URL=ws://sua-api.com/ws
```

### 2. Substituir Dados Mockados

#### Exemplo: Dashboard

**Antes (mockado):**
```typescript
import { mockDashboardStats } from "@/lib/mockData";

const stats = mockDashboardStats;
```

**Depois (API real):**
```typescript
import { getDashboardStats } from "@/lib/api";
import { useEffect, useState } from "react";

const [stats, setStats] = useState(null);

useEffect(() => {
  async function loadStats() {
    const { data, error } = await getDashboardStats();
    if (data) setStats(data);
    if (error) console.error(error);
  }
  loadStats();
}, []);
```

### 3. Implementar Autenticação Real

**Login (src/pages/Login.tsx):**

```typescript
import * as api from "@/lib/api";

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsLoading(true);

  const { data, error } = await api.login(email, password);
  
  if (data) {
    // Salvar token e tenant
    localStorage.setItem('auth_token', data.token);
    localStorage.setItem('tenant_id', data.user.restaurantId);
    
    toast({
      title: "Login realizado com sucesso!",
    });
    navigate("/dashboard");
  } else {
    toast({
      title: "Erro no login",
      description: error,
      variant: "destructive",
    });
  }
  
  setIsLoading(false);
};
```

### 4. Implementar WebSocket para Tempo Real

**Adicionar no MainLayout ou Dashboard:**

```typescript
import { connectWebSocket } from "@/lib/api";
import { useEffect } from "react";

useEffect(() => {
  const ws = connectWebSocket();
  
  ws.onmessage = (event) => {
    const { event: eventType, data } = JSON.parse(event.data);
    
    switch(eventType) {
      case 'new_order':
        // Atualizar lista de pedidos
        setOrders(prev => [data, ...prev]);
        
        // Mostrar notificação
        toast({
          title: "Novo pedido!",
          description: `Pedido de ${data.customerName}`,
        });
        break;
        
      case 'order_updated':
        // Atualizar pedido específico
        setOrders(prev => prev.map(o => 
          o.id === data.id ? data : o
        ));
        break;
        
      case 'new_message':
        // Atualizar conversa
        // ...
        break;
    }
  };
  
  return () => ws.close();
}, []);
```

### 5. Atualizar Módulo de Pedidos

**src/pages/Orders.tsx:**

```typescript
import * as api from "@/lib/api";

// Carregar pedidos
useEffect(() => {
  async function loadOrders() {
    const { data, error } = await api.getOrders();
    if (data) setOrders(data.orders);
  }
  loadOrders();
}, []);

// Atualizar status
const handleDragEnd = async (event: DragEndEvent) => {
  const { active, over } = event;
  if (!over) return;

  const orderId = active.id as string;
  const newStatus = over.id as OrderStatus;

  // Atualizar UI imediatamente (otimista)
  const updatedOrders = orders.map((o) =>
    o.id === orderId ? { ...o, status: newStatus } : o
  );
  setOrders(updatedOrders);

  // Chamar API
  const { error } = await api.updateOrderStatus(orderId, newStatus);
  
  if (error) {
    // Reverter em caso de erro
    toast({
      title: "Erro ao atualizar pedido",
      description: error,
      variant: "destructive",
    });
    // Recarregar pedidos
    loadOrders();
  } else {
    toast({
      title: "Status atualizado!",
      description: "Cliente notificado via WhatsApp.",
    });
  }
};
```

### 6. Integração com WhatsApp (Evolution API)

O backend deve configurar webhooks para receber mensagens:

```typescript
// Backend - Configuração do webhook
POST https://evolution-api.com/webhook/set/{instance}
{
  "url": "https://sua-api.com/webhooks/whatsapp",
  "events": [
    "messages.upsert",
    "messages.update"
  ]
}

// Backend - Processar mensagem recebida
app.post('/webhooks/whatsapp', async (req, res) => {
  const { messages } = req.body;
  
  for (const message of messages) {
    // Processar com bot IA
    const response = await processMessageWithBot(message);
    
    // Enviar resposta
    await sendWhatsAppMessage(message.from, response);
    
    // Notificar frontend via WebSocket
    broadcastToTenant(tenantId, {
      event: 'new_message',
      data: {
        conversationId: message.from,
        text: message.text,
        sender: 'customer',
        timestamp: new Date()
      }
    });
  }
  
  res.sendStatus(200);
});
```

### 7. Tratamento de Erros

Adicione tratamento global de erros:

```typescript
// src/lib/api.ts (já implementado)

// Os erros são retornados como { error: string }
// Sempre verifique e trate:

const { data, error } = await api.getOrders();

if (error) {
  // Caso especial: não autorizado
  if (error.includes('401') || error.includes('Unauthorized')) {
    localStorage.removeItem('auth_token');
    navigate('/login');
    return;
  }
  
  // Outros erros
  toast({
    title: "Erro",
    description: error,
    variant: "destructive",
  });
  return;
}

// Usar data normalmente
setOrders(data.orders);
```

### 8. Loading States

Adicione estados de loading em todos os componentes:

```typescript
const [isLoading, setIsLoading] = useState(true);

useEffect(() => {
  async function loadData() {
    setIsLoading(true);
    const { data, error } = await api.getOrders();
    if (data) setOrders(data.orders);
    setIsLoading(false);
  }
  loadData();
}, []);

// Renderizar loading
if (isLoading) {
  return <div>Carregando...</div>;
  // Ou use o Skeleton component
}
```

## Checklist de Integração

### Backend
- [ ] API implementada seguindo `API_README.md`
- [ ] Autenticação JWT configurada
- [ ] Multi-tenancy implementado
- [ ] WebSocket configurado
- [ ] Evolution API integrada
- [ ] Webhooks configurados
- [ ] CORS configurado
- [ ] Rate limiting implementado

### Frontend
- [ ] Variáveis de ambiente configuradas
- [ ] Funções de API importadas
- [ ] Dados mockados removidos
- [ ] Autenticação implementada
- [ ] WebSocket conectado
- [ ] Loading states adicionados
- [ ] Tratamento de erros implementado
- [ ] Testes realizados

## Testes

### Teste Local

1. **Backend Mock**
   ```bash
   # Você pode usar json-server para testar localmente
   npm install -g json-server
   json-server --watch db.json --port 3000
   ```

2. **Teste as Rotas**
   - Login: POST http://localhost:3000/api/v1/auth/login
   - Pedidos: GET http://localhost:3000/api/v1/orders
   - etc.

### Teste em Produção

1. Configure `.env` com URLs de produção
2. Teste cada módulo individualmente
3. Verifique WebSocket funcionando
4. Teste integração WhatsApp
5. Verifique notificações em tempo real

## Dicas Importantes

1. **Sempre use try-catch** em chamadas assíncronas
2. **Implemente retry logic** para requisições críticas
3. **Cache dados** quando apropriado (React Query é uma ótima opção)
4. **Valide dados** tanto no frontend quanto no backend
5. **Use TypeScript** para evitar erros de tipo
6. **Monitore performance** com React DevTools
7. **Configure logs** para debug em produção

## Suporte

Para dúvidas sobre:
- **Rotas da API**: Consulte `API_README.md`
- **Funções disponíveis**: Veja `src/lib/api.ts`
- **Tipos de dados**: Veja `src/lib/mockData.ts`

## Próximas Melhorias

Após integração básica, considere:

1. **Otimização**
   - Implementar React Query para cache
   - Lazy loading de componentes
   - Otimização de imagens

2. **Features Avançadas**
   - Upload de fotos dos produtos
   - Impressão de pedidos
   - Relatórios em PDF
   - Backup automático

3. **DevOps**
   - CI/CD pipeline
   - Monitoramento de erros (Sentry)
   - Analytics (Google Analytics)
   - Logs estruturados
