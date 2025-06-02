import { supabase } from '../supabase';
import { Tables } from '../supabase';

export type Budget = Tables['budgets'];

export class BudgetService {
  static async getAll(): Promise<{ data: Budget[] | null; error: Error | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { data: null, error: new Error('Usuário não autenticado') };
      }
      
      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user.id)
        .order('name');
      
      if (error) {
        console.error('Erro ao buscar orçamentos:', error);
        return { data: null, error };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Erro inesperado ao buscar orçamentos:', error);
      return { data: null, error: error as Error };
    }
  }
  
  static async getById(id: string): Promise<{ data: Budget | null; error: Error | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { data: null, error: new Error('Usuário não autenticado') };
      }
      
      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();
      
      if (error) {
        console.error(`Erro ao buscar orçamento com ID ${id}:`, error);
        return { data: null, error };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error(`Erro inesperado ao buscar orçamento com ID ${id}:`, error);
      return { data: null, error: error as Error };
    }
  }
  
  static async create(budget: Omit<Budget, 'id' | 'created_at' | 'updated_at'>): Promise<{ data: Budget | null; error: Error | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { data: null, error: new Error('Usuário não autenticado') };
      }
      
      // Garantir que o user_id esteja definido
      const budgetWithUserId = {
        ...budget,
        user_id: user.id
      };
      
      const { data, error } = await supabase
        .from('budgets')
        .insert(budgetWithUserId)
        .select()
        .single();
      
      if (error) {
        console.error('Erro ao criar orçamento:', error);
        return { data: null, error };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Erro inesperado ao criar orçamento:', error);
      return { data: null, error: error as Error };
    }
  }
  
  static async update(id: string, budget: Partial<Omit<Budget, 'id' | 'created_at' | 'updated_at'>>): Promise<{ data: Budget | null; error: Error | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { data: null, error: new Error('Usuário não autenticado') };
      }
      
      const { data, error } = await supabase
        .from('budgets')
        .update({ ...budget, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();
      
      if (error) {
        console.error(`Erro ao atualizar orçamento com ID ${id}:`, error);
        return { data: null, error };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error(`Erro inesperado ao atualizar orçamento com ID ${id}:`, error);
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
        .from('budgets')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) {
        console.error(`Erro ao excluir orçamento com ID ${id}:`, error);
        return { success: false, error };
      }
      
      return { success: true, error: null };
    } catch (error) {
      console.error(`Erro inesperado ao excluir orçamento com ID ${id}:`, error);
      return { success: false, error: error as Error };
    }
  }
  
  static async updateSpentAmount(id: string, spentAmount: number): Promise<{ success: boolean; error: Error | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { success: false, error: new Error('Usuário não autenticado') };
      }
      
      const { error } = await supabase
        .from('budgets')
        .update({ spent_amount: spentAmount, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) {
        console.error(`Erro ao atualizar valor gasto do orçamento ${id}:`, error);
        return { success: false, error };
      }
      
      return { success: true, error: null };
    } catch (error) {
      console.error(`Erro inesperado ao atualizar valor gasto do orçamento ${id}:`, error);
      return { success: false, error: error as Error };
    }
  }
} 