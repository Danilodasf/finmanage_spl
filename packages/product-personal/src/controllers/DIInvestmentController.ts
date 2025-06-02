import { useEffect, useState } from 'react';
import { useAuth } from '../lib/AuthContext';
import { supabase } from '../lib/supabase';

export interface Investment {
  id: string;
  name: string;
  type: string;
  initial_amount: number;
  current_amount: number;
  start_date: Date;
  end_date?: Date;
  return_rate?: number;
  risk_level?: 'baixo' | 'médio' | 'alto';
  notes?: string;
  user_id: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface DIInvestmentController {
  investments: Investment[];
  isLoading: boolean;
  error: Error | null;
  createInvestment: (investment: Omit<Investment, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<Investment | null>;
  updateInvestment: (id: string, updates: Partial<Omit<Investment, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => Promise<Investment | null>;
  deleteInvestment: (id: string) => Promise<boolean>;
}

export function useDIInvestmentController(): DIInvestmentController {
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  const fetchInvestments = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('investments')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        throw new Error(String(error));
      }
      
      if (data) {
        const formattedInvestments = data.map(investment => ({
          ...investment,
          start_date: new Date(investment.start_date),
          end_date: investment.end_date ? new Date(investment.end_date) : undefined,
          created_at: investment.created_at ? new Date(investment.created_at) : undefined,
          updated_at: investment.updated_at ? new Date(investment.updated_at) : undefined,
        }));
        
        setInvestments(formattedInvestments);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erro ao buscar investimentos'));
      console.error('Erro ao buscar investimentos:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchInvestments();
    }
  }, [user]);

  const createInvestment = async (investment: Omit<Investment, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      if (!user) {
        throw new Error('Usuário não autenticado');
      }
      
      const newInvestment = {
        ...investment,
        user_id: user.id,
        current_amount: investment.initial_amount, // Inicialmente igual ao valor inicial
      };
      
      const { data, error } = await supabase
        .from('investments')
        .insert(newInvestment)
        .select()
        .single();
      
      if (error) {
        throw new Error(String(error));
      }
      
      if (data) {
        // Atualizar a lista local
        await fetchInvestments();
        return data as Investment;
      }
      
      return null;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erro ao criar investimento'));
      console.error('Erro ao criar investimento:', err);
      return null;
    }
  };

  const updateInvestment = async (id: string, updates: Partial<Omit<Investment, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => {
    try {
      const { data, error } = await supabase
        .from('investments')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        throw new Error(String(error));
      }
      
      if (data) {
        // Atualizar a lista local
        await fetchInvestments();
        return data as Investment;
      }
      
      return null;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(`Erro ao atualizar investimento com ID ${id}`));
      console.error(`Erro ao atualizar investimento com ID ${id}:`, err);
      return null;
    }
  };

  const deleteInvestment = async (id: string) => {
    try {
      const { error } = await supabase
        .from('investments')
        .delete()
        .eq('id', id);
      
      if (error) {
        throw new Error(String(error));
      }
      
      // Atualizar a lista local
      await fetchInvestments();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(`Erro ao excluir investimento com ID ${id}`));
      console.error(`Erro ao excluir investimento com ID ${id}:`, err);
      return false;
    }
  };

  return {
    investments,
    isLoading,
    error,
    createInvestment,
    updateInvestment,
    deleteInvestment,
  };
} 