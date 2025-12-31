# Dashboard - Especificação Visual e Técnica

## 📐 Layout do Dashboard

```
┌─────────────────────────────────────────────────────────────────┐
│                        Dashboard BiteBoard                      │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────┬─────────────────┬─────────────────┬─────────────────┐
│ 📦 Pedidos Hoje │ 💵 Faturamento  │ 💬 Conversas    │ ⏱️  Em Preparo  │
│ ─────────────── │ ─────────────── │ ─────────────── │ ─────────────── │
│      15         │   R$ 425.50     │       8         │       3         │
│  5 ativos       │ Meta: R$ 2k     │ WhatsApp OK     │ 2 prontos       │
└─────────────────┴─────────────────┴─────────────────┴─────────────────┘

┌──────────────┬──────────────┬──────────────┬──────────────┐
│ ✅ Taxa de   │ 📈 Ticket    │ ⚡ SLA       │ ⚠️  Atenção  │
│ Conclusão    │ Médio        │ Pedidos      │ Necessária   │
│ ────────────── │ ────────────── │ ────────────── │ ────────────── │
│     87%      │  R$ 28.37    │   12 min    │      3       │
│ 2 de 3 prontos│ 15 pedidos   │ Tempo médio  │ Em preparo   │
└──────────────┴──────────────┴──────────────┴──────────────┘

┌──────────────────────────────────────────────────────────┐
│ 📋 Pedidos Recentes                                      │
├──────────────────────────────────────────────────────────┤
│ João Silva         [PREPARANDO]     2 itens    R$ 45.00  │
│ há 5 min                                                  │
├──────────────────────────────────────────────────────────┤
│ Maria Santos       [PRONTO]         1 item     R$ 32.50  │
│ há 12 min                                                 │
├──────────────────────────────────────────────────────────┤
│ Pedro Costa        [ENTREGUE]       3 itens    R$ 89.90  │
│ há 18 min                                                 │
├──────────────────────────────────────────────────────────┤
│ Ana Oliveira       [NOVO]           1 item     R$ 25.00  │
│ há 2 min                                                  │
├──────────────────────────────────────────────────────────┤
│ Lucas Ferreira     [PRONTO]         2 itens    R$ 58.20  │
│ há 8 min                                                  │
└──────────────────────────────────────────────────────────┘
```

---

## 🔌 API Contracts

### GET /dashboard/stats

**Chamado por:** Dashboard ao carregar

**Resposta:**
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

**Usar para:**
- Exibir "Pedidos Hoje"
- Exibir "Faturamento Hoje"
- Exibir "Conversas Ativas"
- Exibir "Em Preparo"

---

### GET /dashboard/metrics

**Chamado por:** Dashboard ao carregar (paralelo com stats)

**Resposta:**
```json
{
  "data": {
    "completionRate": 87,
    "averageTicket": 28.37,
    "ordersInProgress": 3,
    "orderSLA": 12.5
  }
}
```

**Campos:**
- **completionRate** (number, 0-100)
  - Percentual: (ordersReady / (activeOrders + ordersReady + ordersInProgress)) * 100
  - Arredondado a inteiro
  - Valor padrão: 0
  - Interpretação: Quantos % dos pedidos ativos já estão prontos

- **averageTicket** (number, 2 casas decimais)
  - Média: todayRevenue / todayOrders
  - Arredondado a 2 casas
  - Valor padrão: 0
  - Interpretação: Valor médio gasto por cliente hoje

- **ordersInProgress** (number)
  - Simples repetição para UI
  - Quantos pedidos estão em PREPARING agora
  
- **orderSLA** (number, 1 casa decimal, minutos)
  - Tempo médio: AVG(ready_at - preparing_started_at) em minutos
  - Arredondado a 1 casa
  - Valor padrão: 0
  - Interpretação: Quanto tempo leva em média para preparar um pedido

---

### GET /orders

**Já existente, usado para:**
- Últimos 5 pedidos recentes
- Exibir na tabela de "Pedidos Recentes"

**Esperado:**
```json
{
  "data": [
    {
      "id": "uuid",
      "customerName": "João Silva",
      "customerPhone": "11999999999",
      "status": "PREPARING",
      "items": [...],
      "total": 45.00,
      "createdAt": "2025-12-29T10:30:00Z"
    },
    // ... mais 4
  ]
}
```

---

## 🎨 Mapeamento de Dados → UI

### Seção 1: Cards Principais
```
┌─────────────────────────────────────────────────────────┐
│ Fonte: /dashboard/stats                                 │
├─────────────────────────────────────────────────────────┤
│ Card 1: todayOrders + activeOrders                       │
│ Card 2: todayRevenue (formatado)                         │
│ Card 3: activeConversations                              │
│ Card 4: ordersInProgress + ordersReady                   │
└─────────────────────────────────────────────────────────┘
```

