import { supabase } from '../supabase';
import { Tables } from '../supabase';

export type Transaction = Tables['transactions'];

export class TransactionService {
  static async getAll(): Promise<{ data: Transaction[] | null; error: Error | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { data: null, error: new Error('Usuário não autenticado') };
      }
      
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });
      
      if (error) {
        console.error('Erro ao buscar transações:', error);
        return { data: null, error };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Erro inesperado ao buscar transações:', error);
      return { data: null, error: error as Error };
    }
  }
  
  static async getById(id: string): Promise<{ data: Transaction | null; error: Error | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { data: null, error: new Error('Usuário não autenticado') };
      }
      
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();
      
      if (error) {
        console.error(`Erro ao buscar transação com ID ${id}:`, error);
        return { data: null, error };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error(`Erro inesperado ao buscar transação com ID ${id}:`, error);
      return { data: null, error: error as Error };
    }
  }
  
  static async create(transaction: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>): Promise<{ data: Transaction | null; error: Error | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { data: null, error: new Error('Usuário não autenticado') };
      }
      
      // Garantir que o user_id esteja definido
      const transactionWithUserId = {
        ...transaction,
        user_id: user.id
      };
      
      const { data, error } = await supabase
        .from('transactions')
        .insert(transactionWithUserId)
        .select()
        .single();
      
      if (error) {
        console.error('Erro ao criar transação:', error);
        return { data: null, error };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Erro inesperado ao criar transação:', error);
      return { data: null, error: error as Error };
    }
  }
  
  static async update(id: string, transaction: Partial<Omit<Transaction, 'id' | 'created_at' | 'updated_at'>>): Promise<{ data: Transaction | null; error: Error | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { data: null, error: new Error('Usuário não autenticado') };
      }
      
      const { data, error } = await supabase
        .from('transactions')
        .update({ ...transaction, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();
      
      if (error) {
        console.error(`Erro ao atualizar transação com ID ${id}:`, error);
        return { data: null, error };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error(`Erro inesperado ao atualizar transação com ID ${id}:`, error);
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
        .from('transactions')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) {
        console.error(`Erro ao excluir transação com ID ${id}:`, error);
        return { success: false, error };
      }
      
      return { success: true, error: null };
    } catch (error) {
      console.error(`Erro inesperado ao excluir transação com ID ${id}:`, error);
      return { success: false, error: error as Error };
    }
  }
  
  static async getByDateRange(startDate: string, endDate: string): Promise<{ data: Transaction[] | null; error: Error | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { data: null, error: new Error('Usuário não autenticado') };
      }
      
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false });
      
      if (error) {
        console.error(`Erro ao buscar transações no período ${startDate} a ${endDate}:`, error);
        return { data: null, error };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error(`Erro inesperado ao buscar transações no período ${startDate} a ${endDate}:`, error);
      return { data: null, error: error as Error };
    }
  }
  
  static async getByType(type: 'receita' | 'despesa'): Promise<{ data: Transaction[] | null; error: Error | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { data: null, error: new Error('Usuário não autenticado') };
      }
      
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .eq('type', type)
        .order('date', { ascending: false });
      
      if (error) {
        console.error(`Erro ao buscar transações do tipo ${type}:`, error);
        return { data: null, error };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error(`Erro inesperado ao buscar transações do tipo ${type}:`, error);
      return { data: null, error: error as Error };
    }
  }
} 