import { supabase } from '../supabase';
import { Tables } from '../supabase';

export type Goal = Tables['goals'];

export class GoalService {
  static async getAll(): Promise<{ data: Goal[] | null; error: Error | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { data: null, error: new Error('Usuário não autenticado') };
      }
      
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('target_date', { ascending: true });
      
      if (error) {
        console.error('Erro ao buscar objetivos:', error);
        return { data: null, error };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Erro inesperado ao buscar objetivos:', error);
      return { data: null, error: error as Error };
    }
  }
  
  static async getById(id: string): Promise<{ data: Goal | null; error: Error | null }> {
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
        console.error(`Erro ao buscar objetivo com ID ${id}:`, error);
        return { data: null, error };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error(`Erro inesperado ao buscar objetivo com ID ${id}:`, error);
      return { data: null, error: error as Error };
    }
  }
  
  static async create(goal: Omit<Goal, 'id' | 'created_at' | 'updated_at'>): Promise<{ data: Goal | null; error: Error | null }> {
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
        console.error('Erro ao criar objetivo:', error);
        return { data: null, error };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Erro inesperado ao criar objetivo:', error);
      return { data: null, error: error as Error };
    }
  }
  
  static async update(id: string, goal: Partial<Omit<Goal, 'id' | 'created_at' | 'updated_at' | 'user_id'>>): Promise<{ data: Goal | null; error: Error | null }> {
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
        console.error(`Erro ao atualizar objetivo com ID ${id}:`, error);
        return { data: null, error };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error(`Erro inesperado ao atualizar objetivo com ID ${id}:`, error);
      return { data: null, error: error as Error };
    }
  }
  
  static async delete(id: string): Promise<{ success: boolean; error: Error | null }> {
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
        console.error(`Erro ao excluir objetivo com ID ${id}:`, error);
        return { success: false, error };
      }
      
      return { success: true, error: null };
    } catch (error) {
      console.error(`Erro inesperado ao excluir objetivo com ID ${id}:`, error);
      return { success: false, error: error as Error };
    }
  }
  
  static async updateProgress(id: string, currentAmount: number): Promise<{ success: boolean; error: Error | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { success: false, error: new Error('Usuário não autenticado') };
      }
      
      const { error } = await supabase
        .from('goals')
        .update({ 
          current_amount: currentAmount, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) {
        console.error(`Erro ao atualizar progresso do objetivo ${id}:`, error);
        return { success: false, error };
      }
      
      return { success: true, error: null };
    } catch (error) {
      console.error(`Erro inesperado ao atualizar progresso do objetivo ${id}:`, error);
      return { success: false, error: error as Error };
    }
  }
} 