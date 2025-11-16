import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, DollarSign, MessageSquare, Clock } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useEffect, useState } from "react";
import { getDashboardStats, getRevenueData, getOrders } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { DashboardStats, RevenueData } from "@/lib/types";

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);

      const [statsResponse, revenueResponse, ordersResponse] =
        await Promise.all([
          getDashboardStats(),
          getRevenueData({
            period: "daily",
            startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
              .toISOString()
              .split("T")[0],
            endDate: new Date().toISOString().split("T")[0],
          }),
          getOrders(),
        ]);

      if (
        statsResponse.error ||
        revenueResponse.error ||
        ordersResponse.error
      ) {
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar os dados do dashboard.",
          variant: "destructive",
        });
      }

      if (statsResponse.data) setStats(statsResponse.data as DashboardStats);
      if (revenueResponse.data)
        setRevenueData(revenueResponse.data as RevenueData[]);
      if (ordersResponse.data) {
        const orders = ordersResponse.data as any[];
        setRecentOrders(orders.slice(0, 5));
      }

      setIsLoading(false);
    };

    fetchData();
  }, []);

  const getStatusBadge = (status: string) => {
    const badges = {
      NEW: "status-badge-new",
      PREPARING: "status-badge-preparing",
      READY: "status-badge-ready",
      DELIVERED: "status-badge-delivered",
    };
    return badges[status as keyof typeof badges] || "status-badge-new";
  };

  const getStatusText = (status: string) => {
    const texts = {
      NEW: "Novo",
      PREPARING: "Preparando",
      READY: "Pronto",
      DELIVERED: "Entregue",
    };
    return texts[status as keyof typeof texts] || status;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">Carregando...</div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-96">
        Erro ao carregar dados
      </div>
    );
  }

  const statCards = [
    {
      title: "Pedidos Hoje",
      value: stats.todayOrders,
      icon: Package,
      description: `${stats.activeOrders} ativos`,
    },
    {
      title: "Faturamento Hoje",
      value: `R$ ${stats.todayRevenue?.toFixed(2) || "0.00"}`,
      icon: DollarSign,
      description: "Meta: R$ 2.000,00",
    },
    {
      title: "Conversas Ativas",
      value: stats.activeConversations,
      icon: MessageSquare,
      description: "WhatsApp conectado",
    },
    {
      title: "Em Preparo",
      value: stats.ordersInProgress,
      icon: Clock,
      description: `${stats.ordersReady} prontos`,
    },
  ];

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
              <LineChart data={revenueData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="stroke-border"
                />
                <XAxis
                  dataKey="date"
                  className="text-xs text-muted-foreground"
                />
                <YAxis className="text-xs text-muted-foreground" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--primary))" }}
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
                    <span
                      className={`px-2 py-1 rounded-full text-xs border ${getStatusBadge(
                        order.status
                      )}`}
                    >
                      {getStatusText(order.status)}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {order.items?.length || 0}{" "}
                    {order.items?.length === 1 ? "item" : "itens"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">R$ {order.total.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">
                    {Math.floor(
                      (Date.now() - new Date(order.createdAt).getTime()) / 60000
                    )}{" "}
                    min atrás
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
