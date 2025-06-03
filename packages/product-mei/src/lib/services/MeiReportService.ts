import { ReportService, ReportData, Transaction, Category } from '../core-exports';
import jsPDF from 'jspdf';

/**
 * Implementação do serviço de relatórios para o produto MEI
 */
export class MeiReportService implements ReportService {
  // Chaves para armazenamento local
  private transactionsStorageKey = 'finmanage_mei_transactions';
  private categoriesStorageKey = 'finmanage_mei_categories';

  /**
   * Dados simulados para demonstração
   */
  private getSimulatedTransactions(): Transaction[] {
    const transactions = localStorage.getItem(this.transactionsStorageKey);
    if (transactions) {
      return JSON.parse(transactions);
    }

    // Transações simuladas se não houver dados
    const simulatedTransactions: Transaction[] = [
      { id: '1', type: 'receita', date: '2023-06-01', value: 4000, description: 'Vendas de produtos', categoryId: '1', created_at: '2023-06-01T10:00:00Z', updated_at: '2023-06-01T10:00:00Z' },
      { id: '2', type: 'receita', date: '2023-06-15', value: 3000, description: 'Prestação de serviço', categoryId: '2', created_at: '2023-06-15T10:00:00Z', updated_at: '2023-06-15T10:00:00Z' },
      { id: '3', type: 'despesa', date: '2023-06-05', value: 1200, description: 'Compra de materiais', categoryId: '3', created_at: '2023-06-05T10:00:00Z', updated_at: '2023-06-05T10:00:00Z' },
      { id: '4', type: 'despesa', date: '2023-06-10', value: 1500, description: 'Aluguel do escritório', categoryId: '4', created_at: '2023-06-10T10:00:00Z', updated_at: '2023-06-10T10:00:00Z' },
      { id: '5', type: 'despesa', date: '2023-06-20', value: 800, description: 'Impostos', categoryId: '5', created_at: '2023-06-20T10:00:00Z', updated_at: '2023-06-20T10:00:00Z' },
      { id: '6', type: 'receita', date: '2023-07-01', value: 4500, description: 'Vendas de produtos', categoryId: '1', created_at: '2023-07-01T10:00:00Z', updated_at: '2023-07-01T10:00:00Z' },
      { id: '7', type: 'receita', date: '2023-07-15', value: 3500, description: 'Prestação de serviço', categoryId: '2', created_at: '2023-07-15T10:00:00Z', updated_at: '2023-07-15T10:00:00Z' },
      { id: '8', type: 'despesa', date: '2023-07-05', value: 1300, description: 'Compra de materiais', categoryId: '3', created_at: '2023-07-05T10:00:00Z', updated_at: '2023-07-05T10:00:00Z' },
      { id: '9', type: 'despesa', date: '2023-07-10', value: 1500, description: 'Aluguel do escritório', categoryId: '4', created_at: '2023-07-10T10:00:00Z', updated_at: '2023-07-10T10:00:00Z' },
      { id: '10', type: 'despesa', date: '2023-07-20', value: 850, description: 'Impostos', categoryId: '5', created_at: '2023-07-20T10:00:00Z', updated_at: '2023-07-20T10:00:00Z' },
    ];

    // Salvar transações simuladas
    localStorage.setItem(this.transactionsStorageKey, JSON.stringify(simulatedTransactions));

    return simulatedTransactions;
  }

  /**
   * Busca categorias do armazenamento local
   */
  private getCategories(): Category[] {
    const categories = localStorage.getItem(this.categoriesStorageKey);
    if (categories) {
      return JSON.parse(categories);
    }

    // Categorias padrão se não houver dados
    const defaultCategories: Category[] = [
      { id: '1', name: 'Vendas', type: 'receita' },
      { id: '2', name: 'Serviços', type: 'receita' },
      { id: '3', name: 'Materiais', type: 'despesa' },
      { id: '4', name: 'Aluguel', type: 'despesa' },
      { id: '5', name: 'Impostos', type: 'despesa' },
      { id: '6', name: 'Água/Luz/Internet', type: 'despesa' },
      { id: '7', name: 'Transporte', type: 'despesa' },
      { id: '8', name: 'Alimentação', type: 'despesa' },
      { id: '9', name: 'Pró-labore', type: 'ambos' },
    ];

    return defaultCategories;
  }

  /**
   * Gera um relatório com base nos filtros fornecidos
   * @param filters Filtros para o relatório
   */
  async generateReport(filters: {
    startDate: Date;
    endDate: Date;
    categoryId?: string;
    type?: 'receita' | 'despesa' | 'ambos';
  }): Promise<{ data: ReportData | null; error: Error | null }> {
    try {
      const allTransactions = this.getSimulatedTransactions();
      const categories = this.getCategories();

      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 800));

