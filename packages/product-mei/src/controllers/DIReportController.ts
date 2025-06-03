import { DIContainer, REPORT_SERVICE, ReportService, ReportData, Transaction, toast } from '../lib/core-exports';
import jsPDF from 'jspdf';

/**
 * Controlador de relatórios que usa injeção de dependências
 */
export class DIReportController {
  /**
   * Obtém o serviço de relatórios do container de DI
   * @returns Instância do serviço de relatórios
   */
  private static getReportService(): ReportService {
    return DIContainer.get<ReportService>(REPORT_SERVICE);
  }

  /**
   * Gera um relatório com base nos filtros fornecidos
   * @param filters Filtros para o relatório
   * @returns Dados do relatório ou null em caso de erro
   */
  static async generateReport(filters: {
    startDate: Date;
    endDate: Date;
    categoryId?: string;
    type?: 'receita' | 'despesa' | 'ambos';
  }): Promise<ReportData | null> {
    try {
      const reportService = this.getReportService();
      const { data, error } = await reportService.generateReport(filters);
      
      if (error) {
        toast({
          title: "Erro",
          description: "Erro ao gerar relatório.",
          variant: "destructive",
        });
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      toast({
        title: "Erro",
        description: "Erro ao gerar relatório.",
        variant: "destructive",
      });
      return null;
    }
  }

  /**
   * Exporta um relatório para PDF
   * @param reportData Dados do relatório
   * @returns true se o PDF foi exportado com sucesso
   */
  static async exportToPDF(reportData: ReportData): Promise<boolean> {
    try {
      const reportService = this.getReportService();
      const { success, error } = await reportService.exportToPDF(reportData);
      
      if (error || !success) {
        toast({
          title: "Erro",
          description: "Erro ao exportar relatório para PDF.",
          variant: "destructive",
        });
        return false;
      }
      
      toast({
        title: "PDF exportado com sucesso",
        description: "O relatório foi gerado e salvo no seu dispositivo.",
      });
      
      return true;
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      toast({
        title: "Erro",
        description: "Erro ao exportar relatório para PDF.",
        variant: "destructive",
      });
      return false;
    }
  }

  /**
   * Obtém um resumo financeiro para um período específico
   * @param period Período (mês, trimestre ou ano)
   * @returns Resumo financeiro com receitas, despesas, saldo e transações
   */
  static async getFinancialSummary(period: 'month' | 'quarter' | 'year' = 'month'): Promise<{
    receitas: number;
    despesas: number;
    saldo: number;
    transactions: Transaction[];
  }> {
    try {
      const reportService = this.getReportService();
      return await reportService.getFinancialSummary(period);
    } catch (error) {
      console.error('Erro ao obter resumo financeiro:', error);
      toast({
        title: "Erro",
        description: "Erro ao obter resumo financeiro.",
        variant: "destructive",
      });
      return {
        receitas: 0,
        despesas: 0,
        saldo: 0,
        transactions: []
      };
    }
  }
} 