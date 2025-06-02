import { TransactionService as ITransactionService, Transaction } from '@finmanage/core/services';
import { supabase } from '../supabase';
import { Tables } from '../supabase';

/**
 * Implementação do serviço de transações para o produto Personal
 */
export class PersonalTransactionService implements ITransactionService {
  // Mapeamento de tipo para compatibilidade com a interface do core
  private mapTransaction(transaction: Tables['transactions']): Transaction {
    return transaction as unknown as Transaction;
  }

  async getAll(): Promise<{ data: Transaction[] | null; error: Error | null }> {
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
      
      return { 
        data: data ? data.map(this.mapTransaction) : null, 
        error: null 
      };
    } catch (error) {
      console.error('Erro inesperado ao buscar transações:', error);
      return { data: null, error: error as Error };
    }
  }
  
  async getById(id: string): Promise<{ data: Transaction | null; error: Error | null }> {
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
      
      return { 
        data: data ? this.mapTransaction(data) : null, 
        error: null 
      };
    } catch (error) {
      console.error(`Erro inesperado ao buscar transação com ID ${id}:`, error);
      return { data: null, error: error as Error };
    }
  }
  
  async create(transaction: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>): Promise<{ data: Transaction | null; error: Error | null }> {
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
      
      return { 
        data: data ? this.mapTransaction(data) : null, 
        error: null 
      };
    } catch (error) {
      console.error('Erro inesperado ao criar transação:', error);
      return { data: null, error: error as Error };
    }
  }
  
  async update(id: string, transaction: Partial<Omit<Transaction, 'id' | 'created_at' | 'updated_at'>>): Promise<{ data: Transaction | null; error: Error | null }> {
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
      
      return { 
        data: data ? this.mapTransaction(data) : null, 
        error: null 
      };
    } catch (error) {
      console.error(`Erro inesperado ao atualizar transação com ID ${id}:`, error);
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
  
  async getByDateRange(startDate: string, endDate: string): Promise<{ data: Transaction[] | null; error: Error | null }> {
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
      
      return { 
        data: data ? data.map(this.mapTransaction) : null, 
        error: null 
      };
    } catch (error) {
      console.error(`Erro inesperado ao buscar transações no período ${startDate} a ${endDate}:`, error);
      return { data: null, error: error as Error };
    }
  }
  
  async getByType(type: 'receita' | 'despesa'): Promise<{ data: Transaction[] | null; error: Error | null }> {
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
      
      return { 
        data: data ? data.map(this.mapTransaction) : null, 
        error: null 
      };
    } catch (error) {
      console.error(`Erro inesperado ao buscar transações do tipo ${type}:`, error);
      return { data: null, error: error as Error };
    }
  }
  
  async getFinancialSummary(period: 'month' | 'year'): Promise<{
    receitas: number;
    despesas: number;
    saldo: number;
    transactions: Transaction[];
  }> {
    try {
      const now = new Date();
      let startDate, endDate;
      
      if (period === 'month') {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
      } else {
        startDate = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
        endDate = new Date(now.getFullYear(), 11, 31).toISOString().split('T')[0];
      }
      
      const { data, error } = await this.getByDateRange(startDate, endDate);
      
      if (error || !data) {
        return {
          receitas: 0,
          despesas: 0,
          saldo: 0,
          transactions: []
        };
      }
      
      const receitas = data
        .filter(t => t.type === 'receita')
        .reduce((sum, t) => sum + Number(t.value), 0);
      
      const despesas = data
        .filter(t => t.type === 'despesa')
        .reduce((sum, t) => sum + Number(t.value), 0);

      return {
        receitas,
        despesas,
        saldo: receitas - despesas,
        transactions: data
      };
    } catch (error) {
      console.error('Erro ao calcular resumo financeiro:', error);
      return {
        receitas: 0,
        despesas: 0,
        saldo: 0,
        transactions: []
      };
    }
  }
  
  async getAvailableBalance(): Promise<number> {
    try {
      const { receitas, despesas } = await this.getFinancialSummary('month');
      return receitas - despesas;
    } catch (error) {
      console.error('Erro ao calcular saldo disponível:', error);
      return 0;
    }
  }
} 