import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, DollarSign, MessageSquare, Clock } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { mockDashboardStats, mockRevenueData, mockOrders } from "@/lib/mockData";

export default function Dashboard() {
  const stats = mockDashboardStats;
  const recentOrders = mockOrders.slice(0, 5);

  const statCards = [
    {
      title: "Pedidos Hoje",
      value: stats.todayOrders,
      icon: Package,
      description: `${stats.activeOrders} ativos`
    },
    {
      title: "Faturamento Hoje",
      value: `R$ ${stats.todayRevenue.toFixed(2)}`,
      icon: DollarSign,
      description: "Meta: R$ 2.000,00"
    },
    {
      title: "Conversas Ativas",
      value: stats.activeConversations,
      icon: MessageSquare,
      description: "WhatsApp conectado"
    },
    {
      title: "Em Preparo",
      value: stats.ordersInProgress,
      icon: Clock,
      description: `${stats.ordersReady} prontos`
    }
  ];

  const getStatusBadge = (status: string) => {
    const badges = {
      new: "status-badge-new",
      preparing: "status-badge-preparing",
      ready: "status-badge-ready",
      delivered: "status-badge-delivered"
    };
    return badges[status as keyof typeof badges];
  };

  const getStatusText = (status: string) => {
    const texts = {
      new: "Novo",
      preparing: "Preparando",
      ready: "Pronto",
      delivered: "Entregue"
    };
    return texts[status as keyof typeof texts];
  };

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Faturamento dos Últimos 7 Dias</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockRevenueData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis 
                  dataKey="date" 
                  className="text-xs text-muted-foreground"
                />
                <YAxis className="text-xs text-muted-foreground" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Pedidos Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <p className="font-medium">{order.customerName}</p>
                    <span className={`px-2 py-1 rounded-full text-xs border ${getStatusBadge(order.status)}`}>
                      {getStatusText(order.status)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {order.items.length} {order.items.length === 1 ? 'item' : 'itens'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">R$ {order.total.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">
                    {Math.floor((Date.now() - order.createdAt.getTime()) / 60000)} min atrás
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
