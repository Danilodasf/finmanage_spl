
import React, { useState, useEffect } from 'react';
import { MainLayout } from '@/components/Layout/MainLayout';
import { TransactionController } from '@/controllers/TransactionController';
import { CategoryController } from '@/controllers/CategoryController';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard: React.FC = () => {
  const [period, setPeriod] = useState<'month' | 'year'>('month');
  const [summary, setSummary] = useState({
    receitas: 0,
    despesas: 0,
    saldo: 0,
    transactions: []
  });

  useEffect(() => {
    const data = TransactionController.getFinancialSummary(period);
    setSummary(data);
  }, [period]);

  const chartData = [
    {
      name: 'Receitas',
      value: summary.receitas,
    },
    {
      name: 'Despesas',
      value: summary.despesas,
    },
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <Select value={period} onValueChange={(value: 'month' | 'year') => setPeriod(value)}>
            <SelectTrigger className="w-32">
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
            <h3 className="text-sm font-medium text-gray-500">Receitas</h3>
            <p className="text-2xl font-bold text-green-600">
              R$ {summary.receitas.toFixed(2)}
            </p>
          </Card>
          
          <Card className="p-6">
            <h3 className="text-sm font-medium text-gray-500">Despesas</h3>
            <p className="text-2xl font-bold text-red-600">
              R$ {summary.despesas.toFixed(2)}
            </p>
          </Card>
          
          <Card className="p-6">
            <h3 className="text-sm font-medium text-gray-500">Saldo</h3>
            <p className={`text-2xl font-bold ${summary.saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              R$ {summary.saldo.toFixed(2)}
            </p>
          </Card>
        </div>

        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Receitas vs Despesas</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`R$ ${Number(value).toFixed(2)}`, 'Valor']} />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
