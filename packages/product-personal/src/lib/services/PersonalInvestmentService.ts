import { InvestmentService as IInvestmentService, Investment } from '@finmanage/core/services';
import { supabase } from '../supabase';
import { Tables } from '../supabase';

/**
 * Implementação do serviço de investimentos para o produto Personal
 */
export class PersonalInvestmentService implements IInvestmentService {
  // Mapeamento de tipo para compatibilidade com a interface do core
  private mapInvestment(investment: Tables['investments']): Investment {
    return investment as unknown as Investment;
  }

  async getAll(): Promise<{ data: Investment[] | null; error: Error | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { data: null, error: new Error('Usuário não autenticado') };
      }
      
      const { data, error } = await supabase
        .from('investments')
        .select('*')
        .eq('user_id', user.id)
        .order('name');
      
      if (error) {
        console.error('Erro ao buscar investimentos:', error);
        return { data: null, error };
      }
      
      return { 
        data: data ? data.map(this.mapInvestment) : null, 
        error: null 
      };
    } catch (error) {
      console.error('Erro inesperado ao buscar investimentos:', error);
      return { data: null, error: error as Error };
    }
  }
  
  async getById(id: string): Promise<{ data: Investment | null; error: Error | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { data: null, error: new Error('Usuário não autenticado') };
      }
      
      const { data, error } = await supabase
        .from('investments')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();
      
      if (error) {
        console.error(`Erro ao buscar investimento com ID ${id}:`, error);
        return { data: null, error };
      }
      
      return { 
        data: data ? this.mapInvestment(data) : null, 
        error: null 
      };
    } catch (error) {
      console.error(`Erro inesperado ao buscar investimento com ID ${id}:`, error);
      return { data: null, error: error as Error };
    }
  }
  
  async create(investment: Omit<Investment, 'id' | 'created_at' | 'updated_at'>): Promise<{ data: Investment | null; error: Error | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { data: null, error: new Error('Usuário não autenticado') };
      }
      
      // Garantir que o user_id esteja definido
      const investmentWithUserId = {
        ...investment,
        user_id: user.id
      };
      
      const { data, error } = await supabase
        .from('investments')
        .insert(investmentWithUserId)
        .select()
        .single();
      
      if (error) {
        console.error('Erro ao criar investimento:', error);
        return { data: null, error };
      }
      
      return { 
        data: data ? this.mapInvestment(data) : null, 
        error: null 
      };
    } catch (error) {
      console.error('Erro inesperado ao criar investimento:', error);
      return { data: null, error: error as Error };
    }
  }
  
  async update(id: string, investment: Partial<Omit<Investment, 'id' | 'created_at' | 'updated_at'>>): Promise<{ data: Investment | null; error: Error | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { data: null, error: new Error('Usuário não autenticado') };
      }
      
      const { data, error } = await supabase
        .from('investments')
        .update({ ...investment, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();
      
      if (error) {
        console.error(`Erro ao atualizar investimento com ID ${id}:`, error);
        return { data: null, error };
      }
      
      return { 
        data: data ? this.mapInvestment(data) : null, 
        error: null 
      };
    } catch (error) {
      console.error(`Erro inesperado ao atualizar investimento com ID ${id}:`, error);
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
        .from('investments')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      
      if (error) {
        console.error(`Erro ao excluir investimento com ID ${id}:`, error);
        return { success: false, error };
      }
      
      return { success: true, error: null };
    } catch (error) {
      console.error(`Erro inesperado ao excluir investimento com ID ${id}:`, error);
      return { success: false, error: error as Error };
    }
  }
  
  async getByType(type: string): Promise<{ data: Investment[] | null; error: Error | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { data: null, error: new Error('Usuário não autenticado') };
      }
      
      const { data, error } = await supabase
        .from('investments')
        .select('*')
        .eq('user_id', user.id)
        .eq('type', type)
        .order('name');
      
      if (error) {
        console.error(`Erro ao buscar investimentos do tipo ${type}:`, error);
        return { data: null, error };
      }
      
      return { 
        data: data ? data.map(this.mapInvestment) : null, 
        error: null 
      };
    } catch (error) {
      console.error(`Erro inesperado ao buscar investimentos do tipo ${type}:`, error);
      return { data: null, error: error as Error };
    }
  }
  
  async getByStatus(status: 'ativo' | 'resgatado' | 'vencido'): Promise<{ data: Investment[] | null; error: Error | null }> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return { data: null, error: new Error('Usuário não autenticado') };
      }
      
      const { data, error } = await supabase
        .from('investments')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', status)
        .order('name');
      
      if (error) {
        console.error(`Erro ao buscar investimentos com status ${status}:`, error);
        return { data: null, error };
      }
      
      return { 
        data: data ? data.map(this.mapInvestment) : null, 
        error: null 
      };
    } catch (error) {
      console.error(`Erro inesperado ao buscar investimentos com status ${status}:`, error);
      return { data: null, error: error as Error };
    }
  }
  
  async calculateReturn(id: string): Promise<{ 
    currentValue: number; 
    profit: number; 
    profitPercentage: number; 
    error: Error | null 
  }> {
    try {
      const { data: investment, error } = await this.getById(id);
      
      if (error || !investment) {
        console.error(`Erro ao calcular rendimento do investimento ${id}:`, error);
        return { 
          currentValue: 0, 
          profit: 0, 
          profitPercentage: 0, 
          error: error || new Error('Investimento não encontrado') 
        };
      }
      
      const currentValue = investment.amount;
      const initialValue = investment.initial_amount;
      const profit = currentValue - initialValue;
      const profitPercentage = initialValue > 0 ? (profit / initialValue) * 100 : 0;
      
      return { 
        currentValue, 
        profit, 
        profitPercentage, 
        error: null 
      };
    } catch (error) {
      console.error(`Erro inesperado ao calcular rendimento do investimento ${id}:`, error);
      return { 
        currentValue: 0, 
        profit: 0, 
        profitPercentage: 0, 
        error: error as Error 
      };
    }
  }
  
  async registerWithdrawal(id: string, amount: number): Promise<{ data: Investment | null; error: Error | null }> {
    try {
      const { data: investment, error: getError } = await this.getById(id);
      
      if (getError || !investment) {
        console.error(`Erro ao buscar investimento ${id} para resgate:`, getError);
        return { 
          data: null, 
          error: getError || new Error('Investimento não encontrado') 
        };
      }
      
      if (amount > investment.amount) {
        return { 
          data: null, 
          error: new Error('Valor de resgate maior que o valor disponível') 
        };
      }
      
      const newAmount = investment.amount - amount;
      const status = newAmount === 0 ? 'resgatado' : investment.status;
      
      const { data, error } = await this.update(id, { 
        amount: newAmount,
        status,
        updated_at: new Date().toISOString()
      });
      
      if (error) {
        console.error(`Erro ao registrar resgate do investimento ${id}:`, error);
        return { data: null, error };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error(`Erro inesperado ao registrar resgate do investimento ${id}:`, error);
      return { data: null, error: error as Error };
    }
  }
} 