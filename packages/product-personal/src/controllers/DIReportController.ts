import { toast } from '@/hooks/use-toast';
import { DITransactionController } from '@/controllers/DITransactionController';
import { DICategoryController } from '@/controllers/DICategoryController';
import jsPDF from 'jspdf';
import { Transaction, Category } from '@finmanage/core/services';
import { supabase } from '@/lib/supabase';

export interface ReportData {
  transactions: Transaction[];
  categories: Category[];
  summary: {
    totalReceitas: number;
    totalDespesas: number;
    saldo: number;
  };
  period: {
    startDate: Date;
    endDate: Date;
  };
}

export interface ReportFilters {
  startDate: Date;
  endDate: Date;
  categoryId?: string;
  type?: 'receita' | 'despesa' | 'ambos';
}

/**
 * Controlador de relatórios que usa injeção de dependências
 */
export class DIReportController {
  /**
   * Gera um relatório com base nos filtros especificados
   * @param filters Filtros do relatório
   * @returns Dados do relatório
   */
  static async generateReport(filters: ReportFilters): Promise<ReportData> {
    try {
      // Verificar autenticação
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Erro",
          description: "Usuário não autenticado.",
          variant: "destructive",
        });
        throw new Error('Usuário não autenticado');
      }
      
      const allTransactions = await DITransactionController.getTransactions();
      const categories = await DICategoryController.getCategories();

      // Filtrar transações por período
      const filteredTransactions = allTransactions.filter((transaction: Transaction) => {
        const transactionDate = new Date(transaction.date);
        const isInPeriod = transactionDate >= filters.startDate && transactionDate <= filters.endDate;
        
        if (!isInPeriod) return false;

        // Filtrar por categoria se especificada
        if (filters.categoryId && transaction.category_id !== filters.categoryId) {
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
        .filter((t: Transaction) => t.type === 'receita')
        .reduce((sum: number, t: Transaction) => sum + Number(t.value), 0);

      const totalDespesas = filteredTransactions
        .filter((t: Transaction) => t.type === 'despesa')
        .reduce((sum: number, t: Transaction) => sum + Number(t.value), 0);

      return {
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
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      toast({
        title: "Erro",
        description: "Erro ao gerar relatório.",
        variant: "destructive",
      });
      throw error;
    }
  }

  /**
   * Exporta os dados do relatório para um arquivo PDF
   * @param reportData Dados do relatório
   */
  static async exportToPDF(reportData: ReportData): Promise<void> {
    try {
      const doc = new jsPDF();
      let yPosition = 20;

      // Título
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('Relatório Financeiro - FinManage Personal', 20, yPosition);
      yPosition += 10;

      // Período
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      const startDate = reportData.period.startDate.toLocaleDateString('pt-BR');
      const endDate = reportData.period.endDate.toLocaleDateString('pt-BR');
      doc.text(`Período: ${startDate} - ${endDate}`, 20, yPosition);
      yPosition += 10;

      // Data de geração
      const now = new Date();
      const generatedDate = now.toLocaleDateString('pt-BR');
      const generatedTime = now.toLocaleTimeString('pt-BR');
      doc.text(`Gerado em: ${generatedDate} às ${generatedTime}`, 20, yPosition);
      yPosition += 20;

      // Resumo
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Resumo', 20, yPosition);
      yPosition += 10;

      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      
      // Receitas
      doc.setTextColor(5, 150, 105); // Verde
      doc.text(`Receitas: R$ ${reportData.summary.totalReceitas.toFixed(2)}`, 20, yPosition);
      yPosition += 8;

      // Despesas
      doc.setTextColor(220, 38, 38); // Vermelho
      doc.text(`Despesas: R$ ${reportData.summary.totalDespesas.toFixed(2)}`, 20, yPosition);
      yPosition += 8;

      // Saldo
      const saldoColor = reportData.summary.saldo >= 0 ? [5, 150, 105] : [220, 38, 38];
      doc.setTextColor(saldoColor[0], saldoColor[1], saldoColor[2]);
      doc.text(`Saldo: R$ ${reportData.summary.saldo.toFixed(2)}`, 20, yPosition);
      yPosition += 20;

      // Reset cor para preto
      doc.setTextColor(0, 0, 0);

      // Transações
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(`Transações (${reportData.transactions.length})`, 20, yPosition);
      yPosition += 15;

      if (reportData.transactions.length === 0) {
        doc.setFontSize(11);
        doc.setFont('helvetica', 'normal');
        doc.text('Nenhuma transação encontrada para os filtros selecionados.', 20, yPosition);
      } else {
        // Cabeçalho da tabela
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('Data', 20, yPosition);
        doc.text('Tipo', 55, yPosition);
        doc.text('Descrição', 85, yPosition);
        doc.text('Categoria', 135, yPosition);
        doc.text('Valor', 175, yPosition);
        yPosition += 8;

        // Linha separadora
        doc.line(20, yPosition - 2, 190, yPosition - 2);
        yPosition += 5;

        // Transações
        doc.setFont('helvetica', 'normal');
        
        reportData.transactions.forEach((transaction: Transaction) => {
          // Verificar se precisa de nova página
          if (yPosition > 270) {
            doc.addPage();
            yPosition = 20;
          }

          const date = new Date(transaction.date).toLocaleDateString('pt-BR');
          const type = transaction.type === 'receita' ? 'Receita' : 'Despesa';
          const category = this.getCategoryName(transaction.category_id, reportData.categories);
          const value = `R$ ${Number(transaction.value).toFixed(2)}`;

          doc.text(date, 20, yPosition);
          doc.text(type, 55, yPosition);
          
          // Truncar descrição se muito longa
          const description = transaction.description && transaction.description.length > 25 
            ? transaction.description.substring(0, 25) + '...' 
            : transaction.description || '';
          doc.text(description, 85, yPosition);
          
          // Truncar categoria se muito longa
          const categoryText = category.length > 20 
            ? category.substring(0, 20) + '...' 
            : category;
          doc.text(categoryText, 135, yPosition);

          // Valor com cor
          if (transaction.type === 'receita') {
            doc.setTextColor(5, 150, 105);
          } else {
            doc.setTextColor(220, 38, 38);
          }
          doc.text(value, 175, yPosition);
          doc.setTextColor(0, 0, 0); // Reset para preto

          yPosition += 8;
        });
      }

      // Salvar o PDF
      const fileName = `relatorio-financeiro-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);

      toast({
        title: "Sucesso",
        description: "Relatório PDF baixado com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao exportar relatório para PDF:', error);
      toast({
        title: "Erro",
        description: "Erro ao exportar relatório.",
        variant: "destructive",
      });
      throw error;
    }
  }

  /**
   * Obtém o nome de uma categoria pelo ID
   * @param categoryId ID da categoria
   * @param categories Lista de categorias
   * @returns Nome da categoria
   */
  private static getCategoryName(categoryId: string | null | undefined, categories: Category[]): string {
    if (!categoryId) return 'Sem categoria';
    const category = categories.find(c => c.id === categoryId);
    return category?.name || 'Categoria não encontrada';
  }
} 