import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/Layout/MainLayout';
import { TransactionController } from '@/controllers/TransactionController';
import { CategoryController } from '@/controllers/CategoryController';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PieChart, Pie, Cell, Legend, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Filter } from 'lucide-react';

const Dashboard: React.FC = () => {
  const [period, setPeriod] = useState<'month' | 'year'>('month');
  const [summary, setSummary] = useState({
    receitas: 0,
    despesas: 0,
    saldo: 0,
    transactions: []
  });
  const [monthlyData, setMonthlyData] = useState<any[]>([]);

  useEffect(() => {
    // Na versão real, chamaria o controller com dados reais
    // Aqui estamos usando dados fictícios para simulação
    const mockData = {
      receitas: 3500,
      despesas: 2300,
      saldo: 1200,
      transactions: []
    };
    setSummary(mockData);
    
    // Dados fictícios para o gráfico de linha
    const mockMonthlyData = [
      { name: 'Jan', receitas: 4000, despesas: 2400 },
      { name: 'Fev', receitas: 3000, despesas: 1398 },
      { name: 'Mar', receitas: 2000, despesas: 9800 },
      { name: 'Abr', receitas: 2780, despesas: 3908 },
      { name: 'Mai', receitas: 1890, despesas: 4800 },
      { name: 'Jun', receitas: 2390, despesas: 3800 },
    ];
    setMonthlyData(mockMonthlyData);
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
          <h1 className="text-2xl font-bold text-emerald-800">Dashboard</h1>
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
      </div>
    </MainLayout>
  );
};

export default Dashboard; 