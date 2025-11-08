import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, ShoppingBag, Users } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { mockRevenueData } from "@/lib/mockData";
import { useEffect, useState } from "react";
import { getFinancialSummary, getRevenueData } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

export default function Financial() {
  const [stats, setStats] = useState<any>({
    totalRevenue: 15847.50,
    totalOrders: 234,
    averageTicket: 67.72,
    activeCustomers: 156
  });
  const [revenueData, setRevenueData] = useState<any[]>(mockRevenueData);
  const [topItems, setTopItems] = useState<any[]>([
    { name: "Pizza Margherita", quantity: 45, revenue: 2025.00 },
    { name: "Hambúrguer Clássico", quantity: 38, revenue: 1330.00 },
    { name: "Sushi Combinado", quantity: 22, revenue: 1430.00 },
    { name: "Salada Caesar", quantity: 31, revenue: 868.00 },
  ]);

  useEffect(() => {
    const fetchData = async () => {
      const today = new Date();
      const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      
      const [summaryResponse, revenueResponse] = await Promise.all([
        getFinancialSummary({
          period: 'monthly',
          startDate: startDate.toISOString().split('T')[0],
          endDate: today.toISOString().split('T')[0]
        }),
        getRevenueData({
          period: 'daily',
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          endDate: today.toISOString().split('T')[0]
        })
      ]);

      if (summaryResponse.error || revenueResponse.error) {
        toast({
          title: "Não foi possível carregar dados financeiros",
          description: "Usando dados de exemplo. Tente novamente mais tarde.",
          variant: "destructive",
        });
      }

      if (summaryResponse.data) {
        const data = summaryResponse.data as any;
        setStats({
          totalRevenue: data.totalRevenue,
          totalOrders: data.totalOrders,
          averageTicket: data.averageTicket,
          activeCustomers: data.activeCustomers
        });
        if (data.topItems) setTopItems(data.topItems);
      }
      
      if (revenueResponse.data) {
        setRevenueData(revenueResponse.data as any[]);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Relatório Financeiro</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Faturamento Total
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {stats.totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-green-600 mt-1">+12.5% vs mês anterior</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Pedidos
            </CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-green-600 mt-1">+8.3% vs mês anterior</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ticket Médio
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {stats.averageTicket.toFixed(2)}</div>
            <p className="text-xs text-green-600 mt-1">+3.8% vs mês anterior</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Clientes Ativos
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeCustomers}</div>
            <p className="text-xs text-green-600 mt-1">+15.2% vs mês anterior</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Evolução do Faturamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Itens Mais Vendidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topItems}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip />
                  <Bar dataKey="revenue" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
