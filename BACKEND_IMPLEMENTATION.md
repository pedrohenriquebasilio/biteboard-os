# Implementação dos Endpoints do Dashboard no Backend

## Resumo

O Frontend foi refatorado para **NUNCA calcular métricas**. Todos os cálculos devem ser feitos no backend.

## Endpoints para Implementar

### 1. `GET /dashboard/stats` - Já Existente
Verifique se este endpoint está retornando:
```json
{
  "data": {
    "todayOrders": number,
    "todayRevenue": number,
    "activeOrders": number,
    "activeConversations": number,
    "ordersInProgress": number,
    "ordersReady": number
  }
}
```

---

### 2. `GET /dashboard/metrics` - NOVO - PRECISA CRIAR

**Responsabilidade:** Calcular e retornar métricas derivadas

**Response JSON:**
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

**Cálculos no Backend:**

#### A) `completionRate` (percentual inteiro 0-100)
```
Fórmula: (ordersReady / (activeOrders + ordersReady + ordersInProgress)) * 100
Arredondado para inteiro com Math.round()
Se denominador = 0, retornar 0
```

#### B) `averageTicket` (decimal com 2 casas)
```
Fórmula: todayRevenue / todayOrders
Arredondado para 2 casas decimais
Se todayOrders = 0, retornar 0
```

#### C) `ordersInProgress` (inteiro)
```
Simplesmente retornar o valor de ordersInProgress
(redundante, mas mantém a interface consistente)
```

#### D) `orderSLA` (tempo médio em minutos - IMPORTANTE!)
```
Descrição: Tempo médio para um pedido ir de PREPARING para READY

Lógica:
1. Encontrar todos os pedidos que transitaram de PREPARING → READY hoje (ou este mês)
2. Para cada pedido, calcular: (ready_timestamp - preparing_started_timestamp) em minutos
3. Retornar a média dessas diferenças
4. Se nenhum pedido foi concluído, retornar 0

Pseudocódigo SQL:
SELECT 
  ROUND(AVG(EXTRACT(EPOCH FROM (ready_at - preparing_at)) / 60), 1)
FROM orders
WHERE status = 'READY' 
  AND DATE(ready_at) = CURRENT_DATE
  AND ready_at IS NOT NULL 
  AND preparing_at IS NOT NULL

Alternativa Prisma:
const orders = await prisma.order.findMany({
  where: {
    status: 'READY',
    updatedAt: {
      gte: startOfDay,
      lte: endOfDay
    }
  },
  select: {
    // Você precisa rastrear quando mudou para PREPARING e quando ficou READY
    // Isso pode estar em um log de status ou em campos separados
  }
});
```

---

## Importante: Rastreamento de Mudanças de Status

Para calcular o SLA corretamente, você precisa rastrear **quando** um pedido muda de status.

### Opção 1: Campos Separados na Model Order
```prisma
model Order {
  id String @id @default(cuid())
  ...
  status String // NEW, PREPARING, READY, DELIVERED
  
  // Novos campos para SLA
  preparingStartedAt DateTime?  // Quando mudou para PREPARING
  readyAt DateTime?              // Quando mudou para READY
  deliveredAt DateTime?          // Quando mudou para DELIVERED
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### Opção 2: Tabela de Log de Status (mais robusta)
```prisma
model OrderStatusLog {
  id String @id @default(cuid())
  orderId String
  order Order @relation(fields: [orderId], references: [id], onDelete: Cascade)
  
  fromStatus String
  toStatus String
  changedAt DateTime @default(now())
  
  @@index([orderId])
  @@index([changedAt])
}
```

Recomendo a **Opção 1** (mais simples) ou usar `updatedAt` se todos os status são atualizados em sequência.

---

## Implementação Exemplo (NestJS + Prisma)

```typescript
// dashboard.controller.ts
import { Controller, Get } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get('stats')
  async getStats() {
    const stats = await this.dashboardService.getStats();
    return { data: stats };
  }

  @Get('metrics')
  async getMetrics() {
    const metrics = await this.dashboardService.getMetrics();
    return { data: metrics };
  }
}
```

```typescript
// dashboard.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const orders = await this.prisma.order.findMany({
      where: {
        createdAt: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    const todayOrders = orders.length;
    const todayRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const activeOrders = orders.filter(o => 
      ['NEW', 'PREPARING', 'READY'].includes(o.status)
    ).length;
    const ordersInProgress = orders.filter(o => o.status === 'PREPARING').length;
    const ordersReady = orders.filter(o => o.status === 'READY').length;
    const activeConversations = 0; // Implementar conforme sua lógica

    return {
      todayOrders,
      todayRevenue,
      activeOrders,
      activeConversations,
      ordersInProgress,
      ordersReady,
    };
  }

  async getMetrics() {
    const stats = await this.getStats();

    const completionRate = stats.activeOrders > 0
      ? Math.round((stats.ordersReady / stats.activeOrders) * 100)
      : 0;

    const averageTicket = stats.todayOrders > 0
      ? Math.round((stats.todayRevenue / stats.todayOrders) * 100) / 100
      : 0;

    // SLA: tempo médio em minutos
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const completedOrders = await this.prisma.order.findMany({
      where: {
        status: 'READY',
        readyAt: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    let orderSLA = 0;
    if (completedOrders.length > 0) {
      const totalTime = completedOrders.reduce((sum, order) => {
        const diffMs = order.readyAt.getTime() - order.preparingStartedAt.getTime();
        return sum + (diffMs / 1000 / 60); // converter para minutos
      }, 0);
      orderSLA = Math.round(totalTime / completedOrders.length * 10) / 10; // 1 casa decimal
    }

    return {
      completionRate,
      averageTicket,
      ordersInProgress: stats.ordersInProgress,
      orderSLA,
    };
  }
}
```

---

## Frontend - O que foi alterado

✅ Removidos todos os cálculos no frontend
✅ Adicionada chamada para `GET /dashboard/metrics`
✅ Agora apenas exibe os valores retornados do backend
✅ Nenhuma lógica de negócio no componente React

---

## Próximas Etapas

1. **Migração do Banco de Dados:** Adicionar campos `preparingStartedAt` e `readyAt` se usar Opção 1
2. **Atualizar Logic de Status:** Quando mudar status para PREPARING, preencher `preparingStartedAt`
3. **Testar Endpoint:** Chamar `GET /dashboard/metrics` e validar resposta
4. **Frontend Vai Funcionar:** Assim que o backend responder corretamente

Qualquer dúvida, estou aqui para ajudar! 🚀
