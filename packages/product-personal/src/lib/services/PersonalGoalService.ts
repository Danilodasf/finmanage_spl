import { GoalService as IGoalService, Goal } from '@finmanage/core/services';
import { supabase } from '../supabase';
import { Tables } from '../supabase';

/**
 * Implementação do serviço de metas para o produto Personal
 */
export class PersonalGoalService implements IGoalService {
  // Mapeamento de tipo para compatibilidade com a interface do core
  private mapGoal(goal: Tables['goals']): Goal {
    return goal as unknown as Goal;
  }

  async getAll(): Promise<{ data: Goal[] | null; error: Error | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { data: null, error: new Error('Usuário não autenticado') };
      }
      
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('deadline', { ascending: true });
      
      if (error) {
        console.error('Erro ao buscar metas:', error);
        return { data: null, error };
      }
      
      return { 
        data: data ? data.map(this.mapGoal) : null, 
        error: null 
      };
    } catch (error) {
      console.error('Erro inesperado ao buscar metas:', error);
      return { data: null, error: error as Error };
    }
  }
  
  async getById(id: string): Promise<{ data: Goal | null; error: Error | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { data: null, error: new Error('Usuário não autenticado') };
      }
      
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();
      
      if (error) {
        console.error(`Erro ao buscar meta com ID ${id}:`, error);
        return { data: null, error };
      }
      
      return { 
        data: data ? this.mapGoal(data) : null, 
        error: null 
      };
    } catch (error) {
      console.error(`Erro inesperado ao buscar meta com ID ${id}:`, error);
      return { data: null, error: error as Error };
    }
  }
  
  async create(goal: Omit<Goal, 'id' | 'created_at' | 'updated_at'>): Promise<{ data: Goal | null; error: Error | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { data: null, error: new Error('Usuário não autenticado') };
      }
      
      // Garantir que o user_id esteja definido
      const goalWithUserId = {
        ...goal,
        user_id: user.id
      };
      
      const { data, error } = await supabase
        .from('goals')
        .insert(goalWithUserId)
        .select()
        .single();
      
      if (error) {
        console.error('Erro ao criar meta:', error);
        return { data: null, error };
      }
      
      return { 
        data: data ? this.mapGoal(data) : null, 
        error: null 
      };
    } catch (error) {
      console.error('Erro inesperado ao criar meta:', error);
      return { data: null, error: error as Error };
    }
  }
  
  async update(id: string, goal: Partial<Omit<Goal, 'id' | 'created_at' | 'updated_at'>>): Promise<{ data: Goal | null; error: Error | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { data: null, error: new Error('Usuário não autenticado') };
      }
      
      const { data, error } = await supabase
        .from('goals')
        .update({ ...goal, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();
      
      if (error) {
        console.error(`Erro ao atualizar meta com ID ${id}:`, error);
        return { data: null, error };
      }
      
      return { 
        data: data ? this.mapGoal(data) : null, 
        error: null 
      };
    } catch (error) {
      console.error(`Erro inesperado ao atualizar meta com ID ${id}:`, error);
      return { data: null, error: error as Error };
    }
  }
  
  async delete(id: string): Promise<{ success: boolean; error: Error | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { success: false, error: new Error('Usuário não autenticado') };
      }
      
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) {
        console.error(`Erro ao excluir meta com ID ${id}:`, error);
        return { success: false, error };
      }
      
      return { success: true, error: null };
    } catch (error) {
      console.error(`Erro inesperado ao excluir meta com ID ${id}:`, error);
      return { success: false, error: error as Error };
    }
  }
  
  async updateCurrentAmount(id: string, amount: number): Promise<{ data: Goal | null; error: Error | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { data: null, error: new Error('Usuário não autenticado') };
      }
      
      const { data, error } = await supabase
        .from('goals')
        .update({ 
          current_amount: amount,
          updated_at: new Date().toISOString() 
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();
      
      if (error) {
        console.error(`Erro ao atualizar valor atual da meta ${id}:`, error);
        return { data: null, error };
      }
      
      return { 
        data: data ? this.mapGoal(data) : null, 
        error: null 
      };
    } catch (error) {
      console.error(`Erro inesperado ao atualizar valor atual da meta ${id}:`, error);
      return { data: null, error: error as Error };
    }
  }
  
  async calculateProgress(id: string): Promise<{ 
    progress: number; 
    remaining: number; 
    isCompleted: boolean; 
    error: Error | null 
  }> {
    try {
      const { data: goal, error } = await this.getById(id);
      
      if (error || !goal) {
        console.error(`Erro ao calcular progresso da meta ${id}:`, error);
        return { 
          progress: 0, 
          remaining: 0, 
          isCompleted: false, 
          error: error || new Error('Meta não encontrada') 
        };
      }
      
      const progress = Math.min(100, (goal.current_amount / goal.target_amount) * 100);
      const remaining = Math.max(0, goal.target_amount - goal.current_amount);
      const isCompleted = goal.current_amount >= goal.target_amount;
      
      return { 
        progress, 
        remaining, 
        isCompleted, 
        error: null 
      };
    } catch (error) {
      console.error(`Erro inesperado ao calcular progresso da meta ${id}:`, error);
      return { 
        progress: 0, 
        remaining: 0, 
        isCompleted: false, 
        error: error as Error 
      };
    }
  }
  
  async getByCompletionStatus(completed: boolean): Promise<{ data: Goal[] | null; error: Error | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { data: null, error: new Error('Usuário não autenticado') };
      }
      
      // Buscar todas as metas do usuário
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) {
        console.error('Erro ao buscar metas por status de conclusão:', error);
        return { data: null, error };
      }
      
      if (!data) {
        return { data: null, error: null };
      }
      
      // Filtrar localmente pelo status de conclusão
      const filteredGoals = data.filter(goal => {
        const isCompleted = goal.current_amount >= goal.target_amount;
        return isCompleted === completed;
      });
      
      return { 
        data: filteredGoals.map(this.mapGoal), 
        error: null 
      };
    } catch (error) {
      console.error('Erro inesperado ao buscar metas por status de conclusão:', error);
      return { data: null, error: error as Error };
    }
  }
} 