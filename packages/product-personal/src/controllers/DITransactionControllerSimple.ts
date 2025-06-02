import { useEffect, useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { Category } from '../lib/services/CategoryService';
import { Transaction, TransactionService } from '../lib/services/TransactionService';

export interface TransactionData {
  id: string;
  description?: string;
  amount: number;
  date: Date;
  type: 'receita' | 'despesa';
  category_id?: string;
  category?: Category;
  payment_method?: 'cash' | 'credit_card' | 'debit_card' | 'bank_transfer' | 'pix';
  user_id: string;
  created_at?: Date;
  updated_at?: string;
}

export interface DITransactionControllerSimple {
  transactions: TransactionData[];
  isLoading: boolean;
  error: Error | null;
  createTransaction: (transaction: Omit<Transaction, 'id' | 'user_id' | 'created_at'>) => Promise<Transaction | null>;
  updateTransaction: (id: string, updates: Partial<Omit<Transaction, 'id' | 'user_id' | 'created_at'>>) => Promise<Transaction | null>;
  deleteTransaction: (id: string) => Promise<boolean>;
}

export function useDITransactionControllerSimple(): DITransactionControllerSimple {
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await TransactionService.getAll();
      
      if (error) {
        throw new Error(String(error));
      }
      
      if (data) {
        const formattedTransactions = data.map(transaction => ({
          ...transaction,
          date: new Date(transaction.date),
          amount: transaction.value,
          created_at: transaction.created_at ? new Date(transaction.created_at) : undefined,
          category: (transaction as any).categories as unknown as Category,
        }));
        
        setTransactions(formattedTransactions as TransactionData[]);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erro ao buscar transações'));
      console.error('Erro ao buscar transações:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchTransactions();
    }
  }, [user]);

  const createTransaction = async (transaction: Omit<Transaction, 'id' | 'user_id' | 'created_at'>) => {
    try {
      if (!user) {
        throw new Error('Usuário não autenticado');
      }
      
      const newTransaction = {
        ...transaction,
        user_id: user.id,
      };
      
      const { data, error } = await TransactionService.create(newTransaction);
      
      if (error) {
        throw new Error(String(error));
      }
      
      if (data) {
        // Atualizar a lista local
        await fetchTransactions();
        return data;
      }
      
      return null;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erro ao criar transação'));
      console.error('Erro ao criar transação:', err);
      return null;
    }
  };

  const updateTransaction = async (id: string, updates: Partial<Omit<Transaction, 'id' | 'user_id' | 'created_at'>>) => {
    try {
      const { data, error } = await TransactionService.update(id, updates);
      
      if (error) {
        throw new Error(String(error));
      }
      
      if (data) {
        // Atualizar a lista local
        await fetchTransactions();
        return data;
      }
      
      return null;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(`Erro ao atualizar transação com ID ${id}`));
      console.error(`Erro ao atualizar transação com ID ${id}:`, err);
      return null;
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      const { success, error } = await TransactionService.delete(id);
      
      if (error) {
        throw new Error(String(error));
      }
      
      if (success) {
        // Atualizar a lista local
        await fetchTransactions();
        return true;
      }
      
      return false;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(`Erro ao excluir transação com ID ${id}`));
      console.error(`Erro ao excluir transação com ID ${id}:`, err);
      return false;
    }
  };

  return {
    transactions,
    isLoading,
    error,
    createTransaction,
    updateTransaction,
    deleteTransaction,
  };
} 