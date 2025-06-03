import React, { useState, useEffect } from 'react';
import { MainLayout } from '../components/Layout/MainLayout';
import { DITransactionController } from '../controllers/DITransactionController';
import { Card } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { PieChart, Pie, Cell, Legend, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Filter } from 'lucide-react';
import { Transaction } from '../lib/core-exports';

/**
 * Componente de Dashboard que utiliza injeção de dependência
 */
const DashboardDI: React.FC = () => {
  const [period, setPeriod] = useState<'month' | 'year'>('month');
  const [summary, setSummary] = useState<{
    receitas: number;
    despesas: number;
    saldo: number;
    transactions: Transaction[];
  }>({
    receitas: 0,
    despesas: 0,
    saldo: 0,
    transactions: []
  });
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Utilizando o DITransactionController para obter os dados
        const data = await DITransactionController.getFinancialSummary(period);
        setSummary(data);
        
        // Dados fictícios para o gráfico de linha (em uma aplicação real, viriam da API)
        const mockMonthlyData = [
          { name: 'Jan', receitas: 4000, despesas: 2400 },
          { name: 'Fev', receitas: 3000, despesas: 1398 },
          { name: 'Mar', receitas: 2000, despesas: 9800 },
          { name: 'Abr', receitas: 2780, despesas: 3908 },
          { name: 'Mai', receitas: 1890, despesas: 4800 },
          { name: 'Jun', receitas: 2390, despesas: 3800 },
        ];
        setMonthlyData(mockMonthlyData);
      } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [period]);

  const pieData = [
    { name: 'Receitas', value: summary.receitas > 0 ? summary.receitas : 0.1 },
    { name: 'Despesas', value: summary.despesas > 0 ? summary.despesas : 0.1 },
  ];

  const COLORS = ['#3b82f6', '#ef4444'];

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-emerald-800">Dashboard MEI</h1>
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

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-gray-500">Carregando dados...</p>
          </div>
        ) : (
          <>
            <Card className="p-6">
              <h3 className="text-lg font-medium text-black mb-4">Resumo Financeiro</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="text-sm text-gray-600">Total de Receitas</h4>
                  <p className="text-2xl font-bold text-blue-600">
                    R$ {summary.receitas.toFixed(2)}
                  </p>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <h4 className="text-sm text-gray-600">Total de Despesas</h4>
                  <p className="text-2xl font-bold text-red-600">
                    R$ {summary.despesas.toFixed(2)}
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="text-sm text-gray-600">Saldo</h4>
                  <p className="text-2xl font-bold text-green-600">
                    R$ {summary.saldo.toFixed(2)}
                  </p>
                </div>
              </div>
            </Card>

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
                    <RechartsTooltip formatter={(value) => [`R$ ${Number(value).toFixed(2)}`, 'Valor']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-medium text-black mb-4">Evolução Financeira</h3>
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
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default DashboardDI; 