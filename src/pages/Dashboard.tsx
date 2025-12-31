import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, DollarSign, MessageSquare, Clock, AlertCircle, TrendingUp, CheckCircle, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { getDashboardStats, getDashboardMetrics, getOrders } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { LoadingSpinner } from "@/components/Loading";
import { DashboardStats, Order } from "@/lib/types";

interface DashboardMetrics {
  completionRate: number;
  averageTicket: number;
  ordersInProgress: number;
  orderSLA: number; // tempo médio em minutos
}

interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);

      const [statsResponse, metricsResponse, ordersResponse] = await Promise.all([
        getDashboardStats(),
        getDashboardMetrics(),
        getOrders(),
      ]);

      if (statsResponse.error) {
        toast({
          title: "Erro ao carregar estatísticas",
          description: statsResponse.error,
          variant: "destructive",
        });
      } else if (statsResponse.data) {
        console.log('📊 Stats recebidas:', statsResponse.data);
        // Se os dados vierem com estrutura aninhada data.data, extrair
        const statsData = (statsResponse.data as any).data || statsResponse.data;
        setStats(statsData as DashboardStats);
      }

      if (metricsResponse.error) {
        toast({
          title: "Erro ao carregar métricas",
          description: metricsResponse.error,
          variant: "destructive",
        });
      } else if (metricsResponse.data) {
        console.log('📈 Metrics recebidas:', metricsResponse.data);
        // Se os dados vierem com estrutura aninhada data.data, extrair
        const metricsData = (metricsResponse.data as any).data || metricsResponse.data;
        setMetrics(metricsData as DashboardMetrics);
      }

      if (ordersResponse.error) {
        console.error("Erro ao carregar pedidos:", ordersResponse.error);
      } else if (ordersResponse.data && Array.isArray(ordersResponse.data)) {
        const orders = ordersResponse.data as Order[];
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
    return <LoadingSpinner />;
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-96 text-muted-foreground">
        Erro ao carregar dados do dashboard
      </div>
    );
  }

  const statCards = [
    {
      title: "Pedidos Hoje",
      value: stats.todayOrders || 0,
      icon: Package,
      description: `${stats.activeOrders || 0} ativos`,
    },
    {
      title: "Faturamento Hoje",
      value: `€ ${((stats.todayRevenue || 0) as number).toFixed(2)}`,
      icon: DollarSign,
      description: "Meta: € 2.000,00",
    },
    {
      title: "Conversas Ativas",
      value: stats.activeConversations || 0,
      icon: MessageSquare,
      description: "WhatsApp conectado",
    },
    {
      title: "Em Preparo",
      value: stats.ordersInProgress || 0,
      icon: Clock,
      description: `${stats.ordersReady || 0} prontos`,
    },
  ];

  const hasOrders = Array.isArray(recentOrders) && recentOrders.length > 0;

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className="rounded-2xl hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
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

      {/* Informações Rápidas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="rounded-2xl hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Taxa de Conclusão
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.completionRate || 0}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats?.ordersReady || 0} pedidos prontos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ticket Médio
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€ {(metrics?.averageTicket || 0).toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats?.todayOrders || 0} pedidos hoje
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              SLA Pedidos
            </CardTitle>
            <Zap className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.orderSLA || 0}m</div>
            <p className="text-xs text-muted-foreground mt-1">
              Tempo médio até pronto
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Atenção Necessária
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.ordersInProgress || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Pedidos em preparo
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Pedidos Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          {hasOrders ? (
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
                        className={`px-3 py-1 rounded-xl text-xs border transition-all duration-200 ${getStatusBadge(
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
                    <p className="font-semibold">€ {order.total.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">
                      {Math.floor(
                        (Date.now() - new Date(order.createdAt).getTime()) /
                          60000
                      )}{" "}
                      min atrás
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              Nenhum pedido recente
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}