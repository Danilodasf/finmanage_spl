import { supabase } from '../supabase';
import { Tables } from '../supabase';

export type Investment = Tables['investments'];
export type InvestmentReturn = Tables['investment_returns'];

export class InvestmentService {
  static async getAll(): Promise<{ data: Investment[] | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('investments')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Erro ao buscar investimentos:', error);
        return { data: null, error };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Erro inesperado ao buscar investimentos:', error);
      return { data: null, error: error as Error };
    }
  }
  
  static async getById(id: string): Promise<{ data: Investment | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('investments')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error(`Erro ao buscar investimento com ID ${id}:`, error);
        return { data: null, error };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error(`Erro inesperado ao buscar investimento com ID ${id}:`, error);
      return { data: null, error: error as Error };
    }
  }
  
  static async create(investment: Omit<Investment, 'id' | 'created_at' | 'updated_at'>): Promise<{ data: Investment | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('investments')
        .insert(investment)
        .select()
        .single();
      
      if (error) {
        console.error('Erro ao criar investimento:', error);
        return { data: null, error };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Erro inesperado ao criar investimento:', error);
      return { data: null, error: error as Error };
    }
  }
  
  static async update(id: string, investment: Partial<Omit<Investment, 'id' | 'created_at' | 'updated_at'>>): Promise<{ data: Investment | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('investments')
        .update({ ...investment, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error(`Erro ao atualizar investimento com ID ${id}:`, error);
        return { data: null, error };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error(`Erro inesperado ao atualizar investimento com ID ${id}:`, error);
      return { data: null, error: error as Error };
    }
  }
  
  static async delete(id: string): Promise<{ success: boolean; error: Error | null }> {
    try {
      const { error } = await supabase
        .from('investments')
        .delete()
        .eq('id', id);
      
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
  
  // Métodos para gerenciar os rendimentos de investimentos
  static async getInvestmentReturns(investmentId: string): Promise<{ data: InvestmentReturn[] | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('investment_returns')
        .select('*')
        .eq('investment_id', investmentId)
        .order('date', { ascending: false });
      
      if (error) {
        console.error(`Erro ao buscar rendimentos do investimento ${investmentId}:`, error);
        return { data: null, error };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error(`Erro inesperado ao buscar rendimentos do investimento ${investmentId}:`, error);
      return { data: null, error: error as Error };
    }
  }
  
  static async addInvestmentReturn(returnData: Omit<InvestmentReturn, 'id' | 'created_at'>): Promise<{ data: InvestmentReturn | null; error: Error | null }> {
    try {
      const { data, error } = await supabase
        .from('investment_returns')
        .insert(returnData)
        .select()
        .single();
      
      if (error) {
        console.error('Erro ao adicionar rendimento:', error);
        return { data: null, error };
      }
      
      // Atualizar o total de rendimentos do investimento
      await this.updateInvestmentTotalReturns(returnData.investment_id);
      
      return { data, error: null };
    } catch (error) {
      console.error('Erro inesperado ao adicionar rendimento:', error);
      return { data: null, error: error as Error };
    }
  }
  
  static async deleteInvestmentReturn(id: string): Promise<{ success: boolean; error: Error | null }> {
    try {
      // Primeiro obter o retorno para saber o ID do investimento
      const { data: returnData } = await supabase
        .from('investment_returns')
        .select('investment_id')
        .eq('id', id)
        .single();
      
      if (!returnData) {
        return { success: false, error: new Error('Rendimento não encontrado') };
      }
      
      const { error } = await supabase
        .from('investment_returns')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error(`Erro ao excluir rendimento com ID ${id}:`, error);
        return { success: false, error };
      }
      
      // Atualizar o total de rendimentos do investimento
      await this.updateInvestmentTotalReturns(returnData.investment_id);
      
      return { success: true, error: null };
    } catch (error) {
      console.error(`Erro inesperado ao excluir rendimento com ID ${id}:`, error);
      return { success: false, error: error as Error };
    }
  }
  
  // Método auxiliar para atualizar o total de rendimentos de um investimento
  private static async updateInvestmentTotalReturns(investmentId: string): Promise<void> {
    try {
      // Obter todos os rendimentos do investimento
      const { data: returns } = await supabase
        .from('investment_returns')
        .select('amount')
        .eq('investment_id', investmentId);
      
      if (!returns) return;
      
      // Calcular o total
      const totalReturns = returns.reduce((sum, ret) => sum + Number(ret.amount), 0);
      
      // Atualizar o investimento
      await supabase
        .from('investments')
        .update({ total_returns: totalReturns })
        .eq('id', investmentId);
    } catch (error) {
      console.error(`Erro ao atualizar total de rendimentos do investimento ${investmentId}:`, error);
    }
  }
} 