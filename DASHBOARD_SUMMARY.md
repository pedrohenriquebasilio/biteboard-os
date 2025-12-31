# Dashboard Refactoring - Sumário Executivo

## 🎯 Objetivo
Remover toda lógica de cálculo do frontend e garantir que **o backend é a fonte única da verdade** para métricas.

---

## ✅ Mudanças Realizadas

### Frontend (`src/pages/Dashboard.tsx`)

**Removido:**
- ❌ Função `calculateCompletionRate()` - agora vem do backend
- ❌ Função `calculateAvgOrderValue()` - agora vem do backend
- ❌ Gráfico de faturamento redundante
- ❌ Chamada a `getRevenueData()`

**Adicionado:**
- ✅ Interface `DashboardMetrics` para tipar resposta do backend
- ✅ Chamada a `getDashboardMetrics()` do endpoint `/dashboard/metrics`
- ✅ Nova métrica: **SLA de Pedidos** (tempo médio em minutos para preparar)
- ✅ Melhor UX com ícones coloridos para cada métrica

**Dashboard agora exibe 4 seções:**

1. **Pedidos Hoje** - total de pedidos do dia + ativos
2. **Faturamento Hoje** - receita total + meta
3. **Conversas Ativas** - WhatsApp conectado
4. **Em Preparo** - quantos preparando + quantos prontos

**Seguido por 4 Métricas Rápidas (vindo do backend):**

1. **Taxa de Conclusão** (%) - quantos prontos / total ativos
2. **Ticket Médio** (R$) - receita média por pedido
3. **SLA Pedidos** (min) - tempo médio até pronto
4. **Atenção Necessária** (#) - pedidos ainda em preparo

**Finalmente:**

5. **Pedidos Recentes** - últimos 5 pedidos com status e valores

---

## 📋 API Layer (`src/lib/api.ts`)

**Adicionado:**
```typescript
export async function getDashboardMetrics() {
  return apiRequest('/dashboard/metrics');
}
```

---

## 📚 Documentação Criada

### `DASHBOARD_ENDPOINTS.md`
Especificação completa de:
- Endpoint `/dashboard/stats` (já existe)
- Endpoint `/dashboard/metrics` (novo)
- Estrutura JSON esperada
- Descrição de cada campo

### `BACKEND_IMPLEMENTATION.md`
Guia passo-a-passo para implementar no NestJS:
- Como calcular cada métrica
- Importância do rastreamento de status (SLA)
- Exemplos de código NestJS + Prisma
- Migração do banco de dados necessária

---

## 🔑 Endpoints Necessários

### GET `/dashboard/stats`
**Retorna:**
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

### GET `/dashboard/metrics` - NOVO
**Retorna:**
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

---

## 🔧 Cálculos Esperados no Backend

| Métrica | Fórmula | Tipo | Exemplo |
|---------|---------|------|---------|
| `completionRate` | (ordersReady / activeOrders) × 100 | Inteiro (0-100) | 87 |
| `averageTicket` | todayRevenue / todayOrders | Float (2 casas) | 28.37 |
| `ordersInProgress` | count(status='PREPARING') | Inteiro | 3 |
| `orderSLA` | AVG(ready_at - preparing_at) | Float (1 casa, minutos) | 12.5 |

---

## ⚠️ Importante: SLA de Pedidos

Para calcular `orderSLA` corretamente, é necessário:

1. **Rastrear timestamps de status:**
   - Quando muda para `PREPARING` → salvar `preparingStartedAt`
   - Quando muda para `READY` → salvar `readyAt`

2. **Migração Prisma Necessária:**
   ```prisma
   model Order {
     // ... campos existentes
     preparingStartedAt DateTime?
     readyAt DateTime?
   }
   ```

3. **Cálculo:**
   ```sql
   SELECT AVG(EXTRACT(EPOCH FROM (ready_at - preparing_at)) / 60)
   FROM orders
   WHERE status = 'READY' AND DATE(ready_at) = CURRENT_DATE
   ```

---

## 🚀 Fluxo de Dados (Novo)

```
Dashboard Component
├─ useEffect()
│  ├─ getDashboardStats() → GET /dashboard/stats
│  ├─ getDashboardMetrics() → GET /dashboard/metrics (NOVO)
│  └─ getOrders() → GET /orders
└─ Renderiza com dados do backend (zero cálculos)
```

---

## 📊 Comparação Antes vs Depois

### Antes (❌ Cálculos no Frontend)
```typescript
const completionRate = Math.round((stats.ordersReady / stats.activeOrders) * 100);
const averageTicket = (stats.todayRevenue / stats.todayOrders).toFixed(2);
// Lógica espalhada no componente
```

### Depois (✅ Backend Calcula)
```typescript
const metrics = await getDashboardMetrics();
// Simples: metrics.completionRate, metrics.averageTicket
```

---

## 📝 Checklist para Você

Backend:

- [ ] Adicionar endpoint `GET /dashboard/metrics`
- [ ] Implementar cálculos de `completionRate` e `averageTicket`
- [ ] Implementar cálculo de `orderSLA`
  - [ ] Criar migração para `preparingStartedAt` e `readyAt`
  - [ ] Atualizar lógica de mudança de status
- [ ] Testar endpoints com Postman/Insomnia
- [ ] Validar estrutura JSON de resposta

Frontend:

- [ ] Testará automaticamente assim que backend responder
- [ ] Nenhuma mudança adicional necessária

---

## 💡 Próximas Otimizações (Opcional)

- Adicionar caching em `/dashboard/metrics` (30-60 segundos)
- WebSocket para atualização em tempo real
- Histórico de SLA por período
- Alertas quando SLA excede limite

---

## 📞 Pronto!

O Frontend está 100% pronto. É só você implementar os 2 endpoints no backend que tudo funciona! 🎉
