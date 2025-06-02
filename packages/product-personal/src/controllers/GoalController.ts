import { Goal, createGoal, updateGoal } from '@/models/Goal';
import { toast } from '@/hooks/use-toast';

const STORAGE_KEY = 'finmanage_goals';

export class GoalController {
  static getGoals(): Goal[] {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (!savedData) return [];
      
      const goals: Goal[] = JSON.parse(savedData);
      
      // Convertendo strings de data para objetos Date
      return goals.map(goal => ({
        ...goal,
        startDate: new Date(goal.startDate),
        targetDate: new Date(goal.targetDate),
        createdAt: new Date(goal.createdAt),
        updatedAt: new Date(goal.updatedAt)
      }));
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

  static getGoalById(id: string): Goal | null {
    const goals = this.getGoals();
    return goals.find(goal => goal.id === id) || null;
  }

  static createGoal(data: Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>): boolean {
    try {
      const goals = this.getGoals();
      const newGoal = createGoal(data);
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...goals, newGoal]));
      
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

  static updateGoal(id: string, data: Partial<Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>>): boolean {
    try {
      const goals = this.getGoals();
      const goalIndex = goals.findIndex(goal => goal.id === id);
      
      if (goalIndex === -1) {
        toast({
          title: "Erro",
          description: "Objetivo não encontrado.",
          variant: "destructive"
        });
        return false;
      }
      
      const updatedGoal = updateGoal(goals[goalIndex], data);
      goals[goalIndex] = updatedGoal;
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(goals));
      
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

  static deleteGoal(id: string): boolean {
    try {
      const goals = this.getGoals();
      const filteredGoals = goals.filter(goal => goal.id !== id);
      
      if (filteredGoals.length === goals.length) {
        toast({
          title: "Erro",
          description: "Objetivo não encontrado.",
          variant: "destructive"
        });
        return false;
      }
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredGoals));
      
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

  static updateGoalProgress(id: string, amount: number): boolean {
    try {
      const goals = this.getGoals();
      const goalIndex = goals.findIndex(goal => goal.id === id);
      
      if (goalIndex === -1) {
        toast({
          title: "Erro",
          description: "Objetivo não encontrado.",
          variant: "destructive"
        });
        return false;
      }
      
      const updatedGoal = {
        ...goals[goalIndex],
        currentAmount: amount,
        updatedAt: new Date()
      };
      
      goals[goalIndex] = updatedGoal;
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(goals));
      
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