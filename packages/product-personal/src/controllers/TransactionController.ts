import { Transaction, CreateTransactionData } from '@/models/Transaction';
import { toast } from '@/hooks/use-toast';
import { BudgetController } from './BudgetController';

export class TransactionController {
  private static storageKey = 'finmanage_personal_transactions';

  static getTransactions(): Transaction[] {
    const stored = localStorage.getItem(this.storageKey);
    return stored ? JSON.parse(stored) : [];
  }

  static getAvailableBalance(): number {
    const { receitas, despesas } = this.getFinancialSummary('month');
    return receitas - despesas;
  }

  static hasAvailableBalance(amount: number): boolean {
    // Verifica se há saldo disponível para realizar uma despesa
    const availableBalance = this.getAvailableBalance();
    return availableBalance >= amount;
  }

  static createTransaction(data: CreateTransactionData): boolean {
    try {
      // Se for uma despesa, verificar se há saldo disponível
      if (data.type === 'despesa') {
        const hasSufficientBalance = this.hasAvailableBalance(data.value);
        if (!hasSufficientBalance) {
          toast({
            title: "Saldo insuficiente",
            description: "Você não possui saldo suficiente para esta despesa.",
            variant: "destructive",
          });
          return false;
        }
      }

      const transactions = this.getTransactions();
      const newTransaction: Transaction = {
        id: Date.now().toString(),
        ...data
      };

      transactions.push(newTransaction);
      localStorage.setItem(this.storageKey, JSON.stringify(transactions));
      
      // Atualizar orçamentos quando uma nova transação é adicionada
      if (data.type === 'despesa') {
        BudgetController.refreshBudgets();
      }
      
      toast({
        title: "Sucesso",
        description: "Transação criada com sucesso!",
      });
      
      return true;
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao criar transação.",
        variant: "destructive",
      });
      return false;
    }
  }

  static deleteTransaction(id: string): boolean {
    try {
      const transactions = this.getTransactions();
      const transaction = transactions.find(t => t.id === id);
      const filtered = transactions.filter(t => t.id !== id);
      localStorage.setItem(this.storageKey, JSON.stringify(filtered));
      
      // Atualizar orçamentos quando uma transação é removida
      if (transaction && transaction.type === 'despesa') {
        BudgetController.refreshBudgets();
      }
      
      toast({
        title: "Sucesso",
        description: "Transação excluída com sucesso!",
      });
      
      return true;
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao excluir transação.",
        variant: "destructive",
      });
      return false;
    }
  }

  static getFinancialSummary(period: 'month' | 'year' = 'month') {
    const transactions = this.getTransactions();
    const now = new Date();
    
    const filtered = transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      if (period === 'month') {
        return transactionDate.getMonth() === now.getMonth() && 
               transactionDate.getFullYear() === now.getFullYear();
      } else {
        return transactionDate.getFullYear() === now.getFullYear();
      }
    });

    const receitas = filtered
      .filter(t => t.type === 'receita')
      .reduce((sum, t) => sum + t.value, 0);
    
    const despesas = filtered
      .filter(t => t.type === 'despesa')
      .reduce((sum, t) => sum + t.value, 0);

    return {
      receitas,
      despesas,
      saldo: receitas - despesas,
      transactions: filtered
    };
  }
} 