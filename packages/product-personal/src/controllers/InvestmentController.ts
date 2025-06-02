import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';

export interface Investment {
  id: string;
  name: string;
  amount: number;
  category_id?: string;
  description?: string;
  user_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface InvestmentReturn {
  id: string;
  investment_id: string;
  amount: number;
  date: string;
  user_id: string;
  created_at?: string;
}

export class InvestmentController {
  static async getInvestments() {
    try {
      const { data, error } = await supabase
        .from('investments')
        .select('*, categories:category_id(*)')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Erro ao buscar investimentos:', error);
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar investimentos:', error);
      throw error;
    }
  }

  static async getInvestmentById(id: string) {
    try {
      const { data, error } = await supabase
        .from('investments')
        .select('*, categories:category_id(*)')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error(`Erro ao buscar investimento com ID ${id}:`, error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error(`Erro ao buscar investimento com ID ${id}:`, error);
      throw error;
    }
  }

  static async createInvestment(investment: Omit<Investment, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const { data, error } = await supabase
        .from('investments')
        .insert(investment)
        .select()
        .single();
      
      if (error) {
        console.error('Erro ao criar investimento:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao criar investimento:', error);
      return false;
    }
  }

  static async updateInvestment(id: string, updates: Partial<Omit<Investment, 'id' | 'created_at' | 'updated_at' | 'user_id'>>) {
    try {
      const { data, error } = await supabase
        .from('investments')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error(`Erro ao atualizar investimento com ID ${id}:`, error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error(`Erro ao atualizar investimento com ID ${id}:`, error);
      return false;
    }
  }

  static async deleteInvestment(id: string) {
    try {
      const { error } = await supabase
        .from('investments')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error(`Erro ao excluir investimento com ID ${id}:`, error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error(`Erro ao excluir investimento com ID ${id}:`, error);
      return false;
    }
  }

  // Métodos para gerenciar rendimentos
  static async getInvestmentReturns(investmentId: string) {
    try {
      const { data, error } = await supabase
        .from('investment_returns')
        .select('*')
        .eq('investment_id', investmentId)
        .order('date', { ascending: false });
      
      if (error) {
        console.error(`Erro ao buscar rendimentos do investimento ${investmentId}:`, error);
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error(`Erro ao buscar rendimentos do investimento ${investmentId}:`, error);
      throw error;
    }
  }

  static async addInvestmentReturn(returnData: Omit<InvestmentReturn, 'id' | 'created_at'>) {
    try {
      const { data, error } = await supabase
        .from('investment_returns')
        .insert(returnData)
        .select()
        .single();
      
      if (error) {
        console.error('Erro ao adicionar rendimento:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao adicionar rendimento:', error);
      return false;
    }
  }

  static async deleteInvestmentReturn(id: string) {
    try {
      const { error } = await supabase
        .from('investment_returns')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error(`Erro ao excluir rendimento com ID ${id}:`, error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error(`Erro ao excluir rendimento com ID ${id}:`, error);
      return false;
    }
  }
} 