      // Filtrar transações por período
      const filteredTransactions = allTransactions.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        const isInPeriod = 
          transactionDate >= new Date(filters.startDate.setHours(0, 0, 0, 0)) && 
          transactionDate <= new Date(filters.endDate.setHours(23, 59, 59, 999));
        
        if (!isInPeriod) return false;

        // Filtrar por categoria se especificada
        if (filters.categoryId && transaction.categoryId !== filters.categoryId) {
          return false;
        }

        // Filtrar por tipo se especificado
        if (filters.type && filters.type !== 'ambos' && transaction.type !== filters.type) {
          return false;
        }

        return true;
      });

      // Calcular resumo
      const totalReceitas = filteredTransactions
        .filter(t => t.type === 'receita')
        .reduce((sum, t) => sum + t.value, 0);

      const totalDespesas = filteredTransactions
        .filter(t => t.type === 'despesa')
        .reduce((sum, t) => sum + t.value, 0);

      const reportData: ReportData = {
        transactions: filteredTransactions,
        categories,
        summary: {
          totalReceitas,
          totalDespesas,
          saldo: totalReceitas - totalDespesas
        },
        period: {
          startDate: filters.startDate,
          endDate: filters.endDate
        }
      };

      return { data: reportData, error: null };
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      return { data: null, error: error as Error };
    }
  }

  /**
   * Exporta um relatório para PDF
   * @param reportData Dados do relatório
   */
  async exportToPDF(reportData: ReportData): Promise<{ success: boolean; error: Error | null }> {
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Título
      pdf.setFontSize(18);
      pdf.text('Relatório Financeiro MEI', pageWidth / 2, 15, { align: 'center' });
      
      // Data do relatório
      const startDate = reportData.period.startDate.toLocaleDateString('pt-BR');
      const endDate = reportData.period.endDate.toLocaleDateString('pt-BR');
      pdf.setFontSize(12);
      pdf.text(`Período: ${startDate} a ${endDate}`, pageWidth / 2, 25, { align: 'center' });
      
      const today = new Date();
      pdf.setFontSize(10);
      pdf.text(`Gerado em: ${today.toLocaleDateString('pt-BR')}`, pageWidth - 20, 10, { align: 'right' });
      
      // Resumo financeiro
      pdf.setFontSize(14);
      pdf.text('Resumo Financeiro', 14, 35);
      
      pdf.setFontSize(12);
      pdf.text(`Total de Receitas: R$ ${reportData.summary.totalReceitas.toFixed(2)}`, 14, 45);
      pdf.text(`Total de Despesas: R$ ${reportData.summary.totalDespesas.toFixed(2)}`, 14, 52);
      pdf.text(`Saldo: R$ ${reportData.summary.saldo.toFixed(2)}`, 14, 59);
      
      // Informações adicionais
      pdf.setFontSize(10);
      pdf.text('* Este relatório foi gerado automaticamente pelo sistema FinManage MEI.', 14, pageHeight - 20);
      
      // Salvar o PDF
      pdf.save(`relatorio-mei-${today.toISOString().split('T')[0]}.pdf`);
      
      return { success: true, error: null };
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      return { success: false, error: error as Error };
    }
  }

  /**
   * Obtém um resumo financeiro para um período específico
   * @param period Período (mês, trimestre ou ano)
   */
  async getFinancialSummary(period: 'month' | 'quarter' | 'year'): Promise<{
    receitas: number;
    despesas: number;
    saldo: number;
    transactions: Transaction[];
  }> {
    try {
      const now = new Date();
      let startDate: Date, endDate: Date;
      
      // Definir período
      if (period === 'month') {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      } else if (period === 'quarter') {
        const currentQuarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), currentQuarter * 3, 1);
        endDate = new Date(now.getFullYear(), (currentQuarter + 1) * 3, 0);
      } else { // year
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear(), 11, 31);
      }
      
      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 500));

      // Buscar transações e filtrar pelo período
      const allTransactions = this.getSimulatedTransactions();
      const filteredTransactions = allTransactions.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate >= startDate && transactionDate <= endDate;
      });
      
      // Calcular receitas e despesas
      const receitas = filteredTransactions
        .filter(t => t.type === 'receita')
        .reduce((sum, t) => sum + t.value, 0);
      
      const despesas = filteredTransactions
        .filter(t => t.type === 'despesa')
        .reduce((sum, t) => sum + t.value, 0);

      return {
        receitas,
        despesas,
        saldo: receitas - despesas,
        transactions: filteredTransactions
      };
    } catch (error) {
      console.error('Erro ao calcular resumo financeiro:', error);
      return {
        receitas: 0,
        despesas: 0,
        saldo: 0,
        transactions: []
      };
    }
  }
} 