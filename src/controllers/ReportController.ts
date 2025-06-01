
import { Transaction } from '@/models/Transaction';
import { Category } from '@/models/Category';
import { TransactionController } from '@/controllers/TransactionController';
import { CategoryController } from '@/controllers/CategoryController';
import { toast } from '@/hooks/use-toast';

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

export class ReportController {
  static generateReport(filters: ReportFilters): ReportData {
    try {
      const allTransactions = TransactionController.getTransactions();
      const categories = CategoryController.getCategories();

      // Filtrar transações por período
      const filteredTransactions = allTransactions.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        const isInPeriod = transactionDate >= filters.startDate && transactionDate <= filters.endDate;
        
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
      toast({
        title: "Erro",
        description: "Erro ao gerar relatório.",
        variant: "destructive",
      });
      throw error;
    }
  }

  static exportToPDF(reportData: ReportData): void {
    try {
      // Criar conteúdo HTML para o PDF
      const htmlContent = this.generateReportHTML(reportData);
      
      // Abrir em nova janela para impressão/PDF
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
      }

      toast({
        title: "Sucesso",
        description: "Relatório exportado com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao exportar relatório.",
        variant: "destructive",
      });
    }
  }

  private static generateReportHTML(reportData: ReportData): string {
    const getCategoryName = (categoryId: string) => {
      const category = reportData.categories.find(c => c.id === categoryId);
      return category?.name || 'Categoria não encontrada';
    };

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Relatório Financeiro - FinManage</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .summary { margin-bottom: 30px; }
          .summary-item { display: inline-block; margin: 10px 20px; padding: 10px; border: 1px solid #ddd; border-radius: 5px; }
          .receita { color: #059669; }
          .despesa { color: #dc2626; }
          .saldo { font-weight: bold; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f9fafb; }
          .positive { color: #059669; }
          .negative { color: #dc2626; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Relatório Financeiro</h1>
          <p>Período: ${reportData.period.startDate.toLocaleDateString()} - ${reportData.period.endDate.toLocaleDateString()}</p>
        </div>
        
        <div class="summary">
          <h2>Resumo</h2>
          <div class="summary-item receita">
            <strong>Receitas:</strong> R$ ${reportData.summary.totalReceitas.toFixed(2)}
          </div>
          <div class="summary-item despesa">
            <strong>Despesas:</strong> R$ ${reportData.summary.totalDespesas.toFixed(2)}
          </div>
          <div class="summary-item saldo ${reportData.summary.saldo >= 0 ? 'positive' : 'negative'}">
            <strong>Saldo:</strong> R$ ${reportData.summary.saldo.toFixed(2)}
          </div>
        </div>

        <h2>Transações</h2>
        <table>
          <thead>
            <tr>
              <th>Data</th>
              <th>Tipo</th>
              <th>Descrição</th>
              <th>Categoria</th>
              <th>Valor</th>
            </tr>
          </thead>
          <tbody>
            ${reportData.transactions.map(transaction => `
              <tr>
                <td>${new Date(transaction.date).toLocaleDateString()}</td>
                <td>${transaction.type === 'receita' ? 'Receita' : 'Despesa'}</td>
                <td>${transaction.description}</td>
                <td>${getCategoryName(transaction.categoryId)}</td>
                <td class="${transaction.type === 'receita' ? 'positive' : 'negative'}">
                  R$ ${transaction.value.toFixed(2)}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;
  }
}
