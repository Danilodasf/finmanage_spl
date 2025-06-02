import { toast } from '@/hooks/use-toast';
import { BudgetService, Budget } from '@/lib/services/BudgetService';
import { TransactionController } from './TransactionController';

export class BudgetController {
  static async getBudgets(): Promise<Budget[]> {
    try {
      const { data, error } = await BudgetService.getAll();
      
      if (error) {
        toast({
          title: "Erro",
          description: "Não foi possível carregar os orçamentos.",
          variant: "destructive"
        });
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar orçamentos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os orçamentos.",
        variant: "destructive"
      });
      return [];
    }
  }

  static async getBudgetById(id: string): Promise<Budget | null> {
    try {
      const { data, error } = await BudgetService.getById(id);
      
      if (error) {
        console.error(`Erro ao buscar orçamento com ID ${id}:`, error);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error(`Erro ao buscar orçamento com ID ${id}:`, error);
      return null;
    }
  }

  static async createBudget(data: Omit<Budget, 'id' | 'created_at' | 'updated_at'>): Promise<boolean> {
    try {
      const { error } = await BudgetService.create(data);
      
      if (error) {
        toast({
          title: "Erro",
          description: "Não foi possível criar o orçamento.",
          variant: "destructive"
        });
        return false;
      }
      
      toast({
        title: "Sucesso",
        description: "Orçamento criado com sucesso."
      });
      
      return true;
    } catch (error) {
      console.error('Erro ao criar orçamento:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o orçamento.",
        variant: "destructive"
      });
      return false;
    }
  }

  static async updateBudget(id: string, data: Partial<Omit<Budget, 'id' | 'created_at' | 'updated_at' | 'user_id'>>): Promise<boolean> {
    try {
      const { error } = await BudgetService.update(id, data);
      
      if (error) {
        toast({
          title: "Erro",
          description: "Não foi possível atualizar o orçamento.",
          variant: "destructive"
        });
        return false;
      }
      
      // Se a categoria foi alterada, recalcular o valor gasto
      if (data.category_id) {
        await this.updateBudgetSpentAmount(id);
      }
      
      toast({
        title: "Sucesso",
        description: "Orçamento atualizado com sucesso."
      });
      
      return true;
    } catch (error) {
      console.error('Erro ao atualizar orçamento:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o orçamento.",
        variant: "destructive"
      });
      return false;
    }
  }

  static async deleteBudget(id: string): Promise<boolean> {
    try {
      const { success, error } = await BudgetService.delete(id);
      
      if (error || !success) {
        toast({
          title: "Erro",
          description: "Não foi possível excluir o orçamento.",
          variant: "destructive"
        });
        return false;
      }
      
      toast({
        title: "Sucesso",
        description: "Orçamento excluído com sucesso."
      });
      
      return true;
    } catch (error) {
      console.error('Erro ao excluir orçamento:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o orçamento.",
        variant: "destructive"
      });
      return false;
    }
  }

  static async refreshBudgets(): Promise<boolean> {
    try {
      const budgets = await this.getBudgets();
      
      // Atualizar o valor gasto em cada orçamento
      for (const budget of budgets) {
        await this.updateBudgetSpentAmount(budget.id);
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao atualizar valores dos orçamentos:', error);
      return false;
    }
  }

  static async updateBudgetSpentAmount(budgetId: string): Promise<boolean> {
    try {
      const budget = await this.getBudgetById(budgetId);
      if (!budget) return false;
      
      const spentAmount = await this.calculateBudgetSpentAmount(budgetId);
      
      const { success, error } = await BudgetService.updateSpentAmount(budgetId, spentAmount);
      
      if (error || !success) {
        console.error(`Erro ao atualizar valor gasto do orçamento ${budgetId}:`, error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error(`Erro ao atualizar valor gasto do orçamento ${budgetId}:`, error);
      return false;
    }
  }

  static async calculateBudgetSpentAmount(budgetId: string, month?: number, year?: number): Promise<number> {
    try {
      const budget = await this.getBudgetById(budgetId);
      if (!budget || !budget.category_id) return 0;

      const transactions = await TransactionController.getTransactions();
      
      // Filtrar transações pela categoria do orçamento
      let relevantTransactions = transactions.filter(transaction => 
        budget.category_id === transaction.category_id && 
        transaction.type === 'despesa'
      );
      
      // Se mês e ano foram especificados, filtrar por eles
      if (month !== undefined && year !== undefined) {
        relevantTransactions = relevantTransactions.filter(transaction => {
          const transactionDate = new Date(transaction.date);
          return (
            transactionDate.getMonth() + 1 === month &&
            transactionDate.getFullYear() === year
          );
        });
      } else {
        // Caso contrário, filtrar pelo período do orçamento
        relevantTransactions = relevantTransactions.filter(transaction => 
          this.isTransactionInBudgetPeriod(transaction, budget)
        );
      }

      // Somar os valores das transações relevantes
      return relevantTransactions.reduce((total: number, transaction) => total + transaction.value, 0);
    } catch (error) {
      console.error('Erro ao calcular valor gasto do orçamento:', error);
      return 0;
    }
  }

  private static isTransactionInBudgetPeriod(transaction: any, budget: Budget): boolean {
    const transactionDate = new Date(transaction.date);
    const currentDate = new Date();
    
    if (budget.period === 'mensal') {
      // Verificar se a transação é do mês atual
      return (
        transactionDate.getMonth() === currentDate.getMonth() &&
        transactionDate.getFullYear() === currentDate.getFullYear()
      );
    } else if (budget.period === 'anual') {
      // Verificar se a transação é do ano atual
      return transactionDate.getFullYear() === currentDate.getFullYear();
    }
    
    return false;
  }
} 