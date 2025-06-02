import { Transaction } from '@/models/Transaction';
import { Category } from '@/models/Category';
import { TransactionController } from '@/controllers/TransactionController';
import { CategoryController } from '@/controllers/CategoryController';
import { toast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';

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
      const doc = new jsPDF();
      let yPosition = 20;

      // Título
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('Relatório Financeiro - FinManage', 20, yPosition);
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
        
        reportData.transactions.forEach((transaction) => {
          // Verificar se precisa de nova página
          if (yPosition > 270) {
            doc.addPage();
            yPosition = 20;
          }

          const date = new Date(transaction.date).toLocaleDateString('pt-BR');
          const type = transaction.type === 'receita' ? 'Receita' : 'Despesa';
          const category = this.getCategoryName(transaction.categoryId, reportData.categories);
          const value = `R$ ${transaction.value.toFixed(2)}`;

          doc.text(date, 20, yPosition);
          doc.text(type, 55, yPosition);
          
          // Truncar descrição se muito longa
          const description = transaction.description.length > 25 
            ? transaction.description.substring(0, 25) + '...' 
            : transaction.description;
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
      toast({
        title: "Erro",
        description: "Erro ao exportar relatório.",
        variant: "destructive",
      });
    }
  }

  private static getCategoryName(categoryId: string, categories: Category[]): string {
    const category = categories.find(c => c.id === categoryId);
    return category?.name || 'Categoria não encontrada';
  }

  static generateReportHTML(reportData: ReportData): string {
    const getCategoryName = (categoryId: string) => {
      const category = reportData.categories.find(c => c.id === categoryId);
      return category?.name || 'Categoria não encontrada';
    };

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Relatório Financeiro - FinManage</title>
        <meta charset="UTF-8">
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
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Relatório Financeiro - FinManage</h1>
          <p>Período: ${reportData.period.startDate.toLocaleDateString()} - ${reportData.period.endDate.toLocaleDateString()}</p>
          <p>Gerado em: ${new Date().toLocaleDateString()} às ${new Date().toLocaleTimeString()}</p>
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

        <h2>Transações (${reportData.transactions.length})</h2>
        ${reportData.transactions.length === 0 ? 
          '<p>Nenhuma transação encontrada para os filtros selecionados.</p>' :
          `<table>
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
          </table>`
        }
        
        <div class="no-print" style="margin-top: 30px; text-align: center;">
          <button onclick="window.print()" style="padding: 10px 20px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">
            Imprimir Relatório
          </button>
        </div>
      </body>
      </html>
    `;
  }
}
