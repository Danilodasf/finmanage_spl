import { useEffect, useState } from 'react';
import { Budget, BudgetService } from '../lib/services/BudgetService';
import { Category } from '../lib/services/CategoryService';
import { useAuth } from '../lib/AuthContext';

export interface BudgetData {
  id: string;
  name: string;
  amount: number;
  spent: number;
  category_id?: string;
  category?: Category;
  period: 'monthly' | 'yearly';
  start_date: Date;
  end_date?: Date;
  user_id: string;
}

export interface DIBudgetController {
  budgets: BudgetData[];
  isLoading: boolean;
  error: Error | null;
  createBudget: (budget: Omit<Budget, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<Budget | null>;
  updateBudget: (id: string, updates: Partial<Omit<Budget, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => Promise<Budget | null>;
  deleteBudget: (id: string) => Promise<boolean>;
  updateSpent: (id: string, amount: number) => Promise<boolean>;
}

export function useDIBudgetController(): DIBudgetController {
  const [budgets, setBudgets] = useState<BudgetData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  const fetchBudgets = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await BudgetService.getAll();
      
      if (error) {
        throw new Error(String(error));
      }
      
      if (data) {
        const formattedBudgets = data.map(budget => ({
          ...budget,
          start_date: new Date(budget.start_date),
          end_date: budget.end_date ? new Date(budget.end_date) : undefined,
          category: budget.categories as unknown as Category,
        }));
        
        setBudgets(formattedBudgets);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erro ao buscar orçamentos'));
      console.error('Erro ao buscar orçamentos:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchBudgets();
    }
  }, [user]);

  const createBudget = async (budget: Omit<Budget, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      if (!user) {
        throw new Error('Usuário não autenticado');
      }
      
      const newBudget = {
        ...budget,
        user_id: user.id,
        spent: 0, // Inicializa com zero
      };
      
      const { data, error } = await BudgetService.create(newBudget);
      
      if (error) {
        throw new Error(String(error));
      }
      
      if (data) {
        // Atualizar a lista local
        await fetchBudgets();
        return data;
      }
      
      return null;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erro ao criar orçamento'));
      console.error('Erro ao criar orçamento:', err);
      return null;
    }
  };

  const updateBudget = async (id: string, updates: Partial<Omit<Budget, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => {
    try {
      const { data, error } = await BudgetService.update(id, updates);
      
      if (error) {
        throw new Error(String(error));
      }
      
      if (data) {
        // Atualizar a lista local
        await fetchBudgets();
        return data;
      }
      
      return null;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(`Erro ao atualizar orçamento com ID ${id}`));
      console.error(`Erro ao atualizar orçamento com ID ${id}:`, err);
      return null;
    }
  };

  const deleteBudget = async (id: string) => {
    try {
      const { success, error } = await BudgetService.delete(id);
      
      if (error) {
        throw new Error(String(error));
      }
      
      if (success) {
        // Atualizar a lista local
        await fetchBudgets();
        return true;
      }
      
      return false;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(`Erro ao excluir orçamento com ID ${id}`));
      console.error(`Erro ao excluir orçamento com ID ${id}:`, err);
      return false;
    }
  };

  const updateSpent = async (id: string, amount: number) => {
    try {
      const { success, error } = await BudgetService.updateSpent(id, amount);
      
      if (error) {
        throw new Error(String(error));
      }
      
      if (success) {
        // Atualizar a lista local
        await fetchBudgets();
        return true;
      }
      
      return false;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(`Erro ao atualizar gastos do orçamento com ID ${id}`));
      console.error(`Erro ao atualizar gastos do orçamento com ID ${id}:`, err);
      return false;
    }
  };

  return {
    budgets,
    isLoading,
    error,
    createBudget,
    updateBudget,
    deleteBudget,
    updateSpent,
  };
} 