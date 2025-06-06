import React, { useState, useRef, useEffect } from 'react';
import { MainLayout } from '../components/Layout/MainLayout';
import { Card } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Button } from '../components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Download, Loader2 } from 'lucide-react';
import { toast } from '../lib/core-exports';
import { DIReportController } from '../controllers/DIReportController';
import { supabase, getCurrentUserId } from '../lib/supabase';

const ReportsDI: React.FC = () => {
  const [period, setPeriod] = useState<'month' | 'quarter' | 'year'>('month');
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [summary, setSummary] = useState({
    receitas: 0,
    despesas: 0,
    saldo: 0
  });
  const [transactions, setTransactions] = useState([]);
  const chartRef1 = useRef<HTMLDivElement>(null);
  const chartRef2 = useRef<HTMLDivElement>(null);
  
  // Dados para o gráfico de barras (receitas vs despesas)
  const [barChartData, setBarChartData] = useState([]);
  
  // Dados para o gráfico de pizza (distribuição por categoria)
  const [pieChartData, setPieChartData] = useState([]);
  
  // Cores para o gráfico de pizza
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#4CAF50', '#F44336', '#2196F3', '#FF9800'];

  useEffect(() => {
    loadData();
  }, [period]);

  /**
   * Carrega os dados do relatório com base no período selecionado
   */
  const loadData = async () => {
    setIsLoading(true);
    try {
      const userId = await getCurrentUserId();
      if (!userId) {
        throw new Error('Usuário não autenticado');
      }

      // Calcular datas baseadas no período
      const now = new Date();
      let startDate: Date;
      let endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0); // Último dia do mês atual

      switch (period) {
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'quarter':
          const quarterStart = Math.floor(now.getMonth() / 3) * 3;
          startDate = new Date(now.getFullYear(), quarterStart, 1);
          endDate = new Date(now.getFullYear(), quarterStart + 3, 0);
          break;
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1);
          endDate = new Date(now.getFullYear(), 11, 31);
          break;
        default:
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      }

      // Buscar transações do Supabase
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0])
        .order('date', { ascending: false });

      if (transactionsError) {
        throw transactionsError;
      }

      const transactionsArray = transactionsData || [];
      setTransactions(transactionsArray);

      // Calcular resumo financeiro
      const receitas = transactionsArray
        .filter(t => t.type === 'receita')
        .reduce((sum, t) => sum + (t.value || 0), 0);
      
      const despesas = transactionsArray
        .filter(t => t.type === 'despesa')
        .reduce((sum, t) => sum + (t.value || 0), 0);
      
      setSummary({
        receitas,
        despesas,
        saldo: receitas - despesas
      });
      
      // Buscar categorias para os gráficos
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', userId);

      if (categoriesError) {
        throw categoriesError;
      }

      const categoriesArray = categoriesData || [];

      // Preparar dados para gráfico de barras (por mês)
      const monthlyData = [];
      const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      
      for (let i = 0; i < 12; i++) {
        const monthTransactions = transactionsArray.filter(t => {
          const transactionDate = new Date(t.date);
          return transactionDate.getMonth() === i;
        });
        
        const receitas = monthTransactions
          .filter(t => t.type === 'receita')
          .reduce((sum, t) => sum + (t.value || 0), 0);
        
        const despesas = monthTransactions
          .filter(t => t.type === 'despesa')
          .reduce((sum, t) => sum + (t.value || 0), 0);
        
        monthlyData.push({
          name: months[i],
          receitas,
          despesas
        });
      }
      
      setBarChartData(monthlyData);

      // Preparar dados para gráfico de pizza (por categoria)
      const categoryTotals = new Map();
      
      transactionsArray.forEach(transaction => {
        const category = categoriesArray.find(c => c.id === transaction.category_id);
        const categoryName = category?.name || 'Sem categoria';
        
        if (!categoryTotals.has(categoryName)) {
          categoryTotals.set(categoryName, 0);
        }
        
        categoryTotals.set(categoryName, categoryTotals.get(categoryName) + (transaction.value || 0));
      });
      
      const pieData = Array.from(categoryTotals.entries()).map(([name, value]) => ({
        name,
        value
      }));
      
      setPieChartData(pieData);
    } catch (error) {
      console.error('Erro ao carregar dados do relatório:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados do relatório.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Processa os dados para o gráfico de barras
   */
  const processBarChartData = (transactions) => {
    // Agrupar transações por mês ou período relevante
    const groupedData = {};
    
    transactions.forEach(transaction => {
      const date = new Date(transaction.date);
      let key;
      
      if (period === 'month') {
        // Agrupar por dia
        key = date.getDate().toString().padStart(2, '0');
      } else if (period === 'quarter') {
        // Agrupar por mês dentro do trimestre
        const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        key = monthNames[date.getMonth()];
      } else {
        // Agrupar por mês para o ano
        const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        key = monthNames[date.getMonth()];
      }
      
      if (!groupedData[key]) {
        groupedData[key] = { name: key, receitas: 0, despesas: 0 };
      }
      
      if (transaction.type === 'receita') {
        groupedData[key].receitas += transaction.value;
      } else {
        groupedData[key].despesas += transaction.value;
      }
    });
    
    // Converter para array e ordenar
    let result = Object.values(groupedData);
    
    if (period === 'month') {
      // Ordenar por dia para período mensal
      result = result.sort((a, b) => parseInt(a.name) - parseInt(b.name));
    }
    
    setBarChartData(result);
  };

  /**
   * Processa os dados para o gráfico de pizza
   */
  const processPieChartData = (transactions) => {
    // Agrupar por categoria
    const groupedByCategory = {};
    
    transactions.forEach(transaction => {
      if (!groupedByCategory[transaction.categoryId]) {
        groupedByCategory[transaction.categoryId] = {
          categoryId: transaction.categoryId,
          name: getCategoryName(transaction.categoryId),
          value: 0
        };
      }
      
      groupedByCategory[transaction.categoryId].value += transaction.value;
    });
    
    // Converter para array
    const result = Object.values(groupedByCategory);
    
    // Ordenar por valor (decrescente)
    result.sort((a, b) => b.value - a.value);
    
    setPieChartData(result);
  };

  /**
   * Obtém o nome da categoria pelo ID
   */
  const getCategoryName = (categoryId) => {
    // Mapeamento simples para as categorias conhecidas
    const categoryMap = {
      '1': 'Vendas',
      '2': 'Serviços',
      '3': 'Materiais',
      '4': 'Aluguel',
      '5': 'Impostos',
      '6': 'Água/Luz/Internet',
      '7': 'Transporte',
      '8': 'Alimentação',
      '9': 'Pró-labore'
    };
    
    return categoryMap[categoryId] || `Categoria ${categoryId}`;
  };

  /**
   * Exporta o relatório para PDF
   */
  const exportToPDF = async () => {
    setIsExporting(true);
    try {
      // Preparar dados do relatório
      const reportData = {
        transactions,
        categories: [],
        summary: {
          totalReceitas: summary.receitas,
          totalDespesas: summary.despesas,
          saldo: summary.saldo
        },
        period: {
          startDate: getPeriodStartDate(),
          endDate: getPeriodEndDate()
        }
      };
      
      // Exportar para PDF
      await DIReportController.exportToPDF(reportData);
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      toast({
        title: "Erro ao exportar PDF",
        description: "Ocorreu um erro ao gerar o relatório. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  /**
   * Obtém a data de início do período selecionado
   */
  const getPeriodStartDate = () => {
    const now = new Date();
    
    if (period === 'month') {
      return new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (period === 'quarter') {
      const currentQuarter = Math.floor(now.getMonth() / 3);
      return new Date(now.getFullYear(), currentQuarter * 3, 1);
    } else {
      return new Date(now.getFullYear(), 0, 1);
    }
  };

  /**
   * Obtém a data de fim do período selecionado
   */
  const getPeriodEndDate = () => {
    const now = new Date();
    
    if (period === 'month') {
      return new Date(now.getFullYear(), now.getMonth() + 1, 0);
    } else if (period === 'quarter') {
      const currentQuarter = Math.floor(now.getMonth() / 3);
      return new Date(now.getFullYear(), (currentQuarter + 1) * 3, 0);
    } else {
      return new Date(now.getFullYear(), 11, 31);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-emerald-800">Relatórios MEI</h1>
          
          <div className="flex space-x-4">
            <Select value={period} onValueChange={(value: 'month' | 'quarter' | 'year') => setPeriod(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">Mensal</SelectItem>
                <SelectItem value="quarter">Trimestral</SelectItem>
                <SelectItem value="year">Anual</SelectItem>
              </SelectContent>
            </Select>
            
            <Button 
              variant="outline" 
              onClick={exportToPDF}
              disabled={isExporting || isLoading}
            >
              {isExporting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              Exportar PDF
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-80">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            <span className="ml-2 text-emerald-800">Carregando dados...</span>
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

            <Card className="p-6" ref={chartRef1}>
              <h3 className="text-lg font-medium text-black mb-4">Receitas vs Despesas</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={barChartData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => `R$ ${Number(value).toFixed(2)}`} />
                    <Legend />
                    <Bar dataKey="receitas" fill="#3b82f6" name="Receitas" />
                    <Bar dataKey="despesas" fill="#ef4444" name="Despesas" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
            
            <Card className="p-6" ref={chartRef2}>
              <h3 className="text-lg font-medium text-black mb-4">Distribuição por Categoria</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `R$ ${Number(value).toFixed(2)}`} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default ReportsDI;