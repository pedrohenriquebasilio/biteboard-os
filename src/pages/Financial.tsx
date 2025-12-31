import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DollarSign, TrendingUp, ShoppingBag, TrendingDown } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { useEffect, useState } from "react";
import { 
  getFinancialSummary, 
  getFinancialByPeriod, 
  getFinancialToday,
  getFinancialMonthlyComparison 
} from "@/lib/api";
import { LoadingSpinner } from "@/components/Loading";
import { toast } from "@/hooks/use-toast";

interface SummaryData {
  totalRevenue: number;
  totalOrders: number;
  averageTicket: number;
  topSellingItems: Array<{
    itemName: string;
    menuItemId: string;
    quantity: number;
    revenue: number;
  }>;
}

interface PeriodData {
  period: string;
  revenue: number;
  orders: number;
  averageTicket: number;
}

interface ComparisonData {
  currentMonth: {
    revenue: number;
    orders: number;
    averageTicket: number;
  };
  lastMonth: {
    revenue: number;
    orders: number;
    averageTicket: number;
  };
  growth: {
    percentage: number;
    absolute: number;
  };
}

type PeriodType = 'daily' | 'weekly' | 'monthly';

export default function Financial() {
  const [isLoading, setIsLoading] = useState(true);
  const [currentPeriod, setCurrentPeriod] = useState<PeriodType>('daily');
  const [summary, setSummary] = useState<SummaryData>({
    totalRevenue: 0,
    totalOrders: 0,
    averageTicket: 0,
    topSellingItems: []
  });
  const [periodData, setPeriodData] = useState<PeriodData[]>([]);
  const [comparison, setComparison] = useState<ComparisonData | null>(null);

  useEffect(() => {
    fetchData();
  }, [currentPeriod]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [summaryResponse, periodResponse, comparisonResponse] = await Promise.all([
        getFinancialSummary({ period: currentPeriod }),
        getFinancialByPeriod({ period: currentPeriod }),
        getFinancialMonthlyComparison()
      ]);

      if (summaryResponse.error) {
        toast({
          title: "Erro ao carregar resumo financeiro",
          description: summaryResponse.error,
          variant: "destructive",
        });
      } else if (summaryResponse.data) {
        setSummary(summaryResponse.data as SummaryData);
      }

      if (periodResponse.error) {
        toast({
          title: "Erro ao carregar dados por período",
          description: periodResponse.error,
          variant: "destructive",
        });
      } else if (periodResponse.data && Array.isArray(periodResponse.data)) {
        setPeriodData(periodResponse.data as PeriodData[]);
      }

      if (comparisonResponse.error) {
        console.error("Erro ao carregar comparação mensal:", comparisonResponse.error);
      } else if (comparisonResponse.data) {
        setComparison(comparisonResponse.data as ComparisonData);
      }
    } catch (error) {
      toast({
        title: "Erro ao carregar dados",
        description: "Ocorreu um erro ao buscar as informações financeiras",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const hasPeriodData = Array.isArray(periodData) && periodData.length > 0;
  const hasTopItems = Array.isArray(summary.topSellingItems) && summary.topSellingItems.length > 0;

  const getPeriodLabel = (period: PeriodType) => {
    const labels = {
      daily: 'Diário',
      weekly: 'Semanal',
      monthly: 'Mensal'
    };
    return labels[period];
  };

  const getGrowthColor = () => comparison && comparison.growth.percentage >= 0 ? 'text-green-600' : 'text-red-600';
  const getGrowthIcon = () => comparison && comparison.growth.percentage >= 0 ? '+' : '';

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-bold">Relatório Financeiro</h1>
        <div className="flex gap-2">
          {(['daily', 'weekly', 'monthly'] as const).map((period) => (
            <Button
              key={period}
              variant={currentPeriod === period ? 'default' : 'outline'}
              onClick={() => setCurrentPeriod(period)}
              size="sm"
            >
              {getPeriodLabel(period)}
            </Button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Faturamento Total
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€ {summary.totalRevenue.toFixed(2)}</div>
            {comparison && comparison.growth && (
              <p className={`text-xs ${getGrowthColor()} mt-1`}>
                {(comparison.growth.percentage || 0) >= 0 ? '+' : ''}{(comparison.growth.percentage || 0).toFixed(2)}% vs mês anterior
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Pedidos
            </CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalOrders}</div>
            {comparison && comparison.currentMonth && comparison.lastMonth && comparison.lastMonth.orders && (
              <p className={`text-xs ${getGrowthColor()} mt-1`}>
                {(((comparison.currentMonth.orders - comparison.lastMonth.orders) / comparison.lastMonth.orders) * 100).toFixed(2)}% vs mês anterior
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ticket Médio
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€ {summary.averageTicket.toFixed(2)}</div>
            {comparison && comparison.currentMonth && comparison.lastMonth && comparison.lastMonth.averageTicket && (
              <p className={`text-xs ${getGrowthColor()} mt-1`}>
                {(((comparison.currentMonth.averageTicket - comparison.lastMonth.averageTicket) / comparison.lastMonth.averageTicket) * 100).toFixed(2)}% vs mês anterior
              </p>
            )}
          </CardContent>
        </Card>

        {comparison && comparison.currentMonth && comparison.lastMonth && comparison.growth && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Crescimento
              </CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getGrowthColor()}`}>
                {(comparison.growth.percentage || 0) >= 0 ? '+' : ''}€ {(comparison.growth.absolute || 0).toFixed(2)}
              </div>
              <p className={`text-xs ${getGrowthColor()} mt-1`}>
                {(comparison.growth.percentage || 0) >= 0 ? '+' : ''}{(comparison.growth.percentage || 0).toFixed(2)}% de crescimento
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Gráficos */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Faturamento por Período</CardTitle>
          </CardHeader>
          <CardContent>
            {hasPeriodData ? (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={periodData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis 
                      dataKey="period" 
                      className="text-xs"
                      interval={Math.max(0, Math.floor(periodData.length / 10))}
                    />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      formatter={(value: any) => `€ ${Number(value).toFixed(2)}`}
                      labelFormatter={(label) => `Período: ${label}`}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Nenhum dado de faturamento disponível
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Itens Mais Vendidos</CardTitle>
          </CardHeader>
          <CardContent>
            {hasTopItems ? (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={summary.topSellingItems}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis 
                      dataKey="itemName" 
                      className="text-xs"
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      formatter={(value: any) => `€ ${Number(value).toFixed(2)}`}
                    />
                    <Bar dataKey="revenue" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Nenhum item vendido no período
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tabela de detalhes por período */}
      {hasPeriodData && (
        <Card>
          <CardHeader>
            <CardTitle>Detalhes por Período</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-semibold">Período</th>
                    <th className="text-right py-3 px-4 font-semibold">Faturamento</th>
                    <th className="text-right py-3 px-4 font-semibold">Pedidos</th>
                    <th className="text-right py-3 px-4 font-semibold">Ticket Médio</th>
                  </tr>
                </thead>
                <tbody>
                  {periodData.map((row, idx) => (
                    <tr key={idx} className="border-b border-border hover:bg-muted/50">
                      <td className="py-3 px-4">{row.period}</td>
                      <td className="text-right py-3 px-4 font-medium">€ {row.revenue.toFixed(2)}</td>
                      <td className="text-right py-3 px-4">{row.orders}</td>
                      <td className="text-right py-3 px-4">€ {row.averageTicket.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Comparação mensal */}
      {comparison && comparison.currentMonth && comparison.lastMonth && comparison.growth && (
        <Card>
          <CardHeader>
            <CardTitle>Comparação Mensal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Mês Atual</p>
                <div className="space-y-1">
                  <p className="font-semibold">€ {(comparison.currentMonth.revenue || 0).toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">{comparison.currentMonth.orders || 0} pedidos</p>
                  <p className="text-xs text-muted-foreground">Ticket: € {(comparison.currentMonth.averageTicket || 0).toFixed(2)}</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Mês Anterior</p>
                <div className="space-y-1">
                  <p className="font-semibold">€ {(comparison.lastMonth.revenue || 0).toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">{comparison.lastMonth.orders || 0} pedidos</p>
                  <p className="text-xs text-muted-foreground">Ticket: € {(comparison.lastMonth.averageTicket || 0).toFixed(2)}</p>
                </div>
              </div>

              <div className={`space-y-2 p-3 rounded-lg ${(comparison.growth.percentage || 0) >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
                <p className={`text-sm font-semibold ${(comparison.growth.percentage || 0) >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                  Crescimento
                </p>
                <div className="space-y-1">
                  <p className={`font-bold text-lg ${(comparison.growth.percentage || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {(comparison.growth.percentage || 0) >= 0 ? '+' : ''}{(comparison.growth.percentage || 0).toFixed(2)}%
                  </p>
                  <p className={`text-xs ${(comparison.growth.percentage || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {(comparison.growth.percentage || 0) >= 0 ? '+' : ''}€ {(comparison.growth.absolute || 0).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