### Seção 2: Métricas Calculadas
```
┌─────────────────────────────────────────────────────────┐
│ Fonte: /dashboard/metrics                               │
├─────────────────────────────────────────────────────────┤
│ Card 1: completionRate (com %)                           │
│ Card 2: averageTicket (formatado em R$)                  │
│ Card 3: orderSLA (com "m" de minuto)                     │
│ Card 4: ordersInProgress (redundante mas mantido)        │
└─────────────────────────────────────────────────────────┘
```

### Seção 3: Pedidos Recentes
```
┌─────────────────────────────────────────────────────────┐
│ Fonte: /orders (slice dos primeiros 5)                   │
├─────────────────────────────────────────────────────────┤
│ Para cada pedido:                                        │
│  - customerName                                          │
│  - status (com badge colorido)                           │
│  - items.length (quantos itens)                          │
│  - total (formatado em R$)                               │
│  - tempo desde createdAt (em minutos)                    │
└─────────────────────────────────────────────────────────┘
```

---

## 🔄 Fluxo de Dados Completo

```
┌──────────────────────────┐
│   Dashboard Component    │
│   (React + TypeScript)   │
└────────────┬─────────────┘
             │
             │ useEffect() dispara 3 requisições em paralelo
             │
      ┌──────┴──────┬────────────┬──────────────┐
      │             │            │              │
      ▼             ▼            ▼              ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ getDash      │ │ getDash      │ │ getOrders    │
│ boardStats() │ │ boardMetrics │ │              │
└──────────────┘ └──────────────┘ └──────────────┘
      │             │                     │
      ▼             ▼                     ▼
┌──────────────────────────────────────────────┐
│         Backend NestJS + Prisma              │
├──────────────────────────────────────────────┤
│ GET /dashboard/stats                         │
│  ├─ SELECT * FROM orders WHERE createdAt=today
│  └─ COUNT/SUM/etc                            │
│                                              │
│ GET /dashboard/metrics                       │
│  ├─ (ordersReady / activeOrders) * 100       │
│  ├─ todayRevenue / todayOrders               │
│  └─ AVG(ready_at - preparing_started_at)     │
│                                              │
│ GET /orders                                  │
│  └─ SELECT * FROM orders ORDER BY createdAt │
└──────────────────────────────────────────────┘
      │             │                     │
      ▼             ▼                     ▼
  {stats}      {metrics}            {orders}
     │             │                     │
     └─────────────┼─────────────────────┘
                   │
                   ▼
    ┌─────────────────────────────────┐
    │   setStats                      │
    │   setMetrics                    │
    │   setRecentOrders               │
    └─────────────┬───────────────────┘
                  │
                  ▼
    ┌─────────────────────────────────┐
    │    Renderiza UI com dados       │
    │    - 4 Cards Principais         │
    │    - 4 Métricas                 │
    │    - Tabela Pedidos Recentes    │
    └─────────────────────────────────┘
```

---

## 📋 Checklist de Implementação

### Backend

- [ ] Endpoint `GET /dashboard/stats` (validar retorno)
  - [ ] todayOrders
  - [ ] todayRevenue
  - [ ] activeOrders
  - [ ] activeConversations
  - [ ] ordersInProgress
  - [ ] ordersReady

- [ ] Endpoint `GET /dashboard/metrics` (criar novo)
  - [ ] completionRate (cálculo correto)
  - [ ] averageTicket (cálculo correto)
  - [ ] ordersInProgress
  - [ ] orderSLA (requer rastreamento de status)

- [ ] Schema Prisma atualizado
  - [ ] Adicionar `preparingStartedAt` ao Order
  - [ ] Adicionar `readyAt` ao Order
  - [ ] Migrations rodadas

- [ ] Lógica de Status
  - [ ] Ao mudar para PREPARING, salvar `preparingStartedAt`
  - [ ] Ao mudar para READY, salvar `readyAt`

### Frontend

- [x] Dashboard refatorado
- [x] Endpoints importados da API
- [x] Interfaces TypeScript criadas
- [x] Zero cálculos no frontend
- [x] Pronto para usar os dados

---

## 🧪 Teste Manual

1. Abrir Postman/Insomnia
2. Chamar `GET /dashboard/stats`
   - Validar JSON structure
   - Validar valores numéricos
3. Chamar `GET /dashboard/metrics`
   - Validar JSON structure
   - Validar cálculos:
     - completionRate deve estar entre 0-100
     - averageTicket deve ser > 0 se há pedidos
     - orderSLA deve estar > 0 se há pedidos prontos
4. Abrir Dashboard no browser
   - Verificar se carrega sem erros
   - Validar valores exibidos

---

## 🎯 Resultado Final

Dashboard funcional que:
- ✅ Exibe estatísticas do dia
- ✅ Mostra métricas calculadas
- ✅ Monitora SLA de pedidos
- ✅ Lista pedidos recentes
- ✅ Zero lógica no frontend
- ✅ Backend é fonte única da verdade
- ✅ Escalável e manutenível
