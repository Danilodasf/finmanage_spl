import { supabase } from '../supabase';

export interface Goal {
  id: string;
  name: string;
  description?: string;
  target_amount: number;
  current_amount: number;
  deadline?: Date;
  user_id: string;
  created_at?: Date;
  updated_at?: Date;
}

export class GoalService {
  static async getAll() {
    try {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Erro ao buscar objetivos:', error);
        return { data: null, error };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Erro ao buscar objetivos:', error);
      return { data: null, error };
    }
  }

  static async getById(id: string) {
    try {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error(`Erro ao buscar objetivo com ID ${id}:`, error);
        return { data: null, error };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error(`Erro ao buscar objetivo com ID ${id}:`, error);
      return { data: null, error };
    }
  }

  static async create(goal: Omit<Goal, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const { data, error } = await supabase
        .from('goals')
        .insert(goal)
        .select()
        .single();
      
      if (error) {
        console.error('Erro ao criar objetivo:', error);
        return { data: null, error };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Erro ao criar objetivo:', error);
      return { data: null, error };
    }
  }

  static async update(id: string, updates: Partial<Omit<Goal, 'id' | 'created_at' | 'updated_at' | 'user_id'>>) {
    try {
      const { data, error } = await supabase
        .from('goals')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error(`Erro ao atualizar objetivo com ID ${id}:`, error);
        return { data: null, error };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error(`Erro ao atualizar objetivo com ID ${id}:`, error);
      return { data: null, error };
    }
  }

  static async delete(id: string) {
    try {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error(`Erro ao excluir objetivo com ID ${id}:`, error);
        return { success: false, error };
      }
      
      return { success: true, error: null };
    } catch (error) {
      console.error(`Erro ao excluir objetivo com ID ${id}:`, error);
      return { success: false, error };
    }
  }

  static async updateProgress(id: string, amount: number) {
    try {
      // Primeiro buscamos o objetivo atual
      const { data: goal, error: fetchError } = await this.getById(id);
      
      if (fetchError || !goal) {
        console.error(`Erro ao buscar objetivo com ID ${id}:`, fetchError);
        return { success: false, error: fetchError };
      }
      
      // Calculamos o novo valor atual
      const newAmount = goal.current_amount + amount;
      
      // Atualizamos o objetivo
      const { data, error } = await this.update(id, { current_amount: newAmount });
      
      if (error) {
        console.error(`Erro ao atualizar progresso do objetivo com ID ${id}:`, error);
        return { success: false, error };
      }
      
      return { success: true, error: null };
    } catch (error) {
      console.error(`Erro ao atualizar progresso do objetivo com ID ${id}:`, error);
      return { success: false, error };
    }
  }
} 