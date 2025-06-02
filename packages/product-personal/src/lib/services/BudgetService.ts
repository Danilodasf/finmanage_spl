import { supabase } from '../supabase';

export interface Budget {
  id: string;
  name: string;
  amount: number;
  spent: number;
  category_id?: string;
  period: 'monthly' | 'yearly';
  start_date: Date;
  end_date?: Date;
  user_id: string;
  created_at?: Date;
  updated_at?: Date;
}

export class BudgetService {
  static async getAll() {
    try {
      const { data, error } = await supabase
        .from('budgets')
        .select('*, categories:category_id(*)')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Erro ao buscar orçamentos:', error);
        return { data: null, error };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Erro ao buscar orçamentos:', error);
      return { data: null, error };
    }
  }

  static async getById(id: string) {
    try {
      const { data, error } = await supabase
        .from('budgets')
        .select('*, categories:category_id(*)')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error(`Erro ao buscar orçamento com ID ${id}:`, error);
        return { data: null, error };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error(`Erro ao buscar orçamento com ID ${id}:`, error);
      return { data: null, error };
    }
  }

  static async create(budget: Omit<Budget, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const { data, error } = await supabase
        .from('budgets')
        .insert(budget)
        .select()
        .single();
      
      if (error) {
        console.error('Erro ao criar orçamento:', error);
        return { data: null, error };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Erro ao criar orçamento:', error);
      return { data: null, error };
    }
  }

  static async update(id: string, updates: Partial<Omit<Budget, 'id' | 'created_at' | 'updated_at' | 'user_id'>>) {
    try {
      const { data, error } = await supabase
        .from('budgets')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error(`Erro ao atualizar orçamento com ID ${id}:`, error);
        return { data: null, error };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error(`Erro ao atualizar orçamento com ID ${id}:`, error);
      return { data: null, error };
    }
  }

  static async delete(id: string) {
    try {
      const { error } = await supabase
        .from('budgets')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error(`Erro ao excluir orçamento com ID ${id}:`, error);
        return { success: false, error };
      }
      
      return { success: true, error: null };
    } catch (error) {
      console.error(`Erro ao excluir orçamento com ID ${id}:`, error);
      return { success: false, error };
    }
  }

  static async updateSpent(id: string, amount: number) {
    try {
      // Primeiro buscamos o orçamento atual
      const { data: budget, error: fetchError } = await this.getById(id);
      
      if (fetchError || !budget) {
        console.error(`Erro ao buscar orçamento com ID ${id}:`, fetchError);
        return { success: false, error: fetchError };
      }
      
      // Calculamos o novo valor gasto
      const newSpent = budget.spent + amount;
      
      // Atualizamos o orçamento
      const { data, error } = await this.update(id, { spent: newSpent });
      
      if (error) {
        console.error(`Erro ao atualizar gastos do orçamento com ID ${id}:`, error);
        return { success: false, error };
      }
      
      return { success: true, error: null };
    } catch (error) {
      console.error(`Erro ao atualizar gastos do orçamento com ID ${id}:`, error);
      return { success: false, error };
    }
  }
} 