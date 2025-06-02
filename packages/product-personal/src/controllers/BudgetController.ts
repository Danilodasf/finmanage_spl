import { Budget, createBudget, updateBudget } from '@/models/Budget';
import { Transaction } from '@/models/Transaction';
import { TransactionController } from './TransactionController';
import { toast } from '@/hooks/use-toast';

const STORAGE_KEY = 'finmanage_budgets';

export class BudgetController {
  static getBudgets(): Budget[] {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (!savedData) return [];
      
      const budgets: Budget[] = JSON.parse(savedData);
      
      // Convertendo strings de data para objetos Date
      return budgets.map(budget => ({
        ...budget,
        createdAt: new Date(budget.createdAt),
        updatedAt: new Date(budget.updatedAt)
      }));
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

  static getBudgetById(id: string): Budget | null {
    const budgets = this.getBudgets();
    return budgets.find(budget => budget.id === id) || null;
  }

  static createBudget(data: Omit<Budget, 'id' | 'spentAmount' | 'createdAt' | 'updatedAt'>): boolean {
    try {
      const budgets = this.getBudgets();
      const newBudget = createBudget(data);
      
      // Calcular valor já gasto com base nas transações existentes
      const spentAmount = this.calculateSpentAmount(newBudget);
      newBudget.spentAmount = spentAmount;
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...budgets, newBudget]));
      
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

  static updateBudget(id: string, data: Partial<Omit<Budget, 'id' | 'spentAmount' | 'createdAt' | 'updatedAt'>>): boolean {
    try {
      const budgets = this.getBudgets();
      const budgetIndex = budgets.findIndex(budget => budget.id === id);
      
      if (budgetIndex === -1) {
        toast({
          title: "Erro",
          description: "Orçamento não encontrado.",
          variant: "destructive"
        });
        return false;
      }
      
      const updatedBudget = updateBudget(budgets[budgetIndex], data);
      
      // Recalcular o valor gasto apenas se a categoria foi alterada
      if (data.categoryId) {
        updatedBudget.spentAmount = this.calculateSpentAmount(updatedBudget);
      }
      
      budgets[budgetIndex] = updatedBudget;
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(budgets));
      
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

  static deleteBudget(id: string): boolean {
    try {
      const budgets = this.getBudgets();
      const filteredBudgets = budgets.filter(budget => budget.id !== id);
      
      if (filteredBudgets.length === budgets.length) {
        toast({
          title: "Erro",
          description: "Orçamento não encontrado.",
          variant: "destructive"
        });
        return false;
      }
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredBudgets));
      
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

  static refreshBudgets(): boolean {
    try {
      const budgets = this.getBudgets();
      
      // Atualizar o valor gasto em cada orçamento
      const updatedBudgets = budgets.map(budget => ({
        ...budget,
        spentAmount: this.calculateSpentAmount(budget)
      }));
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedBudgets));
      return true;
    } catch (error) {
      console.error('Erro ao atualizar valores dos orçamentos:', error);
      return false;
    }
  }

  static calculateSpentAmount(budget: Budget): number {
    try {
      const transactions = TransactionController.getTransactions();
      
      // Filtrar transações pela categoria do orçamento
      const relevantTransactions = transactions.filter(transaction => 
        budget.categoryId === transaction.categoryId && 
        transaction.type === 'despesa' &&
        this.isTransactionInBudgetPeriod(transaction, budget)
      );
      
      // Somar os valores das transações relevantes
      return relevantTransactions.reduce((total, transaction) => total + transaction.value, 0);
    } catch (error) {
      console.error('Erro ao calcular valor gasto:', error);
      return 0;
    }
  }

  private static isTransactionInBudgetPeriod(transaction: Transaction, budget: Budget): boolean {
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