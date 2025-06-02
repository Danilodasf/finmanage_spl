import { useEffect, useState } from 'react';
import { Goal, GoalService } from '../lib/services/GoalService';
import { useAuth } from '../lib/AuthContext';

export interface GoalData {
  id: string;
  name: string;
  description?: string;
  target_amount: number;
  current_amount: number;
  deadline?: Date;
  user_id: string;
  created_at?: Date;
  updated_at?: Date;
  progress: number; // Percentual de progresso (calculado)
}

export interface DIGoalController {
  goals: GoalData[];
  isLoading: boolean;
  error: Error | null;
  createGoal: (goal: Omit<Goal, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<Goal | null>;
  updateGoal: (id: string, updates: Partial<Omit<Goal, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => Promise<Goal | null>;
  deleteGoal: (id: string) => Promise<boolean>;
  updateProgress: (id: string, amount: number) => Promise<boolean>;
}

export function useDIGoalController(): DIGoalController {
  const [goals, setGoals] = useState<GoalData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  const fetchGoals = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await GoalService.getAll();
      
      if (error) {
        throw new Error(String(error));
      }
      
      if (data) {
        const formattedGoals = data.map(goal => {
          const progress = goal.target_amount > 0 
            ? (goal.current_amount / goal.target_amount) * 100 
            : 0;
          
          return {
            ...goal,
            deadline: goal.deadline ? new Date(goal.deadline) : undefined,
            created_at: goal.created_at ? new Date(goal.created_at) : undefined,
            updated_at: goal.updated_at ? new Date(goal.updated_at) : undefined,
            progress: Math.min(progress, 100), // Limita a 100%
          };
        });
        
        setGoals(formattedGoals);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erro ao buscar objetivos'));
      console.error('Erro ao buscar objetivos:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchGoals();
    }
  }, [user]);

  const createGoal = async (goal: Omit<Goal, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      if (!user) {
        throw new Error('Usuário não autenticado');
      }
      
      const newGoal = {
        ...goal,
        user_id: user.id,
        current_amount: goal.current_amount || 0, // Garante que tenha um valor inicial
      };
      
      const { data, error } = await GoalService.create(newGoal);
      
      if (error) {
        throw new Error(String(error));
      }
      
      if (data) {
        // Atualizar a lista local
        await fetchGoals();
        return data;
      }
      
      return null;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erro ao criar objetivo'));
      console.error('Erro ao criar objetivo:', err);
      return null;
    }
  };

  const updateGoal = async (id: string, updates: Partial<Omit<Goal, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => {
    try {
      const { data, error } = await GoalService.update(id, updates);
      
      if (error) {
        throw new Error(String(error));
      }
      
      if (data) {
        // Atualizar a lista local
        await fetchGoals();
        return data;
      }
      
      return null;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(`Erro ao atualizar objetivo com ID ${id}`));
      console.error(`Erro ao atualizar objetivo com ID ${id}:`, err);
      return null;
    }
  };

  const deleteGoal = async (id: string) => {
    try {
      const { success, error } = await GoalService.delete(id);
      
      if (error) {
        throw new Error(String(error));
      }
      
      if (success) {
        // Atualizar a lista local
        await fetchGoals();
        return true;
      }
      
      return false;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(`Erro ao excluir objetivo com ID ${id}`));
      console.error(`Erro ao excluir objetivo com ID ${id}:`, err);
      return false;
    }
  };

  const updateProgress = async (id: string, amount: number) => {
    try {
      const { success, error } = await GoalService.updateProgress(id, amount);
      
      if (error) {
        throw new Error(String(error));
      }
      
      if (success) {
        // Atualizar a lista local
        await fetchGoals();
        return true;
      }
      
      return false;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(`Erro ao atualizar progresso do objetivo com ID ${id}`));
      console.error(`Erro ao atualizar progresso do objetivo com ID ${id}:`, err);
      return false;
    }
  };

  return {
    goals,
    isLoading,
    error,
    createGoal,
    updateGoal,
    deleteGoal,
    updateProgress,
  };
} 