import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@finmanage/core';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@finmanage/core';
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DITransactionController } from '../controllers/DITransactionController';
import { DICategoryController } from '../controllers/DICategoryController';
import { Transaction, TransactionType } from '../lib/core/services';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { TrendingUp, TrendingDown, DollarSign, CreditCard, Filter } from 'lucide-react';

interface FinancialSummary {
  receitas: number;
  despesas: number;
  saldo: number;
  totalTransactions: number;
}

const Dashboard: React.FC = () => {
  const [period, setPeriod] = useState<'month' | 'quarter' | 'year' | 'all'>('month');

  const [summary, setSummary] = useState<FinancialSummary>({
    receitas: 0,
    despesas: 0,
    saldo: 0,
    totalTransactions: 0
  });
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);


  // Dados para gráficos - apenas dados reais
  const pieData = [
    { 
      name: 'Receitas', 
      value: summary.receitas, 
      fill: '#3b82f6' 
    },
    { 
      name: 'Despesas', 
      value: summary.despesas, 
      fill: '#ef4444' 
    }
  ];

  // Verifica se há dados para exibir no gráfico
  const hasFinancialData = summary.receitas > 0 || summary.despesas > 0;

  // Dados do gráfico de linha serão calculados dinamicamente baseados nas transações reais
  const lineData: any[] = [];

  useEffect(() => {
    loadDashboardData();
  }, [period]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // Buscar transações
      const transactionController = new DITransactionController();
      const transactionsResult = await transactionController.getAllTransactions();
      
      if (transactionsResult.success && transactionsResult.data) {
        const transactions = transactionsResult.data;
        
        // Calcular resumo financeiro
        const receitas = transactions
          .filter(t => t.type === TransactionType.INCOME)
          .reduce((sum, t) => sum + t.amount, 0);
        
        const despesas = transactions
          .filter(t => t.type === TransactionType.EXPENSE)
          .reduce((sum, t) => sum + t.amount, 0);
        
        setSummary({
          receitas,
          despesas,
          saldo: receitas - despesas,
          totalTransactions: transactions.length
        });
        
        // Pegar as 5 transações mais recentes
        const recent = transactions
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 5);
        
        setRecentTransactions(recent);
      }
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };



  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (date: string): string => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        <span className="ml-2 text-lg">Carregando dados...</span>
      </div>
    );
  }

  return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-emerald-800">Dashboard</h1>
          <div className="flex items-center space-x-3">
            {/* Filtro de Período */}
            <div className="flex items-center space-x-3 bg-white rounded-lg border border-gray-200 px-4 py-2 shadow-sm">
              <Filter className="h-4 w-4 text-emerald-600" />
              <span className="text-sm font-medium text-gray-700">Período:</span>
              <Select value={period} onValueChange={(value: 'month' | 'quarter' | 'year' | 'all') => setPeriod(value)}>
                <SelectTrigger className="w-36 border-0 shadow-none focus:ring-1 focus:ring-emerald-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 shadow-lg min-w-fit w-full">
                  <SelectItem value="month" className="bg-white hover:bg-emerald-50 focus:bg-emerald-50">Mensal</SelectItem>
                  <SelectItem value="quarter" className="bg-white hover:bg-emerald-50 focus:bg-emerald-50">Trimestral</SelectItem>
                  <SelectItem value="year" className="bg-white hover:bg-emerald-50 focus:bg-emerald-50">Anual</SelectItem>
                  <SelectItem value="all" className="bg-white hover:bg-emerald-50 focus:bg-emerald-50">Geral</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Receitas</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(summary.receitas)}
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Despesas</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(summary.despesas)}
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saldo</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${
                summary.saldo >= 0 ? 'text-blue-600' : 'text-red-600'
              }`}>
                {formatCurrency(summary.saldo)}
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Transações</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {summary.totalTransactions}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>Distribuição Financeira</CardTitle>
            </CardHeader>
            <CardContent>
              {hasFinancialData ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-[300px] text-gray-500">
                  <div className="text-6xl mb-4">📊</div>
                  <h3 className="text-lg font-medium mb-2">Nenhum dado financeiro</h3>
                  <p className="text-sm text-center">Adicione suas primeiras transações para ver a distribuição financeira</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white">
            <CardHeader>
              <CardTitle>Evolução Mensal</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={lineData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Legend />
                  <Line type="monotone" dataKey="receitas" stroke="#10b981" strokeWidth={2} name="Receitas" />
                  <Line type="monotone" dataKey="despesas" stroke="#ef4444" strokeWidth={2} name="Despesas" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Transações Recentes */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle>Transações Recentes</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
          
          {recentTransactions.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <p>Nenhuma transação encontrada.</p>
              <p className="text-sm mt-1">Comece adicionando suas primeiras transações!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="px-6 py-4 flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {transaction.description}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatDate(transaction.date)}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      transaction.type === TransactionType.INCOME
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {transaction.type === TransactionType.INCOME ? 'Receita' : 'Despesa'}
                    </span>
                    
                    <span className={`text-sm font-semibold ${
                      transaction.type === TransactionType.INCOME
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}>
                      {transaction.type === TransactionType.INCOME ? '+' : '-'}
                      {formatCurrency(transaction.amount)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {recentTransactions.length > 0 && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <button className="text-sm text-emerald-600 hover:text-emerald-500 font-medium">
                Ver todas as transações →
              </button>
            </div>
          )}
          </CardContent>
        </Card>
      </div>
  );
};

export default Dashboard;