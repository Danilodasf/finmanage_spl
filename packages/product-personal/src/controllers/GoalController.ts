import { toast } from '@/hooks/use-toast';
import { GoalService, Goal } from '@/lib/services/GoalService';

export class GoalController {
  static async getGoals(): Promise<Goal[]> {
    try {
      const { data, error } = await GoalService.getAll();
      
      if (error) {
        toast({
          title: "Erro",
          description: "Não foi possível carregar os objetivos.",
          variant: "destructive"
        });
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar objetivos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os objetivos.",
        variant: "destructive"
      });
      return [];
    }
  }

  static async getGoalById(id: string): Promise<Goal | null> {
    try {
      const { data, error } = await GoalService.getById(id);
      
      if (error) {
        console.error(`Erro ao buscar objetivo com ID ${id}:`, error);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error(`Erro ao buscar objetivo com ID ${id}:`, error);
      return null;
    }
  }

  static async createGoal(data: Omit<Goal, 'id' | 'created_at' | 'updated_at'>): Promise<boolean> {
    try {
      const { error } = await GoalService.create(data);
      
      if (error) {
        toast({
          title: "Erro",
          description: "Não foi possível criar o objetivo.",
          variant: "destructive"
        });
        return false;
      }
      
      toast({
        title: "Sucesso",
        description: "Objetivo criado com sucesso."
      });
      
      return true;
    } catch (error) {
      console.error('Erro ao criar objetivo:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o objetivo.",
        variant: "destructive"
      });
      return false;
    }
  }

  static async updateGoal(id: string, data: Partial<Omit<Goal, 'id' | 'created_at' | 'updated_at' | 'user_id'>>): Promise<boolean> {
    try {
      const { error } = await GoalService.update(id, data);
      
      if (error) {
        toast({
          title: "Erro",
          description: "Não foi possível atualizar o objetivo.",
          variant: "destructive"
        });
        return false;
      }
      
      toast({
        title: "Sucesso",
        description: "Objetivo atualizado com sucesso."
      });
      
      return true;
    } catch (error) {
      console.error('Erro ao atualizar objetivo:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o objetivo.",
        variant: "destructive"
      });
      return false;
    }
  }

  static async deleteGoal(id: string): Promise<boolean> {
    try {
      const { success, error } = await GoalService.delete(id);
      
      if (error || !success) {
        toast({
          title: "Erro",
          description: "Não foi possível excluir o objetivo.",
          variant: "destructive"
        });
        return false;
      }
      
      toast({
        title: "Sucesso",
        description: "Objetivo excluído com sucesso."
      });
      
      return true;
    } catch (error) {
      console.error('Erro ao excluir objetivo:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o objetivo.",
        variant: "destructive"
      });
      return false;
    }
  }

  static async updateGoalProgress(id: string, amount: number): Promise<boolean> {
    try {
      const { success, error } = await GoalService.updateProgress(id, amount);
      
      if (error || !success) {
        toast({
          title: "Erro",
          description: "Não foi possível atualizar o progresso.",
          variant: "destructive"
        });
        return false;
      }
      
      toast({
        title: "Sucesso",
        description: "Progresso do objetivo atualizado."
      });
      
      return true;
    } catch (error) {
      console.error('Erro ao atualizar progresso:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o progresso.",
        variant: "destructive"
      });
      return false;
    }
  }
} 