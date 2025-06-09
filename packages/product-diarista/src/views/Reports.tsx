import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@finmanage/core';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@finmanage/core';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@finmanage/core';
import { Popover, PopoverContent, PopoverTrigger } from '@finmanage/core';
import { Calendar } from '@finmanage/core';
import { Button } from '@finmanage/core';
import { Input } from '@finmanage/core';
import { Badge } from '@finmanage/core';
import jsPDF from 'jspdf';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon, Download, FileText, TrendingUp, TrendingDown, DollarSign, CreditCard } from 'lucide-react';
import { DITransactionController } from '../controllers/DITransactionController';
import { DICategoryController } from '../controllers/DICategoryController';
import { Transaction, TransactionType, Category } from '../lib/core/services';
import { cn } from '../lib/utils';

interface ReportFilters {
  startDate: string;
  endDate: string;
  type: 'all' | TransactionType;
  categoryId?: string;
}

interface ReportSummary {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  transactionCount: number;
}

const Reports: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<ReportSummary>({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
    transactionCount: 0
  });
  const [filters, setFilters] = useState<ReportFilters>({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    type: 'all'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Instanciar controladores
  const transactionController = new DITransactionController();
  const categoryController = new DICategoryController();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    generateReport();
  }, [transactions, filters]);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      console.log('Reports: Carregando dados...');
      
      // Carregar transações
      const transactionsResult = await transactionController.getAllTransactions();
      console.log('Reports: Resultado das transações:', transactionsResult);
      
      if (transactionsResult.data && !transactionsResult.error) {
        setTransactions(transactionsResult.data);
        console.log('Reports: Transações carregadas:', transactionsResult.data.length);
      } else {
        console.warn('Reports: Falha ao carregar transações:', transactionsResult.error);
        setTransactions([]);
      }

      // Carregar categorias
      const categoriesResult = await categoryController.getAllCategories();
      console.log('Reports: Resultado das categorias:', categoriesResult);
      
      if (categoriesResult.data && !categoriesResult.error) {
        setCategories(categoriesResult.data);
        console.log('Reports: Categorias carregadas:', categoriesResult.data.length);
      } else {
        console.warn('Reports: Falha ao carregar categorias:', categoriesResult.error);
        setCategories([]);
      }
    } catch (err) {
      console.error('Reports: Erro ao carregar dados:', err);
      setError('Erro ao carregar dados: ' + (err instanceof Error ? err.message : 'Erro desconhecido'));
    } finally {
      setIsLoading(false);
    }
  };

  const generateReport = () => {
    let filtered = transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      const startDate = new Date(filters.startDate);
      const endDate = new Date(filters.endDate);
      
      // Filtro por data
      if (transactionDate < startDate || transactionDate > endDate) {
        return false;
      }
      
      // Filtro por tipo
      if (filters.type !== 'all' && transaction.type !== filters.type) {
        return false;
      }
      
      // Filtro por categoria
      if (filters.categoryId && filters.categoryId !== 'all' && transaction.category_id !== filters.categoryId) {
        return false;
      }
      
      return true;
    });

    // Calcular resumo
    const totalIncome = filtered
      .filter(t => t.type === TransactionType.INCOME)
      .reduce((sum, t) => sum + t.value, 0);
    
    const totalExpenses = filtered
      .filter(t => t.type === TransactionType.EXPENSE)
      .reduce((sum, t) => sum + t.value, 0);
    
    const balance = totalIncome - totalExpenses;
    
    setFilteredTransactions(filtered);
    setSummary({
      totalIncome,
      totalExpenses,
      balance,
      transactionCount: filtered.length
    });
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value === '' ? undefined : value
    }));
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

  const generatePDF = () => {
    const doc = new jsPDF();
    
    // Definir datas do filtro
    const startDate = filters.startDate;
    const endDate = filters.endDate;
    
    // Calcular totais para o PDF
    const totalReceitas = filteredTransactions
      .filter(t => t.type === TransactionType.INCOME)
      .reduce((sum, t) => sum + t.value, 0);
    
    const totalDespesas = filteredTransactions
      .filter(t => t.type === TransactionType.EXPENSE)
      .reduce((sum, t) => sum + t.value, 0);
    
    // Configurações de cores e fontes
    const primaryColor = [34, 197, 94]; // emerald-500
    const secondaryColor = [75, 85, 99]; // gray-600
    const accentColor = [239, 68, 68]; // red-500
    const blueColor = [59, 130, 246]; // blue-500
    
    // Cabeçalho com design melhorado
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, 210, 25, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('RELATÓRIO FINANCEIRO DETALHADO', 105, 15, { align: 'center' });
    
    // Data do relatório
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Período: ${startDate} a ${endDate}`, 15, 35);
    doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 15, 42);
    
    // Linha separadora
    doc.setDrawColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.setLineWidth(0.5);
    doc.line(15, 47, 195, 47);
    
    let yPosition = 57;
    
    // Resumo financeiro com caixas coloridas
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('RESUMO FINANCEIRO', 15, yPosition);
    yPosition += 15;
    
    // Grid de 2x2 para métricas
    const boxWidth = 85;
    const boxHeight = 25;
    const spacing = 10;
    
    // Receitas
    doc.setFillColor(220, 252, 231); // green-50
    doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(15, yPosition, boxWidth, boxHeight, 'FD');
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('RECEITAS TOTAIS', 20, yPosition + 8);
    doc.setFontSize(12);
    doc.text(`R$ ${totalReceitas.toFixed(2)}`, 20, yPosition + 18);
    
    // Despesas
    doc.setFillColor(254, 242, 242); // red-50
    doc.setDrawColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.rect(15 + boxWidth + spacing, yPosition, boxWidth, boxHeight, 'FD');
    doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('DESPESAS TOTAIS', 20 + boxWidth + spacing, yPosition + 8);
    doc.setFontSize(12);
    doc.text(`R$ ${totalDespesas.toFixed(2)}`, 20 + boxWidth + spacing, yPosition + 18);
    
    yPosition += boxHeight + spacing;
    
    // Saldo
    const saldo = totalReceitas - totalDespesas;
    const saldoColor = saldo >= 0 ? primaryColor : accentColor;
    const saldoBackground = saldo >= 0 ? [220, 252, 231] : [254, 242, 242];
    
    doc.setFillColor(...saldoBackground);
    doc.setDrawColor(...saldoColor);
    doc.rect(15, yPosition, boxWidth, boxHeight, 'FD');
    doc.setTextColor(...saldoColor);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('SALDO FINAL', 20, yPosition + 8);
    doc.setFontSize(12);
    doc.text(`R$ ${saldo.toFixed(2)}`, 20, yPosition + 18);
    
    // Total de transações
    doc.setFillColor(239, 246, 255); // blue-50
    doc.setDrawColor(blueColor[0], blueColor[1], blueColor[2]);
    doc.rect(15 + boxWidth + spacing, yPosition, boxWidth, boxHeight, 'FD');
    doc.setTextColor(blueColor[0], blueColor[1], blueColor[2]);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL TRANSAÇÕES', 20 + boxWidth + spacing, yPosition + 8);
    doc.setFontSize(12);
    doc.text(`${filteredTransactions.length}`, 20 + boxWidth + spacing, yPosition + 18);
    
    yPosition += boxHeight + 20;
    
    // Detalhes das transações
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('DETALHES DAS TRANSAÇÕES', 15, yPosition);
    yPosition += 15;
    
    // Cabeçalho da tabela
    doc.setFillColor(243, 244, 246); // gray-100
    doc.setDrawColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.rect(15, yPosition - 5, 180, 12, 'FD');
    
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('DATA', 20, yPosition + 2);
    doc.text('DESCRIÇÃO', 45, yPosition + 2);
    doc.text('CATEGORIA', 100, yPosition + 2);
    doc.text('TIPO', 140, yPosition + 2);
    doc.text('VALOR', 170, yPosition + 2);
    
    yPosition += 15;
    
    // Dados das transações
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    
    filteredTransactions.forEach((transaction, index) => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
        
        // Repetir cabeçalho na nova página
        doc.setFillColor(243, 244, 246);
        doc.setDrawColor(...secondaryColor);
        doc.rect(15, yPosition - 5, 180, 12, 'FD');
        
        doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('DATA', 20, yPosition + 2);
        doc.text('DESCRIÇÃO', 45, yPosition + 2);
        doc.text('CATEGORIA', 100, yPosition + 2);
        doc.text('TIPO', 140, yPosition + 2);
        doc.text('VALOR', 170, yPosition + 2);
        
        yPosition += 15;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
      }
      
      // Linha alternada
      if (index % 2 === 0) {
        doc.setFillColor(249, 250, 251); // gray-50
        doc.rect(15, yPosition - 3, 180, 10, 'F');
      }
      
      doc.setTextColor(31, 41, 55); // gray-800
      doc.text(new Date(transaction.date).toLocaleDateString('pt-BR'), 20, yPosition + 2);
      doc.text(transaction.description.substring(0, 20), 45, yPosition + 2);
      
      const categoria = categories.find(c => c.id === transaction.category_id);
      doc.text(categoria ? categoria.name.substring(0, 15) : 'N/A', 100, yPosition + 2);
      
      // Tipo com cor
      const tipoColor = transaction.type === TransactionType.INCOME ? primaryColor : accentColor;
      doc.setTextColor(tipoColor[0], tipoColor[1], tipoColor[2]);
      doc.text(transaction.type === TransactionType.INCOME ? 'RECEITA' : 'DESPESA', 140, yPosition + 2);
      
      // Valor com cor
      const valorColor = transaction.type === TransactionType.INCOME ? primaryColor : accentColor;
      doc.setTextColor(valorColor[0], valorColor[1], valorColor[2]);
      const valorText = `${transaction.type === TransactionType.INCOME ? '+' : '-'} R$ ${transaction.value.toFixed(2)}`;
      doc.text(valorText, 170, yPosition + 2);
      
      yPosition += 12;
    });
    
    // Rodapé
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(0, 285, 210, 12, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text('FinManage Diarista - Sistema de Gestão Financeira', 15, 292);
      doc.text(`Página ${i} de ${pageCount}`, 195, 292, { align: 'right' });
    }
    
    doc.save(`relatorio-financeiro-${startDate}-${endDate}.pdf`);
  };

  const getCategoryName = (categoryId: string): string => {
    const category = categories.find(c => c.id === categoryId);
    return category?.name || 'Categoria não encontrada';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-6"></div>
            <div className="bg-white p-6 rounded-lg shadow mb-6 h-64"></div>
            <div className="bg-white p-6 rounded-lg shadow h-96"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-emerald-800">Relatórios</h1>

        {/* Filtros */}
        <Card className="mb-6 bg-white border border-gray-200 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold text-emerald-800">Filtros do Relatório</CardTitle>
          </CardHeader>
          <CardContent className="bg-white">
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {typeof error === 'string' ? error : 'Erro inesperado'}
            </div>
          )}
          

          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Data Inicial</label>
              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Data Final</label>
              <Input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo</label>
              <Select value={filters.type} onValueChange={(value) => setFilters(prev => ({ ...prev, type: value as 'all' | TransactionType }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 shadow-lg min-w-fit w-full">
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value={TransactionType.INCOME}>Receitas</SelectItem>
                  <SelectItem value={TransactionType.EXPENSE}>Despesas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Categoria</label>
              <Select value={filters.categoryId || ''} onValueChange={(value) => setFilters(prev => ({ ...prev, categoryId: value || undefined }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as categorias" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-200 shadow-lg min-w-fit w-full">
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-3">
            <Button 
              onClick={generatePDF}
              disabled={filteredTransactions.length === 0}
              className="bg-emerald-800 hover:bg-emerald-700 text-white"
            >
              <FileText className="mr-2 h-4 w-4" />
              Gerar PDF
            </Button>
          </div>
        </CardContent>
      </Card>

        {/* Resumo */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Resumo do Período</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
                  <p className="text-sm font-medium">Receitas</p>
                </div>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(summary.totalIncome)}
                </p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <TrendingDown className="h-5 w-5 text-red-600 mr-2" />
                  <p className="text-sm font-medium">Despesas</p>
                </div>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(summary.totalExpenses)}
                </p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <DollarSign className="h-5 w-5 text-blue-600 mr-2" />
                  <p className="text-sm font-medium">Saldo</p>
                </div>
                <p className={`text-2xl font-bold ${
                  summary.balance >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(summary.balance)}
                </p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <CreditCard className="h-5 w-5 text-gray-600 mr-2" />
                  <p className="text-sm font-medium">Transações</p>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {summary.transactionCount}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Transações */}
        <Card>
          <CardHeader>
            <CardTitle>Transações ({filteredTransactions.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredTransactions.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">
                <p>Nenhuma transação encontrada para os filtros selecionados.</p>
                <p className="text-sm mt-1">Ajuste os filtros ou adicione novas transações!</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium">
                        {formatDate(transaction.date)}
                      </TableCell>
                      <TableCell>{transaction.description}</TableCell>
                      <TableCell>{getCategoryName(transaction.category_id)}</TableCell>
                      <TableCell>
                         <Badge variant={transaction.type === TransactionType.INCOME ? "default" : "destructive"}>
                           {transaction.type === TransactionType.INCOME ? 'Receita' : 'Despesa'}
                         </Badge>
                       </TableCell>
                       <TableCell className="text-right font-medium">
                         <span className={transaction.type === TransactionType.INCOME ? 'text-green-600' : 'text-red-600'}>
                           {formatCurrency(transaction.value)}
                         </span>
                       </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Reports;