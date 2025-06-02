import { toast } from '@/hooks/use-toast';
import { TransactionService, Transaction } from '@/lib/services/TransactionService';
import { useAuth } from '@/lib/AuthContext';
import { BudgetController } from './BudgetController';

export class TransactionController {
  private static storageKey = 'finmanage_personal_transactions';

  static async getTransactions(): Promise<Transaction[]> {
    try {
      const { data, error } = await TransactionService.getAll();
      
      if (error) {
        toast({
          title: "Erro",
          description: "Erro ao buscar transações.",
          variant: "destructive",
        });
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar transações:', error);
      toast({
        title: "Erro",
        description: "Erro ao buscar transações.",
        variant: "destructive",
      });
      return [];
    }
  }

  static async getAvailableBalance(): Promise<number> {
    try {
      const { receitas, despesas } = await this.getFinancialSummary('month');
      return receitas - despesas;
    } catch (error) {
      console.error('Erro ao calcular saldo disponível:', error);
      return 0;
    }
  }

  static async hasAvailableBalance(amount: number): Promise<boolean> {
    try {
      const availableBalance = await this.getAvailableBalance();
      return availableBalance >= amount;
    } catch (error) {
      console.error('Erro ao verificar saldo disponível:', error);
      return false;
    }
  }

  static async createTransaction(data: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>): Promise<boolean> {
    try {
      // Se for uma despesa, verificar se há saldo disponível
      if (data.type === 'despesa') {
        const hasSufficientBalance = await this.hasAvailableBalance(data.value);
        if (!hasSufficientBalance) {
          toast({
            title: "Saldo insuficiente",
            description: "Você não possui saldo suficiente para esta despesa.",
            variant: "destructive",
          });
          return false;
        }
      }

      const { data: newTransaction, error } = await TransactionService.create(data);
      
      if (error) {
        toast({
          title: "Erro",
          description: "Erro ao criar transação.",
          variant: "destructive",
        });
        return false;
      }
      
      toast({
        title: "Sucesso",
        description: "Transação criada com sucesso!",
      });
      
      return true;
    } catch (error) {
      console.error('Erro ao criar transação:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar transação.",
        variant: "destructive",
      });
      return false;
    }
  }

  static async deleteTransaction(id: string): Promise<boolean> {
    try {
      const { success, error } = await TransactionService.delete(id);
      
      if (error || !success) {
        toast({
          title: "Erro",
          description: "Erro ao excluir transação.",
          variant: "destructive",
        });
        return false;
      }
      
      toast({
        title: "Sucesso",
        description: "Transação excluída com sucesso!",
      });
      
      return true;
    } catch (error) {
      console.error('Erro ao excluir transação:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir transação.",
        variant: "destructive",
      });
      return false;
    }
  }

  static async getFinancialSummary(period: 'month' | 'year' = 'month') {
    try {
      const now = new Date();
      let startDate, endDate;
      
      if (period === 'month') {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
      } else {
        startDate = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
        endDate = new Date(now.getFullYear(), 11, 31).toISOString().split('T')[0];
      }
      
      const { data, error } = await TransactionService.getByDateRange(startDate, endDate);
      
      if (error || !data) {
        return {
          receitas: 0,
          despesas: 0,
          saldo: 0,
          transactions: []
        };
      }
      
      const receitas = data
        .filter(t => t.type === 'receita')
        .reduce((sum, t) => sum + Number(t.value), 0);
      
      const despesas = data
        .filter(t => t.type === 'despesa')
        .reduce((sum, t) => sum + Number(t.value), 0);

      return {
        receitas,
        despesas,
        saldo: receitas - despesas,
        transactions: data
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

  static async getMonthlyData(year: number = new Date().getFullYear()): Promise<{ name: string; receitas: number; despesas: number }[]> {
    try {
      // Nomes dos meses em português
      const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      
      // Inicializa o array com todos os meses
      const monthlyData = monthNames.map((name, index) => ({
        name,
        receitas: 0,
        despesas: 0,
        month: index + 1 // Mês 1-12
      }));
      
      // Define o período para o ano inteiro
      const startDate = `${year}-01-01`;
      const endDate = `${year}-12-31`;
      
      // Busca todas as transações do ano
      const { data, error } = await TransactionService.getByDateRange(startDate, endDate);
      
      if (error || !data) {
        return monthlyData.map(({ name, receitas, despesas }) => ({ name, receitas, despesas }));
      }
      
      // Processa as transações e agrupa por mês
      data.forEach(transaction => {
        const date = new Date(transaction.date);
        const month = date.getMonth(); // 0-11
        
        if (transaction.type === 'receita') {
          monthlyData[month].receitas += Number(transaction.value);
        } else if (transaction.type === 'despesa') {
          monthlyData[month].despesas += Number(transaction.value);
        }
      });
      
      // Remove a propriedade month antes de retornar
      return monthlyData.map(({ name, receitas, despesas }) => ({ 
        name, 
        receitas, 
        despesas 
      }));
    } catch (error) {
      console.error('Erro ao buscar dados mensais:', error);
      return [];
    }
  }
} 