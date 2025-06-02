import { BudgetService as IBudgetService, Budget } from '@finmanage/core/services';
import { supabase } from '../supabase';
import { Tables } from '../supabase';

/**
 * Implementação do serviço de orçamentos para o produto Personal
 */
export class PersonalBudgetService implements IBudgetService {
  // Mapeamento de tipo para compatibilidade com a interface do core
  private mapBudget(budget: Tables['budgets']): Budget {
    return budget as unknown as Budget;
  }

  async getAll(): Promise<{ data: Budget[] | null; error: Error | null }> {
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
      
      return { 
        data: data ? data.map(this.mapBudget) : null, 
        error: null 
      };
    } catch (error) {
      console.error('Erro inesperado ao buscar orçamentos:', error);
      return { data: null, error: error as Error };
    }
  }
  
  async getById(id: string): Promise<{ data: Budget | null; error: Error | null }> {
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
      
      return { 
        data: data ? this.mapBudget(data) : null, 
        error: null 
      };
    } catch (error) {
      console.error(`Erro inesperado ao buscar orçamento com ID ${id}:`, error);
      return { data: null, error: error as Error };
    }
  }
  
  async create(budget: Omit<Budget, 'id' | 'created_at' | 'updated_at'>): Promise<{ data: Budget | null; error: Error | null }> {
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
      
      return { 
        data: data ? this.mapBudget(data) : null, 
        error: null 
      };
    } catch (error) {
      console.error('Erro inesperado ao criar orçamento:', error);
      return { data: null, error: error as Error };
    }
  }
  
  async update(id: string, budget: Partial<Omit<Budget, 'id' | 'created_at' | 'updated_at'>>): Promise<{ data: Budget | null; error: Error | null }> {
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
      
      return { 
        data: data ? this.mapBudget(data) : null, 
        error: null 
      };
    } catch (error) {
      console.error(`Erro inesperado ao atualizar orçamento com ID ${id}:`, error);
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
  
  async getByDateRange(startDate: string, endDate: string): Promise<{ data: Budget[] | null; error: Error | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { data: null, error: new Error('Usuário não autenticado') };
      }
      
      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user.id)
        .or(`start_date.gte.${startDate},end_date.lte.${endDate}`)
        .order('start_date');
      
      if (error) {
        console.error(`Erro ao buscar orçamentos no período ${startDate} a ${endDate}:`, error);
        return { data: null, error };
      }
      
      return { 
        data: data ? data.map(this.mapBudget) : null, 
        error: null 
      };
    } catch (error) {
      console.error(`Erro inesperado ao buscar orçamentos no período ${startDate} a ${endDate}:`, error);
      return { data: null, error: error as Error };
    }
  }
  
  async updateSpent(id: string, amount: number): Promise<{ data: Budget | null; error: Error | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { data: null, error: new Error('Usuário não autenticado') };
      }
      
      // Primeiro, obter o orçamento atual
      const { data: budget, error: getError } = await this.getById(id);
      
      if (getError || !budget) {
        console.error(`Erro ao buscar orçamento com ID ${id}:`, getError);
        return { data: null, error: getError || new Error('Orçamento não encontrado') };
      }
      
      // Atualizar o valor gasto
      const { data, error } = await supabase
        .from('budgets')
        .update({ 
          spent: amount,
          updated_at: new Date().toISOString() 
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();
      
      if (error) {
        console.error(`Erro ao atualizar valor gasto do orçamento ${id}:`, error);
        return { data: null, error };
      }
      
      return { 
        data: data ? this.mapBudget(data) : null, 
        error: null 
      };
    } catch (error) {
      console.error(`Erro inesperado ao atualizar valor gasto do orçamento ${id}:`, error);
      return { data: null, error: error as Error };
    }
  }
  
  async isWithinLimit(id: string): Promise<{ withinLimit: boolean; remaining: number; error: Error | null }> {
    try {
      const { data: budget, error } = await this.getById(id);
      
      if (error || !budget) {
        console.error(`Erro ao verificar limite do orçamento ${id}:`, error);
        return { 
          withinLimit: false, 
          remaining: 0, 
          error: error || new Error('Orçamento não encontrado') 
        };
      }
      
      const remaining = budget.amount - budget.spent;
      const withinLimit = remaining >= 0;
      
      return { 
        withinLimit, 
        remaining, 
        error: null 
      };
    } catch (error) {
      console.error(`Erro inesperado ao verificar limite do orçamento ${id}:`, error);
      return { 
        withinLimit: false, 
        remaining: 0, 
        error: error as Error 
      };
    }
  }
} 