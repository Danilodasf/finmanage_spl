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
    const currentYear = new Date().getFullYear();
    const simulatedTransactions: Transaction[] = [
      { id: '1', type: 'receita', date: `${currentYear}-06-01`, value: 4000, description: 'Vendas de produtos', categoryId: '1', created_at: `${currentYear}-06-01T10:00:00Z`, updated_at: `${currentYear}-06-01T10:00:00Z` },
      { id: '2', type: 'receita', date: `${currentYear}-06-15`, value: 3000, description: 'Prestação de serviço', categoryId: '2', created_at: `${currentYear}-06-15T10:00:00Z`, updated_at: `${currentYear}-06-15T10:00:00Z` },
      { id: '3', type: 'despesa', date: `${currentYear}-06-05`, value: 1200, description: 'Compra de materiais', categoryId: '3', created_at: `${currentYear}-06-05T10:00:00Z`, updated_at: `${currentYear}-06-05T10:00:00Z` },
      { id: '4', type: 'despesa', date: `${currentYear}-06-10`, value: 1500, description: 'Aluguel do escritório', categoryId: '4', created_at: `${currentYear}-06-10T10:00:00Z`, updated_at: `${currentYear}-06-10T10:00:00Z` },
      { id: '5', type: 'despesa', date: `${currentYear}-06-20`, value: 800, description: 'Impostos', categoryId: '5', created_at: `${currentYear}-06-20T10:00:00Z`, updated_at: `${currentYear}-06-20T10:00:00Z` },
      { id: '6', type: 'receita', date: `${currentYear}-07-01`, value: 4500, description: 'Vendas de produtos', categoryId: '1', created_at: `${currentYear}-07-01T10:00:00Z`, updated_at: `${currentYear}-07-01T10:00:00Z` },
      { id: '7', type: 'receita', date: `${currentYear}-07-15`, value: 3500, description: 'Prestação de serviço', categoryId: '2', created_at: `${currentYear}-07-15T10:00:00Z`, updated_at: `${currentYear}-07-15T10:00:00Z` },
      { id: '8', type: 'despesa', date: `${currentYear}-07-05`, value: 1300, description: 'Compra de materiais', categoryId: '3', created_at: `${currentYear}-07-05T10:00:00Z`, updated_at: `${currentYear}-07-05T10:00:00Z` },
      { id: '9', type: 'despesa', date: `${currentYear}-07-10`, value: 1500, description: 'Aluguel do escritório', categoryId: '4', created_at: `${currentYear}-07-10T10:00:00Z`, updated_at: `${currentYear}-07-10T10:00:00Z` },
      { id: '10', type: 'despesa', date: `${currentYear}-07-20`, value: 850, description: 'Impostos', categoryId: '5', created_at: `${currentYear}-07-20T10:00:00Z`, updated_at: `${currentYear}-07-20T10:00:00Z` },
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
      let yPosition = 20;
      
      // Cabeçalho com fundo colorido
      pdf.setFillColor(16, 185, 129); // Verde emerald
      pdf.rect(0, 0, pageWidth, 35, 'F');
      
      // Logo/Título
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(22);
      pdf.setFont('helvetica', 'bold');
      pdf.text('FinManage MEI', pageWidth / 2, 15, { align: 'center' });
      
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Relatório Financeiro Detalhado', pageWidth / 2, 25, { align: 'center' });
      
      // Data de geração no canto superior direito
      const today = new Date();
      pdf.setFontSize(9);
      pdf.text(`Gerado em: ${today.toLocaleDateString('pt-BR')} às ${today.toLocaleTimeString('pt-BR')}`, pageWidth - 10, 30, { align: 'right' });
      
      yPosition = 45;
      
      // Reset cor do texto
      pdf.setTextColor(0, 0, 0);
      
      // Período do relatório
      const startDate = reportData.period.startDate.toLocaleDateString('pt-BR');
      const endDate = reportData.period.endDate.toLocaleDateString('pt-BR');
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Período Analisado:', 20, yPosition);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`${startDate} a ${endDate}`, 60, yPosition);
      yPosition += 15;
      
      // Seção de Resumo Financeiro com caixas coloridas
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Resumo Financeiro', 20, yPosition);
      yPosition += 15;
      
      // Caixa de Receitas
      pdf.setFillColor(220, 252, 231); // Verde claro
      pdf.setDrawColor(16, 185, 129); // Verde escuro
      pdf.rect(20, yPosition - 5, 50, 20, 'FD');
      pdf.setTextColor(5, 150, 105);
      pdf.setFontSize(10);
      pdf.text('RECEITAS', 22, yPosition);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`R$ ${reportData.summary.totalReceitas.toFixed(2)}`, 22, yPosition + 8);
      
      // Caixa de Despesas
      pdf.setFillColor(254, 226, 226); // Vermelho claro
      pdf.setDrawColor(239, 68, 68); // Vermelho escuro
      pdf.rect(80, yPosition - 5, 50, 20, 'FD');
      pdf.setTextColor(220, 38, 38);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text('DESPESAS', 82, yPosition);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`R$ ${reportData.summary.totalDespesas.toFixed(2)}`, 82, yPosition + 8);
      
      // Caixa de Saldo
      const saldoPositivo = reportData.summary.saldo >= 0;
      if (saldoPositivo) {
        pdf.setFillColor(220, 252, 231);
        pdf.setDrawColor(16, 185, 129);
      } else {
        pdf.setFillColor(254, 226, 226);
        pdf.setDrawColor(239, 68, 68);
      }
      pdf.rect(140, yPosition - 5, 50, 20, 'FD');
      pdf.setTextColor(saldoPositivo ? 5 : 220, saldoPositivo ? 150 : 38, saldoPositivo ? 105 : 38);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.text('SALDO', 142, yPosition);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`R$ ${reportData.summary.saldo.toFixed(2)}`, 142, yPosition + 8);
      
      yPosition += 35;
      
      // Reset cor do texto
      pdf.setTextColor(0, 0, 0);
      
      // Seção de Transações Detalhadas
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`Transações Detalhadas (${reportData.transactions.length} registros)`, 20, yPosition);
      yPosition += 15;
      
      if (reportData.transactions.length === 0) {
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(107, 114, 128);
        pdf.text('Nenhuma transação encontrada para o período selecionado.', 20, yPosition);
      } else {
        // Cabeçalho da tabela com fundo
        pdf.setFillColor(249, 250, 251);
        pdf.setDrawColor(209, 213, 219);
        pdf.rect(20, yPosition - 5, 170, 12, 'FD');
        
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(55, 65, 81);
        pdf.text('Data', 22, yPosition + 2);
        pdf.text('Tipo', 45, yPosition + 2);
        pdf.text('Descrição', 65, yPosition + 2);
        pdf.text('Categoria', 120, yPosition + 2);
        pdf.text('Valor', 165, yPosition + 2);
        yPosition += 15;
        
        // Transações
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(0, 0, 0);
        
        reportData.transactions.forEach((transaction, index) => {
          // Verificar se precisa de nova página
          if (yPosition > 260) {
            pdf.addPage();
            yPosition = 20;
            
            // Repetir cabeçalho na nova página
            pdf.setFillColor(249, 250, 251);
            pdf.setDrawColor(209, 213, 219);
            pdf.rect(20, yPosition - 5, 170, 12, 'FD');
            
            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'bold');
            pdf.setTextColor(55, 65, 81);
            pdf.text('Data', 22, yPosition + 2);
            pdf.text('Tipo', 45, yPosition + 2);
            pdf.text('Descrição', 65, yPosition + 2);
            pdf.text('Categoria', 120, yPosition + 2);
            pdf.text('Valor', 165, yPosition + 2);
            yPosition += 15;
            
            pdf.setFont('helvetica', 'normal');
            pdf.setTextColor(0, 0, 0);
          }
          
          // Linha alternada
          if (index % 2 === 0) {
            pdf.setFillColor(249, 250, 251);
            pdf.rect(20, yPosition - 4, 170, 10, 'F');
          }
          
          const date = new Date(transaction.date).toLocaleDateString('pt-BR');
          const type = transaction.type === 'receita' ? 'Receita' : 'Despesa';
          const category = this.getCategoryName(transaction.categoryId, reportData.categories);
          const value = `R$ ${Number(transaction.value).toFixed(2)}`;
          
          pdf.setFontSize(9);
          pdf.text(date, 22, yPosition);
          
          // Tipo com cor
          if (transaction.type === 'receita') {
            pdf.setTextColor(5, 150, 105);
          } else {
            pdf.setTextColor(220, 38, 38);
          }
          pdf.text(type, 45, yPosition);
          pdf.setTextColor(0, 0, 0);
          
          // Descrição truncada
          const description = transaction.description && transaction.description.length > 30
            ? transaction.description.substring(0, 30) + '...'
            : transaction.description || 'Sem descrição';
          pdf.text(description, 65, yPosition);
          
          // Categoria truncada
          const categoryText = category.length > 25
            ? category.substring(0, 25) + '...'
            : category;
          pdf.text(categoryText, 120, yPosition);
          
          // Valor com cor
          if (transaction.type === 'receita') {
            pdf.setTextColor(5, 150, 105);
          } else {
            pdf.setTextColor(220, 38, 38);
          }
          pdf.setFont('helvetica', 'bold');
          pdf.text(value, 165, yPosition);
          pdf.setFont('helvetica', 'normal');
          pdf.setTextColor(0, 0, 0);
          
          yPosition += 10;
        });
      }
      
      // Rodapé
      const footerY = pageHeight - 15;
      pdf.setFontSize(8);
      pdf.setTextColor(107, 114, 128);
      pdf.text('Este relatório foi gerado automaticamente pelo FinManage MEI', 20, footerY);
      pdf.text(`Página 1 de ${pdf.getNumberOfPages()}`, pageWidth - 20, footerY, { align: 'right' });
      
      // Salvar o PDF
      pdf.save(`relatorio-mei-detalhado-${today.toISOString().split('T')[0]}.pdf`);
      
      return { success: true, error: null };
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      return { success: false, error: error as Error };
    }
  }
  
  /**
   * Obtém o nome de uma categoria pelo ID
   * @param categoryId ID da categoria
   * @param categories Lista de categorias
   * @returns Nome da categoria
   */
  private getCategoryName(categoryId: string | null | undefined, categories: Category[]): string {
    if (!categoryId) return 'Sem categoria';
    const category = categories.find(c => c.id === categoryId);
    return category?.name || 'Categoria não encontrada';
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