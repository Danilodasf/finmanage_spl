import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/Layout/MainLayout';
import { DITransactionController } from '@/controllers/DITransactionController';
import { DICategoryController } from '@/controllers/DICategoryController';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PieChart, Pie, Cell, Legend, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Filter, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { Transaction } from '@finmanage/core/services';

const DashboardDI: React.FC = () => {
  const { user } = useAuth();
  const [period, setPeriod] = useState<'month' | 'year'>('month');
  const [summary, setSummary] = useState({
    receitas: 0,
    despesas: 0,
    saldo: 0,
    transactions: [] as Transaction[]
  });
  const [monthlyData, setMonthlyData] = useState<{ name: string; receitas: number; despesas: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        if (user) {
          // Buscar dados reais usando o DITransactionController
          const financialSummary = await DITransactionController.getFinancialSummary(period);
          setSummary(financialSummary);
          
          // Buscar dados históricos para o gráfico de linha
          const historicalData = await DITransactionController.getMonthlyData(selectedYear);
          setMonthlyData(historicalData);
        }
      } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [period, user, selectedYear]);

  const pieData = [
    { name: 'Receitas', value: summary.receitas > 0 ? summary.receitas : 0.1 },
    { name: 'Despesas', value: summary.despesas > 0 ? summary.despesas : 0.1 },
  ];

  const COLORS = ['#3b82f6', '#ef4444'];

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          <span className="ml-2 text-lg">Carregando dashboard...</span>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-emerald-800">Dashboard</h1>
          </div>
          <Select value={period} onValueChange={(value: 'month' | 'year') => setPeriod(value)}>
            <SelectTrigger className="w-32">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Mês</SelectItem>
              <SelectItem value="year">Ano</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6">
            <h3 className="text-sm font-medium text-black">Receitas</h3>
            <p className="text-2xl font-bold text-blue-600">
              R$ {summary.receitas.toFixed(2)}
            </p>
          </Card>
          
          <Card className="p-6">
            <h3 className="text-sm font-medium text-black">Despesas</h3>
            <p className="text-2xl font-bold text-red-600">
              R$ {summary.despesas.toFixed(2)}
            </p>
          </Card>
          
          <Card className="p-6">
            <h3 className="text-sm font-medium text-black">Saldo</h3>
            <p className={`text-2xl font-bold ${summary.saldo >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
              R$ {summary.saldo.toFixed(2)}
            </p>
          </Card>
        </div>

        <Card className="p-6">
          <h3 className="text-lg font-medium text-black mb-4">Distribuição Financeira</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip formatter={(value) => [`R$ ${Number(value).toFixed(2)}`, 'Valor']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-black">Evolução Financeira</h3>
            <Select 
              value={selectedYear.toString()} 
              onValueChange={(value) => setSelectedYear(Number(value))}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`R$ ${Number(value).toFixed(2)}`, '']} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="receitas" 
                  stroke="#3b82f6" 
                  strokeWidth={2} 
                  activeDot={{ r: 8 }} 
                  name="Receitas"
                />
                <Line 
                  type="monotone" 
                  dataKey="despesas" 
                  stroke="#ef4444" 
                  strokeWidth={2} 
                  name="Despesas"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
};

export default DashboardDI; 