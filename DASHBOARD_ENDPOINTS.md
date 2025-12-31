# Dashboard Endpoints - Documentação

## Endpoints Necessários para o Backend

### 1. GET `/dashboard/stats`
**Descrição:** Retorna as estatísticas principais do dashboard

**Query Parameters:** Nenhum

**Response (200 OK):**
```json
{
  "data": {
    "todayOrders": 15,
    "todayRevenue": 425.50,
    "activeOrders": 5,
    "activeConversations": 8,
    "ordersInProgress": 3,
    "ordersReady": 2
  }
}
```

**Descrição dos campos:**
- `todayOrders`: Total de pedidos realizados hoje
- `todayRevenue`: Faturamento total do dia em reais
- `activeOrders`: Pedidos ativos (NEW + PREPARING + READY)
- `activeConversations`: Conversas abertas no WhatsApp
- `ordersInProgress`: Pedidos em status PREPARING
- `ordersReady`: Pedidos em status READY

---

### 2. GET `/dashboard/metrics`
**Descrição:** Retorna as métricas calculadas para exibição no dashboard

**Query Parameters:** Nenhum

**Response (200 OK):**
```json
{
  "data": {
    "completionRate": 87,
    "averageTicket": 28.37,
    "ordersInProgress": 3,
    "orderSLA": 12
  }
}
```

**Descrição dos campos:**
- `completionRate`: Percentual de pedidos prontos em relação aos ativos (0-100)
  - Cálculo: `(ordersReady / (activeOrders + ordersReady + ordersInProgress)) * 100`
  - Arredondado para inteiro
- `averageTicket`: Valor médio por pedido do dia em reais
  - Cálculo: `todayRevenue / todayOrders`
  - Arredondado para 2 casas decimais
  - Valor padrão 0 se `todayOrders === 0`
- `ordersInProgress`: Número de pedidos em preparo (redundante com stats, mas incluído para completude)
- `orderSLA`: Tempo médio em minutos para um pedido ir do status PREPARING para READY
  - Cálculo: Considerar pedidos que mudaram de PREPARING para READY no mês atual
  - Fórmula: `AVG(EXTRACT(EPOCH FROM (ready_at - preparing_started_at)) / 60)` em minutos
  - Se nenhum pedido completou, retornar 0

---

## Implementação no Frontend

O Frontend está configurado para:

1. Chamar `GET /dashboard/stats` para obter estatísticas base
2. Chamar `GET /dashboard/metrics` para obter métricas calculadas
3. Chamar `GET /orders` para obter últimos 5 pedidos recentes

Nenhum cálculo é feito no frontend. Todos os valores são passados diretamente do backend.

---

## Exemplo de Fluxo de Dados

```
Frontend Dashboard
├── getDashboardStats() → GET /dashboard/stats
│   └── Atualiza: todayOrders, todayRevenue, activeOrders, activeConversations, ordersInProgress, ordersReady
├── apiRequest('/dashboard/metrics') → GET /dashboard/metrics
│   └── Atualiza: completionRate, averageTicket, orderSLA
├── getOrders() → GET /orders
│   └── Atualiza: últimos 5 pedidos recentes
└── Renderiza UI com dados recebidos
```

---

## Observações Importantes

- **Backend é a fonte da verdade**: Todas as métricas são calculadas no backend
- **SLA de Pedidos**: Requer que você rastreie quando um pedido muda de status PREPARING para READY
- **Valores padrão**: Se houver erro ou dados insuficientes, retornar valores padrão (0 ou vazio)
- **Caching opcional**: Considere cachear esses dados por 30-60 segundos para melhorar performance
